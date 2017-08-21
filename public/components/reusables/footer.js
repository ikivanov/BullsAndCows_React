import React from 'react';
import ReactDOM from 'react-dom';

export default class Footer extends React.Component {
	render() {
		return (
			<div>
				<h5 className="footer">
					Implemented by <a href="mailto:ikivanov@gmail.com">Ivan Ivanov</a>
				</h5>
				<h5 className="footer2">
					Phone: +359 888 959 386
				</h5>
			</div>
		)
	}
}