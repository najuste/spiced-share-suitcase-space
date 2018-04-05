import axios from "./axios";

export function getLoggedInUser() {
    return axios
        .get("/user-data")
        .then(function({ data }) {
            // console.log("In getting user data", data);
            return {
                type: "GET_USER",
                user: data.user // var from json what I am returning
            };
        })
        .catch(err => console.log("Getting user data error", err));
}

export function register(data) {
    return axios.post("/register", data).then(function({ data }) {
        // console.log("Response from register", data);
        if (data.success) {
            window.location.replace("/");
            return {
                type: "SET_REGISTER_SUCCESS",
                user: data.user
            };
        } else {
            return {
                type: "SET_ERROR",
                errorMsg: data.errorMsg
            };
        }
    });
}

export function login(loginData) {
    return axios.post("/login", loginData).then(function({ data }) {
        // console.log("Response from login", data);
        if (data.success) {
            window.location.replace("/");
            return {
                type: "SET_LOGIN_SUCCESS",
                user: data.user
            };
        } else {
            return {
                type: "SET_ERROR",
                errorMsg: data.errorMsg
            };
        }
    });
}

export function uploadPic(formData) {
    // console.log("Reached actions, uploadPic,", formData);
    return axios.post("/pic-upload", formData).then(function({ data }) {
        console.log("Getting FormData resp", data);
        if (data.success) {
            return {
                type: "UPDATE_PIC",
                pic: data.image // var from json what I am returning
            };
        } else {
            return {
                type: "SET_ERROR",
                errorMsg: data.errorMsg //not getting  that to client I guess
            };
        }
    });
}

export function editDesc(desc) {
    // console.log("Reached actions, desc", desc);

    return axios.post("/desc-submit", { desc }).then(function({ data }) {
        console.log("Getting desc resp", data);
        if (data.success) {
            return {
                type: "UPDATE_DESC",
                desc
            };
        } else {
            return {
                type: "SET_ERROR",
                errorMsg: data.errorMsg //not getting  that to client I guess
            };
        }
    });
}

export function getSuitcases() {
    return axios
        .get("/latest-suitcases")
        .then(function({ data }) {
            console.log("In getting suitcases data", data);
            return {
                type: "GET_SUITCASES",
                suitcases: data.results // var from json what I am returning
            };
        })
        .catch(err => console.log("Getting user data error", err));
}

export function getSuitcaseById(id) {
    return axios.get(`/get-suitcase/${id}`).then(function({ data }) {
        // console.log("In actions in getSuitcaseById, data", data);
        return {
            type: "GET_SUITCASE",
            suitcase: data.results
        };
    });
}
export function reserveSuitcaseById(id) {
    // console.log("reached action reserveSuitcaseById");
    return axios.post("/reserve-suitcase", { id }).then(function({ data }) {
        console.log("Reserved suitcase", data);
        if (data.success) {
            return {
                type: "RESERVE_SUITCASE",
                id
            };
        }
    });
}

export function searchForSuitcase({ place_a, place_b, trip_date, size }) {
    console.log("Reached actions, searchForSuitcase");
    let url = `/search-suitcase?place_a=${place_a}&place_b=${place_b}&trip_date=${trip_date}&size=${size}`;

    return axios.get(url).then(function({ data }) {
        // console.log("Getting desc resp", data);
        if (data.success) {
            return {
                type: "SEARCH_SUITCASE_RESULTS",
                suitcases: data.results
            };
        } else {
            return {
                type: "SET_ERROR",
                errorMsg: data.errorMsg //not getting  that to client I guess
            };
        }
    });
}

export function shareASuitcase(shareParams) {
    // console.log("Reached actions, shareASuitcase", shareParams);

    return axios
        .post("/share-suitcase", { shareParams })
        .then(function({ data }) {
            if (data.success) {
                return {
                    type: "SHARE_SUITCASE",
                    suitcases: data.results
                };
            } else {
                return {
                    type: "SET_ERROR",
                    errorMsg: data.errorMsg //not getting  that to client I guess
                };
            }
        });
}

export function getUserSuitcases() {
    return axios
        .get("/user-suitcase")
        .then(function({ data }) {
            console.log("GETTING USERS suitcases data", data);
            return {
                type: "USER_SUITCASES",
                id: data.id,
                userSuitcases: data.results // var from json what I am returning
            };
        })
        .catch(err => console.log("Getting user data error", err));
}
