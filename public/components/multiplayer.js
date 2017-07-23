import React from 'react';
import ReactDOM from 'react-dom';

import BotPlayer from './botPlayer.js';

import io from 'socket.io-client';
const socket = io();

import '../styles/main.css';

const
	SERVER_ADDRESS = "localhost:8080",
	MULTIPLAYER = 1,
	GAME_OVER_EVENT = "game over",
	JOIN_GAME_SERVER_EVENT = "join server game",
	PLAYER_TURN_SERVER_EVENT = "player turn",
	GAME_STARTED_SERVER_EVENT = "game started server event",
	GUESS_NUMBER_SERVER_EVENT = "guess number server event",
	LIST_GAMES_EVENT = "list games",
	CHECK_NICKNAME_EXISTS_EVENT = "nickname exists",
	JOIN_GAME_EVENT = "join game",
	LIST_GAME_PLAYERS_EVENT = "list players",
	START_GAME_EVENT = "start game",
	GUESS_NUMBER_EVENT = "guess number",
	CREATE_GAME_EVENT = "create game";

export default class Multiplayer extends React.Component {
	render() {
		return (
			<div id="workspace" className="workspace">
				<h1 className="welcome-title">
					Welcome to <br />Bulls and Cows!
				</h1>

				<div className="info-title">
					<div>Multiplayer</div>
					Step <span>{ this.state.step + 1 }</span> of 3
				</div>

				<br />

				<div className="multiplayer">
				{
					this.state.step === 0 &&
					<table>
						<tbody>
							<tr>
								<td>
									<label> 1. Enter your nickname </label>
								</td>
							</tr>
							<tr>
								<td>
									<input type="text" value={ this.state.nickname } onChange={ (e) => this.setState({ nickname: e.target.value }) }/>
								</td>
							</tr>
							<tr>
								<td><br /></td>
							</tr>
							<tr>
								<td colSpan="4" style={{ textAlign: 'left' }}>
									<label>2. Create new game</label>
								</td>
							</tr>
							<tr>
								<td colSpan="2">
									<input type="text" value={ this.state.gameName } onChange={ (e) => this.setState({ gameName: e.target.value }) } />
								</td>
								<td colSpan="2">
									<button disabled={ this.state.nickname.length === 0 || this.state.gameName.length === 0 } onClick={ () => this.onCreateGameBtnClicked() }>Create Game</button>
								</td>
							</tr>
							<tr>
								<td><br /></td>
							</tr>
							<tr>
								<td colSpan="4" style={{ textAlign: 'left' }}>
									<label>or join an existing one</label>
								</td>
							</tr>
							<tr>
								<td colSpan="2">
									<select className="full-width"
										value={ this.state.selectedGameId }
										disabled={ this.state.gamesList.length === 0 }
										onChange={(e) => this.setState({ selectedGameId: e.target.value }) }>
									{
										this.state.gamesList.map((game, index) =>
											<option key={index} value={ game.id }>{ game.name }</option>
										)
									}
									</select>
								</td>
								<td colSpan="2">
									<button disabled={ this.state.nickname.length === 0 || this.state.selectedGameId.length === 0 } onClick={ () => this.onJoinGameBtnClicked() }>Join Game</button>
								</td>
							</tr>
						</tbody>
					</table>
				}
				</div>

				<div className="multiplayer">
				{
					this.state.step === 1 &&
					<table className="game-table">
						<tbody>
							<tr>
								<td colSpan=" 2">
									<label>Game name:</label>
								</td>
								<td colSpan="2">
									<label>{this.state.gameName}</label>
								</td>
							</tr>
							<tr>
								<td colSpan="4">
									<button onClick={ () => this.onAddBotBtnClicked() }>Add Bot</button>
								</td>
							</tr>
							<tr>
								<td><br /></td>
							</tr>
							<tr>
								<td colSpan="4" style={{ textAlign: 'left' }}>
									<label>Players:</label>
								</td>
							</tr>
							<tr>
								<td colSpan="4" style={{ textAlign: 'left' }}>
									<select className="full-width" multiple size="5">
									{
										this.state.gamePlayers.map((player, index) =>
											<option key={index}>{ player }</option>
										)
									}
									</select>
								</td>
							</tr>
							<tr>
								<td><br /></td>
							</tr>
							<tr>
								<td colSpan="4" className="text-center">
									<button onClick={ () => this.onStartGameBtnClicked() }>Start Game!</button>
								</td>
							</tr>
						</tbody>
					</table>
				}
				</div>

				{
					this.state.step === 2 &&
					<table className="game-table">
						<tbody>
							<tr>
								<td>
									<input type="number" min="1" max="9" disabled={ !this.state.isRunning } value={ this.state.number1 }
										onChange={ (e) => {
											this.setState({ number1: e.target.value}, () => {
												this.onValidate(e);
											});
										}} />

								</td>
								<td>
									<input type="number" min="0" max="9" disabled={ !this.state.isRunning } value={ this.state.number2 }
										onChange={ (e) => {
											this.setState({ number2: e.target.value}, () => {
												this.onValidate(e);
											});
										}} />
								</td>
								<td>
									<input type="number" min="0" max="9" disabled={ !this.state.isRunning } value={ this.state.number3 }
										onChange={ (e) => {
											this.setState({ number3: e.target.value}, () => {
												this.onValidate(e);
											});
										}} />
								</td>
								<td>
									<input type="number" min="0" max="9" disabled={ !this.state.isRunning } value={ this.state.number4 }
										onChange={ (e) => {
											this.setState({ number4: e.target.value}, () => {
												this.onValidate(e);
											});
										}} />
								</td>
							</tr>

							<tr>
								<td colSpan="4">
									<button className="guess-button" disabled={ !this.state.isRunning || !this.state.isValidInput || !this.state.isMyTurn } onClick={ (e) => this.onGuessBtnClicked(e) }>
										Make a guess
									</button>
								</td>
							</tr>

							{
								!this.state.isValidInput &&
								<tr>
									<td colSpan="4">
										<span>Guess number cannot contain duplicating digits!</span>
									</td>

								</tr>
							}

							<tr>
								<td colSpan="4">
									<select className="server-output" multiple size="12">
									{
										this.state.guesses.map((guess, index) =>
											<option key={index}>{ guess }</option>
										)
									}
									</select>

									{
										!this.state.isRunning && !this.state.isGameOver &&
										<div className="awaiting-game-progress">
											<img src="img/waiting.gif" />
											<span>Awaiting game start...</span>
										</div>
									}

									{
										this.state.isRunning && !this.state.isMyTurn &&
										<div className="awaiting-turn-progress">
											<img src="img/waiting.gif" />
											<span>Please wait for your turn...</span>
										</div>
									}
								</td>
							</tr>
						</tbody>
					</table>
				}

				<h5 className="footer">
					Implemented by <a href="mailto:ikivanov@gmail.com">Ivan Ivanov</a>
				</h5>
				<h5 className="footer2">
					Phone: +359 888 959 386
				</h5>
			</div>
		);
	}

	constructor(props) {
		super(props);

		this.state = {
			isGameOver: false,
			isRunning: false,
			nickname: "",
			guesses: [],
			number1: 1,
			number2: 2,
			number3: 3,
			number4: 4,
			isValidInput: true,
			gameName: "",
			selectedGameId: "",
			step: 0,
			isMyTurn: false,
			gamesList: [],
			gamePlayers: []
		};

		this.socket = null;

        this.gameType = MULTIPLAYER;

        this.gameId = "";
        this.playerToken = "";

        this.isGameCreator = false;

        this.bots = [];

        this.initSocket();

        this.ListGames();
	}

    onCreateGameBtnClicked() {
        if (!this.socket) {
            this.initSocket();
        }

        this.socket.emit(CREATE_GAME_EVENT,
            {
                name: this.state.gameName,
                nickname: this.state.nickname,
                type: this.gameType
            },
            (data) => this.onGameCreated(data)
        );
    }

    onAddBotBtnClicked() {
        let botSocket = io.connect(SERVER_ADDRESS, { 'forceNew': true }),
        	nickname = "botPlayer_" + new Date().getTime(),
			bot = new BotPlayer(null, botSocket, this.gameId, nickname);

        bot.joinGame(this.gameId);
    }

    initSocket() {
        this.socket = io.connect(SERVER_ADDRESS, { 'forceNew': true });

        this.socket.on(GAME_OVER_EVENT, (data) => {
			this.onGameOver(data);
        });

        this.socket.on(JOIN_GAME_SERVER_EVENT, (data) => {
            this.onGameJoined(data);
        });

        this.socket.on(PLAYER_TURN_SERVER_EVENT, (data) => {
            this.onPlayerTurn(data);
        });

        this.socket.on(GAME_STARTED_SERVER_EVENT, (data) => {
            this.onGameStarted(data);
        });

        this.socket.on(GUESS_NUMBER_SERVER_EVENT, (data) => {
            this.onGuessNumber(data);
        });
    }

    onGameCreated(data) {
        let success = data.success;

		if (!success) {
            alert(data.msg);
            return;
        }

        this.gameId = data.gameId;
        this.playerToken = data.playerToken;

        this.isGameCreator = true;

        this.ListPlayers();

        this.setState({ step : 1 });
    }

    onGameOver(data) {
        let winStr = data.win ? "win" : "lose",
        	result = "Game over! You " + winStr + "! Number is: " + data.number.join(''),
			guesses = this.state.guesses.slice();

        guesses.push(result);

		this.setState({
			isGameOver: true,
			isRunning: false,
			guesses
		});


        this.gameId = "";

        this.socket.removeAllListeners();
        this.socket.disconnect();
        this.socket = null;
    }

    ListGames() {
        this.socket.emit(LIST_GAMES_EVENT, { type: this.gameType },
            (data) => this.onGamesListed(data)
        );
    }

    onGamesListed(data) {
        let  success = data.success;

		if (!success) {
            alert(data.msg);
            return;
        }

		this.setState({ gamesList: data.gamesList });

		if (data.gamesList && data.gamesList.length > 0) {
			this.setState({ selectedGameId: data.gamesList[0].id });
		}
    }

    onGuessNumber(data) {
        if (data.nickname === this.state.nickname) {
            return;
        }

        this.onGuessResponse(data);
    }

    onJoinGameBtnClicked() {
        if (!this.socket) {
            this.initSocket();
        }

        this.socket.emit(CHECK_NICKNAME_EXISTS_EVENT, {
            gameId: this.state.selectedGameId,
            nickname: this.nickname },
			(data) => this.onNicknameExistsResponse(data)
		);
    }

    onNicknameExistsResponse(data) {
        let exists = data.exists;

		if (exists) {
            alert(data.msg);
            return;
        }

        this.socket.emit(JOIN_GAME_EVENT, {
            gameId: this.state.selectedGameId,
            nickname: this.state.nickname },
			(data) => this.onGameJoined(data)
		);
    }

    onGameJoined(data) {
        let success = data.success;

		if (!success) {
            alert(data.msg);
            return;
        }

        if (this.state.nickname == data.nickname) { //current user has joined the game, go to step 2
            this.gameId = data.gameId;
            this.playerToken = data.playerToken;

            this.setState({ step: 2 });
        } else { //another user has joined the game, update the player list
            if (this.isGameCreator) {
                this.ListPlayers();
            }
        }
    }

    ListPlayers() {
        this.socket.emit(LIST_GAME_PLAYERS_EVENT,
            {
                gameId: this.gameId,
                playerToken: this.playerToken
            },
            (data) => this.onPlayersListed(data)
        );
    }

    onPlayersListed(data) {
        let success = data.success;

		if (!success) {
            alert(data.msg);
            return;
        }

        this.setState({ gamePlayers: data.players });
    }

    onStartGameBtnClicked() {
        this.socket.emit(START_GAME_EVENT, {
            gameId: this.gameId,
            playerToken: this.playerToken
        	},
			(data) => this.onGameStarted(data)
		);
    }

    onGameStarted(data) {
        let success = data.success;

        if (!success) {
            alert(data.msg);
            return;
        }

        this.setState({
			isRunning: true,
			guesses: [],
			number1: 1,
			number2: 2,
			number3: 3,
			number4: 4,
			step: 2
		 });
    }

    onPlayerTurn(data) {
        if (data.nickname == this.state.nickname) {
            this.setState({ isMyTurn: true });
        }
    }

    onGuessBtnClicked() {
        if (!this.isValidNumber()) {
            alert("Guess number cannot contain duplicating digits!");
            return;
        }

        this.socket.emit(GUESS_NUMBER_EVENT, {
            gameId: this.gameId,
            playerToken: this.playerToken,
            number: [this.state.number1, this.state.number2, this.state.number3, this.state.number4]
        }, (data) => {
            this.onGuessResponse(data);
            this.setState({ isMyTurn: false });
        });
    }

    onGuessResponse(data) {
        let bulls = data.bulls,
			cows = data.cows,
			number = data.number,
			guesses = this.state.guesses.slice();

		guesses.push(data.nickname + ": " + number.join('') + ", bulls: " + bulls + ", cows: " + cows);
        this.setState({ guesses });
    }

 	onValidate(e) {
		this.setState({ isValidInput: this.isValidNumber() });
	}

   isValidNumber() {
        if (this.state.number1 == 0) {
            return false;
        }

        let nums = [this.state.number1, this.state.number2, this.state.number3, this.state.number4];

        //are numbers different from each other?
        for (let i = 0; i < nums.length; i++) {
            for (let j = nums.length - 1; j > i; j--) {
                if (nums[i] == nums[j])
                    return false;
            }
        }

        return true;
    }
}