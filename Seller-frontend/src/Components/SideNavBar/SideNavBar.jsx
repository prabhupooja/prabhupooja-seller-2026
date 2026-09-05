import React from "react";
import {
  FaWallet,
  FaExchangeAlt,
  FaShoppingCart,
  FaUsers,
  FaBox,
  FaHistory,
  FaBell,
  FaHeadset,
  FaSignOutAlt,
  FaChartPie,
} from "react-icons/fa";
import "./SideNavBar.css";
import logo from "../../Assest/logo.png";
import { Link, useNavigate, useLocation } from "react-router-dom";
import useAuthStore from "../../Store/AuthStore/AuthStore";
import { ImCancelCircle } from "react-icons/im";
import { RiCouponLine } from "react-icons/ri";

const SideNavBar = ({ isOpen, setIsOpen }) => {
  const { logout } = useAuthStore();
  const navigate = useNavigate();
  const location = useLocation();

  const handleLogout = () => {
    logout();
    navigate("/");
  };

  const isActive = (path) => {
    if (path === "/dashboard") {
      return location.pathname === "/dashboard" || location.pathname === "/dashboard/";
    }
    return location.pathname.startsWith(path);
  };

  const menuItems = [
    { path: "/dashboard", name: "Dashboard", icon: <FaChartPie /> },
    { path: "/mywallet", name: "My Wallet", icon: <FaWallet /> },
    { path: "/transactions", name: "Transactions", icon: <FaExchangeAlt /> },
    { path: "/orders", name: "Orders", icon: <FaShoppingCart /> },
    { path: "/customers", name: "Customers", icon: <FaUsers /> },
    { path: "/products", name: "Products", icon: <FaBox /> },
    { path: "/history", name: "History", icon: <FaHistory /> },
    { path: "/notification", name: "Notifications", icon: <FaBell /> },
  ];

  const helpItems = [
    { path: "/support", name: "Support", icon: <FaHeadset /> },
    { path: "/coupons", name: "Coupons", icon: <RiCouponLine /> },
  ];

  return (
    <>
      {isOpen && (
        <div className="sideNavOverlay" onClick={() => setIsOpen(false)}></div>
      )}
      <div
        className={`sideNavContainer ${isOpen ? "sideNavopen" : "sideNavclosed"}`}
      >
        <div className="sideNavCloseBtn" onClick={() => setIsOpen(false)}>
          <ImCancelCircle size={22} />
        </div>

        <div className="brandLogo">
          <Link to="/dashboard" className="brandLogoLink">
            <div className="logoWrapper">
              <img src={logo} alt="Prabhu Pooja" />
            </div>
            <div className="brandText">
              <h4>Prabhu Pooja</h4>
              <span>Seller Central</span>
            </div>
          </Link>
        </div>

        <div className="menuBox">
          <div className="menuSection">
            <h5 className="menuTitle">MAIN MENU</h5>
            <div className="menuList">
              {menuItems.map((item) => (
                <Link
                  key={item.path}
                  to={item.path}
                  onClick={() => setIsOpen(false)}
                >
                  <div
                    className={`MenuItemsName ${
                      isActive(item.path) ? "activeNav" : ""
                    }`}
                  >
                    <span className="navIconWrapper">{item.icon}</span>
                    <span className="navItemTitle">{item.name}</span>
                    {isActive(item.path) && <span className="activeIndicator" />}
                  </div>
                </Link>
              ))}
            </div>
          </div>

          <div className="menuSection">
            <h5 className="menuTitle">SUPPORT & SETTINGS</h5>
            <div className="menuList">
              {helpItems.map((item) => (
                <Link
                  key={item.path}
                  to={item.path}
                  onClick={() => setIsOpen(false)}
                >
                  <div
                    className={`MenuItemsName ${
                      isActive(item.path) ? "activeNav" : ""
                    }`}
                  >
                    <span className="navIconWrapper">{item.icon}</span>
                    <span className="navItemTitle">{item.name}</span>
                    {isActive(item.path) && <span className="activeIndicator" />}
                  </div>
                </Link>
              ))}

              <div className="MenuItemsName logoutItem" onClick={handleLogout}>
                <span className="navIconWrapper">
                  <FaSignOutAlt />
                </span>
                <span className="navItemTitle">Logout</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default SideNavBar;
