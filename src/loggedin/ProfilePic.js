import React from "react";
import profileicon from "./../img/default-profile-pic.svg";

export default function ProfilePic(props) {
    console.log("Props in profilepic", props);

    return (
        <div className="profile-logo">
            <img
                className="userpic"
                src={props.profilePic ? props.profilePic : profileicon}
                alt={props.firstName + "_" + props.lastName}
                onClick={props.togglePicUpload}
            />
        </div>
    );
}
//src={props.profilePic ? props.profilePic : { profileicon }}
// <div>Links</div> :
// LINKS to PROFILE menu :
//     Profile (has it all..)
//     Edit Profile
//     Offered trips
//     Used space
//     Logout
