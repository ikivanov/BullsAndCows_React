const Player = require("./player").Player,
	Token = require("./token").Token,
	consts = require("./consts").consts,
	gameType = require("./consts").gameType,
	uuid = require('uuid');

class Game {
	constructor(name, type) {
        this.id = uuid.v4();

        this.name = name;
        this.type = type;

        this.secretNumber = this.generateSecretNumber();

        this.numberOfMoves = 0;
        this.currentPlayerIndex = -1;
        this.players = [];

        this.isStarted = false;
	}

	createPlayer(nickname, isGameCreator) {
		const nick = this.ensureNickname(nickname),
			expirationTime = new Date().getTime() + consts.EXPIRATION_TIME_MINUTES * 60 * 1000,
			token = new Token(uuid.v4(), new Date(expirationTime));

		return new Player(nick, token, isGameCreator);
	}

	addPlayer(player) {
		if (!player) return;

		if (this.type === gameType.SINGLE_PLAYER) {
			if (this.players.length == 1) {
				throw new Error("This game is a single player game. No more that one player can join it!");
			}
		}

		this.players.push(player);
	}

	removePlayer(nickname) {
		//TODO:
	}

	getPlayerByTokenKey(tokenKey) {
		this.players.forEach(player =>  {
		});

		for (let i = 0; i < this.players.length; i++) {
			const player = this.players[i];

			if (player.token.key === tokenKey) {
				return player;
			}
		}

		return null;
	}

	nicknameExists(nickname) {
		this.players.forEach(player => {
			if (nickname === player.nickname) {
				return true;
			}
		});

		return false;
	}

	ensureNickname(nickname) {
		if (!nickname) {
			nickname = "guest";
		}

		let suffix = 2;

		while (this.nicknameExists(nickname)) {
			nickname += suffix;
			suffix++;
		}

		return nickname;
	}

	getCurrentTurnPlayer() {
		if (this.type == gameType.SINGLE_PLAYER) {
			if (this.players.length > 0) {
				return this.players[0];
			} else {
				return null;
			}
		}

		if (this.currentPlayerIndex == -1) {
			return null;
		}

		return this.players[this.currentPlayerIndex];
	}

	getNextTurnPlayer() {
		if (this.type == gameType.SINGLE_PLAYER) {
			return this.getCurrentTurnPlayer();
		}

		if (this.currentPlayerIndex == this.players.length - 1) {
			this.currentPlayerIndex = 0;
		} else {
			this.currentPlayerIndex++;
		}

		return this.players[this.currentPlayerIndex];
	}

	start() {
		this.isStarted = true;
	}

	checkGuessNumber(player, guessNumber) {
		let bulls = 0,
			cows = 0;

		guessNumber.forEach((number, i) => {
			const num = parseInt(number),
				index = this.secretNumber.indexOf(num);

			if (index >= 0) {
				if (index == i) {
					bulls++;
				} else {
					cows++;
				}
			}
		});

		this.numberOfMoves++;
		return { bulls: bulls, cows: cows };
	}

	generateSecretNumber() {
		let result = [];

		for (let i = 0; i < consts.NUMBER_SIZE; i++) {

			while (true) {
				const num = Math.floor((Math.random() * 9) + 1);

				if (result.indexOf(num) == -1) {
					result.push(num);
					break;
				} else {
					continue;
				}
			}
		}

		return result;
	}
}

exports.Game = Game;