import React, { Component } from "react";
import { BrowserRouter, Route, Link, Switch } from "react-router-dom";
// import axios from "./axios";

import "./App.css";

import logo from "./img/logo.svg";
import menuicon from "./img/menu-caret-down.svg";

import Lost from "./Lost";

import LoginForm from "./registration/LoginForm";
import RegisterForm from "./registration/RegisterForm";

import SearchBar from "./components/SearchBar";
import SearchResults from "./components/SearchResults";
import ProfilePic from "./loggedin/ProfilePic";
import Profile from "./loggedin/Profile";
import ShareASuitcase from "./loggedin/ShareASuitcase";
import Suitcase from "./loggedin/Suitcase";

import { connect } from "react-redux";
import { getLoggedInUser } from "./actions";

class App extends Component {
    constructor() {
        super();
        this.state = {
            showMenu: false
        };
        this.toggleMenu = this.toggleMenu.bind(this);
    }

    componentDidMount() {
        this.props.dispatch(getLoggedInUser());
    }
    toggleMenu() {
        this.setState({ showMenu: !this.state.showMenu });
    }
    handleClick() {
        window.location.assign("/login");
    }
    render() {
        const { user } = this.props;
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
                                <div className="navigation-corner">
                                    <Link to="/share-suitcase">
                                        <div className="btn btn-nav">
                                            SHARE YOUR SUITCASE
                                        </div>
                                    </Link>
                                    {!this.props.user ? (
                                        <Link to="/login">
                                            <div className="btn btn-nav">
                                                LOGIN
                                            </div>
                                        </Link>
                                    ) : (
                                        <div className="user-profile">
                                            <Link to="/profile">
                                                <div className="profile profile-name">
                                                    {user.firstname}
                                                </div>
                                                {this.props.user && (
                                                    <ProfilePic
                                                        firstName={
                                                            user.firstname
                                                        }
                                                        lastName={user.lastname}
                                                        profilePic={
                                                            user.profilepic
                                                        }
                                                    />
                                                )}
                                            </Link>
                                            <div className="profile menu">
                                                <img
                                                    id="menu-icon"
                                                    src={menuicon}
                                                    onClick={this.toggleMenu}
                                                />
                                                {this.state.showMenu && (
                                                    <Menu
                                                        toggleMenu={
                                                            this.toggleMenu
                                                        }
                                                    />
                                                )}
                                            </div>
                                        </div>
                                    )}
                                </div>
                            </nav>
                            <h1 className="title">Share Suitcase Space</h1>
                        </header>
                        <main>
                            <Route
                                exact
                                path="/"
                                render={props => (
                                    <div>
                                        <SearchBar {...props} />
                                        <SearchResults />
                                    </div>
                                )}
                            />
                            <Route path="/login" component={LoginForm} />
                            <Route path="/register" component={RegisterForm} />

                            <Route path="/profile" component={Profile} />

                            <Route
                                path="/share-suitcase"
                                component={ShareASuitcase}
                            />
                            <Route path="/suitcase/:id" component={Suitcase} />
                        </main>
                    </div>
                </BrowserRouter>
            </div>
        );
    }
}
const Menu = props => {
    console.log("Should show Menu");
    return (
        <div id="drop-down-menu">
            <Link to="/profile" onClick={props.toggleMenu}>
                Profile
            </Link>
            <Link to="/share-suitcase" onClick={props.toggleMenu}>
                Share-A-Suitace
            </Link>
            <Link to="/" onClick={props.toggleMenu}>
                Find-A-Suitace
            </Link>
            <Link to="/messages" onClick={props.toggleMenu}>
                Messages
            </Link>
        </div>
    );
};

function mapStateToProps(state) {
    //console.log("App mapStateToProps", state);
    return {
        user: state.user,
        errorMsg: state.errorMsg
    };
}
export default connect(mapStateToProps)(App);
