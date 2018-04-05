export default function(state = {}, action) {
    if (action.type == "GET_USER") {
        console.log("in reducer get_user:, action:", action);
        console.log("in reducer get_user:, state:", state);

        return Object.assign({}, state, {
            user: action.user //action.users from actions
        });
    }

    if (
        action.type == "SET_REGISTER_SUCCESS" ||
        action.type == "SET_LOGIN_SUCCESS"
    ) {
        console.log("Reached reducer in success", action);
        return Object.assign({}, state, {
            user: action.user //action.users from actions
        });
    }

    if (action.type == "UPDATE_PIC") {
        console.log("Reached reducer fileUpload with success", action);
        const user = Object.assign({}, state.user, {
            profilepic: action.pic
        });
        return {
            ...state,
            user
        };
    }
    if (action.type == "UPDATE_DESC") {
        console.log("Reached reducer desc update with success", action);
        const user = Object.assign({}, state.user, {
            description: action.desc
        });
        return {
            ...state,
            user
        };
    }
    if (action.type == "SET_ERROR") {
        console.log("Reached reducer with error", action);
        return Object.assign({}, state, {
            errorMsg: action.errorMsg //action.users from actions
        });
    }
    //initial results for suitcases
    if (action.type == "GET_SUITCASES") {
        console.log("Reached reducer to get latest suitcases", action);
        return Object.assign({}, state, {
            suitcases: action.suitcases //action.users from actions
        });
    }
    if (action.type == "GET_SUITCASE") {
        console.log("Reached reducer to get specific suitcase", action);
        return Object.assign({}, state, {
            suitcase: action.suitcase //action.users from actions
        });
    }
    if (action.type == "RESERVE_SUITCASE") {
        // console.log("Reached reducer to get specific suitcase", action);
        // console.log("Reached reducer to get specific suitcase, state", state);

        return {
            ...state,
            suitcases: state.suitcases.filter(item => {
                console.log(item, action, item.id != action.id);
                // console.log("parse int", item.id != parseInt(action.id));
                return item.id != action.id;
            })
        };
    }

    console.log("IN REDUCER:", action);

    if (action.type == "SEARCH_SUITCASE_RESULTS") {
        console.log("Reached reducer searchForSuitcase", action);
        return Object.assign({}, state, {
            suitcases: action.suitcases //action.users from actions
        });
    }
    console.log("ALL State in reducer", state);
    return state;
}
