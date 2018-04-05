import React from "react";

import { connect } from "react-redux";
import { getSuitcases } from "./../actions";

import { Link } from "react-router-dom";

class SearchResults extends React.Component {
    componentDidMount() {
        this.props.dispatch(getSuitcases());
    }

    render() {
        const { suitcases } = this.props;
        console.log("LOADING-.... Props in searchResults", this.props);
        return (
            <div id="search-results">
                {suitcases && (
                    <div id="search-results-wrapper">
                        {suitcases.length ? (
                            suitcases.map((suitcase, i) => {
                                return (
                                    <Link
                                        to={"/suitcase/" + suitcase.id}
                                        key={i}
                                    >
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
                                            <div className="size">
                                                {suitcase.size}
                                            </div>
                                        </div>
                                    </Link>
                                );
                            })
                        ) : (
                            <p>No reach results</p>
                        )}
                    </div>
                )}
            </div>
        );
    }
}

function mapStateToProps(state) {
    console.log("state in SEARCH RESULTS mapStateToProps", state);
    return {
        user: state.user,
        suitcases: state.suitcases,
        errorMsg: state.errorMsg
    };
}

export default connect(mapStateToProps)(SearchResults);
