import * as consts from '../js/consts.js';

export default class BotPlayer {
	constructor(viewModel, socket, gameId, nickname, playerToken) {
		this.viewModel = viewModel;
		this.socket = socket;
		this.gameId = gameId;
		this.playerToken = playerToken;
		this.nickname = nickname ? nickname : "botPlayer_" + new Date().getTime();

		this.socket.on(
			consts.PLAYER_TURN_SERVER_EVENT,
			(data) => this.onPlayerTurn(data)
		);

		this.answers = this.getPermutations(consts.NUMBER_LENGH, "123456789");
		this.answers = this.shuffle(this.answers);
	}

	joinGame(gameId) {
		this.socket.emit(consts.JOIN_GAME_EVENT,
			{
				gameId: gameId,
				nickname: this.nickname
			},
			(data) => this.onGameJoined(data)
		);
	}

	onGameJoined(data) {
		let success = data.success;

		if (!success) {
			return;
		}

		if (this.nickname == data.nickname) {
			this.gameId = data.gameId;
			this.playerToken = data.playerToken;
		}
	}

	onPlayerTurn(data) {
		if (data.nickname === this.nickname) {
			this.guess();
		}
	}

	guess() {
		let guessNum = this.answers[0];
		let arr = guessNum.split('');

		this.socket.emit(consts.GUESS_NUMBER_EVENT,
			{
				gameId: this.gameId,
				playerToken: this.playerToken,
				number: [arr[0], arr[1], arr[2], arr[3]]
			},
			(data) => this.onGuessResponse(data)
		);
	}

	onGuessResponse(data) {
		let gameId = data.gameId,
			bulls = data.bulls, cows = data.cows,
			number = data.number;

		this.reduceAnswers(number.join(''), bulls, cows);

		if (this.viewModel) {
			this.viewModel.onGuessResponse(data);
		}
	}

	reduceAnswers(guess, bulls, cows) {
		var that = this;

		for (var i = that.answers.length - 1; i >= 0; i--) {
			var tb = 0, tc = 0;
			for (var ix = 0; ix < consts.NUMBER_LENGH; ix++)
				if (that.answers[i][ix] == guess[ix])
					tb++;
				else if (that.answers[i].indexOf(guess[ix]) >= 0)
					tc++;
			if ((tb != bulls) || (tc != cows))
				that.answers.splice(i, 1);
		}
	}

	getPermutations(n, word) {
		var that = this;

		var tmpPermutation = [];

		if (!word || word.length == 0 || n <= 0) {
			tmpPermutation.push("");
		}
		else {
			for (var i = 0; i < word.length; i++) {
				var tmpWord = word.substr(0, i) + word.substr(i + 1);
				var perms = that.getPermutations(n - 1, tmpWord);
				for (var j = 0; j < perms.length; j++) {
					var item = perms[j];
					tmpPermutation.push(word[i] + item);
				}
			}
		}

		return tmpPermutation;
	}

	//Fisher–Yates Shuffle
	shuffle(array) {
		let m = array.length, t, i;

		// While there remain elements to shuffle…
		while (m) {

			// Pick a remaining element…
			i = Math.floor(Math.random() * m--);

			// And swap it with the current element.
			t = array[m];
			array[m] = array[i];
			array[i] = t;
		}

		return array;
	}
}