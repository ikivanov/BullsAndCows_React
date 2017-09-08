import React from 'react';
import ReactDOM from 'react-dom';

import * as consts from '../js/consts.js';

import io from 'socket.io-client';
const socket = io();

import '../styles/main.css';

import Footer from './reusables/footer.js';
import Title from './reusables/title.js';
import Header from './reusables/header.js';

import Peer2PeerStep1 from './peer2peer/peer2peerStep1';
import Peer2PeerStep2 from './peer2peer/peer2peerStep2';
import Peer2PeerStep3 from './peer2peer/peer2peerStep3';

export default class Peer2Peer extends React.Component {
	render() {
		return (
			<div id="workspace" className="workspace p2p-workspace">
				<Title />

				<Header title="Peer 2 Peer" description={ "Step " + (this.state.step + 1) + " of 3" } />

				<div className="multiplayer">
				{
					this.state.step === 0 &&
					<Peer2PeerStep1 selectedGameId={ this.state.selectedGameId }
									gamesList={ this.state.gamesList }
									onCreateGame={ (args) => this.onCreateGame(args) }
									onJoinGame={ (args) => this.onJoinGame(args) } />
				}

				{
					this.state.step === 1 &&
					<Peer2PeerStep2 gameName={ this.state.gameName }
									gamePlayers={ this.state.gamePlayers }
									onStartGame={ () => this.onStartGame() }/>
				}

				{
					this.state.step === 2 &&
					<Peer2PeerStep3 isGameOver={ this.state.isGameOver }
									isRunning={ this.state.isRunning }
									isMyTurn={ this.state.isMyTurn }
									guesses={ this.state.guesses }
									opponentGuesses={ this.state.opponentGuesses }
									onGuess={ (args) => this.onGuess(args) } />
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
			gameName: "",
			step: 0,
			isMyTurn: false,
			gamesList: [],
			secretNumber: "",
			gamePlayers: [],
			selectedGameId: "",
			guesses: [],
			opponentGuesses: []
		};

		this.socket = null;

        this.gameType = consts.PEER_2_PEER;

        this.initSocket();

        this.ListGames();

        this.isGameCreator = false;
        this.isMyTurn = false;
        this.gameId = "";
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

		this.socket.on(consts.GUESS_PEER_NUMBER_SERVER_EVENT, (data) => {
			this.onGuessPeerIncomingQuery(data);
		});

		this.socket.on(consts.GUESS_PEER_NUMBER_RESPONSE_EVENT, (data) => {
			this.onGuessPeerNumberResponse(data);
		});

		this.socket.on(consts.GAME_OVER_PEER_SERVER_EVENT, (data) => {
			this.onGameOver(data);
		});
	}

	closeSocket() {
		if (!this.socket) return;

		this.socket.removeAllListeners();
		this.socket.disconnect();
		this.socket = null;
	}

	onCreateGame(args) {
		this.setState({
			nickname: args.nickname,
			secretNumber: args.secretNumber,
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

    onGuessPeerIncomingQuery(data) {
        let bullscows = { bulls: 0, cows: 0 };

        let r = this.checkGuessNumber(data.number);
        if (r.bulls == consts.NUMBER_LENGH) {
            this.fireGameOver();
            return;
        }

		let opponentGuesses = this.state.opponentGuesses.slice();
		opponentGuesses.push("number: " + data.number.join('') + ", bulls: " + r.bulls + ", cows: " + r.cows);

		this.setState({ opponentGuesses });

		this.socket.emit(consts.GUESS_PEER_NUMBER_CLIENT_RESPONSE_EVENT, {
			gameId: this.gameId,
			playerToken: this.playerToken,
			nickname: this.state.nickname,
			success: true,
			number: data.number,
			bulls: r.bulls,
			cows: r.cows
		});
	}

	onGuessPeerNumberResponse(data) {
		let bulls = data.bulls, cows = data.cows,
			number = data.number,
			guesses = this.state.guesses.slice();

		guesses.push("number: " + number.join('') + ", bulls: " + bulls + ", cows: " + cows);

		this.setState({ guesses });
	}

	fireGameOver() {
		this.socket.emit(consts.GAME_OVER_PEER_CLIENT_EVENT, {
			gameId: this.gameId,
			playerToken: this.playerToken,
			nickname: this.state.nickname,
			number: this.state.secretNumber.split(""),
			success: true
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
		let nickname = data.nickname,
			result = "Game over! ",
			guesses = this.state.guesses.slice();

		if (nickname != this.state.nickname) {
			result += "You win! Number is: " + data.number.join('');;
		} else {
			result += "You lose! Your opponent guessed your secret number!";
		}

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

	checkGuessNumber(guessNumber) {
		let bulls = 0, cows = 0,
			secretNumArr = this.state.secretNumber.slice("");

		for (let i = 0; i < guessNumber.length; i++) {
			let num = guessNumber[i];

			let index = secretNumArr.indexOf(num.toString());
			if (index >= 0) {
				if (index == i) {
					bulls++;
				} else {
					cows++;
				}
			}
		}

		let res =
			{
				bulls: bulls, cows: cows
			}

		return res;
	}

	ListGames() {
		this.socket.emit(consts.LIST_GAMES_EVENT, { type: this.gameType },
			(data) => this.onGamesListed(data)
		);
	}

	onGamesListed(data) {
		let success = data.success;

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

	onGuessResponse(data) {
		let bulls = data.bulls,
			cows = data.cows,
			number = data.number;

		this.guesses.push(data.nickname + ": " + number.join('') + ", bulls: " + bulls + ", cows: " + cows);
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
			opponentGuesses: [],
			step: 2
		});
	}

	onPlayerTurn(data) {
		if (data.nickname == this.state.nickname) {
			this.setState({ isMyTurn: true });
		}
	}

	onGuess(number) {
		this.socket.emit(consts.GUESS_PEER_NUMBER_EVENT, {
			gameId: this.gameId,
			playerToken: this.playerToken,
			number
		}, (data) => {
			if (!data.success) {
				alert(data.msg);
			}
		});

		this.setState({ isMyTurn: false });
	}

	componentWillUnmount() {
		this.closeSocket();
	}
}