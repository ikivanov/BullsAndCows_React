import React from 'react';
import ReactDOM from 'react-dom';
import PropTypes from 'prop-types';

export default class ProgressBar extends React.Component {
	constructor(props) {
		super(props);

		this.state = {
			visible: props.visible,
			text: props.text
		}
	}

	componentWillReceiveProps(props) {
		this.setState({ visible: props.visible });
	}

	render() {
		if (!this.state.visible) {
			return null;
		}

		return (
			<div className="game-progress">
				<img src="img/waiting.gif" />
				<span>{ this.state.text }</span>
			</div>
		)
	}
}

ProgressBar.propTypes = {
	visible: PropTypes.bool,
	text: PropTypes.string.isRequired
}

ProgressBar.defaultProps = {
	visible: false
}