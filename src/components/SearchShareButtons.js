import React from "react";

export const SearchShareButtons = props => {
    return (
        <div className="btn main-btn">
            {props.searchForSuitcase ? (
                <div className="search-btn">
                    <button onClick={props.searchForSuitcase}>
                        SEARCH FOR SUITCASE
                    </button>
                </div>
            ) : (
                <div className="search-btn">
                    <button onClick={props.shareASuitcase}>
                        SHARE A SUITCASE
                    </button>
                </div>
            )}
        </div>
    );
};
