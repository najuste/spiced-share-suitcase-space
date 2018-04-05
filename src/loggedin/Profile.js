import "./Profile.css";

import React from "react";
import ProfilePic from "./ProfilePic";
import { ProfilePicUpload } from "./ProfilePicUpload";

import { connect } from "react-redux";
import { getLoggedInUser, uploadPic, editDesc } from "./../actions";

let tripsOffered, tripsTaken;

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
        const { user } = this.props;
        console.log("Logging in PROFILE.js, props.user", this.props);
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
                        <p id="desc-text">
                            {this.props.user &&
                                (user.description ? (
                                    user.description
                                ) : (
                                    <a onClick={this.toggleDesc}>
                                        You haven't shared anything with us yet
                                    </a>
                                ))}
                            <button
                                className="btn btn-edit"
                                onClick={this.toggleDesc}
                            >
                                Edit
                            </button>
                        </p>
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
                {tripsOffered && (
                    <div className="subsection trips trips-offered">...</div>
                )}
                {tripsTaken && (
                    <div className="subsection trips trips-taken">...</div>
                )}

                <div className="subsection reviews">
                    Review block, that logged in user can leave? Sockets?
                </div>
            </div>
        );
    }
}

function mapStateToProps(state) {
    console.log("state in MAP STATE TO PROPS in Profile", state);
    return {
        user: state.user,
        errorMsg: state.errorMsg
    };
}

export default connect(mapStateToProps)(Profile);
