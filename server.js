const Game = require("./game").Game,
	Player = require("./player").Player,
	Token = require("./token").Token,
	events = require("./consts").events,
	consts = require("./consts").consts,
	gameType = require("./consts").gameType;

//Server class is responsible for low level socket comunication
//and delegates most of the business logic to the Game and Player classes
class Server {
	constructor(io) {
		this.io = io;
		this.runningGames = {};

		this.initSocketIO();
	}

	initSocketIO() {
		this.io.on('connection', socket => {
			socket.on(events.CREATE_GAME_EVENT, (data, callback) => {
				this.createGame(socket, data, callback); //create channel with id = roomId
			});

			socket.on(events.JOIN_GAME_EVENT, (data, callback) => {
				this.joinGame(socket, data, callback); //join channel with id = roomId
			});

			socket.on(events.START_GAME_EVENT, (data, callback) => {
				this.startGame(socket, data, callback);
			});

			socket.on(events.LIST_GAMES_EVENT, (data, callback) => {
				this.listGames(socket, data, callback);
			});

			socket.on(events.LIST_GAME_PLAYERS_EVENT, (data, callback) => {
				this.listPlayers(socket, data, callback);
			});

			socket.on(events.SURRENDER_GAME_EVENT, (data, callback) => {
				this.surrenderGame(socket, data, callback);
			});

			socket.on(events.GUESS_NUMBER_EVENT, (data, callback) => {
				this.guessNumber(socket, data, callback);
			});

			socket.on(events.GUESS_PEER_NUMBER_EVENT, (data, callback) => {
				this.guessPeerNumber(socket, data, callback);
			});

			socket.on(events.GUESS_PEER_NUMBER_CLIENT_RESPONSE_EVENT, (data, callback) => {
				this.guessPeerNumberClientResponse(socket, data, callback);
			});

			socket.on(events.POST_NUMBER_EVENT, data => {
				this.postSecretNumber(socket, data);
			});

			socket.on(events.CHECK_NICKNAME_EXISTS_EVENT, (data, callback) => {
				this.checkNicknameExists(socket, data, callback);
			});

			socket.on(events.GAME_OVER_PEER_CLIENT_EVENT, data => {
				this.gameOverPeerClient(socket, data);
			});
		});
	}

	ensureGame(socket, gameId, callback) {
		const game = this.runningGames[gameId];

		if (!game) {
			if (callback) {
				callback({
					success: false,
					msg: consts.GAME_NOT_FOUND_MSG
				});
			}
			return false;
		}

		return true;
	}

	ensurePlayer(socket, game, playerToken, callback) {
		const player = game.getPlayerByTokenKey(playerToken);

		if (!player) {
			if (callback) {
				callback({
					success: false,
					msg: consts.PLAYER_NOT_FOUND_MSG
				});
			}
			return false;
		}

		return true;
	}

	//creates new game with one player, the game creator
	//this method has public access, everyone is allowed to call it
	createGame(socket, data, callback) {
		try {
			const game = new Game(data.name, data.type),
				player = game.createPlayer(data.nickname, true);

			game.addPlayer(player);

			this.runningGames[game.id] = game;

			socket.join(game.id)

			if (callback) {
				callback({
					success: true,
					gameId: game.id,
					playerToken: player.token.key,
					name: game.name,
					msg: consts.CREATED_GAME_SUCCESS_MSG
				});
			}
		}
		catch (e) {
			if (callback) {
				callback({
					success: false,
					msg: consts.CREATED_GAME_ERROR_MSG + " " + e
				});
			}
		}
	}

	//starts an existing game
	//this method has private access, only game creator is allowed to call it
	startGame(socket, data, callback) {
		const gameId = data.gameId,
			playerToken = data.playerToken;

		if (!this.ensureGame(socket, gameId, callback)) return;

		const game = this.runningGames[gameId];
		if (!this.ensurePlayer(socket, game, playerToken, callback)) return;

		game.start();

		if (callback) {
			callback({
				success: true,
				msg: consts.STARTED_GAME_SUCCESS_MSG
			});

			//send PLAYER_TURN_SERVER_EVENT to all the players of the room
			const player = game.getNextTurnPlayer();

			this.io.to(game.id).emit(events.PLAYER_TURN_SERVER_EVENT, {
				nickname: player.nickname
			});
		}

		if (game.type != gameType.SINGLE_PLAYER) {
			this.io.to(game.id).emit(events.GAME_STARTED_SERVER_EVENT, {
				success: true,
				msg: consts.STARTED_GAME_SUCCESS_MSG
			});
		}
	}

	//surrenders an existing game
	//this method has private access, only game creator is allowed to call it
	surrenderGame(socket, data, callback) {
		const gameId = data.gameId,
			playerToken = data.playerToken;

		if (!this.ensureGame(socket, gameId, callback)) return;

		const game = this.runningGames[gameId];
		if (!this.ensurePlayer(socket, game, playerToken, callback)) return;

		const player = game.getPlayerByTokenKey(playerToken);

		if (callback) {
			if (!player.isGameCreator) {
				callback({
					success: false,
					msg: consts.SURRENDER_GAME_ERROR_MSG
				});
				return;
			} else {
				callback({
					success: true,
					msg: "OK!"
				});
			}
		}

		this.gameOver(socket, gameId, false);
	}

	//tries to guess the secret number
	//this method has private access, only players joined the current game are allowed to call it
	//additionaly, in mutiplayer mode, only the player who is on move is allowed to call the method
	guessNumber(socket, data, callback) {
		const gameId = data.gameId,
			playerToken = data.playerToken,
			guessNum = data.number;

		if (!this.ensureGame(socket, gameId, callback)) return;

		const game = this.runningGames[gameId];
		if (!this.ensurePlayer(socket, game, playerToken, callback)) return;

		const player = game.getPlayerByTokenKey(playerToken);

		if (player != game.getCurrentTurnPlayer()) {
			callback({
				success: false,
				msg: "It is not your turn!"
			});
			return;
		}

		if (game.numberOfMoves == consts.NUMBER_OF_ALLOWED_MOVES) {
			this.gameOver(socket, gameId, false);

			return;
		}

		const bullscows = game.checkGuessNumber(player, guessNum);
		if (bullscows.bulls == consts.NUMBER_SIZE) {
			this.gameOver(socket, gameId, true);

			return;
		}

		if (callback) {
			callback({
				nickname: player.nickname,
				success: true,
				number: guessNum,
				bulls: bullscows.bulls,
				cows: bullscows.cows
			});

			if (game.type == gameType.MULTIPLAYER || game.type == gameType.PEER_2_PEER) {
				this.io.to(game.id).emit(events.GUESS_NUMBER_SERVER_EVENT, { //send GUESS_NUMBER_SERVER_EVENT so all players can see the current player turn
					nickname: player.nickname,
					success: true,
					number: guessNum,
					bulls: bullscows.bulls,
					cows: bullscows.cows
				});
			}

			//send PLAYER_TURN_SERVER_EVENT to all the players of the room
			const nextTurnPlayer = game.getNextTurnPlayer();

			this.io.to(game.id).emit(events.PLAYER_TURN_SERVER_EVENT, {
				nickname: nextTurnPlayer.nickname
			});
		}
	}

	guessPeerNumber(socket, data, callback) {
		const gameId = data.gameId,
			playerToken = data.playerToken,
			guessNum = data.number;

		if (!this.ensureGame(socket, gameId, callback)) return;

		const game = this.runningGames[gameId];
		if (!this.ensurePlayer(socket, game, playerToken, callback)) return;

		const player = game.getPlayerByTokenKey(playerToken);

		if (player != game.getCurrentTurnPlayer()) {
			callback({
				success: false,
				msg: "It is not your turn!"
			});
			return;
		}

		socket.broadcast.to(game.id).emit(events.GUESS_PEER_NUMBER_SERVER_EVENT, {
			number: data.number
		});
	}

	guessPeerNumberClientResponse(socket, data, callback) {
		const gameId = data.gameId,
			playerToken = data.playerToken;

		if (!this.ensureGame(socket, gameId, callback)) return;

		var game = this.runningGames[gameId];
		if (!this.ensurePlayer(socket, game, playerToken, callback)) return;

		socket.broadcast.to(game.id).emit(events.GUESS_PEER_NUMBER_RESPONSE_EVENT, {
			number: data.number,
			bulls: data.bulls,
			cows: data.cows
		});

		var nextTurnPlayer = game.getNextTurnPlayer();

		this.io.to(game.id).emit(events.PLAYER_TURN_SERVER_EVENT, {
			nickname: nextTurnPlayer.nickname
		});
	}

	//joins a player to an existing game
	//this method has public access, everyone is allowed to call it
	joinGame(socket, data, callback) {
		const gameId = data.gameId,
			game = this.runningGames[gameId];

		if (!game) {
			if (callback) {
				callback({ success: false, msg: consts.JOIN_GAME_ERROR});
			}

			return;
		}

		let nickname = data.nickname,
			player = game.createPlayer(nickname, false);

		try {
			game.addPlayer(player);
		}
		catch (e) {
			if (callback) {
				callback({ success: false, msg: e});
			}
			return;
		}

		socket.join(game.id);

		if (callback) {
			callback({
				success: true,
				gameId: gameId,
				playerToken: player.token.key,
				nickname: player.nickname,
				msg: consts.JOIN_GAME_SUCCESS
			});
		}

		this.io.to(game.id).emit(events.JOIN_GAME_SERVER_EVENT, {
			success: true,
			gameId: gameId,
			playerToken: player.token.key,
			nickname: player.nickname,
			msg: consts.JOIN_GAME_SUCCESS
		});
	}

	//lists all available non-runing, multiplayer games
	//this method has public access, everyone is allowed to call it
	listGames(socket, data, callback) {
		const type = data.type,
			gamesList = [];

		for (let id in this.runningGames) {
			const game = this.runningGames[id];

			if (game.isStarted || game.type != type) continue;

			gamesList.push({
				id: game.id,
				name: game.name
			});
		}

		if (callback) {
			callback({
				success: true,
				gamesList: gamesList,
				msg: "OK"
			});
		}
	}

	//lists all players who join the current game
	//this method has private access, only the creator of the current game is allowed to call it
	listPlayers(socket, data, callback) {
		const gameId = data.gameId,
			playerToken = data.playerToken;

		if (!this.ensureGame(socket, gameId, callback)) return;

		var game = this.runningGames[gameId];
		if (!this.ensurePlayer(socket, game, playerToken, callback)) return;

		const player = game.getPlayerByTokenKey(playerToken);
		if (!player.isGameCreator) {
			if (callback) {
				callback({
					success: false,
					msg: "Only the creator of the game is allowed to list the game's players!"
				});
			}
			return;
		}

		let players = [];

		game.players.forEach(player => {
			players.push(player.nickname);
		});

		if (callback) {
			callback({
				success: true,
				msg: "OK!",
				players: players
			});
		}
	}

	checkNicknameExists(socket, data, callback) {
		const gameId = data.gameId,
			nickname = data.nickname;

		if (!this.ensureGame(socket, gameId, callback)) return;

		const game = this.runningGames[gameId],
			exists = game.nicknameExists(nickname);

		if (callback) {
			callback({
				success: true,
				msg: "This nickname is already in use!",
				exists: exists
			});
		}
	}

	gameOver(socket, gameId, win) {
		const game = this.runningGames[gameId];
		this.io.to(game.id).emit(events.GAME_OVER_EVENT, { gameId: gameId, number: game.secretNumber, win: win });

		this.runningGames[gameId] = null;
		delete this.runningGames[gameId];
	}

	gameOverPeerClient(socket, data) {
		const gameId = data.gameId,
			game = this.runningGames[gameId];

		this.io.to(game.id).emit(events.GAME_OVER_PEER_SERVER_EVENT, { gameId: gameId, nickname: data.nickname, number: data.number });

		this.runningGames[gameId] = null;
		delete this.runningGames[gameId];
	}
}

exports.Server = Server;