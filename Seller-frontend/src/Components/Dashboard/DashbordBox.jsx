import React, { useEffect, useState } from "react";
import "../Dashboard/DashbordBox.css";
import SellerBalance from "../SellerBalance/SellerBalance";
import { FaRupeeSign, FaShoppingCart, FaChartLine, FaArrowUp, FaChevronRight } from "react-icons/fa";
import CustomerDetails from "../CustomerDetails/CustomerDetails";
import { Link, useNavigate } from "react-router-dom";
import { CircularProgressbar, buildStyles } from "react-circular-progressbar";
import {
  InitialState,
  UnderReview,
  RejectedAccount,
} from "../UnderReview/UnderReview";
import useAuthStore from "../../Store/AuthStore/AuthStore";
import useOrderStore from "../../Store/OrderStore/OrderStore";
import Loader from "../loader/loader";

const DashbordBox = () => {
  const [status, setStatus] = useState(null);
  const [completion, setCompletion] = useState(0);
  const { userGet, user, setIsVerified, setIsCompleted } = useAuthStore();
  const { orderlist, recentOrders } = useOrderStore();
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    if (!user) {
      userGet().catch((err) => console.error("userGet failed in DashbordBox", err));
    }
    fetchRecentOrders();
  }, []);

  const fetchRecentOrders = async () => {
    try {
      const response = await recentOrders();
      setOrders(response?.data?.data || []);
    } catch (err) {
      console.error("Error fetching recent orders:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    calculateCompletion();
    if (user) {
      const { aadhaar_status, pan_status, gst_status, address_proof_status } = user;
      if (
        aadhaar_status === pan_status &&
        pan_status === gst_status &&
        gst_status === address_proof_status
      ) {
        setStatus(aadhaar_status);
        setIsVerified(aadhaar_status);
      } else if (
        aadhaar_status === "pending" ||
        pan_status === "pending" ||
        gst_status === "pending" ||
        address_proof_status === "pending"
      ) {
        setStatus("pending");
      }
    }
  }, [user]);

  const calculateCompletion = () => {
    if (!user) return;
    const ignoredFields = ["otp"];
    const totalFields = Object.keys(user).filter(
      (field) => !ignoredFields.includes(field)
    );
    const filledFields = totalFields.filter(
      (field) => user[field] && user[field] !== ""
    );
    const percentage = Math.round((filledFields.length / totalFields.length) * 100);
    setCompletion(percentage);
    setIsCompleted(percentage);
  };

  const handleOrderdetails = (orderId) => {
    navigate(`/orderdetails/${orderId}`);
  };

  const formatCurrency = (val) => {
    const num = Number(val) || 0;
    return new Intl.NumberFormat("en-IN", {
      style: "currency",
      currency: "INR",
      maximumFractionDigits: 0,
    }).format(num);
  };

  if (loading) return <Loader />;

  return (
    <div className="DashbordBoxContainer">
      {status === "initially" && <InitialState />}
      {status === "pending" && <UnderReview completion={completion} />}
      {status === "rejected" && <RejectedAccount />}

      {status === "approved" && (
        <div className="DashbordBoxContainerLeft">
          <div className="BoxContainerLeftList">
            {/* Total Income Card */}
            <div className="metricCard incomeCard">
              <div className="metricCardTop">
                <div className="metricIconBox incomeIcon">
                  <FaRupeeSign />
                </div>
                <span className="trendBadge positive">
                  <FaArrowUp size={10} /> +12.4%
                </span>
              </div>
              <div className="metricCardBody">
                <span className="metricLabel">Total Revenue</span>
                <h3 className="metricValue">{formatCurrency(orderlist?.data?.totalIncome || 0)}</h3>
              </div>
            </div>

            {/* Total Orders Card */}
            <div className="metricCard ordersCard">
              <div className="metricCardTop">
                <div className="metricIconBox ordersIcon">
                  <FaShoppingCart />
                </div>
                <span className="trendBadge positive">
                  <FaArrowUp size={10} /> +8.1%
                </span>
              </div>
              <div className="metricCardBody">
                <span className="metricLabel">Total Orders</span>
                <h3 className="metricValue">{orderlist?.data?.totalOrders || 0}</h3>
              </div>
            </div>

            {/* Average Sale Card */}
            <div className="metricCard salesCard">
              <div className="metricCardTop">
                <div className="metricIconBox salesIcon">
                  <FaChartLine />
                </div>
                <span className="trendBadge neutral">Avg / Order</span>
              </div>
              <div className="metricCardBody">
                <span className="metricLabel">Average Sale</span>
                <h3 className="metricValue">{formatCurrency(orderlist?.data?.averageSale || 0)}</h3>
              </div>
            </div>
          </div>

          <div className="customerContainerList">
            <CustomerDetails />
          </div>
        </div>
      )}

      <div className="DashbordBoxContainerRight">
        <div className="BoxContainerRightList">
          {status === "approved" && (
            <>
              <div className="balanceCart">
                <SellerBalance />
              </div>

              <div className="recentSalesCard">
                <div className="recentSalesHeader">
                  <h4>Recent Sales</h4>
                  <Link to="/orders" className="viewAllLink">
                    View All <FaChevronRight size={10} />
                  </Link>
                </div>

                <div className="recentSalesList">
                  {orders.length === 0 ? (
                    <div className="noRecentOrders">
                      <p>No recent sales yet.</p>
                    </div>
                  ) : (
                    orders
                      .flatMap((pro) => {
                        const products = Array.isArray(pro.products)
                          ? pro.products
                          : [pro.products];
                        return products.map((product) => ({
                          product,
                          createdAt: pro.createdAt,
                          id: pro.id,
                        }));
                      })
                      .slice(0, 5)
                      .map((item, index) => (
                        <div
                          className="recentSaleItem"
                          key={index}
                          onClick={() => handleOrderdetails(item.id)}
                        >
                          <div className="saleItemThumb">
                            <img
                              src={
                                Array.isArray(item.product?.image)
                                  ? item.product.image[0]
                                  : item.product?.image || "/favicon.ico"
                              }
                              alt={item.product?.productName || "Product"}
                            />
                          </div>
                          <div className="saleItemDetails">
                            <h5>{item.product?.productName || "Pooja Product"}</h5>
                            <span className="saleItemDate">
                              {new Date(item.createdAt).toLocaleDateString("en-GB", {
                                day: "2-digit",
                                month: "short",
                                year: "numeric",
                              })}
                            </span>
                          </div>
                          <span className="saleItemPrice">
                            ₹{item.product?.price || item.product?.offerPrice || 0}
                          </span>
                        </div>
                      ))
                  )}
                </div>
              </div>
            </>
          )}

          <div className="profileStatusCard">
            <div className="profileProgressRow">
              <div className="circularProgressWrapper">
                <CircularProgressbar
                  value={completion}
                  text={`${completion}%`}
                  styles={buildStyles({
                    textSize: "26px",
                    textColor: completion === 100 ? "#10B981" : "#0F172A",
                    pathColor: completion === 100 ? "#10B981" : "#4F46E5",
                    trailColor: "#F1F5F9",
                  })}
                />
              </div>

              <div className="profileStatusText">
                <h4>
                  {completion === 100
                    ? "Profile Completed"
                    : "Complete Your Profile"}
                </h4>
                <p>
                  {completion === 100
                    ? "All merchant features unlocked!"
                    : "Finish your KYC to unlock direct payouts."}
                </p>
              </div>
            </div>

            {completion < 100 && (
              <Link to="/compelet-profile" className="verifyIdentityBtn">
                Verify Identity & KYC
              </Link>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default DashbordBox;
