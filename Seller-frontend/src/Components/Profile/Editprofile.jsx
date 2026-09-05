import React, { useState } from "react";
import "./editprofile.css";

const Editprofile = () => {
  const [formData, setFormData] = useState({
    name: "",
    phone: "",
    email: "",
    shopName: "",
    shopAddress: "",
    aadharNumber: "",
    panNumber: "",
    gstNumber: "",
    aadharPhoto: null,
    panPhoto: null,
    shopPhoto: null,
    addressProof: null,
  });

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: value,
    });
  };

  const handleFileChange = (e) => {
    const { name, files } = e.target;
    setFormData({
      ...formData,
      [name]: files[0],
    });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    console.log(formData);
  };

  return (
    <div className="edit-profile-container">
      <h1>Edit Profile</h1>
      <form onSubmit={handleSubmit}>
        <div className="form-section">
          <div className="form-group">
            <label htmlFor="name">Name</label>
            <input
              type="text"
              id="name"
              name="name"
              value={formData.name}
              onChange={handleChange}
              required
            />
          </div>

          <div className="form-group">
            <label htmlFor="phone">Phone Number</label>
            <input
              type="text"
              id="phone"
              name="phone"
              value={formData.phone}
              onChange={handleChange}
              required
            />
          </div>

          <div className="form-group">
            <label htmlFor="email">Email</label>
            <input
              type="email"
              id="email"
              name="email"
              value={formData.email}
              onChange={handleChange}
              required
            />
          </div>

          <div className="form-group">
            <label htmlFor="shopName">Shop Name</label>
            <input
              type="text"
              id="shopName"
              name="shopName"
              value={formData.shopName}
              onChange={handleChange}
              required
            />
          </div>

          <div className="form-group">
            <label htmlFor="shopAddress">Shop Address</label>
            <input
              type="text"
              id="shopAddress"
              name="shopAddress"
              value={formData.shopAddress}
              onChange={handleChange}
              required
            />
          </div>

          <div className="form-group">
            <label htmlFor="aadharNumber">Aadhar Number</label>
            <input
              type="text"
              id="aadharNumber"
              name="aadharNumber"
              value={formData.aadharNumber}
              onChange={handleChange}
              required
            />
          </div>

          <div className="form-group">
            <label htmlFor="panNumber">Pan Number</label>
            <input
              type="text"
              id="panNumber"
              name="panNumber"
              value={formData.panNumber}
              onChange={handleChange}
              required
            />
          </div>

          <div className="form-group">
            <label htmlFor="gstNumber">GST Number</label>
            <input
              type="text"
              id="gstNumber"
              name="gstNumber"
              value={formData.gstNumber}
              onChange={handleChange}
              required
            />
          </div>

          <div className="form-group">
            <label htmlFor="aadharPhoto">Aadhar Photo</label>
            <input
              type="file"
              id="aadharPhoto"
              name="aadharPhoto"
              onChange={handleFileChange}
              required
            />
          </div>

          <div className="form-group">
            <label htmlFor="panPhoto">Pan Photo</label>
            <input
              type="file"
              id="panPhoto"
              name="panPhoto"
              onChange={handleFileChange}
              required
            />
          </div>

          <div className="form-group">
            <label htmlFor="shopPhoto">Shop Photo</label>
            <input
              type="file"
              id="shopPhoto"
              name="shopPhoto"
              onChange={handleFileChange}
              required
            />
          </div>

          <div className="form-group">
            <label htmlFor="addressProof">Address Proof</label>
            <input
              type="file"
              id="addressProof"
              name="addressProof"
              onChange={handleFileChange}
              required
            />
          </div>
        </div>

        <div className="editprofile-savebtn">
          <button type="submit" className="submit-btn">
            Save Changes
          </button>
        </div>
      </form>
    </div>
  );
};

export default Editprofile;
