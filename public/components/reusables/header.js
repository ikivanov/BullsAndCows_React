import React from 'react';
import ReactDOM from 'react-dom';

export default class Header extends React.Component {
	render() {
		return (
			<div className="info-title">
				<div>{ this.props.title }</div>
				<div>{ this.props.description }</div>
			</div>
		)
	}
}