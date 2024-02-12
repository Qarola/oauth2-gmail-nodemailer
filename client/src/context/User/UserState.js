import React, { useReducer } from "react";
import userReducer, { initialState } from "./UserReducer";
import UserContext from "./UserContext";
import axios from "axios";


const backendUrl ="http://localhost:5000/api/";/* process.env.REACT_APP_BACKEND_URL ||  */
//console.log(process.env.REACT_APP_BACKEND_URL);

export const UserState = ({ children }) => {
  const [state, dispatch] = useReducer(userReducer, initialState);

  const registerUser = async (userData) => {
    dispatch({ type: "USER_SIGNUP", payload: true });
    try {
      const response = await axios.post(`${backendUrl}signup`, userData);
      if (response.status === 200) {
        dispatch({ type: "USER_SIGNUP", payload: response.data.user });
        localStorage.setItem("token", response.data.token);
      } else {
        dispatch({ type: "SET_ERROR", payload: response.data.error });
      }
    } catch (error) {
      console.error("Error registering user:", error);
      dispatch({ type: "SET_ERROR", payload: "Error registering user" });
    }
  };


  const loginUser = async (userData) => {
    dispatch({ type: "USER_SIGNIN", payload: true });
    try {
      const response = await axios.post(`${backendUrl}signin`, userData);
      if (response.status === 200) {
        dispatch({ type: "USER_SIGNIN", payload: response.data.user });
        localStorage.setItem("token", response.data.token);
      } else {
        dispatch({ type: "SET_ERROR", payload: response.data.error });
      }
    } catch (error) {
      console.error("Error logging in:", error);
      dispatch({ type: "SET_ERROR", payload: "Error logging in" });
    }
  };


  const logoutUser = () => {
    localStorage.removeItem("token");
    dispatch({ type: "LOGOUT" });
  };

  return (
    <UserContext.Provider value={{ state, dispatch, loginUser, registerUser, logoutUser }}>
      {children}
    </UserContext.Provider>
  );
};
