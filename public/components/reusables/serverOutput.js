import React from 'react';
import ReactDOM from 'react-dom';

import '../../styles/main.css';

export default class ServerOutput extends React.Component {
	constructor(props) {
		super(props);

		this.state = {
			output: props.output
		};
	}

	render() {
		return (
			<select className="server-output" multiple size="12">
				{
					this.state.output.map((o, index) =>
						<option key={index}>{ o }</option>
					)
				}
			</select>
		)
	}

	componentWillReceiveProps(props) {
		if (this.props.output === props.output) {
			return;
		}

		this.setState({ output: props.output });
	}
}