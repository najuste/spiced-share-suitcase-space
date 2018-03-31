import React, { Component } from "react";
import { BrowserRouter, Route, Link } from "react-router-dom";

import "./App.css";

import logo from "./logo.svg";

import LoginForm from "./registration/LoginForm";
import RegisterForm from "./registration/RegisterForm";

import SearchBar from "./components/SearchBar";
import SearchResults from "./components/SearchResults";
import ProfileLogo from "./loggedin/ProfileLogo";
import Profile from "./loggedin/Profile";

class App extends Component {
    constructor() {
        super();
        this.state = { loggedin: 0 };
    }

    handleClick() {
        console.log("Button was clicked");
        window.location.replace("/login");
    }
    render() {
        return (
            <div className="app">
                <BrowserRouter>
                    <div>
                        <header className="header">
                            <nav>
                                <Link to="/">
                                    <div className="Logo">
                                        <img
                                            src={logo}
                                            className="logo"
                                            alt="logo"
                                            height="50px"
                                        />
                                    </div>
                                </Link>
                                <div className="UserLogo">
                                    {this.state.loggedin === 0 ? (
                                        <Link to="/login">LOGIN</Link>
                                    ) : (
                                        <Link to="/profile">
                                            <ProfileLogo />
                                        </Link>
                                    )}
                                </div>
                            </nav>
                            <h1 className="title">Share Suitcase Space</h1>
                        </header>
                        <main>
                            <Route
                                exact
                                path="/"
                                render={() => (
                                    <div>
                                        <SearchBar />
                                        <SearchResults />
                                    </div>
                                )}
                            />
                            <Route path="/login" component={LoginForm} />
                            <Route path="/register" component={RegisterForm} />
                            <Route path="/profile" component={Profile} />
                        </main>
                    </div>
                </BrowserRouter>
                <footer>
                    <p>maybe some copyrights... </p>
                </footer>
            </div>
        );
    }
}

export default App;
