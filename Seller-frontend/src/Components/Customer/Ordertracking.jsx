import React, { useEffect, useState } from "react";
import "./ordertracking.css";
import { FaCheckCircle } from "react-icons/fa";
import { FaExclamationTriangle } from "react-icons/fa";
import { useParams } from "react-router-dom";
import useCustomerStore from "../../Store/CustomerStore/CustomerStore";

const OrderTracking = () => {
  const { id } = useParams();
  const { getOrderTracking, cancelReason, userOrdersFetchByOrderId } = useCustomerStore();
  const [trackingData, setTrackingData] = useState([]);
  const [mapUrl, setMapUrl] = useState("");

  useEffect(() => {
    const fetchOrderTracking = async () => {
      try {
        if (id) {
          const res = await getOrderTracking(id);

          console.log("order tracking data", res);

          if (res?.success) {
            setTrackingData(res?.order);
            userOrdersFetchByOrderId(id)
          }
        }
      } catch (err) {
        console.error("Failed to fetch tracking data", err);
      } 
    };

    fetchOrderTracking();
  }, [id, getOrderTracking]);


  const statusLabels = {
    order_placed: "Order Placed",
    dispatched: "Dispatched",
    shipping: "Shipping",
    delivered: "Delivered",
    error: "Error",
  };

  const getMapUrl = async (address) => {
    const encodedAddress = encodeURIComponent(address);
    const response = await fetch(
      `https://nominatim.openstreetmap.org/search?q=${encodedAddress}&format=json`
    );
    const data = await response.json();

    if (data.length > 0) {
      const { lat, lon } = data[0];

      const lonLeft = parseFloat(lon) - 0.01;
      const lonRight = parseFloat(lon) + 0.01;
      const latBottom = parseFloat(lat) - 0.01;
      const latTop = parseFloat(lat) + 0.01;

      return `https://www.openstreetmap.org/export/embed.html?bbox=${lonLeft},${latBottom},${lonRight},${latTop}&layer=mapnik&marker=${lat},${lon}`;
    }

    return null;
  };
  useEffect(() => {
    if (trackingData?.shippingAddress?.address) {
      const addr = trackingData.shippingAddress.address;
      const city = trackingData.shippingAddress.city || "";
      const fullAddress = `${addr} ${city}`.trim();
      getMapUrl(fullAddress)
        .then((url) => {
          if (url) setMapUrl(url);
        })
        .catch(() => {});
    }
  }, [trackingData]);

  const orderDisplayId = Number(trackingData?.orderId || 0) + 1000;

  return (
    <div className="order-tracking-container">
      <h2 className="title">ORDER TRACKING</h2>

      <div className="order-tracking-summary">
        <div className="summary-tracking-item">
          <span>ORDER PLACED</span>
          <strong>
            {new Date(trackingData?.orderDate || Date.now()).toLocaleDateString("en-GB", {
              day: "numeric",
              month: "short",
              year: "numeric",
            })}
          </strong>
        </div>
        <div className="summary-tracking-item">
          <span>TOTAL AMOUNT</span>
          <strong>₹{Number(trackingData?.totalPrice || 0).toFixed(2)}</strong>
        </div>
        <div className="summary-tracking-item">
          <span>SHIP TO</span>
          <strong>
            {trackingData?.shippingAddress?.name || "Customer"}{" "}
            {trackingData?.shippingAddress?.lastname || ""}
          </strong>
        </div>
        <div className="summary-tracking-item">
          <span>ORDER REF</span>
          <strong>#{orderDisplayId}</strong>
        </div>
        <div className="summary-tracking-item">
          <span>PAYMENT STATUS</span>
          <strong className="paymentStatusPill">{trackingData?.orderStatus || "Pending"}</strong>
        </div>
      </div>

     <div className="order-tracking-status">
        <h3>
          Order Status:{" "}
          <span
            style={{
              color:
                trackingData?.order_progress_status === "error"
                  ? "red"
                  : "green",
            }}
            className="status"
          >
            {trackingData?.order_progress_status === 'error'
              ? 'Order Cancel'
              : statusLabels[trackingData?.order_progress_status]}
          </span>
        </h3>
        {trackingData?.order_progress_status === 'error' ? (
          <span className="Order_cancel">Order Cancel: <p style={{ color: '#6a0505', fontWeight: 'bold' }}>
            {cancelReason}
          </p>
          </span>
        ) : (
          <p>
            Estimated Delivery:{" "}
            <strong>
              {trackingData?.estimated_delivery_start
                ? new Date(trackingData.estimated_delivery_start).toLocaleDateString("en-GB", {
                  day: "numeric",
                  month: "long",
                  year: "numeric",
                })
                : "N/A"}
              {" - "}
              {trackingData?.estimated_delivery_end
                ? new Date(trackingData.estimated_delivery_end).toLocaleDateString("en-GB", {
                  day: "numeric",
                  month: "long",
                  year: "numeric",
                })
                : "N/A"}
            </strong>
          </p>
        )}


        <div className="progress-tracking-bar">
          {trackingData?.trackingStatus?.map((step, index) => (
            <div key={index} className={`tracking-step ${step?.status}`}>
              {step?.status === "completed" && (
                <FaCheckCircle className="icon success" />
              )}
              {step?.status === "processing" && (
                <FaCheckCircle className="icon in-progress" />
              )}
              {step?.status === "error" && (
                <FaExclamationTriangle className="icon error" />
              )}

              <span>{step?.name}</span>
              <small>
                {step?.status === "processing" ? (
                  <span className="processing-status">
                    <span className="dot"></span>
                    Processing
                  </span>
                ) : (
                  step?.date
                )}
              </small>
            </div>
          ))}
        </div>
      </div>


     
      <div className="shipping-info">
        <h3>SHIPPING DETAILS</h3>
        {trackingData?.shippingAddress && (
          <div>
            <p>
              <strong>Name:</strong> {trackingData?.shippingAddress.name}{" "}
              {trackingData?.shippingAddress.lastname}
            </p>
            <p>
              <strong>Email:</strong> {trackingData?.shippingAddress.email}
            </p>
            <p>
              <strong>Number:</strong> {trackingData?.shippingAddress.number}
            </p>
            <p>
              <strong>Shipping Address:</strong>{" "}
              {trackingData?.shippingAddress.address}
            </p>
            <p>
              <strong>City:</strong> {trackingData?.shippingAddress.city}
            </p>
            <p>
              <strong>Pincode:</strong>{" "}
              {trackingData?.shippingAddress.postalCode}
            </p>
            <p>
              <strong>State:</strong> {trackingData?.shippingAddress.state}
            </p>
            <p>
              <strong>Country:</strong> {trackingData?.shippingAddress.country}
            </p>
          </div>
        )}
      </div>

   
      <div className="map-container">
        <iframe
          title="Google Map"
          width="100%"
          height="100%"
          style={{ border: 0 }}
          allowFullScreen
          loading="lazy"
          referrerPolicy="no-referrer-when-downgrade"
          src={mapUrl}
        ></iframe>
      </div>
    </div>
  );
};

export default OrderTracking;
