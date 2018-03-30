import React from "react";

let searchResults;

export default class SearchResults extends React.Component {
    render() {
        return (
            <div id="search-results">
                {searchResults ? (
                    <div id="search-results-wrapper">
                        <div id="item">Search Item..</div>
                    </div>
                ) : (
                    <p>No reach results</p>
                )}
            </div>
        );
    }
}
