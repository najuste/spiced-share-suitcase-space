import React from "react";
import ProfilePic from "./ProfilePic";
import { Link } from "react-router-dom";

import { connect } from "react-redux";
import {
    getSuitcases,
    getSuitcaseById,
    reserveSuitcaseById
} from "./../actions";

class Suitcase extends React.Component {
    constructor() {
        super();

        this.handleSuitcaseReservation = this.handleSuitcaseReservation.bind(
            this
        );
    }
    componentWillMount() {
        console.log("Component will mount, the props Im getting", this.props);
        if (!this.props.user) {
            window.location.replace("/login");
        }
    }

    componentDidMount() {
        const id = this.props.match.params.id;
        console.log("Logging id of the suitcase ,", id);
        this.props.dispatch(getSuitcaseById(`${this.props.match.params.id}`));
        //if user directly got the url, the state does not have suitcases array
        this.props.dispatch(getSuitcases());
    }

    handleSuitcaseReservation() {
        const id = this.props.match.params.id;
        this.props.dispatch(
            reserveSuitcaseById(`${this.props.match.params.id}`)
        );

        //redirect
        //window.location.replace("/profile");
    }

    render() {
        console.log("Logging in Suitcase, the props", this.props);
        const { suitcase } = this.props;

        return (
            <div>
                {suitcase && (
                    <div id="suitcase-section">
                        <div className="suitcase-owner">
                            <ProfilePic
                                firstName={suitcase.firstname}
                                lastName={suitcase.lastname}
                                profilePic={suitcase.profilepic}
                            />
                            <h3>{suitcase.firstName}</h3>
                        </div>
                        <div className="suitcase">
                            <div className="from">{suitcase.place_a_name}</div>
                            <div className="to">{suitcase.place_b_name}</div>
                            <div className="date">{suitcase.trip_date}</div>
                            <div className="size">{suitcase.size}</div>
                        </div>

                        <button
                            className="btn btn-submit"
                            onClick={this.handleSuitcaseReservation}
                        >
                            Book a suitcase
                        </button>
                    </div>
                )}
            </div>
        );
    }
}

function mapStateToProps(state) {
    console.log("state in SUITCASE mapStateToProps", state);
    return {
        user: state.user,
        suitcase: state.suitcase,
        errorMsg: state.errorMsg,
        suitcases: state.suitcases
    };
}

export default connect(mapStateToProps)(Suitcase);
