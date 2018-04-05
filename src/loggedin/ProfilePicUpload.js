import React from "react";

export const ProfilePicUpload = props => {
    return (
        <div id="pic-uploader">
            <div onClick={props.togglePicUpload} id="close">
                x
            </div>
            <form>
                <label htmlFor="file">
                    <a>{props.uploadPicLabel}</a>
                </label>
                <input
                    onChange={props.handlePicChange}
                    name="file"
                    type="file"
                    id="file"
                />
                <button
                    disabled={!props.uploadPic}
                    className="btn btn-upload"
                    onClick={props.handlePicUpload}
                >
                    Upload New Pic
                </button>
            </form>
        </div>
    );
};
