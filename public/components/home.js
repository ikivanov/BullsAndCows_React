import React from 'react';
import ReactDOM from 'react-dom';
import { Link } from 'react-router-dom';

import '../styles/main.css';

import Header from './reusables/header.js';
import Footer from './reusables/footer.js';

export default class Home extends React.Component {
	render() {
		return (
			<div id="workspace" className="workspace">
				<div id="game_root">
					<Header title="Welcome to" description="Bulls and Cows" />

					<div className="info-title">
						<div>Please select a game type:</div>
					</div>

					<table className="game-table">
						<tbody>
							<tr>
								<td>
									<Link to='/humanVsComputer'>
										<button className="game-menu-button">Human vs. Computer</button>
									</Link>
								</td>
							</tr>
							<tr>
								<td>
									<Link to='/computerVsComputer'>
										<button className="game-menu-button">Computer vs. Computer</button>
									</Link>
								</td>
							</tr>
							<tr>
								<td>
									<Link to='/multiplayer'>
										<button className="game-menu-button">Multiplayer</button>
									</Link>
								</td>
							</tr>
							<tr>
								<td>
									<Link to='/peer2peer'>
										<button className="game-menu-button">Peer to Peer</button>
									</Link>
								</td>
							</tr>
						</tbody>
					</table>

					<Footer />
				</div>
			</div>
		);
	}
}