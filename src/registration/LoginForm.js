import React from "react";
// import axios from "./../axios";
import { Link } from "react-router-dom";
import { FormErrors } from "./FormErrors";

import { connect } from "react-redux";
import { login } from "./../actions";

class LoginForm extends React.Component {
    constructor() {
        super();
        this.state = {
            email: "",
            password: "",
            formErrors: {
                email: "",
                password: ""
            },
            emailValid: false,
            passwordValid: false,
            formValid: false,
            errorMsg: false
        };
        this.handleChange = this.handleChange.bind(this);
    }

    handleChange(e) {
        const name = e.target.name;
        const value = e.target.value;
        this.setState(
            {
                [name]: value
            },
            res => {
                this.fieldsNotEmpty(name, value);
            }
        );
    }
    fieldsNotEmpty(name, value) {
        console.log("Validating fields", name, value);
        let formValidation = this.state.formErrors;
        let emailValid = this.state.emailValid;
        let passwordValid = this.state.passwordValid;

        switch (name) {
            case "email":
                emailValid = value.match(
                    /^([\w.!#$%&'*+-=?^_`{|}~]+)@([\w-]+\.)+([\w]{2,})$/i
                );
                formValidation.email = emailValid ? "" : "invalid email";
                break;
            case "password":
                passwordValid = value.length >= 6;
                formValidation.password = passwordValid
                    ? ""
                    : "password at least 6 char long";
                break;
            default:
                break;
        }

        this.setState(
            {
                formErrors: formValidation,
                emailValid: emailValid,
                passwordValid: passwordValid
            },
            this.validateForm
        );
    }

    validateForm() {
        this.setState({
            formValid: this.state.emailValid && this.state.passwordValid
        });
    }

    submitLogin() {
        this.props.dispatch(login(this.state));
    }

    render() {
        const email = this.state.email;
        const password = this.state.password;
        const msg = this.props.errorMsg;

        return (
            <div className="login-section section">
                <input
                    onChange={this.handleChange}
                    name="email"
                    type="email"
                    placeholder="Email"
                />
                <input
                    onChange={this.handleChange}
                    name="password"
                    type="password"
                    placeholder="Password"
                />
                <button
                    type="submit"
                    className="btn btn-register"
                    disabled={!this.state.formValid}
                    onClick={e => {
                        e.preventDefault();
                        this.submitLogin();
                    }}
                >
                    Log in
                </button>
                {msg ? <p className="error">{msg}</p> : null}
                <div className="validation-msg">
                    {!this.state.formValid && (
                        <FormErrors formErrors={this.state.formErrors} />
                    )}
                </div>
                <p>
                    Not registered yet?
                    <br />
                    <Link to="/register">Register!</Link>
                </p>
            </div>
        );
    }
}

function mapStateToProps(state) {
    console.log("state in MAP STATE TO PROPS", state);
    if (state.errorMsg) {
        return {
            errorMsg: state.errorMsg
        };
    }
}

export default connect(mapStateToProps)(LoginForm);
