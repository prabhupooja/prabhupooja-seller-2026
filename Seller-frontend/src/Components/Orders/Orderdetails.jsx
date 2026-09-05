import React, { useEffect, useState } from "react";
import "./orderdetails.css";
import { MdOutlineMail, MdArrowBack, MdPrint } from "react-icons/md";
import { IoMdCall } from "react-icons/io";
import { FaBoxOpen, FaTruck, FaMapMarkerAlt, FaUserCheck } from "react-icons/fa";
import { useParams, useNavigate } from "react-router-dom";
import useOrderStore from "../../Store/OrderStore/OrderStore";
import useAuthStore from "../../Store/AuthStore/AuthStore";
import userImage from "../../Assest/usericon.jpg";
import Loader from "../loader/loader";

const Orderdetails = () => {
  const { orderId } = useParams();
  const navigate = useNavigate();
  const { getOrderDetail, orderDetail } = useOrderStore();
  const { user } = useAuthStore();
  const [loading, setLoading] = useState(true);

  const getOrderDetails = async () => {
    try {
      setLoading(true);
      await getOrderDetail(orderId, user?.id);
    } catch (err) {
      console.error("Error fetching order detail:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (user?.id && orderId) {
      getOrderDetails();
    }
  }, [user?.id, orderId]);

  const customer = orderDetail?.userDetails;
  const products = orderDetail?.productDetails || [];

  // Parse shipping address safely
  const shippingAddress = (() => {
    const raw = orderDetail?.shipping_address;
    if (!raw) return {};
    if (typeof raw === "object") return raw;
    try {
      return JSON.parse(raw);
    } catch {
      return { address: String(raw) };
    }
  })();

  const subtotal = products.reduce(
    (sum, p) => sum + (Number(p.offerPrice) || Number(p.price) || 0) * (Number(p.quantity) || 1),
    0
  );

  const originalTotal = products.reduce(
    (sum, p) => sum + (Number(p.price) || 0) * (Number(p.quantity) || 1),
    0
  );

  const discountTotal = Math.max(0, originalTotal - subtotal);

  if (loading) return <Loader />;

  return (
    <div className="order-container">
      {/* Top Action Bar */}
      <div className="order-details-top-bar">
        <button className="backBtn" onClick={() => navigate("/orders")}>
          <MdArrowBack /> Back to Orders
        </button>
        <div className="orderDetailHeaderRight">
          <button className="printBtn" onClick={() => window.print()}>
            <MdPrint /> Print Invoice
          </button>
        </div>
      </div>

      {/* Main Order Grid */}
      <div className="order-content">
        <div className="left-column">
          {/* Products List Card */}
          <div className="order-section">
            <div className="orderSectionHeader">
              <div className="orderIdBadge">
                <FaBoxOpen />
                <h3>Order #{orderDetail?.id || orderId}</h3>
              </div>
              <span
                className={`badge ${
                  orderDetail?.status?.toLowerCase() === "paid"
                    ? "badge-emerald"
                    : "badge-amber"
                }`}
              >
                {orderDetail?.status || "Pending"}
              </span>
            </div>

            <div className="productListGroup">
              {products.map((product, idx) => (
                <div className="product-info-card" key={idx}>
                  <div className="productThumb">
                    <img
                      src={
                        Array.isArray(product.image)
                          ? product.image[0]
                          : product.image || "/favicon.ico"
                      }
                      alt={product.productName || "Product"}
                    />
                  </div>
                  <div className="productCardDetails">
                    <h4>{product.productName}</h4>
                    <span className="productCodeText">
                      Item Code: {product.ProductCode || product.id}
                    </span>
                    <span className="productQtyChip">
                      Qty: {product.quantity || 1}
                    </span>
                  </div>
                  <div className="productPriceColumn">
                    <span className="priceCurrent">
                      ₹{product.offerPrice || product.price}
                    </span>
                    {product.offerPrice && product.price && (
                      <span className="priceOriginal">₹{product.price}</span>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Price Breakdown Card */}
          <div className="order-section">
            <h3 className="sectionTitle">Payment & Price Summary</h3>

            <div className="priceBreakdownList">
              <div className="breakdownRow">
                <span>Original Price Total</span>
                <span>₹{originalTotal.toFixed(2)}</span>
              </div>
              <div className="breakdownRow discountRow">
                <span>Total Discount</span>
                <span>- ₹{discountTotal.toFixed(2)}</span>
              </div>
              <div className="breakdownRow">
                <span>Shipping / Delivery</span>
                <span className="freeDeliveryBadge">FREE</span>
              </div>
              <hr className="dividerLine" />
              <div className="breakdownRow totalRow">
                <strong>Final Amount Paid</strong>
                <strong>₹{subtotal.toFixed(2)}</strong>
              </div>
            </div>
          </div>
        </div>

        {/* Right Customer Info Column */}
        <div className="right-column">
          <div className="order-section customerCard">
            <h3 className="sectionTitle">Customer Information</h3>

            <div className="customerProfileRow">
              <img
                src={customer?.image || userImage}
                alt="Customer"
                className="customerAvatar"
              />
              <div>
                <h4 className="customerFullName">
                  {customer?.name} {customer?.lastname || ""}
                </h4>
                <span className="verifiedCustomerBadge">
                  <FaUserCheck size={11} /> Verified Buyer
                </span>
              </div>
            </div>

            <div className="contactSection">
              <h4>Contact Details</h4>
              {customer?.email && (
                <a href={`mailto:${customer.email}`} className="contactLink">
                  <MdOutlineMail /> {customer.email}
                </a>
              )}
              {customer?.mobile && (
                <a href={`tel:${customer.mobile}`} className="contactLink">
                  <IoMdCall /> {customer.mobile}
                </a>
              )}
            </div>

            <div className="shippingAddressSection">
              <h4>
                <FaMapMarkerAlt /> Shipping Address
              </h4>
              <p className="addressText">
                {shippingAddress.address || "Standard Delivery Address"}{" "}
                {shippingAddress.city ? `${shippingAddress.city}, ` : ""}
                {shippingAddress.state ? `${shippingAddress.state} ` : ""}
                {shippingAddress.postalCode ? `- ${shippingAddress.postalCode}` : ""}
                {shippingAddress.country ? `, ${shippingAddress.country}` : ""}
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Orderdetails;
