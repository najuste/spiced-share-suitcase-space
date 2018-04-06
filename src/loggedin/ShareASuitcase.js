import React from "react";
import SearchBar from "./../components/SearchBar";

import { connect } from "react-redux";
import { getLoggedInUser } from "./../actions";

class ShareASuitcase extends React.Component {
    componentDidMount() {
        this.props.dispatch(getLoggedInUser());
        console.log("componentDidMount -----SHARE SUITCASE", this.props);
        if (!this.props.user) {
            window.location.replace("/login");
        }
    }

    render() {
        console.log("Props", this.props);
        return (
            <div className="section offer">
                <p className="italic">
                    Here you can share your suitcase! And don't forget to add
                    the description .)
                </p>

                <SearchBar path={this.props.match.path} />
            </div>
        );
    }
}

function mapStateToProps(state) {
    return {
        user: state.user
    };
}

export default connect(mapStateToProps)(ShareASuitcase);
