import React from 'react';
import ReactDOM from 'react-dom';

import * as consts from '../js/consts.js';

import io from 'socket.io-client';
const socket = io();

import '../styles/main.css';

export default class HumanVsComputer extends React.Component {
	render() {
		return (
			<div id="workspace" className="workspace">
				<div>
					<h1 className="welcome-title">
						<div>Welcome to</div>
						<div>Bulls and Cows!</div>
					</h1>

					<div className="info-title">
						<div>Single Player: </div>
						Human vs Computer
					</div>

					<table className="game-table">
						<tbody>
							<tr>
								<td colSpan="2">
									<button className="new-game-button" onClick={ (e) => this.onCreateBtnClicked(e) }>Start New Game</button>
								</td>
								<td colSpan="2">
									<button className="surrender-button" onClick={ (e) => this.onSurrenderBtnClicked(e) } disabled={ !this.state.isRunning }>Surrender</button>
								</td>
							</tr>

							<tr>
								<td>
									<input type="number" className="guess-number-textbox" min="1" max="9" disabled={ !this.state.isRunning } value={ this.state.number1 }
										onChange={ (e) => {
											this.setState({ number1: e.target.value}, () => {
												this.onValidate(e);
											});
										}} />
								</td>
								<td>
									<input type="number" className="guess-number-textbox" min="0" max="9" disabled={ !this.state.isRunning } value={ this.state.number2 }
										onChange={ (e) => {
											this.setState({ number2: e.target.value}, () => {
												this.onValidate(e);
											});
										}} />
								</td>
								<td>
									<input type="number" className="guess-number-textbox" min="0" max="9" disabled={ !this.state.isRunning } value={ this.state.number3 }
										onChange={ (e) => {
											this.setState({ number3: e.target.value}, () => {
												this.onValidate(e);
											});
										}} />
								</td>
								<td>
									<input type="number" className="guess-number-textbox" min="0" max="9" disabled={ !this.state.isRunning } value={ this.state.number4 }
										onChange={ (e) => {
											this.setState({ number4: e.target.value}, () => {
												this.onValidate(e);
											});
										}} />
								</td>
							</tr>

							<tr>
								<td colSpan="4">
									<button className="guess-button" disabled={ !this.state.isRunning || !this.state.isValidInput } onClick={ (e) => this.onGuessBtnClicked(e) }>
										Make a guess
									</button>
								</td>
							</tr>

							{
								!this.state.isValidInput &&
								<tr>
									<td colSpan="4">
										<div className="validation-footer">Guess number cannot contain <br />duplicating digits!</div>
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
			</div>
		);
	}

	constructor(props) {
		super(props);

		this.state = {
			isRunning: false,
			guesses: [],
			number1: 1,
			number2: 2,
			number3: 3,
			number4: 4,
			isValidInput: true
		};

		this.socket = null;
	}

    initSocket () {
        this.socket = io.connect(consts.SERVER_ADDRESS, { 'forceNew': true });

        this.socket.on(consts.GAME_OVER_EVENT, (data) => {
            this.onGameOver(data);
        });
    }

	onCreateBtnClicked(e) {
        if (!this.socket) {
			this.initSocket();
		}

        this.socket.emit(consts.CREATE_GAME_EVENT,
            {
                name: ("h_vs_c" + new Date().getTime()),
                nickname: "guest",
                type: consts.SINGLE_PLAYER
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

				this.setState({
					isRunning: true,
					guesses: [],
					number1: 1,
					number2: 2,
					number3: 3,
					number4: 4
				});
		});
    }

	onSurrenderBtnClicked(e) {
        this.socket.emit(consts.SURRENDER_GAME_EVENT,
            {
                gameId: this.gameId,
                playerToken: this.playerToken
            },
            (data) => {
                if (!data.success) {
                    alert(data.msg);
                }
            }
        );

        this.setState({ isRunning: false });
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

	onGuessBtnClicked(e) {
        if (!this.isValidNumber()) {
            alert("Guess number cannot contain duplicating digits!");
            return;
        }

        this.socket.emit(consts.GUESS_NUMBER_EVENT,
            {
                gameId: this.gameId,
                playerToken: this.playerToken,
                number: [this.state.number1, this.state.number2, this.state.number3, this.state.number4]
            },
            (data) => {
                this.onGuessResponse(data);
            }
        );
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