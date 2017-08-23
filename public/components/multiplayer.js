import React from 'react';
import ReactDOM from 'react-dom';

import BotPlayer from './botPlayer.js';

import * as consts from '../js/consts.js';

import io from 'socket.io-client';
const socket = io();

import '../styles/main.css';

import Footer from './reusables/footer.js';
import Title from './reusables/title.js';
import Header from './reusables/header.js';

import MultiplayerStep1 from './multiplayer/multiplayerStep1';
import MultiplayerStep2 from './multiplayer/multiplayerStep2';
import MultiplayerStep3 from './multiplayer/multiplayerStep3';

export default class Multiplayer extends React.Component {
	render() {
		return (
			<div id="workspace" className="workspace">
				<Title />

				<Header title="Multiplayer" description={ "Step " + (this.state.step + 1) + " of 3" } />

				<div className="multiplayer">
				{
					this.state.step === 0 &&
					<MultiplayerStep1 selectedGameId={ this.state.selectedGameId }
										gamesList={ this.state.gamesList }
										onCreateGame={ (args) => this.onCreateGame(args) }
										onJoinGame={ (args) => this.onJoinGame(args) } />
				}

				{
					this.state.step === 1 &&
					<MultiplayerStep2 gameName={ this.state.gameName }
										gamePlayers={ this.state.gamePlayers }
										onAddBot={ () => this.onAddBot() }
										onStartGame={ () => this.onStartGame() }/>
				}

				{
					this.state.step === 2 &&
					<MultiplayerStep3 isGameOver={ this.state.isGameOver }
										isRunning={ this.state.isRunning }
										isMyTurn={ this.state.isMyTurn }
										guesses={ this.state.guesses }
										onGuess={ (args) => this.onGuess(args) }/>
				}
				</div>

				<Footer />
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

        this.gameType = consts.MULTIPLAYER;

        this.gameId = "";
        this.playerToken = "";

        this.isGameCreator = false;

        this.bots = [];

        this.initSocket();

        this.ListGames();
	}

	onCreateGame(args) {
		this.setState({
			nickname: args.nickname,
			gameName: args.gameName
		});

        if (!this.socket) {
            this.initSocket();
        }

        this.socket.emit(consts.CREATE_GAME_EVENT,
            {
                name: args.gameName,
                nickname: args.nickname,
                type: this.gameType
            },
            (data) => this.onGameCreated(data)
        );
	}

	onAddBot() {
        let botSocket = io.connect(consts.SERVER_ADDRESS, { 'forceNew': true }),
        	nickname = "botPlayer_" + new Date().getTime(),
			bot = new BotPlayer(null, botSocket, this.gameId, nickname);

        bot.joinGame(this.gameId);
	}

    initSocket() {
        this.socket = io.connect(consts.SERVER_ADDRESS, { 'forceNew': true });

        this.socket.on(consts.GAME_OVER_EVENT, (data) => {
			this.onGameOver(data);
        });

        this.socket.on(consts.JOIN_GAME_SERVER_EVENT, (data) => {
            this.onGameJoined(data);
        });

        this.socket.on(consts.PLAYER_TURN_SERVER_EVENT, (data) => {
            this.onPlayerTurn(data);
        });

        this.socket.on(consts.GAME_STARTED_SERVER_EVENT, (data) => {
            this.onGameStarted(data);
        });

        this.socket.on(consts.GUESS_NUMBER_SERVER_EVENT, (data) => {
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
        this.socket.emit(consts.LIST_GAMES_EVENT, { type: this.gameType },
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

	onJoinGame(args) {
        if (!this.socket) {
            this.initSocket();
        }

		this.setState({
			gameId: args.selectedGameId,
			nickname: args.nickname
		});

        this.socket.emit(consts.CHECK_NICKNAME_EXISTS_EVENT, {
            gameId: args.selectedGameId,
            nickname: args.nickname },
			(data) => this.onNicknameExistsResponse(data)
		);
	}

    onNicknameExistsResponse(data) {
        let exists = data.exists;

		if (exists) {
            alert(data.msg);
            return;
        }

        this.socket.emit(consts.JOIN_GAME_EVENT, {
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
		this.socket.emit(consts.LIST_GAME_PLAYERS_EVENT,
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

	onStartGame() {
		this.socket.emit(consts.START_GAME_EVENT, {
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

	onGuess(number) {
		this.socket.emit(consts.GUESS_NUMBER_EVENT, {
			gameId: this.gameId,
			playerToken: this.playerToken,
			number
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