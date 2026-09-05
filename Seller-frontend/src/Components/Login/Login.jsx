import React, { useState, useEffect, useRef } from "react";
import "./LoginForm.css";
import { FaChevronDown, FaChevronUp } from "react-icons/fa";
import banner from "../../Assest/banner.png";
import Registration from "../Registration/Registration";
import logo from "../../Assest/logo.png";
import useAuthStore from "../../Store/AuthStore/AuthStore";
import Swal from "sweetalert2";
import { useNavigate } from "react-router-dom";

const introSlides = [
  {
    text: "Grow Your Business with Prabhu Pooja",
    subtext:
      "Sell prasad, devotional items, and spiritual products to a global audience.",
  },
  {
    text: "Join Us as a Seller",
    subtext:
      "Expand your reach effortlessly and connect with a spiritual community.",
  },
  {
    text: "Already Selling?",
    subtext: "Log in to manage your store, track orders, and handle inventory.",
  },
];

const LoginForm = () => {
  const [expanded, setExpanded] = useState(false);
  const [currentSlide, setCurrentSlide] = useState(0);
  const [showRegistration, setShowRegistration] = useState(false);
  const [otp, setOtp] = useState(["", "", "", "", "", ""]);
  const inputRefs = [
    useRef(),
    useRef(),
    useRef(),
    useRef(),
    useRef(),
    useRef(),
  ];
  const [inputValue, setInputValue] = useState("");
  const navigate = useNavigate();
  const token = localStorage.getItem("authToken");
  const [isLoading, setLoading] = useState(false);
  const [isLoading1, setLoading1] = useState(false);


  const { login, userOTP } = useAuthStore();

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentSlide((prev) => (prev + 1) % introSlides.length);
    }, 3000);
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    if (token) {
      navigate("/dashboard");
    }
  }, [token]);

  const handleChange = (index, event) => {
    let value = event.target.value;
    if (!/^\d*$/.test(value)) return;

    let newOtp = [...otp];
    newOtp[index] = value;
    setOtp(newOtp);

    if (value && index < 5) {
      inputRefs[index + 1].current.focus();
    }
  };

  const handleKeyDown = (index, event) => {
    if (event.key === "Backspace" && !otp[index] && index > 0) {
      inputRefs[index - 1].current.focus();
    }
  };

  const handleLogin = async (e) => {
    if (e) e.preventDefault();
    if (isLoading) return;

    if (!inputValue || inputValue.trim() === "") {
      Swal.fire("Required", "Please enter your registered Email or Mobile Number", "warning");
      return;
    }

    setLoading(true);
    try {
      const response = await login({
        input: inputValue.trim(),
      });
      if (response?.data?.success) {
        Swal.fire("Success!", response.data.message || `OTP has been sent to ${inputValue}`, "success");
      } else {
        Swal.fire("Error!", response?.data?.message || "Invalid User, please check and try again.", "error");
      }
    } catch (error) {
      console.error("Login error:", error);
      const msg = error?.response?.data?.message || error?.response?.data?.error || "User not found or error occurred while sending OTP.";
      Swal.fire("Error!", msg, "error");
    } finally {
      setLoading(false);
    }
  };

  const verifyOTP = async () => {
    if (isLoading1) return;

    const otpStr = otp.join("").trim();
    if (otpStr.length !== 6) {
      Swal.fire({
        icon: "info",
        title: "OTP Required",
        text: "Please enter the complete 6-digit OTP",
      });
      return;
    }

    const formattedOTP = Number(otpStr);
    if (!formattedOTP) {
      Swal.fire({
        icon: "error",
        title: "Invalid OTP",
        text: "Please enter valid numeric digits.",
      });
      return;
    }

    setLoading1(true);
    try {
      const response = await userOTP({ otp: formattedOTP });

      if (response && response.data.success) {
        Swal.fire({
          icon: "success",
          title: "OTP Verified",
          text: "Your OTP has been successfully verified!",
          timer: 1500,
          showConfirmButton: false,
        });
        navigate("/dashboard");
      } else {
        Swal.fire({
          icon: "error",
          title: "Error",
          text: response?.data?.message || "Verification Failed",
        });
      }
    } catch (error) {
      const msg = error?.response?.data?.message || error?.response?.data?.error || "OTP Verification Failed";
      Swal.fire({
        icon: "error",
        title: "Verification Failed",
        text: msg,
      });
    } finally {
      setLoading1(false);
    }
  };

  return (
    <div className="login-container">
      <div className={`card ${expanded ? "expanded" : "collapsed"}`}>
        <div className="toggle-btn" onClick={() => setExpanded(!expanded)}>
          {expanded ? <FaChevronUp /> : <FaChevronDown />}
        </div>

        {expanded ? (
          <>
            {showRegistration ? (
              <div className="form-content">
                <div className="form-content-data">
                  <Registration
                    setShowRegistration={setShowRegistration}
                    onRegisterSuccess={(contact) => {
                      setInputValue(contact);
                      setShowRegistration(false);
                    }}
                  />
                </div>
                <div className="form-content-img">
                  <img src={banner} alt="Login Banner" />
                </div>
              </div>
            ) : (
              <div className="form-content">
                <div className="form-content-data">
                  <img src={logo} alt="logo" className="logoImg" />

                  <h2 className="login-title">Login</h2>
                  <input
                    type="text"
                    placeholder="Email or Number"
                    className="input-field"
                    value={inputValue}
                    onChange={(e) => setInputValue(e.target.value)}
                    required
                  />
                  <span className="otp-container">
                    {otp.map((digit, index) => (
                      <input
                        key={index}
                        ref={inputRefs[index]}
                        type="text"
                        maxLength="1"
                        value={digit}
                        onChange={(e) => handleChange(index, e)}
                        onKeyDown={(e) => handleKeyDown(index, e)}
                        className="otp-box"
                      />
                    ))}
                    <button
                      className="sendOTPbtn"
                      onClick={handleLogin}
                      disabled={isLoading}
                    >
                      {isLoading ? "Sending..." : "Send OTP"}
                    </button>{" "}
                  </span>
                  <div className="buttons">
                    <button className="btn login-btn" onClick={verifyOTP} disabled={isLoading1}>
                      {isLoading1 ? "Wait.." : "Log In"}
                    </button>
                    <button
                      className="btn signup-btn"
                      onClick={() => setShowRegistration(true)}
                    >
                      Register
                    </button>{" "}
                  </div>
                </div>
                <div className="form-content-img">
                  <img src={banner} alt="Login Banner" />
                </div>
              </div>
            )}
          </>
        ) : (
          <div className="intro-content">
            <div className="slide-container">
              {introSlides.map((slide, index) => (
                <div
                  key={index}
                  className="slide"
                  style={{ transform: `translateX(-${currentSlide * 100}%)` }}
                >
                  <h3 className="intro-text">{slide.text}</h3>
                  <p className="seller-message">{slide.subtext}</p>
                </div>
              ))}
            </div>
            <button className="join-btn" onClick={() => setExpanded(true)}>
              Sign Up/Login
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default LoginForm;
