import React from 'react';
import ReactDOM from 'react-dom';

import BotPlayer from './botPlayer.js';

import io from 'socket.io-client';
const socket = io();

import * as consts from '../js/consts.js';

import '../styles/main.css';

import Title from './reusables/title.js';
import Header from './reusables/header.js';
import Footer from './reusables/footer.js';
import ServerOutput from './reusables/serverOutput.js';

export default class ComputerVsComputer extends React.Component {
	render() {
		return (
			<div id="workspace" className="workspace">
				<Title />

				<Header title="Single Player:" description="Computer vs Computer" />

				<table className="game-table">
					<tbody>
						<tr>
							<td colSpan="2">
								<button className="new-game-button" onClick={ (e) => this.onCreateBtnClicked(e) }>Start New Game</button>
							</td>
						</tr>

						<tr>
							<td colSpan="4">
								<ServerOutput output={ this.state.guesses }/>
							</td>
						</tr>
					</tbody>
				</table>

				<Footer />
			</div>
		)
	}

	constructor(props) {
		super(props);

		this.state = {
			isRunning: false,
			guesses: []
		};

		this.nickname = "h_vs_c_" + new Date().getTime();
		this.gameName = "computerVsComputer_" + new Date().getTime();
		this.gameType = consts.SINGLE_PLAYER;

		this.gameId = "";
		this.playerToken = "";

		this.botPlayer = null;

		this.socket = null;
	}

	initSocket () {
		this.socket = io.connect(consts.SERVER_ADDRESS, { 'forceNew': true });

		this.socket.on(consts.GAME_OVER_EVENT, (data) => {
			this.onGameOver(data);
		});
	}

	closeSocket() {
		if (!this.socket) return;

		this.socket.removeAllListeners();
		this.socket.disconnect();
		this.socket = null;
	}

	onCreateBtnClicked() {
		this.botPlayer = null;

		if (!this.socket) {
			this.initSocket();
		}

		this.socket.emit(consts.CREATE_GAME_EVENT,
			{
				name: this.gameName,
				nickname: this.nickname,
				type: this.gameType
			},
			(data) => { this.onGameCreated(data); });
	}

	onGameCreated(data) {
		let success = data.success;

		if (!success) {
			alert(data.msg);
			return;
		}

		this.gameId = data.gameId;
		this.playerToken = data.playerToken;

		this.socket.emit(consts.START_GAME_EVENT,
			{
				gameId: this.gameId,
				playerToken: this.playerToken
			},
			(data) => {
				let success = data.success;
				if (!success) {
					alert(data.msg);
					return;
				}

				this.setState({ isRunning: true, guesses: [] });
		});

		this.botPlayer = new BotPlayer(this, this.socket, this.gameId, this.nickname, this.playerToken);
	}

	onGuessResponse(data) {
		let bulls = data.bulls,
			cows = data.cows,
			number = data.number,
			guesses = this.state.guesses.slice();

		guesses.push("number: " + number.join('') + ", bulls: " + bulls + ", cows: " + cows);

		this.setState({ guesses });
	}

	onGameOver(data) {
		let winStr = data.win ? "win" : "lose",
			result = "Game over! You " + winStr + "! Number is: " + data.number.join(''),
			guesses = this.state.guesses.slice();

		guesses.push(result);

		this.setState({ isRunning: false, guesses });

		this.gameId = "";

		this.socket.removeAllListeners();
		this.socket.disconnect();
		this.socket = null;
	}

	componentWillUnmount() {
		this.closeSocket();
	}
}