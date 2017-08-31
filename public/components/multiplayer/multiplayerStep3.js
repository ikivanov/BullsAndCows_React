import React from 'react';
import ReactDOM from 'react-dom';

import NumberSelector from '../reusables/numberSelector.js';
import ServerOutput from '../reusables/serverOutput.js';
import ProgressBar from '../reusables/progressBar.js';

import PropTypes from 'prop-types';

export default class MultiplayerStep3 extends React.Component {
	render() {
		return (
			<table className="game-table">
				<tbody>
					<tr>
						<td>
							<NumberSelector disabled={ !this.state.isRunning || !this.state.isMyTurn } onGuess={ (number) => this.onGuess(number) }/>
						</td>
					</tr>

					<tr>
						<td>
							<ServerOutput output={ this.state.guesses }/>

							<ProgressBar visible={ !this.state.isRunning && !this.state.isGameOver }
								text="Awaiting game start..." />

							<ProgressBar visible={ this.state.isRunning && !this.state.isMyTurn }
								text="Please wait for your turn..." />
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

MultiplayerStep3.propTypes = {
	isGameOver: PropTypes.bool,
	isRunning: PropTypes.bool,
	isMyTurn: PropTypes.bool,
	guesses: PropTypes.arrayOf(PropTypes.string),
	onGuess: PropTypes.func.isRequired
}