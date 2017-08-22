import React from 'react';
import ReactDOM from 'react-dom';

export default class MultiplayerStep3 extends React.Component {
	render() {
		return (
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
		)
	}

	constructor(props) {
		super(props);

		this.state = {
			isGameOver: false,
			isRunning: false,
			guesses: [],
			number1: 1,
			number2: 2,
			number3: 3,
			number4: 4,
			isValidInput: true,
			isMyTurn: false
		};

		this.onGuess = props.onGuess || null;
	}

	componentWillReceiveProps(props) {
		this.setState({
			isGameOver: props.isGameOver,
			isRunning: props.isRunning,
			isMyTurn: props.isMyTurn,
			guesses: props.guesses
		});
	}

	onGuessBtnClicked(e) {
		if (!this.isValidNumber()) {
			alert("Guess number cannot contain duplicating digits!");
			return;
		}

		if (!this.onGuess) {
			return;
		}

		this.onGuess([ this.state.number1, this.state.number2, this.state.number3, this.state.number4 ]);
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