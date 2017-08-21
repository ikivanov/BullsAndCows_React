import React from 'react';
import ReactDOM from 'react-dom';

import '../../styles/main.css';

export default class NumberSelector extends React.Component {
	constructor(props) {
		super(props);

		this.state = {
			number1: 1,
			number2: 2,
			number3: 3,
			number4: 4,
			isValidInput: true,
			disabled: props.disabled || false
		};

		if (props.onGuess) {
			this.onGuess = props.onGuess;
		}
	}

	render() {
		return (
			<table style={{ width: '100%' }}>
				<tbody>
					<tr>
						<td>
							<input type="number" className="guess-number-textbox" min="1" max="9" disabled={ !this.state.disabled } value={ this.state.number1 }
								onChange={ (e) => {
									this.setState({ number1: e.target.value}, () => {
										this.onValidate(e);
									});
								}} />
						</td>
						<td>
							<input type="number" className="guess-number-textbox" min="0" max="9" disabled={ !this.state.disabled } value={ this.state.number2 }
								onChange={ (e) => {
									this.setState({ number2: e.target.value}, () => {
										this.onValidate(e);
									});
								}} />
						</td>
						<td>
							<input type="number" className="guess-number-textbox" min="0" max="9" disabled={ !this.state.disabled } value={ this.state.number3 }
								onChange={ (e) => {
									this.setState({ number3: e.target.value}, () => {
										this.onValidate(e);
									});
								}} />
						</td>
						<td>
							<input type="number" className="guess-number-textbox" min="0" max="9" disabled={ !this.state.disabled } value={ this.state.number4 }
								onChange={ (e) => {
									this.setState({ number4: e.target.value}, () => {
										this.onValidate(e);
									});
								}} />
						</td>
					</tr>

					<tr>
						<td colSpan="4">
							<button className="guess-button" disabled={ !this.state.disabled || !this.state.isValidInput } onClick={ (e) => this.onGuessBtnClicked(e) }>
								Make a guess
							</button>
						</td>
					</tr>

					{
						!this.state.isValidInput &&
						<tr>
							<td colSpan="4">
								<div className="validation-footer">Guess number cannot contain <br />duplicating digits!</div>
							</td>
						</tr>
					}
				</tbody>
			</table>
		)
	}

	componentWillReceiveProps(props) {
		if (this.props.disabled === props.disabled) {
			return;
		}

		this.setState({ disabled: props.disabled });
	}

	onValidate(e) {
		this.setState({ isValidInput: this.isValidNumber() });
	}

    isValidNumber() {
		if (this.state.number1 == 0) {
            return false;
        }

        let nums = [this.state.number1, this.state.number2, this.state.number3, this.state.number4];

		//are numbers different from each other?
		for (let i = 0; i < nums.length; i++) {
			for (let j = nums.length - 1; j > i; j--) {
				if (nums[i] == nums[j])
					return false;
			}
		}

		return true;
	}

	onGuessBtnClicked(e) {
        if (!this.isValidNumber()) {
            alert("Guess number cannot contain duplicating digits!");
            return;
        }

		if (this.onGuess) {
			let number = [this.state.number1, this.state.number2, this.state.number3, this.state.number4];

			this.onGuess(number);
		}
	}
}