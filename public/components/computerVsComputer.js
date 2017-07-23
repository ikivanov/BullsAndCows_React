import React from 'react';
import ReactDOM from 'react-dom';

import BotPlayer from './botPlayer.js';

import io from 'socket.io-client';
const socket = io();

import '../styles/main.css';

const
	SERVER_ADDRESS = "localhost:8080",
	GAME_OVER_EVENT = "game over",
	SINGLE_PLAYER = 0,
	START_GAME_EVENT = "start game",
	CREATE_GAME_EVENT = "create game",
	GUESS_NUMBER_EVENT = "guess number",
	SURRENDER_GAME_EVENT = "surrender game";

export default class ComputerVsComputer extends React.Component {
	render() {
		return (
			<div id="workspace" className="workspace">
				<h1 className="welcome-title">
					<div>Welcome to</div>
					<div>Bulls and Cows!</div>
				</h1>

				<div className="info-title">
					<div>Single Player:</div>
					Computer vs Computer
				</div>

				<table className="game-table">
					<tbody>
						<tr>
							<td colSpan="2">
								<button className="new-game-button" onClick={ (e) => this.onCreateBtnClicked(e) }>Start New Game</button>
							</td>
						</tr>

						<tr>
							<td colSpan="4">
								<div className="game-table-moves">
									<select className="server-output" multiple size="12">
										{
											this.state.guesses.map((guess, index) =>
												<option key={index}>{ guess }</option>
											)
										}
									</select>
								</div>
							</td>
						</tr>
					</tbody>
				</table>

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
			isRunning: false,
			guesses: [],
		};

        this.nickname = "h_vs_c_" + new Date().getTime();
        this.gameName = "botPlayer_" + new Date().getTime();
        this.gameType = SINGLE_PLAYER;

        this.gameId = "";
        this.playerToken = "";

		this.botPlayer = null;

		this.socket = null;
	}

    initSocket () {
        this.socket = io.connect(SERVER_ADDRESS, { 'forceNew': true });

        this.socket.on(GAME_OVER_EVENT, (data) => {
            this.onGameOver(data);
        });
    }

	onCreateBtnClicked() {
        this.botPlayer = null;

        if (!this.socket) {
			this.initSocket();
		}

        this.socket.emit(CREATE_GAME_EVENT,
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

        this.socket.emit(START_GAME_EVENT,
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
}