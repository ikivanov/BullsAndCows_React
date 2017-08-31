import React from 'react';
import ReactDOM from 'react-dom';
import PropTypes from 'prop-types';

export default class MultiplayerStep1 extends React.Component {
	render() {
		return (
			<table className="game-table">
				<tbody>
					<tr>
						<td style={{ textAlign: 'left' }}>
							<label>1. Enter your nickname </label>
						</td>
					</tr>
					<tr>
						<td>
							<input type="text" value={ this.state.nickname } onChange={ (e) => this.setState({ nickname: e.target.value }) }/>
						</td>
					</tr>
					<tr>
						<td><br /></td>
					</tr>
					<tr>
						<td colSpan="4" style={{ textAlign: 'left' }}>
							<label>2. Create new game</label>
						</td>
					</tr>
					<tr>
						<td colSpan="2">
							<input type="text" value={ this.state.gameName } onChange={ (e) => this.setState({ gameName: e.target.value }) } />
						</td>
						<td colSpan="2">
							<button disabled={ this.state.nickname.length === 0 || this.state.gameName.length === 0 } onClick={ () => this.onCreateGameBtnClicked() }>Create Game</button>
						</td>
					</tr>
					<tr>
						<td><br /></td>
					</tr>
					<tr>
						<td colSpan="4" style={{ textAlign: 'left' }}>
							<label>or join an existing one</label>
						</td>
					</tr>
					<tr>
						<td colSpan="2">
							<select className="full-width"
								value={ this.state.selectedGameId }
								disabled={ this.state.gamesList.length === 0 }
								onChange={(e) => this.setState({ selectedGameId: e.target.value }) }>
							{
								this.state.gamesList.map((game, index) =>
									<option key={index} value={ game.id }>{ game.name }</option>
								)
							}
							</select>
						</td>
						<td colSpan="2">
							<button disabled={ this.state.nickname.length === 0 || this.state.selectedGameId.length === 0 } onClick={ () => this.onJoinGameBtnClicked() }>Join Game</button>
						</td>
					</tr>
				</tbody>
			</table>
		)
	}

	constructor(props) {
		super(props);

		this.state = {
			nickname: "",
			gameName: "",
			selectedGameId: props.selectedGameId,
			gamesList: props.gamesList,
			gamePlayers: []
		};

		this.onCreateGame = props.onCreateGame || null;
		this.onJoinGame = props.onJoinGame || null;
	}

	componentWillReceiveProps(props) {
		this.setState({
			selectedGameId: props.selectedGameId,
			gamesList: props.gamesList
		});
	}

	onCreateGameBtnClicked() {
		if (!this.onCreateGame) {
			return;
		}

		this.onCreateGame({ gameName: this.state.gameName, nickname: this.state.nickname });
	}

    onJoinGameBtnClicked() {
		if (!this.onJoinGame) {
			return;
		}

		this.onJoinGame({ selectedGameId: this.state.selectedGameId, nickname: this.state.nickname });
	}
}

MultiplayerStep1.propTypes = {
	selectedGameId: PropTypes.string,
	gameList: PropTypes.arrayOf(PropTypes.string),
	onCreateGame: PropTypes.func.isRequired,
	onJoinGame: PropTypes.func.isRequired
}