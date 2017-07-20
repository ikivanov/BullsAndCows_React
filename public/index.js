import React from 'react';
import ReactDOM from 'react-dom';
import { BrowserRouter, Route } from 'react-router-dom';

import './styles/main.css';

import Home from './components/home.js';
import HumanVsComputer from './components/humanVsComputer.js';
import ComputerVsComputer from './components/computerVsComputer.js';
import Multiplayer from './components/multiplayer.js';
import Peer2Peer from './components/peer2peer.js';

ReactDOM.render(
	<BrowserRouter>
		<div>
			<Route exact path="/public" component={ Home } />
			<Route exact path="/public/index.html" component={ Home } />
			<Route path="/public/humanVsComputer" component={ HumanVsComputer } />
			<Route path="/public/computerVsComputer" component={ ComputerVsComputer } />
			<Route path="/public/multiplayer" component={ Multiplayer } />
			<Route path="/public/peer2peer" component={ Peer2Peer } />
		</div>
	</BrowserRouter>,
	document.getElementById('root')
);