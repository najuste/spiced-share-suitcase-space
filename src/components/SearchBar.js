import React from "react";

import PlacesAutocomplete from "react-places-autocomplete";
import { geocodeByAddress, getLatLng } from "react-places-autocomplete";

export default class SearchBar extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            from: "",
            to: ""
        };
        this.onChangeFrom = from => this.setState({ from });
        this.onChangeTo = to => this.setState({ to });

        this.handleFormSubmit = this.handleFormSubmit.bind(this);
    }

    handleFormSubmit(e) {
        e.preventDefault();
        geocodeByAddress(this.state.address)
            .then(results => getLatLng(results[0]))
            .then(latLng => console.log("Success", latLng))
            .catch(error => console.error("Error", error));
    }

    render() {
        const inputPropsFrom = {
            value: this.state.from,
            onChange: this.onChangeFrom,
            placeholder: "Where you thrive"
        };
        const inputPropsTo = {
            value: this.state.to,
            onChange: this.onChangeTo,
            placeholder: "Where you thrive"
        };
        const options = {
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

            autocompleteContainer: { width: "12em", height: "3em" }
            // autocompleteItem: { color: "black" }
            // autocompleteItemActive: { color: "blue" }
        };

        return (
            <div id="search-bar">
                <label htmlFor="placeA">From</label>

                <PlacesAutocomplete
                    class="input placeA"
                    inputProps={inputPropsFrom}
                    options={options}
                    styles={myStyles}
                />
                <label htmlFor="placeB">To</label>

                <PlacesAutocomplete
                    class="input placeB"
                    inputProps={inputPropsTo}
                    options={options}
                    styles={myStyles}
                />
                <label htmlFor="date">Dates</label>
                <input className="input date" type="date" />
                <label htmlFor="size">Size</label>

                <select className="input size">
                    <option value="small">small</option>
                    <option value="average">average</option>
                    <option value="big">big</option>
                </select>
            </div>
        );
    }
}
