import React, { useState } from "react";
import "./MyProfile.css";
import shopLogo from "../../Assest/seller.webp"
import useAuthStore from "../../Store/AuthStore/AuthStore";
import { BiSolidEdit } from "react-icons/bi";
import EditMyProfile from "./EditMyProfile";


const MyProfile = () => {
  const { user } = useAuthStore();
  const [openEditProfile, setOpenEditProfile] = useState(false);

  const handleToggleEdit = () => {
    setOpenEditProfile(!openEditProfile)
  }

  return (
    <div className="myprofile-container">
      {/* Profile Section */}
      <div className="myprofile-header">
        <div className="my-profile-div">
          <img className="myprofile-photo" src={user?.shop_photo || shopLogo} alt="Profile" />
          <button className="myprofile-edit-button" onClick={handleToggleEdit}><span>Edit</span><span className="edit-icon"><BiSolidEdit size={15} /></span>  </button>
        </div>

        <div className="myprofile-info">
          <h2>{user?.seller_name.toUpperCase()}</h2>
          <p><strong>Mobile:</strong> {user?.number}</p>
          <p><strong>Email:</strong> {user?.email}</p>
          {user?.shop_name &&
            <p><strong>Shop Name:</strong> {user?.shop_name?.split(" ").map(word => word.charAt(0).toUpperCase() + word.slice(1)).join(" ")}</p>
          }
          <p><strong>Address:</strong> {user?.address?.split(" ").map(word => word.charAt(0).toUpperCase() + word.slice(1)).join(" ")}</p>
          {user?.gst &&
            <p><strong>GST Number:</strong> {user?.gst.toUpperCase()}</p>

          }

        </div>
      </div>

      {/* Documents Section */}

      <div className="mydocuments-section">
        <h3>Verification Documents</h3>
        <div className="mydocument-row">
          {user?.aadhaar_status !== "initially" && (
            <div className="mydocument-card">
              <img src={user?.aadhaar_photo} alt="Aadhaar Preview" />
              <p><strong>Aadhaar:</strong> {user?.aadhaar_number}</p>
              <span className={`${user?.aadhaar_status}`}>{user?.aadhaar_status.toUpperCase()}</span>
            </div>
          )}

          {user?.pan_status !== "initially" && (
            <div className="mydocument-card">
              <img src={user?.pan_photo} alt="PAN Preview" />
              <p><strong>PAN:</strong> {user?.pan_number?.toUpperCase()}</p>
              <span className={`${user?.pan_status}`}>{user?.pan_status.toUpperCase()}</span>

            </div>
          )}

          {user?.address_proof_status !== "initially" && (
            <div className="mydocument-card">
              <img src={user?.address_proof} alt="Address Proof Preview" />
              <p><strong>Address Proof:</strong> {user?.address_proof_name}</p>
              <span className={`${user?.address_proof_status}`}>{user?.address_proof_status.toUpperCase()}</span>
            </div>
          )}
        </div>

        {(user?.aadhaar_status === "initially" &&
          user?.pan_status === "initially" &&
          user?.address_proof_status === "initially") && (
            <div className="no-documents">
              <p>No Documents Available</p>
            </div>
          )}
      </div>
      {openEditProfile &&
        <EditMyProfile isOpen={openEditProfile} onClose={() => setOpenEditProfile(false)}  />}
    </div>
  );
};

export default MyProfile;
