import React from 'react';
import ReactDOM from 'react-dom';
import PropTypes from 'prop-types';

import NumberSelector from '../reusables/numberSelector.js';
import ServerOutput from '../reusables/serverOutput.js';
import ProgressBar from '../reusables/progressBar.js';

export default class Peer2PeerStep3 extends React.Component {
	render() {
		return (
			<table>
				<tbody>
					<tr>
						<td>
							<table>
								<tbody>
									<tr>
										<td>
											<NumberSelector disabled={ !this.state.isRunning || !this.state.isMyTurn } onGuess={ (number) => this.onGuess(number) }/>
										</td>
									</tr>
									<tr>
										<td>
											<ServerOutput output={ this.state.guesses }/>
										</td>
									</tr>
								</tbody>
							</table>
						</td>

						<td>
							<table>
								<tbody>
									<tr>
										<td>
											Opponent guesses
										</td>
									</tr>
									<tr>
										<td>
											<ServerOutput output={ this.state.opponentGuesses }/>

											<ProgressBar visible={ !this.state.isRunning && !this.state.isGameOver }
												text="Awaiting game start..." />

											<ProgressBar visible={ this.state.isRunning && !this.state.isMyTurn }
												text="Please wait for your turn..." />
										</td>
									</tr>
								</tbody>
							</table>
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
			opponentGuesses: [],
			isMyTurn: false
		}

		this.onGuess = props.onGuess || null;
	}

	componentWillReceiveProps(props) {
		this.setState({
			isGameOver: props.isGameOver,
			isRunning: props.isRunning,
			isMyTurn: props.isMyTurn,
			guesses: props.guesses,
			opponentGuesses: props.opponentGuesses
		});
	}
}

Peer2PeerStep3.propTypes = {
	isGameOver: PropTypes.bool.isRequired,
	isRunning: PropTypes.bool.isRequired,
	isMyTurn: PropTypes.bool.isRequired,
	guesses: PropTypes.arrayOf(PropTypes.string),
	opponentGuesses: PropTypes.arrayOf(PropTypes.string),
	onGuess: PropTypes.func.isRequired
}