import React, { useState, useEffect, useRef } from "react";
import { FaSearch, FaBell, FaChevronDown } from "react-icons/fa";
import "./TopNavBar.css";
import Profile from "../Popups/Profile";
import Notification from "../Popups/Notification";
import { useLocation } from "react-router-dom";
import useAuthStore from "../../Store/AuthStore/AuthStore";
import { IoMdMenu } from "react-icons/io";
import useNotificationStore from "../../Store/notificationStore/notificationStore";

const TopNavBar = ({ setIsOpen, isOpen }) => {
  const [openProfile, setOpenProfile] = useState(false);
  const [openNotification, setOpenNotification] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");

  const profileRef = useRef(null);
  const notificationRef = useRef(null);
  const location = useLocation();
  const { user } = useAuthStore();

  const { notifications, connectSocket, disconnectSocket, getAllNotifications } =
    useNotificationStore();

  useEffect(() => {
    if (user?.id) {
      connectSocket(user.id);
      getAllNotifications(user.id).catch((error) => {
        console.error("Error fetching notifications:", error);
      });
    }

    return () => {
      disconnectSocket();
    };
  }, [user?.id]);

  useEffect(() => {
    function handleClickOutside(event) {
      if (
        profileRef.current &&
        !profileRef.current.contains(event.target)
      ) {
        setOpenProfile(false);
      }
      if (
        notificationRef.current &&
        !notificationRef.current.contains(event.target)
      ) {
        setOpenNotification(false);
      }
    }

    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  useEffect(() => {
    setOpenNotification(false);
    setOpenProfile(false);
  }, [location.pathname]);

  const handleToggleNotification = () => {
    setOpenNotification(!openNotification);
    setOpenProfile(false);
  };

  const handleToggleProfile = () => {
    setOpenProfile(!openProfile);
    setOpenNotification(false);
  };

  const formattedPath =
    location.pathname === "/dashboard" || location.pathname === "/dashboard/"
      ? "Dashboard Overview"
      : location.pathname
          .replace("/", "")
          .replace(/-/g, " ")
          .split("/")
          .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
          .join(" / ");

  const getInitials = (name) => {
    if (!name) return "S";
    return name
      .split(" ")
      .map((n) => n[0])
      .join("")
      .substring(0, 2)
      .toUpperCase();
  };

  return (
    <header className="topNavBar">
      <div className="topNavLeftSection">
        <button
          className="sideBareToggleButton"
          onClick={() => setIsOpen(!isOpen)}
          aria-label="Toggle menu"
        >
          <IoMdMenu size={24} />
        </button>
        <div className="topNavBarLeft">
          <h3>{formattedPath}</h3>
          <p>PrabhuPooja Merchant Control Center</p>
        </div>
      </div>

      <div className="topNavBarRight">
        <div className="searchBar">
          <FaSearch className="searchIcon" />
          <input
            type="text"
            placeholder="Search dashboard, orders..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
          <kbd className="searchKbd">⌘K</kbd>
        </div>

        <div className="navIconsGroup">
          <div
            className={`navIconBtn ${openNotification ? "activeIcon" : ""}`}
            ref={notificationRef}
            onClick={handleToggleNotification}
          >
            <FaBell className="icon" />
            {notifications && notifications.length > 0 && (
              <span className="notifBadge">
                {notifications.length > 9 ? "9+" : notifications.length}
              </span>
            )}
            {openNotification && (
              <div className="notification-popup">
                <Notification />
              </div>
            )}
          </div>

          <div
            className="profilePill"
            ref={profileRef}
            onClick={handleToggleProfile}
          >
            <div className="avatarWrapper">
              {user?.shop_photo ? (
                <img
                  src={user.shop_photo}
                  alt={user?.seller_name || "Seller"}
                  className="avatarImg"
                />
              ) : (
                <span className="avatarInitials">
                  {getInitials(user?.seller_name)}
                </span>
              )}
              <span className="onlineStatusDot" />
            </div>
            <div className="profileInfo">
              <span className="profileName">
                {user?.seller_name || "Seller Account"}
              </span>
              <span className="profileShop">
                {user?.shop_name || "Merchant Store"}
              </span>
            </div>
            <FaChevronDown
              size={11}
              className={`chevronIcon ${openProfile ? "chevronRotate" : ""}`}
            />

            {openProfile && (
              <div className="profile-popup">
                <Profile />
              </div>
            )}
          </div>
        </div>
      </div>
    </header>
  );
};

export default TopNavBar;
