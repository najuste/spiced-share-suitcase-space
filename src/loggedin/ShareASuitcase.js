import React from "react";
import SearchBar from "./../components/SearchBar";

export default class ShareASuitcase extends React.Component {
    render() {
        console.log("Props", this.props);
        return (
            <div className="section offer">
                <p>Here you can offer your trip!</p>

                <p>Let's see how searchBar looks like</p>
                <SearchBar path={this.props.match.path} />
            </div>
        );
    }
}
