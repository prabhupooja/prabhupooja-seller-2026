import React, { useEffect, useState, useCallback } from "react";
import "./customerlistdetails.css";
import userimg from "../../Assest/usericon.jpg";
import { useNavigate, useParams } from "react-router-dom";
import useCustomerStore from "../../Store/CustomerStore/CustomerStore";
import Loader from "../loader/loader";
import { MdArrowBack } from "react-icons/md";
import { FaShoppingBag, FaRupeeSign, FaCalendarAlt } from "react-icons/fa";

const Customerlistdetails = () => {
  const { id } = useParams();
  const { getCustomerDetail } = useCustomerStore();
  const [user, setUser] = useState(null);
  const [orders, setOrders] = useState([]);
  const [spent, setSpent] = useState(0);
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [totalPages, setTotalPages] = useState(0);
  const [currentPage, setCurrentPage] = useState(1);
  const [resultsPerPage, setResultsPerPage] = useState(10);

  const fetchCustomerDetail = useCallback(async () => {
    if (!id) return;
    try {
      setLoading(true);
      const response = await getCustomerDetail(id, currentPage, resultsPerPage);
      if (response?.data?.success) {
        setTotalPages(response?.data?.pagination?.totalPages || 0);
        setUser(response?.data?.user || null);
        setOrders(response?.data?.orders || []);
        setSpent(response?.data?.totalAmountSpent || 0);
      }
    } catch (error) {
      console.error("Error fetching customer details:", error);
    } finally {
      setLoading(false);
    }
  }, [id, currentPage, resultsPerPage, getCustomerDetail]);

  useEffect(() => {
    fetchCustomerDetail();
  }, [fetchCustomerDetail]);

  const handleNext = () => {
    if (currentPage < totalPages) {
      setCurrentPage((prevPage) => prevPage + 1);
    }
  };

  const handlePrevious = () => {
    if (currentPage > 1) {
      setCurrentPage((prevPage) => prevPage - 1);
    }
  };

  const handlePageClick = (page) => {
    setCurrentPage(page);
  };

  const handleNavigate = (orderId) => {
    navigate(`/ordertracking/${orderId}`);
  };

  if (loading && !user) return <Loader />;

  return (
    <div className="customer-details-container">
      <button className="backBtn" onClick={() => navigate("/customers")}>
        <MdArrowBack /> Back to Customers
      </button>

      <div className="customer-info-card">
        <img
          src={user?.image || userimg}
          alt={user?.name || "Customer"}
          className="customer-profile-image"
        />
        <div className="customer-data">
          <h2>
            {user?.name} {user?.lastname || ""}
          </h2>
          <div className="customer-fields-grid">
            <div className="custFieldItem">
              <span>Email Address</span>
              <strong>{user?.email || "N/A"}</strong>
            </div>
            <div className="custFieldItem">
              <span>Phone Number</span>
              <strong>{user?.mobile || "N/A"}</strong>
            </div>
            <div className="custFieldItem">
              <span>Lifetime Orders</span>
              <strong className="badge-indigo">
                <FaShoppingBag size={12} /> {orders?.length || 0} Orders
              </strong>
            </div>
            <div className="custFieldItem">
              <span>Total Spent</span>
              <strong className="badge-emerald">
                <FaRupeeSign size={12} /> ₹{Number(spent).toFixed(2)}
              </strong>
            </div>
          </div>
        </div>
      </div>

      <div className="orders-list-section">
        <h3 className="sectionHeading">Customer Order History</h3>
        {orders?.length === 0 ? (
          <div className="noCustomerOrders">
            <p>No past orders recorded for this customer.</p>
          </div>
        ) : (
          orders.flatMap((order, orderIndex) => {
            const productList = Array.isArray(order.products)
              ? order.products
              : [order.products].filter(Boolean);

            return productList.map((item, productIndex) => (
              <div
                className="order-item-card"
                key={`${orderIndex}-${productIndex}`}
                onClick={() => handleNavigate(order.id)}
              >
                <img
                  src={
                    Array.isArray(item?.image)
                      ? item.image[0]
                      : item?.image || "/favicon.ico"
                  }
                  alt={item?.productName || "Product"}
                  className="orderItemThumb"
                />
                <div className="order-info-col">
                  <span className="product-name">
                    {item?.productName || "Pooja Product"}
                  </span>
                  <span className="product-id">Item Code: {item?.id}</span>
                </div>
                <div className="order-meta-col">
                  <span className="orderDateText">
                    <FaCalendarAlt size={12} />
                    {new Date(order.createdAt).toLocaleDateString("en-GB", {
                      day: "2-digit",
                      month: "short",
                      year: "numeric",
                    })}
                  </span>
                  <div className="statusBadgesRow">
                    <span
                      className={`badge ${
                        order.status === "paid" ? "badge-emerald" : "badge-amber"
                      }`}
                    >
                      Payment: {order.status}
                    </span>
                    <span className="badge badge-indigo">
                      Delivery: {order.order_status || "Processing"}
                    </span>
                  </div>
                </div>
              </div>
            ));
          })
        )}
      </div>

      <div className="paginationCard">
        <div className="show-results">
          <span>Show result:</span>
          <select
            name="resultsPerPage"
            value={resultsPerPage}
            onChange={(e) => setResultsPerPage(Number(e.target.value))}
            className="results-dropdown"
          >
            {[5, 10, 20, 50].map((size) => (
              <option key={size} value={size}>
                {size}
              </option>
            ))}
          </select>
        </div>

        <div className="pagination">
          <button
            className="page-btn"
            onClick={handlePrevious}
            disabled={currentPage === 1}
          >
            &lt;
          </button>
          {[...Array(totalPages || 1)].map((_, i) => (
            <span
              key={i}
              className={`page-number ${
                currentPage === i + 1 ? "active" : ""
              }`}
              onClick={() => handlePageClick(i + 1)}
            >
              {i + 1}
            </span>
          ))}
          <button
            className="page-btn"
            onClick={handleNext}
            disabled={currentPage >= totalPages}
          >
            &gt;
          </button>
        </div>
      </div>
    </div>
  );
};

export default Customerlistdetails;
