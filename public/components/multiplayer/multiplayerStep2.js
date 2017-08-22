import React from 'react';
import ReactDOM from 'react-dom';

export default class MultiplayerStep2 extends React.Component {
	render() {
		return (
			<table className="game-table">
				<tbody>
					<tr>
						<td colSpan=" 2">
							<label>Game name:</label>
						</td>
						<td colSpan="2">
							<label>{ this.props.gameName }</label>
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
		)
	}

	constructor(props) {
		super(props);

		this.state = {
			gamePlayers: []
		}

		this.onAddBot = props.onAddBot || null;
		this.onStartGame = props.onStartGame || null;
	}

	componentWillReceiveProps(props) {
		if (this.props.gamePlayers === props.gamePlayers) {
			return;
		}

		this.setState({ gamePlayers: props.gamePlayers });
	}

	onAddBotBtnClicked() {
		if (!this.onAddBot) {
			return;
		}

		this.onAddBot();
	}

	onStartGameBtnClicked() {
		if (!this.onStartGame) {
			return;
		}

		this.onStartGame();
	}
}