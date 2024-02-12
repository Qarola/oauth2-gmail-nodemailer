import React from "react";
import { useFormContext } from "../context/FormContext";

export default function Form() {
  const {
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
  } = useFormContext();

  //Event change handler
  function handleInputChange(e) {
    setInput({
      ...input,
      [e.target.name]: e.target.value,
    });
    setErrors(
      validate({
        ...input,
        [e.target.name]: e.target.value,
      })
    );
  }

  //Event submit handler
  async function handleSubmit(e) {
    e.preventDefault();

    // Validar los campos del formulario
    const validationErrors = validate(input);
    setErrors(validationErrors);

    // Check for validation errors
    if (Object.keys(validationErrors).length === 0) {
      try {
        console.log("Datos enviados al backend:", JSON.stringify(input));
        console.log("Backend URL:", `${backendUrl}signup`);
        const response = await fetch(`${backendUrl}signup`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(input),
        });

        if (response.ok) {
          //Successful registration
          setSuccessMessage("Successful registration");
          setErrorMessage("");
          setInput({
            name: "",
            email: "",
            password: "",
            dateOfBirth: "",
          });
        } else {
          //Registration error
          setSuccessMessage("");
          setErrorMessage("Registration error");
        }
        console.log("Successful registration");
      } catch (error) {
        // Request error
        setSuccessMessage("");
        setErrorMessage("Request error");
      }
    }

    // Limpia los campos del formulario después del envío
    setInput({
      name: "",
      email: "",
      password: "",
      dateOfBirth: "",
    });
  }

  return (
    <>
      <div className="container" key={input.id}>
        <form className="container__form" onSubmit={(e) => handleSubmit(e)}>
          <div className="container__form-control">
            <div className="container__greeting">Register With Us</div>
            {/* Form fields */}
            {successMessage && <p>{successMessage}</p>}
            {errorMessage && <p>{errorMessage}</p>}
            <label className="container__firstname">
              First Name and Last Name
            </label>
            <input
              className="container__firstname-input"
              autoComplete="off"
              type="text"
              value={input.name}
              name="name"
              placeholder="Enter your first name and last name"
              onChange={(e) => handleInputChange(e)}
            />
            {errors.name && <p className="errorname">{errors.name}</p>}

            <label className="container__firstname">Email</label>
            <input
              className="container__firstname"
              autoComplete="off"
              type="text"
              value={input.email}
              name="email"
              placeholder="Enter your email"
              onChange={(e) => handleInputChange(e)}
            />
            {errors.email && <p className="errorname">{errors.email}</p>}
            <label className="container__firstname">Password</label>
            <input
              className="container__firstname"
              autoComplete="off"
              type="text"
              value={input.password}
              name="password"
              placeholder="Enter your password"
              onChange={(e) => handleInputChange(e)}
            />
            {errors.password && <p className="errorname">{errors.password}</p>}
            <label className="container__firstname">Date of Birth</label>
            <input
              className="container__firstname"
              autoComplete="off"
              type="text"
              value={input.dateOfBirth}
              name="dateOfBirth"
              placeholder="YYYY/MM/DD"
              onChange={(e) => handleInputChange(e)}
            />
            {errors.dateOfBirth && (
              <p className="errorname">{errors.dateOfBirth}</p>
            )}

            <button
              className="container__btn active"
              type="submit"
              disabled={
                !input.name ||
                !input.email ||
                !input.password ||
                !input.dateOfBirth
              }
            >
              Register
            </button>
          </div>
        </form>
      </div>
    </>
  );
}
