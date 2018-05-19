import "./Map.css";

import React from "react";
import ReactDOM from "react-dom";

import L from "leaflet";
//will need access data from DB
// -- write QUERIES
// -- establish route to reach DATA
// -- map it in here

import { connect } from "react-redux";
import { getSuitcases } from "./actions";

class Map extends React.Component {
    constructor(props) {
        super(props);
    }

    componentWillMount() {
        this.props.dispatch(getSuitcases());
    }

    componentDidMount() {
        //
        var latlng = L.latLng(51, 5);

        var Stamen_TonerLite = L.tileLayer(
            "https://stamen-tiles-{s}.a.ssl.fastly.net/toner-lite/{z}/{x}/{y}.{ext}",
            {
                attribution:
                    'Map tiles by <a href="http://stamen.com">Stamen Design</a>, <a href="http://creativecommons.org/licenses/by/3.0">CC BY 3.0</a> &mdash; Map data &copy; <a href="http://www.openstreetmap.org/copyright">OpenStreetMap</a>',
                subdomains: "abcd",
                minZoom: 0,
                maxZoom: 20,
                ext: "png"
            }
        );

        var map = (this.map = L.map(ReactDOM.findDOMNode(this), {
            center: latlng,
            maxZoom: 20,
            layers: [Stamen_TonerLite],
            attributionControl: false
        }));

        map.on("click", this.onMapClick);
        map.fitWorld();
    }

    componentWillUnmount() {
        this.map.off("click", this.onMapClick);
        this.map = null;
    }

    // onMapClick = () => {
    //     // Do some wonderful map things...
    // }

    render() {
        const { suitcases } = this.props;
        return <div className="suitcase-map" />;
    }
}

function mapStateToProps(state) {
    console.log("state in SEARCH RESULTS mapStateToProps", state);
    return {
        //user: state.user,
        suitcases: state.suitcases
    };
}

export default connect(mapStateToProps)(Map);
