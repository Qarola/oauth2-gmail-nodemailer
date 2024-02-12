export const initialState = {
    userSignup: "",
    userSignin: "",
  };
  
  const actions = {
    USER_SIGNUP: "USER_SIGNUP",
    USER_SIGNIN: "USER_SIGNIN"
  }
  
  const userReducer = (state, action) => {
    switch (action.type) {
      case actions.USER_SIGNUP:
        return {
          ...state,
          userSignup: action.payload,
        };
        case actions.USER_SIGNIN:
          return {
            ...state,
            userSignin: action.payload,
          };
      case "LOGOUT":
        return {
          ...state,
          userSignin: null,
        };
      default:
        return state;
    }
  };
  
  export default userReducer;
  