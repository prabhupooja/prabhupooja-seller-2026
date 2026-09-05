import React from "react";
import "./sellerprofile.css";
import image1 from "../../Assest/littleganeshafront.jpg";
import { FaRegEdit } from "react-icons/fa";
import { Link } from "react-router-dom";

const SellerProfile = () => {
  return (
    <>
      <div className="sellerprofile-container">
        <div className="profile-card">
          <div className="profile-header">
            <h1>
              Profile Details
              <Link to="/editprofile">
                <FaRegEdit className="selleredit_icon" />
              </Link>
            </h1>
          </div>
          <div className="profile-body">
            <div className="profile-info">
              <h2>Personal Information</h2>
              <div className="info-item">
                <strong>Name:</strong> John Doe
              </div>
              <div className="info-item">
                <strong>Phone:</strong> +91 9876543210
              </div>
              <div className="info-item">
                <strong>Email:</strong> johndoe@example.com
              </div>
            </div>

            <div className="profile-info">
              <h2>Shop Information</h2>
              <div className="info-item">
                <strong>Shop Name:</strong> John's Electronics
              </div>
              <div className="info-item">
                <strong>Shop Address:</strong> 123 Main Street, City, State
              </div>
            </div>

            <div className="profile-info">
              <h2>Identity Documents</h2>
              <div className="info-item">
                <strong>Aadhar No:</strong> 1234 5678 9123
              </div>
              <div className="info-item">
                <strong>PAN No:</strong> ABCD1234E
              </div>

              <div className="info-item">
                <strong>GST No:</strong> ABCD1234E
              </div>
            </div>
          </div>

          <div className="profile-photos">
            <h2>Documents</h2>
            <div className="profile-photobox">
              <div className="photo-item">
                <label>Aadhar Photo</label>
                <img src={image1} alt="Aadhar" />
              </div>

              <div className="photo-item">
                <label>Pan Photo</label>
                <img src={image1} alt="Pan" />
              </div>

              <div className="photo-item">
                <label>Shop Photo</label>
                <img src={image1} alt="Shop" />
              </div>

              <div className="photo-item">
                <label>Address Proof</label>
                <img src={image1} alt="Address Proof" />
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default SellerProfile;
