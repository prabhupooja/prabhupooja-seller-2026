import React, { useState, useRef, useEffect } from "react";
import "./AdditonalForm.css";
import { Link, useNavigate } from "react-router-dom";
import useAuthStore from "../../Store/AuthStore/AuthStore";
import Swal from "sweetalert2";

const AdditonalForm = () => {
  const navigate = useNavigate();
  const { user, profileData } = useAuthStore();
  const [completion, setCompletion] = useState(0);
  const [isLoading, setIsLoading] = useState(false);

  const [formData, setFormData] = useState({
    shopName: "",
    shopAddress: user?.address,
    aadharNumber: "",
    panNumber: "",
    gstNumber: "",
    documentName: "",
    aadharPhoto: null,
    panPhoto: null,
    shopPhoto: null,
    addressProof: null,
  });

  useEffect(() => {
    calculateCompletion();
  }, [user]);

  useEffect(() => {
    if (completion === 100) {
      Swal.fire("Info", "Your profile is already completed.", "info");
      navigate("/dashboard");
    }
  }, [completion, navigate]);

  const calculateCompletion = () => {
    if (!user) return;

    const ignoredFields = ["otp"];
    const totalFields = Object.keys(user).filter(
      (field) => !ignoredFields.includes(field)
    );

    const filledFields = totalFields.filter(
      (field) => user[field] && user[field] !== ""
    );

    const percentage = (filledFields.length / totalFields.length) * 100;
    setCompletion(Math.round(percentage));
  };

  useEffect(() => {
    calculateCompletion();
    console.log(completion, "ooooooooooo");
    if (completion === 100) {
      Swal.fire("Info", "Your profile is already completed.", "info");
      navigate("/dashboard");
    }
  }, []);

  const fileInputRefs = {
    aadharPhoto: useRef(null),
    panPhoto: useRef(null),
    shopPhoto: useRef(null),
    addressProof: useRef(null),
  };

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleFileChange = (e) => {
    const { name, files } = e.target;
    setFormData({ ...formData, [name]: files[0] });
  };

  const handleBrowseClick = (inputName) => {
    if (fileInputRefs[inputName] && fileInputRefs[inputName].current) {
      fileInputRefs[inputName].current.click();
    } else {
      console.error(`File input reference for ${inputName} is undefined.`);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      const response = await profileData(user?.id, {
      seller_name:user?.seller_name,
      address:formData.shopAddress,
      shop_name:formData.shopName,
      aadhaar_number:formData.aadharNumber,
      pan_number:formData.panNumber,
      address_proof_name:formData.documentName,
      gst:formData.gstNumber,
      aadhaar_photo:formData.aadharPhoto,
      pan_photo:formData.panPhoto,
      shop_photo:formData.shopPhoto,
      address_proof:formData.addressProof
      });
      if(response.data.success){
        Swal.fire({
          title: "Success!",
          text: "Your data has been successfully submitted. Please wait for approval.",
          icon: "success",
          confirmButtonText: "OK",
      });
      setIsLoading(false)
      navigate("/profile");
      }
    } catch (error) {
      Swal.fire({
        title: "Error!",
        text: "Try Again, Server Error",
        icon: "error",
        confirmButtonText: "OK",
    });
    setIsLoading(false)
    }
  };

  return (
    <div className="Additionalform-container">
      <h2>Complete Your Profile</h2>
      <form onSubmit={handleSubmit}>
        <div className="grid-container">
          <div className="form-group">
            <label>
              Shop Name <span className="impInpute">*</span>
            </label>
            <input
              type="text"
              name="shopName"
              value={formData.shopName}
              onChange={handleChange}
              placeholder="Enter shop name"
              required
            />
          </div>
          <div className="form-group">
            <label>
              Shop Address<span className="impInpute">*</span>
            </label>
            <input
              type="text"
              name="shopAddress"
              value={formData.shopAddress}
              onChange={handleChange}
              placeholder="Enter shop address"
              required
            />
          </div>
          <div className="form-group">
            <label>
              Aadhar Number<span className="impInpute">*</span>
            </label>
            <input
              type="text"
              name="aadharNumber"
              value={formData.aadharNumber}
              onChange={handleChange}
              placeholder="Enter Aadhar number"
              required
            />
          </div>
          <div className="form-group">
            <label>
              Pan Number:<span className="impInpute">*</span>
            </label>
            <input
              type="text"
              name="panNumber"
              value={formData.panNumber}
              onChange={handleChange}
              placeholder="Enter PAN number"
              required
            />
          </div>

          <div className="form-group">
            <label>
              GST Number:<span className="impInpute">*</span>
            </label>
            <input
              type="text"
              name="gstNumber"
              value={formData.gstNumber}
              onChange={handleChange}
              placeholder="Enter GST number"
              required
            />
          </div>
          <div className="form-group">
            <label>
              Address Proof Name:<span className="impInpute">*</span>
            </label>
            <input
              type="text"
              name="documentName"
              value={formData.documentName}
              onChange={handleChange}
              placeholder="Enter Address Proof Document Name"
              required
            />
          </div>

          {/* File Uploads */}
          {["aadharPhoto", "panPhoto", "shopPhoto", "addressProof"].map(
            (field) => (
              <div className="form-group file-upload" key={field}>
                <label>
                  {field
                    .replace(/([A-Z])/g, " $1")
                    .replace(/^./, (str) => str.toUpperCase())}
                  <span className="impInpute">*</span>
                </label>
                <div
                  className="file-input-wrapper"
                  onClick={() => handleBrowseClick(field)}
                >
                  <span>
                    {formData[field] ? formData[field].name : "No file chosen"}
                  </span>
                  <button type="button">Browse</button>
                  <input
                    type="file"
                    name={field}
                    accept="image/*"
                    ref={fileInputRefs[field]}
                    onChange={handleFileChange}
                    hidden
                  />
                </div>
                {formData[field] && (
                  <img
                    src={URL.createObjectURL(formData[field])}
                    alt="Preview"
                    className="preview-img"
                  />
                )}
              </div>
            )
          )}
        </div>

        <div className="formButtons">
          <span className="note">
            <strong>Note:</strong> Uploaded photos must be clear and authentic.
            Fake or altered images will not be accepted.
          </span>
          <div className="formButtons1">
            <button className="back-btn">
              <Link to="/dashboard">Back</Link>
            </button>
            <button type="submit" className="submit-btn">
              {isLoading ? "Wait..." : "Submit"}
            </button>
          </div>
        </div>
      </form>
    </div>
  );
};

export default AdditonalForm;
