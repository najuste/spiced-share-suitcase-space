import React from "react";
// import axios from "./../axios";
import { Link } from "react-router-dom";
import { FormErrors } from "./FormErrors";

import { connect } from "react-redux";
import { register } from "./../actions";

class RegisterForm extends React.Component {
    constructor() {
        super();
        this.state = {
            firstname: "",
            lastname: "",
            email: "",
            password: "",
            formErrors: {
                email: "",
                password: ""
            },
            emailValid: false,
            passwordValid: false,
            formValid: false
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
            case "firstname":
                var valid = value.length >= 1;
                formValidation.firstname = valid ? "" : "no name?";
                break;
            case "lastname":
                valid = value.length >= 1;
                formValidation.lastname = valid ? "" : "no surname?";
                break;
            case "email":
                emailValid = value.match(
                    /^([\w.%+-]+)@([\w-]+\.)+([\w]{2,})$/i
                );
                formValidation.email = emailValid ? "" : " invalid email";
                break;
            case "password":
                passwordValid = value.length >= 6;
                formValidation.password = passwordValid
                    ? ""
                    : "too short password";
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

    submitRegistration() {
        this.props.dispatch(register(this.state));
    }

    render() {
        const firstname = this.state.firstname;
        const lastname = this.state.lastname;
        const email = this.state.email;
        const password = this.state.password;

        const msg = this.props.errorMsg;
        return (
            <div className="register-section section">
                <input
                    onChange={this.handleChange}
                    name="firstname"
                    type="text"
                    placeholder="First Name"
                />
                <input
                    onChange={this.handleChange}
                    name="lastname"
                    type="text"
                    placeholder="Last Name"
                />
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
                        this.submitRegistration();
                    }}
                >
                    Register
                </button>
                {msg ? <p className="error">{msg}</p> : null}
                {!this.state.formValid && (
                    <FormErrors formErrors={this.state.formErrors} />
                )}
                <p>
                    Already registered?<br />
                    <Link to="/login">Log in!</Link>
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

export default connect(mapStateToProps)(RegisterForm);
