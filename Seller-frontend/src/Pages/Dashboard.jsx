import React, { useEffect, useState } from "react";
import { Routes, Route, useNavigate, useLocation } from "react-router-dom";
import SideNavBar from "../Components/SideNavBar/SideNavBar";
import TopNavBar from "../Components/TopNavBar/TopNavBar";
import DashbordBox from "../Components/Dashboard/DashbordBox";
import Transaction from "../Components/Transaction/Transaction";
import "./Dashboard.css";
import Orderlist from "../Components/Orders/Orderlist";
import Orderdetails from "../Components/Orders/Orderdetails";
import Notification from "../Components/Notification/Notification";
import History from "../Components/History/History";
import Support from "../Components/Support/Support";
import MyWallet from "../Components/MyWallet/MyWallet";
import AdditonalForm from "../Components/AdditionalFroms/AdditonalFrom";
import SellerProfile from "../Components/Profile/SellerProfile";
import Editprofile from "../Components/Profile/Editprofile";
import MyProfile from "../Components/MyProfile/MyProfile";
import useAuthStore from "../Store/AuthStore/AuthStore";
import Swal from "sweetalert2";
import ProductUpload from "../Components/Products/ProductUpload";
import Customerlist from "../Components/Customer/Customerlist";
import ProductFirstList from "../Components/Products/ProductFirstList";
import Productdetails from "../Components/Products/Productdetails";
import Createcoupon from "../Components/coupons/createcoupon";
import Customerlistdetails from "../Components/Customer/Customerlistdetails";
import Editproductdetails from "../Components/Products/Editproductdetails";
import OrderTracking from "../Components/Customer/Ordertracking";

const Dashboard = () => {
  const { isVerified } = useAuthStore();
  const navigate = useNavigate();
  const location = useLocation();
  const [isOpen, setIsOpen] = useState(false);

  useEffect(() => {
    const allowedRoutes = ["/dashboard", "/profile", "/compelet-profile"];
    const timer = setTimeout(() => {
      if (
        isVerified !== "approved" &&
        !allowedRoutes.includes(location.pathname)
      ) {
        navigate("/dashboard");
        Swal.fire(
          "Info",
          "Your account is not active. Please complete your profile and wait for approval.",
          "info"
        );
      }
    }, 200);

    return () => clearTimeout(timer);
  }, [isVerified, location.pathname, navigate]);

  useEffect(() => {
    const token = localStorage.getItem("authToken");

    if (!token) {
      navigate("/");
    }
  }, []);

  return (
    <div className="dashboardContainer">
      <div className="sideNavContent">
        <SideNavBar isOpen={isOpen} setIsOpen={setIsOpen} />
      </div>
      <div className="topNavContent">
        <TopNavBar isOpen={isOpen} setIsOpen={setIsOpen} />
        <div style={{ marginTop: "80px" }}>
          <Routes>
            <Route path="dashboard/" element={<DashbordBox />} />
            <Route path="/transactions" element={<Transaction />} />
            <Route path="/orders" element={<Orderlist />} />
            <Route path="/orderdetails/:orderId" element={<Orderdetails />} />
            <Route path="/notification" element={<Notification />} />
            <Route path="/history" element={<History />} />
            <Route path="/support" element={<Support />} />
            <Route path="/mywallet" element={<MyWallet />} />
            <Route path="/compelet-profile" element={<AdditonalForm />} />
            <Route path="/sellerprofile" element={<SellerProfile />} />
            <Route path="/editprofile" element={<Editprofile />} />
            <Route path="/profile" element={<MyProfile />} />
            <Route path="/products" element={<ProductFirstList />} />
            <Route path="/productUpload" element={<ProductUpload />} />
            <Route path="/productdetails/:id" element={<Productdetails />} />
            <Route
              path="/editproductdetails/:id"
              element={<Editproductdetails />}
            />
            <Route path="/customers" element={<Customerlist />} />
            <Route path="/ordertracking/:id" element={<OrderTracking />} />
            <Route
              path="/customerdetails/:id"
              element={<Customerlistdetails />}
            />
            <Route path="/coupons" element={<Createcoupon />} />
          </Routes>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
