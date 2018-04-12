# Share Suitcase Space

## Description:

It is web platform for _suitcase sharing to help transport packages peer2peer_.

Starts with search-page where one searches for suitcase from location A to location B on a specific date (current implementation: from today up to chosen date), with a possibility to variate the location search radius, so that other cities within that radius could be included.
By default the most current suitcases available are listed. However there is no possibility at looking for more details if not logged in.

For logged in experience there is a suitcase-page, with suitcase data and user, who is sharing the suitcase data, including link to message the user (in work...).
And there is a share-suitcase-page to offer your suitcase on your trip from location A to B, on a chosen date, chosen size and optionally a suitcase description.

Also after the registration the user is offered to share some information about himself on the user-profile-page, where he can upload/edit his photo, update/his bio description.

In future the user rating option is planned as well as peer2peer messaging.

## Techstak

React & Redux, Node.js & Express.js, AWS S3, PostgreSQL & PostGIS, for geolocation: npm react-places-autocomplete.

## How to run

If you clone on your machine to start application just launch the server: type: `node server.js`.
If any changes has been made to the code, first build it in order to run: type: `npm run build.

This project was bootstrapped with [Create React App](https://github.com/facebookincubator/create-react-app).
