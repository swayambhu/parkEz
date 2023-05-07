import { createStore } from "redux";

const initialState = {
  user: { role: "guest" },
};

const rootReducer = (state = initialState, action) => {
  switch (action.type) {
    case "SET_USER":
      return { ...state, user: action.payload };
    case "SET_USER_ROLE":
      return { ...state, user: { ...state.user, role: action.role } };
    case "LOGOUT":
      return { ...state, user: { ...state.user, role: "guest" } };
    default:
      return state;
  }
};

const store = createStore(rootReducer);

export default store;
