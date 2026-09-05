import React from "react";
import "./UnderReview.css";
import { Link } from "react-router-dom";
import { CircularProgress } from "@mui/material"; 


const UnderReview = ({ completion }) => {
  return (
    <div className="under-review-container">
    <div className="review-card">
      {completion === 100 && (
        <>
          <h2 className="success-text">Congratulations!</h2>
          <p className="completed-text">Your Profile is Completed</p>
        </>
      )}

      <h2 className="review-title">Now Your Account is Under Review</h2>
      <CircularProgress style={{ color: "#ED3B3B", margin: "20px" }} /> 
      
      <p className="review-description">
      We are currently verifying your documents. This process ensures the authenticity of your documents.
The verification may take <strong>24 to 48 hours.</strong> You will be notified once the process is complete.
      </p>
      
      <p className="support-text">
        If you have any queries, please <a href="/support">contact our support team</a>.
        <p>enquiry@prabhupooja.com</p>
      </p>
    </div>
  </div>
  );
};

const InitialState = () => {
  return (
    <div className="accountStatusContainer">
      <div className="profileStatusContainer">
        <div className="profileStatus">
          <div className="ProfileMessage">
            <h4>⚠️ Complete Your Profile First</h4>
            <p>
              Your profile is incomplete. Completing your profile will give you
              full access to all features and benefits of the seller panel.
            </p>
            <ul>
              <li>
                Incomplete profiles may have restricted access to certain
                features.
              </li>
              <li>
                A complete profile increases your product visibility and chances
                of getting more orders.
              </li>
              <li>
                You're just a few steps away! Fill in your details and verify
                your identity to complete your profile.
              </li>
            </ul>
          </div>
        </div>

        {/* <Link to="/complete-profile">
            <button style={{width:"25%"}}>Complete Your Profile Now</button>
          </Link> */}
      </div>
    </div>
  );
};

const RejectedAccount = () => {
  return (
    <div className="accountStatusContainer">
      <div className="rejectedContainer">
        <h3>Your documents has been rejected</h3>
        <p>Please review your details and reapply for verification.</p>
        <Link to="/compelet-profile">
          <button>Reapply Now</button>
        </Link>
      </div>
    </div>
  );
};

export { UnderReview, InitialState, RejectedAccount };
