import React, { useEffect, useRef, useState } from "react";
import { useForm } from "react-hook-form";
import { toast, ToastContainer } from "react-toastify";
import PhoneInput from "react-phone-number-input";
import initializeAuthentication from "./Firebase/firebase.initialize";
import {
  getAuth,
  signInWithPhoneNumber,
  RecaptchaVerifier,
} from "firebase/auth";
import emailjs from "emailjs-com";
import "react-toastify/dist/ReactToastify.css";
import "react-phone-number-input/style.css";
import "./App.css";

initializeAuthentication();

const auth = getAuth();

function App() {
  const form = useRef();
  const [success, setSuccess] = useState(false);
  const [emailError, setEmailError] = useState(false);
  const [invalidEmail, setInvalidEmail] = useState(false);
  const [invalidOTP, setInvalidOTP] = useState(false);
  const [wrongPhoneCode, setWrongPhoneCode] = useState(false);
  const [error, setError] = useState("");
  const [result, setResult] = useState("");
  const [allOTP, setAllOTP] = useState([]);
  const otp = allOTP[allOTP.length - 1];

  const notifySuccess = () =>
    toast.success("Message Sent Successfully!", {
      position: "top-center",
      autoClose: 5000,
      hideProgressBar: false,
      closeOnClick: true,
      pauseOnHover: true,
      draggable: true,
      progress: undefined,
    });

  const notifyWrongOTP = () =>
    toast.error("Wrong OTP for email! Please try again with the correct OTP.", {
      position: "top-center",
      autoClose: 5000,
      hideProgressBar: false,
      closeOnClick: true,
      pauseOnHover: true,
      draggable: true,
      progress: undefined,
    });

  const notifyWrongMobileCode = () =>
    toast.error(
      "Wrong OTP for Phone SMS! Please try again with the correct OTP.",
      {
        position: "top-center",
        autoClose: 5000,
        hideProgressBar: false,
        closeOnClick: true,
        pauseOnHover: true,
        draggable: true,
        progress: undefined,
      }
    );

  const noEmail = () =>
    toast.error("Email is missing!", {
      position: "top-center",
      autoClose: 5000,
      hideProgressBar: false,
      closeOnClick: true,
      pauseOnHover: true,
      draggable: true,
      progress: undefined,
    });

  const emailNotValid = () =>
    toast.error("Invalid email! Please put a valid one.", {
      position: "top-center",
      autoClose: 5000,
      hideProgressBar: false,
      closeOnClick: true,
      pauseOnHover: true,
      draggable: true,
      progress: undefined,
    });

  const { register, handleSubmit, reset } = useForm();

  const onSubmit = (data) => {
    emailjs
      .sendForm(
        "otp_verification_serv",
        "otp_verification_temp",
        form.current,
        "dFkb5T2Yg-PzlBUBI"
      )
      .then(
        (result) => {
          console.log(result.text);
        },
        (error) => {
          console.log(error.text);
        }
      );
    // Email OTP
    const submitOTP = data.emailOTP;
    const phoneCode = data.phoneOTP;
    const verifyOtp = () => {
      if (phoneCode.length === 6) {
        let confirmationResult = window.confirmationResult;
        confirmationResult
          .confirm(phoneCode)
          .then((result) => {
            // User signed in successfully.
            setResult(result);
            const user = result.user;
            console.log(user);
          })
          .catch((error) => {
            setWrongPhoneCode(true);
            setError(error);
          });
      }
    };
    verifyOtp();

    if (otp.submitEmailOTP === submitOTP) {
      setInvalidOTP(false);
    } else {
      setInvalidOTP(true);
    }
    if (otp.submitEmailOTP === submitOTP && wrongPhoneCode === false) {
      const proceed = window.confirm("Please confirm to send!");
      if (proceed) {
        fetch("http://localhost:5000/messages", {
          method: "POST",
          headers: {
            "content-type": "application/json",
          },
          body: JSON.stringify(data),
        })
          .then((res) => res.json())
          .then((result) => {
            if (result.insertedId) {
              reset();
              setSuccess(true);
              notifySuccess();
            }
          });
      }
    } else {
      if (wrongPhoneCode === true) {
        notifyWrongMobileCode();
      } else {
        notifyWrongOTP();
      }
    }
  };

  useEffect(() => {
    fetch("http://localhost:5000/emailOTP/OTP")
      .then((res) => res.json())
      .then((data) => setAllOTP(data));
  }, []);

  const handleEmailOtp = () => {
    const email = document.querySelector("#email").value;
    const submitEmailOTP = Math.floor(100000 + Math.random() * 900000);

    const emailOtpKey = {
      email,
      submitEmailOTP,
    };

    if (!email.trim()) {
      setEmailError(true);
      return noEmail();
    } else if (!/^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/.test(email)) {
      setInvalidEmail(true);
      return emailNotValid();
    } else {
      fetch("http://localhost:5000/emailOtp", {
        method: "POST",
        headers: {
          "content-type": "application/json",
        },
        body: JSON.stringify(emailOtpKey),
      })
        .then((res) => res.json())
        .then((result) => {
          if (result.insertedId) {
            alert(`Check OTP on {${email}} this Gmail!`);
            window.location.reload();
          }
        });
    }
  };

  const handlePhoneOtp = () => {
    const phoneNumber = document.querySelector("#phone").value;
    // const code = document.querySelector("#phoneCode").value;
    // console.log(phoneNumber, code);

    const recaptchaVerifier = new RecaptchaVerifier(
      "recaptcha-container",
      {},
      auth
    );
    recaptchaVerifier.render();
    signInWithPhoneNumber(auth, phoneNumber, recaptchaVerifier)
      .then((confirmationResult) => {
        // SMS sent. Prompt user to type the code from the message, then sign the
        // user in with confirmationResult.confirm(code).
        window.confirmationResult = confirmationResult;
        // ...
      })
      .catch((error) => {
        console.log(error);
      });
  };

  return (
    <div className="form_container">
      <h2>Contact Us</h2>
      {success && (
        <ToastContainer
          position="top-center"
          autoClose={5000}
          hideProgressBar={false}
          newestOnTop={false}
          closeOnClick
          rtl={false}
          pauseOnFocusLoss
          draggable
          pauseOnHover
        />
      )}
      {invalidOTP && (
        <ToastContainer
          position="top-center"
          autoClose={5000}
          hideProgressBar={false}
          newestOnTop={false}
          closeOnClick
          rtl={false}
          pauseOnFocusLoss
          draggable
          pauseOnHover
        />
      )}
      {emailError && (
        <ToastContainer
          position="top-center"
          autoClose={5000}
          hideProgressBar={false}
          newestOnTop={false}
          closeOnClick
          rtl={false}
          pauseOnFocusLoss
          draggable
          pauseOnHover
        />
      )}
      {invalidEmail && (
        <ToastContainer
          position="top-center"
          autoClose={5000}
          hideProgressBar={false}
          newestOnTop={false}
          closeOnClick
          rtl={false}
          pauseOnFocusLoss
          draggable
          pauseOnHover
        />
      )}
      {wrongPhoneCode && (
        <ToastContainer
          position="top-center"
          autoClose={5000}
          hideProgressBar={false}
          newestOnTop={false}
          closeOnClick
          rtl={false}
          pauseOnFocusLoss
          draggable
          pauseOnHover
        />
      )}
      <form ref={form} onSubmit={handleSubmit(onSubmit)}>
        <div className="non_otp_field">
          <input
            type="text"
            id=""
            placeholder="Name"
            {...register("name")}
            required
          />
        </div>
        <div className="non_otp_field">
          <input
            type="email"
            id="email"
            placeholder="Email"
            {...register("email")}
            required
          />
        </div>
        <div className="otp_taking_field">
          <input
            type="text"
            id=""
            placeholder="Email Verification Code"
            {...register("emailOTP")}
            required
          />
          <button
            className="main_button"
            type="button"
            onClick={handleEmailOtp}
          >
            Send OTP
          </button>
        </div>

        <div className="non_otp_field">
          <PhoneInput
            defaultCountry="BD"
            international
            type="tel"
            id="phone"
            className="phone_no_input"
            placeholder="Mobile Number"
            {...register("phone")}
            required
          />
        </div>
        <div className="otp_taking_field">
          <input
            type="text"
            id="phoneCode"
            placeholder="Mobile Verification Code"
            {...register("phoneOTP")}
            required
          />
          <button
            className="main_button"
            type="button"
            onClick={handlePhoneOtp}
          >
            Send OTP
          </button>
        </div>
        <div style={{ display: "flex", justifyContent: "center" }}>
          <div id="recaptcha-container"></div>
        </div>
        <div className="non_otp_field">
          <textarea
            id=""
            placeholder="Message"
            {...register("message")}
            required
          ></textarea>
        </div>
        <button className="main_button" type="submit">
          Submit
        </button>
      </form>
    </div>
  );
}

export default App;
