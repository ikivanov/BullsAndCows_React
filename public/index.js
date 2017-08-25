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
			<Route exact path="/" component={ Home } />
			<Route exact path="/index.html" component={ Home } />
			<Route path="/humanVsComputer" component={ HumanVsComputer } />
			<Route path="/computerVsComputer" component={ ComputerVsComputer } />
			<Route path="/multiplayer" component={ Multiplayer } />
			<Route path="/peer2peer" component={ Peer2Peer } />
		</div>
	</BrowserRouter>,
	document.getElementById('root')
);