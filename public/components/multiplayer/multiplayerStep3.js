import React from 'react';
import ReactDOM from 'react-dom';

import NumberSelector from '../reusables/numberSelector.js';
import ServerOutput from '../reusables/serverOutput.js';

export default class MultiplayerStep3 extends React.Component {
	render() {
		return (
			<table className="game-table">
				<tbody>
					<tr>
						<td>
							<NumberSelector disabled={ this.state.isRunning && this.state.isMyTurn } onGuess={ (number) => this.onGuess(number) }/>
						</td>
					</tr>

					<tr>
						<td>
							<ServerOutput output={ this.state.guesses }/>

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
}