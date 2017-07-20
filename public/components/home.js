import React from 'react';
import ReactDOM from 'react-dom';
import { Link } from 'react-router-dom';

import '../styles/main.css';

export default class Home extends React.Component {
	render() {
		return (
			<div id="workspace" className="workspace">
				<div id="game_root">
					<h1 className="welcome_title">
						Welcome to <br />
						Bulls and Cows!
					</h1>

					<div className="info_title">
						<div>Please select a game type:</div>
					</div>

					<table className="game_table">
						<tbody>
							<tr>
								<td>
									<Link to='/public/humanVsComputer'>
										<button className="game-menu-button">Human vs. Computer</button>
									</Link>
								</td>
							</tr>
							<tr>
								<td>
									<Link to='/public/computerVsComputer'>
										<button className="game-menu-button">Computer vs. Computer</button>
									</Link>
								</td>
							</tr>
							<tr>
								<td>
									<Link to='/public/multiplayer'>
										<button className="game-menu-button">Multiplayer</button>
									</Link>
								</td>
							</tr>
							<tr>
								<td>
									<Link to='/public/peer2peer'>
										<button className="game-menu-button">Peer to Peer</button>
									</Link>
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
}