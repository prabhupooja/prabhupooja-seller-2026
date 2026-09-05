import React from 'react';
import './Profile.css';
import { FaUserCircle } from 'react-icons/fa';
import { BiLogOut } from 'react-icons/bi';
import { Link, useNavigate } from 'react-router-dom';
import useAuthStore from "../../Store/AuthStore/AuthStore";



const Profile = () => {
  const navigate = useNavigate();
  const {logout}= useAuthStore();

  const handleLogout = ()=>{
    logout();
    navigate("/")
  }

  return (
    <div className="profile-container">
      <div className="profile-menu">
        <ul>
          <Link to="/profile"><li><FaUserCircle className="icon" /> My Profile</li></Link>
          <li className="logout" onClick={handleLogout} ><BiLogOut className="icon" /> Log Out</li>
          <Link to="https://www.prabhupooja.com/privacypolicy" target='_blank'> <li>Privacy Policy</li></Link>
          <Link to="https://www.prabhupooja.com/about" target='_blank'><li>About</li></Link>
        </ul>
      </div>
    </div>
  );
};

export default Profile;
