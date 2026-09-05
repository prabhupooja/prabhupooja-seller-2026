import React, { useEffect, useState } from 'react'
import useAuthStore from '../../Store/AuthStore/AuthStore'
import Swal from 'sweetalert2';
import './EditMyProfile.css'
import { IoClose } from "react-icons/io5";

const EditMyProfile = ({ isOpen, onClose }) => {
  const { user, updateUser, userGet } = useAuthStore();
  const [name, setName] = useState('');
  const [shopName, setShopName] = useState('');
  const [email, setEmail] = useState('');
  const [shopImage, setShopImage] = useState(null);
  const [loading, setLoading] = useState(false);



  const [rawFile, setRawFile] = useState(null);

  const handleImageUpload = (event) => {
    const selected = event.target.files[0];
    if (selected) {
      setRawFile(selected);
      const imageUrl = URL.createObjectURL(selected);
      setShopImage(imageUrl);
    }
  };
  useEffect(() => {
    if (user) {
      setName(user.seller_name || '');
      setShopName(user.shop_name || '');
      setEmail(user.email || '');
      setShopImage(user?.shop_photo || null);
    }
  }, [user]);

  const handleSave = async () => {
    const formData = new FormData();
    formData.append('name', name);
    formData.append('shop_name', shopName);
    formData.append('email', email);

    if (rawFile) {
      formData.append('shop_photo', rawFile);
    }

    try {
      setLoading(true);
      const response = await updateUser(user?.id, formData);

      if (response.data.success) {
        await userGet();
        Swal.fire({
          title: 'Success!',
          text: 'Profile updated successfully',
          icon: 'success',
          confirmButtonText: 'OK'
        })
      }
    } catch (error) {
      console.error('Error updating profile:', error);
      Swal.fire({
        title: 'Error!',
        text: 'Failed to update profile',
        icon: 'error',
        confirmButtonText: 'OK'
      });
    } finally {
      setLoading(false);
      onClose();
    }
  };
  if (!isOpen) return null;


  return (
    <div className="editprofile_overlay">
      <div className="editprofile_container">
        <div className="editprofile_form-container">
          <button className="editprofile_close-button" onClick={onClose}><IoClose size={25} /></button>
          <h1 className="editprofile_heading">Edit Profile</h1>

          <div className="editprofile_form-group">
            <label className="editprofile_label">Shop Image</label>
            <input type="file" className="editprofile_input" onChange={handleImageUpload} />
            {shopImage ? (
              <img src={shopImage} alt="Shop Preview" className="editprofile_image-preview" />
            ) : (
              <p>No image selected</p>
            )}
          </div>

          <div className="editprofile_form-group">
            <label className="editprofile_label">Name</label>
            <input
              type="text"
              className="editprofile_input"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Enter your name"
            />
          </div>

          <div className="editprofile_form-group">
            <label className="editprofile_label">Shop Name</label>
            <input
              type="text"
              className="editprofile_input"
              value={shopName}
              onChange={(e) => setShopName(e.target.value)}
              placeholder="Enter your shop name"
            />
          </div>

          <div className="editprofile_form-group">
            <label className="editprofile_label">Email</label>
            <input
              type="email"
              className="editprofile_input"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="Enter your email"
            />
          </div>

          <button className="editprofile_save-button" onClick={handleSave} disabled={loading}>
            {loading ? "Saving..." : "Save Changes"}
          </button>
        </div>
      </div>
    </div>
  );
}

export default EditMyProfile