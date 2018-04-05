import React from "react";
import { SearchShareButtons } from "./SearchShareButtons.js";

import { connect } from "react-redux";
import { searchForSuitcase, shareASuitcase } from "./../actions";

import PlacesAutocomplete, {
    geocodeByAddress,
    getLatLng
} from "react-places-autocomplete";

class SearchBar extends React.Component {
    constructor(props) {
        super(props);

        let date = new Date();
        date.setDate(date.getDate() + 1);
        this.state = {
            place_a_name: "", //from
            place_b_name: "", //to
            trip_date: date,
            size: "small",
            search_radius: 50000, //in meters
            description: ""
        };
        this.onChangeFrom = place_a_name => this.setState({ place_a_name });
        this.onChangeTo = place_b_name => this.setState({ place_b_name });
        this.onChangeInput = this.onChangeInput.bind(this);
        this.onChangeSlider = this.onChangeSlider.bind(this);
        this.onChangeSize = this.onChangeSize.bind(this);
        this.searchForSuitcase = this.searchForSuitcase.bind(this);
        this.shareASuitcase = this.shareASuitcase.bind(this);
    }
    onChangeInput(e) {
        this.setState({
            [e.target.name]: e.target.value
        });
    }

    onChangeSize() {
        let size = document.getElementById("size").value;
        this.setState({ size });
    }
    onChangeSlider(e) {
        //let search_radius_in_m = e.target.value * 1000;
        //console.log(search_radius_in_m, e.target.value);
        this.setState({
            [e.target.name]: e.target.value
        });
    }

    searchForSuitcase() {
        const {
            place_a_name,
            place_b_name,
            trip_date,
            size,
            search_radius
        } = this.state;
        //let search_radius = searchradius * 1000;
        geoCode(place_a_name, place_b_name).then(results => {
            let place_a = `POINT(${results.resultsFrom.lat} ${
                results.resultsFrom.lng
            })`;
            let place_b = `POINT(${results.resultsTo.lat} ${
                results.resultsTo.lng
            })`;

            // console.log(
            //     "Dispatching a data to searchForSuitcase",
            //     place_a,
            //     place_b,
            //     trip_date,
            //     size,
            // search_radius

            // );
            this.props.dispatch(
                searchForSuitcase({
                    place_a,
                    place_b,
                    trip_date,
                    size,
                    search_radius
                })
            );
        });
    }

    shareASuitcase() {
        // console.log("Button clicked", this.state);
        const {
            place_a_name,
            place_b_name,
            trip_date,
            size,
            description
        } = this.state;
        geoCode(place_a_name, place_b_name).then(results => {
            // console.log("Inside shareASuitcase,", results);
            //'POINT(41.2 32.4)'
            let place_a = `POINT(${results.resultsFrom.lat} ${
                results.resultsFrom.lng
            })`;
            let place_b = `POINT(${results.resultsTo.lat} ${
                results.resultsTo.lng
            })`;
            // console.log(
            //     "Dispatching a data to shareASuitcase",
            //     place_a,
            //     place_a_name,
            //     place_b,
            //     place_b_name,
            //     trip_date,
            //     size
            // );
            this.props.dispatch(
                shareASuitcase({
                    place_a,
                    place_a_name,
                    place_b,
                    place_b_name,
                    trip_date,
                    size,
                    description
                })
            );
        });
        //results = geoC(this.state.from, this.state.to);
    }

    render() {
        const inputPropsFrom = {
            value: this.state.place_a_name,
            onChange: this.onChangeFrom,
            placeholder: "From:"
        };
        const inputPropsTo = {
            value: this.state.place_b_name,
            onChange: this.onChangeTo,
            placeholder: "To:"
        };
        const options = {
            // TODO: check if vould be bounded just to CITIES ??? Or try with airports
            // location: new google.maps.LatLng(52.52, 13.409),
            // radius: 10000, //10 km
            // country: "de",
            types: ["geocode"]
        };
        const myStyles = {
            root: { position: "relative" },
            input: {
                width: "9em",
                height: "2em",
                padding: "0.4em 0.4em 0.2em 0.2em",
                margin: "1em",
                fontSize: "1em",
                fontFamily: "Arial",
                backgroundColor: "rgba(250, 250, 250, 0.8)"
            },

            autocompleteContainer: {
                width: "12em",
                height: "3em",
                color: "blue",
                zIndex: "10px"
            }
            // autocompleteItem: { color: "black" }
            // autocompleteItemActive: { color: "blue" }
        };

        return (
            <div id="search-bar">
                <PlacesAutocomplete
                    class="input placeA"
                    inputProps={inputPropsFrom}
                    options={options}
                    styles={myStyles}
                />
                <PlacesAutocomplete
                    class="input placeB"
                    inputProps={inputPropsTo}
                    options={options}
                    styles={myStyles}
                />
                <input
                    onChange={this.onChangeInput}
                    className="input date"
                    type="date"
                    name="trip_date"
                />
                <select
                    onChange={this.onChangeSize}
                    className="input size"
                    id="size"
                >
                    <option value="small">small</option>
                    <option value="average">average</option>
                    <option value="big">big</option>
                </select>
                {this.props.path == "/share-suitcase" ? (
                    <div>some extra stuff</div>
                ) : (
                    <div className="slider">
                        <label htmlFor="search_radius">Search radius</label>
                        <input
                            onChange={this.onChangeSlider}
                            type="range"
                            min="10000"
                            max="1000000"
                            value={this.state.search_radius}
                            step="10000"
                            name="search_radius"
                            id="search_radius"
                        />
                        <output name="value" htmlFor="search_radius">
                            {this.state.search_radius / 1000} km
                        </output>
                    </div>
                )}
                {this.props.path == "/share-suitcase" ? (
                    <SearchShareButtons shareASuitcase={this.shareASuitcase} />
                ) : (
                    <SearchShareButtons
                        searchForSuitcase={this.searchForSuitcase}
                    />
                )}
            </div>
        );
    }
}
// {this.props.path != "/share-suitcase" && (
//
//         <input onChange={this.onChangeInput} type="range" min="10" max="100"
//             value="50" name="search_radius" id="search_radius">
//
// )}

// {this.props.path == "/share-suitcase" && (
//     <div id="desc-edit">
//         <p> Please submit the description of your suitcase and place available</p>
//         <textarea
//             type="text"
//             defaultValue={//TODO should get here the description from the state
//                 this.state.description}/>
//         <button
//             type="submit"
//             className="btn btn-submit"
//             onClick={this.handleDescSubmit}>
//             Update
//         </button>
//     </div>
// )}

async function geoCode(from, to) {
    const resultsFrom = geocodeByAddress(from).then(results =>
        getLatLng(results[0])
    );

    const resultsTo = geocodeByAddress(to).then(results =>
        getLatLng(results[0])
    );
    console.log("From results:", resultsFrom, "To results:", resultsTo);
    return { resultsFrom: await resultsFrom, resultsTo: await resultsTo };
}

export default connect(null)(SearchBar);
