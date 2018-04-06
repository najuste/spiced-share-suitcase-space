import React from "react";
import { Link } from "react-router-dom";

export default function Lost() {
    return (
        <div className="lost">
            <h1>Ups...</h1>
            <p>You've probably lost your suitcase...</p>
            <br />
            <p className="italic">
                Maybe you forgot it at <Link className="btn">HOME</Link> ?
            </p>
        </div>
    );
}
