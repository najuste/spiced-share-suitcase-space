import React from "react";

export default function ProfileLogo(props) {
    return (
        <div className="profile-logo-wrapper">
            <div>
                <p>{props.firstName}</p>
            </div>
            <img
                className="userpic"
                src={props.profilePic}
                alt={props.firstName + "_" + props.lastName}
                onClick={props.toggleUploader}
            />
            <div>Links</div>
        </div>
    );
}

// <div>Links</div> :
// LINKS to PROFILE menu :
//     Profile (has it all..)
//     Edit Profile
//     Offered trips
//     Used space
//     Logout
