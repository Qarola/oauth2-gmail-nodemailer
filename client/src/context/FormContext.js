import React, { createContext, useContext, useState } from "react";

const FormContext = createContext();

export function useFormContext() {
  return useContext(FormContext);
}

export function FormProvider({ children }) {
  const [input, setInput] = useState({
    name: "",
    email: "",
    password: "",
    dateOfBirth: "",
  });

  const [errors, setErrors] = useState({});
  const [successMessage, setSuccessMessage] = useState("");
  const [errorMessage, setErrorMessage] = useState("");

  const backendUrl = "http://localhost:5000/api/";

  //fields validations
  const validate = (input) => {
    let errors = {};
    const patternFirstnameAndLastname = /^[a-zA-Z\s]+$/;
    const patternEmail = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    const patternPassword = /(?=.*\d)(?=.*[a-z])(?=.*[A-Z]).{8,}/;
    const patternDateOfBirth =
      /^(19|20)\d{2}-(0[1-9]|1[0-2])-(0[1-9]|[12]\d|3[01])$/;

    if (!input.name) {
      errors.name = "Firstname and Lastname is required";
    } else if (!patternFirstnameAndLastname.test(input.name)) {
      errors.name = "Firstname and Lastname is invalid";
    }
    if (!input.email || !patternEmail.test(input.email)) {
      errors.email = "Email is required";
    } else if (!patternEmail.test(input.email)) {
      errors.email = "Email is not valid";
    }
    if (input.password.length < 8) {
      errors.password = "Password is too short!";
    } else if (!patternPassword.test(input.password)) {
      errors.password = "Password is required";
    }
    if (!patternDateOfBirth.test(input.dateOfBirth)) {
      errors.dateOfBirth = "Date of Birth is required";
    }
    return errors;
  };


  return (
    <FormContext.Provider
      value={{
        input,
        setInput,
        errors,
        setErrors,
        successMessage,
        setSuccessMessage,
        errorMessage,
        setErrorMessage,
        backendUrl,
        validate,
      }}
    >
      {children}
    </FormContext.Provider>
  );
}
