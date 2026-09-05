import React, { useState } from "react";
import "../Login/LoginForm.css";
import logo from "../../Assest/logo.png";
import useAuthStore from "../../Store/AuthStore/AuthStore";
import Swal from "sweetalert2";

const Registration = ({ setShowRegistration, onRegisterSuccess }) => {
  const { register } = useAuthStore();
  const [isLoading, setIsLoading] = useState(false);

  const [step, setStep] = useState(1);
  const [formData, setFormData] = useState({
    name: "",
    phone: "",
    email: "",
    address: "",
  });

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const nextStep = (e) => {
    e.preventDefault();
    if (!formData.name.trim()) {
      Swal.fire("Required", "Please enter your name!", "warning");
      return;
    }
    if (formData.phone.trim().length !== 10) {
      Swal.fire("Invalid Number", "Phone number must be exactly 10 digits!", "error");
      return;
    }
    setStep(step + 1);
  };

  const prevStep = (e) => {
    e.preventDefault();
    setStep(step - 1);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (isLoading) return;

    if (formData.phone.trim().length !== 10) {
      Swal.fire("Invalid Number", "Phone number must be exactly 10 digits!", "error");
      return;
    }

    if (!formData.email.trim() || !formData.address.trim()) {
      Swal.fire("Required", "Please fill in all required fields!", "warning");
      return;
    }

    setIsLoading(true);

    try {
      const response = await register({
        seller_name: formData.name.trim(),
        email: formData.email.trim(),
        number: formData.phone.trim(),
        address: formData.address.trim(),
      });

      if (response?.data?.success) {
        Swal.fire({
          icon: "success",
          title: "Success!",
          text: "Registration completed successfully! Please login with your registered number or email.",
          confirmButtonText: "Proceed to Login",
        }).then(() => {
          if (onRegisterSuccess) {
            onRegisterSuccess(formData.phone.trim());
          }
          setShowRegistration(false);
        });
      } else {
        Swal.fire("Error!", response?.data?.message || "Registration failed. Please try again.", "error");
      }
    } catch (error) {
      const status = error.response?.status;
      const msg = error.response?.data?.message || error.response?.data?.error || "Registration failed. Please try again.";
      if (status === 409) {
        Swal.fire("Already Registered", "Mobile number or email is already registered. Please login.", "info").then(() => {
          if (onRegisterSuccess) {
            onRegisterSuccess(formData.phone.trim());
          }
          setShowRegistration(false);
        });
      } else {
        Swal.fire("Error!", msg, "error");
      }
    } finally {
      setIsLoading(false);
    }
  };
  

  return (
    <>
      <img src={logo} alt="logo" className="logoImg" />
      <h2 className="login-title">Register</h2>
      <form onSubmit={handleSubmit} className="registration-form">
        {step === 1 && (
          <>
            <input
              type="text"
              name="name"
              placeholder="Name"
              className="input-field"
              value={formData.name}
              onChange={handleChange}
              required
            />
            <input
              type="text"
              name="phone"
              placeholder="Phone Number"
              className="input-field"
              value={formData.phone}
              onChange={handleChange}
              required
            />
          </>
        )}
        {step === 2 && (
          <>
            <input
              type="email"
              name="email"
              placeholder="Email"
              className="input-field"
              value={formData.email}
              onChange={handleChange}
              required
            />
            <input
              type="text"
              name="address"
              placeholder="Address"
              className="input-field"
              value={formData.address}
              onChange={handleChange}
              required
            />
          </>
        )}
        <div className="buttons">
          {step > 1 && (
            <button type="button" className="btn back-btn" onClick={prevStep}>
              Back
            </button>
          )}
          {step < 2 ? (
            <button type="button" className="btn next-btn" onClick={nextStep}>
              Next
            </button>
          ) : (
            <button type="submit" className="btn signup-btn" disabled={isLoading}>
              {isLoading ? "Wait.." : "Register"}
            </button>
          )}
        </div>
      </form>
      <button
        className="btn login-btn"
        onClick={() => setShowRegistration(false)}
      >
        Log In
      </button>
    </>
  );
};

export default Registration;
