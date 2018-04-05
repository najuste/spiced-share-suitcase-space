import "./Profile.css";

import React from "react";
import ProfilePic from "./ProfilePic";
import { ProfilePicUpload } from "./ProfilePicUpload";

import { connect } from "react-redux";
import {
    getLoggedInUser,
    uploadPic,
    editDesc,
    getUserSuitcases
} from "./../actions";

let suitcasesOffered, suitcasesTaken;

class Profile extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            //profilePic: "",
            showPicUpload: false,
            file: "",
            label: "Choose your logo!",
            showDescriptionEdit: false
        };
        this.togglePicUpload = this.togglePicUpload.bind(this);
        this.handlePicChange = this.handlePicChange.bind(this);
        this.handlePicUpload = this.handlePicUpload.bind(this);
        this.toggleDesc = this.toggleDesc.bind(this);
        this.handleDescSubmit = this.handleDescSubmit.bind(this);
    }
    componentDidMount() {
        this.props.dispatch(getLoggedInUser());
        this.props.dispatch(getUserSuitcases());
    }

    // --- subsection PIC;
    togglePicUpload() {
        this.setState({ showPicUpload: !this.state.showPicUpload });
    }

    handlePicChange(e) {
        this.setState({
            [e.target.name]: e.target.files[0],
            label: e.target.files[0].name.slice(0, 10) + "..."
        });
    }

    handlePicUpload(e) {
        e.preventDefault();
        const formData = new FormData();
        formData.append("file", this.state.file);
        this.props.dispatch(uploadPic(formData));
        this.togglePicUpload();
    }

    // --- subsection DESC;
    toggleDesc() {
        this.setState({ showDescriptionEdit: !this.state.showDescriptionEdit });
    }

    handleDescSubmit() {
        let desc = document.querySelector("textarea").value;
        console.log("Got description:", desc);
        this.props.dispatch(editDesc(desc));
        this.toggleDesc();
    }

    render() {
        console.log("PROFILE.js, props!!", this.props);
        const { user, suitcasesTaken, suitcasesOffered } = this.props;

        return (
            <div className="section user-profile">
                <div className="subsection pic">
                    {this.state.showPicUpload ? (
                        <ProfilePicUpload
                            uploadPicLabel={this.state.label}
                            uploadPic={this.state.file}
                            handlePicChange={this.handlePicChange}
                            handlePicUpload={this.handlePicUpload}
                            togglePicUpload={this.togglePicUpload}
                        />
                    ) : (
                        <div>
                            {this.props.user && (
                                <ProfilePic
                                    firstName={user.firstname}
                                    lastName={user.lastname}
                                    profilePic={user.profilepic}
                                    togglePicUpload={this.togglePicUpload}
                                />
                            )}
                        </div>
                    )}
                </div>
                <div className="subsection desc">
                    {!this.state.showDescriptionEdit ? (
                        <div id="desc-text">
                            <p>
                                {this.props.user &&
                                    (user.description ? (
                                        user.description
                                    ) : (
                                        <a onClick={this.toggleDesc}>
                                            You haven't shared anything with us
                                            yet
                                        </a>
                                    ))}
                            </p>
                            <button
                                className="btn btn-upload"
                                onClick={this.toggleDesc}
                            >
                                Edit
                            </button>
                        </div>
                    ) : (
                        <div id="desc-edit">
                            <textarea
                                type="text"
                                defaultValue={
                                    user.description
                                        ? user.description
                                        : "tell us about yourself"
                                }
                            />
                            <button
                                type="submit"
                                className="btn btn-submit"
                                onClick={this.handleDescSubmit}
                            >
                                Update
                            </button>
                        </div>
                    )}
                </div>
                <div className="subsection-trips">
                    {suitcasesOffered && (
                        <div className="trips suitcase-offered">
                            <h3>Suitcases shared</h3>
                            {suitcasesOffered.length &&
                                suitcasesOffered.map(suitcase => {
                                    //check if trip_date is already behind today
                                    return (
                                        <div className="suitcase">
                                            <div className="from">
                                                {suitcase.place_a_name}
                                            </div>
                                            <div className="to">
                                                {suitcase.place_b_name}
                                            </div>
                                            <div className="date">
                                                {suitcase.trip_date}
                                            </div>
                                        </div>
                                    );
                                })}
                        </div>
                    )}
                    {suitcasesTaken && (
                        <div className="trips suitcase-taken">
                            <h3>Suitcases taken</h3>

                            {suitcasesTaken.length &&
                                suitcasesTaken.map(suitcase => {
                                    //check if trip_date is already behind today
                                    return (
                                        <div className="suitcase">
                                            <div className="from">
                                                {suitcase.place_a_name}
                                            </div>
                                            <div className="to">
                                                {suitcase.place_b_name}
                                            </div>
                                            <div className="date">
                                                {suitcase.trip_date}
                                            </div>
                                        </div>
                                    );
                                })}
                        </div>
                    )}
                </div>
                <div className="subsection reviews">
                    Review block, that logged in user can leave? Sockets?
                </div>
            </div>
        );
    }
}

function mapStateToProps(state) {
    // console.log("state in MAP STATE TO PROPS in Profile", state);
    return {
        user: state.user,
        errorMsg: state.errorMsg,
        suitcasesOffered:
            state.userSuitcases &&
            state.userSuitcases.filter(s => {
                return s.reservedby_id !== state.user.id;
            }),
        suitcasesTaken:
            state.userSuitcases &&
            state.userSuitcases.filter(s => {
                return s.user_id !== state.user.id;
            })
    };
    console.log("state in MAP STATE TO PROPS in Profile", state);
}

export default connect(mapStateToProps)(Profile);
