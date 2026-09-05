import React, { useState, useCallback, useEffect, useRef } from "react";
import "./orderlist.css";
import { useNavigate } from "react-router-dom";
import { FaRegCalendarAlt, FaFileCsv, FaEye, FaFilter } from "react-icons/fa";
import useOrderStore from "../../Store/OrderStore/OrderStore";
import useAuthStore from "../../Store/AuthStore/AuthStore";
import { LuSettings2, LuSearch } from "react-icons/lu";
import Loader from "../loader/loader";

const Orderlist = () => {
  const [search, setSearch] = useState("");
  const [ordersPerPage, setOrdersPerPage] = useState(10);
  const [currentPage, setCurrentPage] = useState(1);
  const navigate = useNavigate();
  const { orderlist, getAllOrders } = useOrderStore();
  const { user } = useAuthStore();
  const [totalPages, setTotalPages] = useState(1);
  const [filterData, setFilterData] = useState("All");
  const [isFilterOpen, setIsFilterOpen] = useState(false);
  const [loading, setLoading] = useState(true);

  const filterRef = useRef(null);

  const fetchOrderList = useCallback(async () => {
    if (!user?.id) return;
    try {
      setLoading(true);
      await getAllOrders(user.id, ordersPerPage, currentPage, search);
    } catch (error) {
      console.error("Error fetching orders:", error);
    } finally {
      setLoading(false);
    }
  }, [user?.id, ordersPerPage, currentPage, search, getAllOrders]);

  useEffect(() => {
    fetchOrderList();
  }, [fetchOrderList]);

  useEffect(() => {
    if (orderlist?.data?.totalPages) {
      setTotalPages(orderlist.data.totalPages);
    }
  }, [orderlist]);

  const handleNext = () => {
    if (currentPage < totalPages) {
      setCurrentPage(currentPage + 1);
    }
  };

  const handlePrevious = () => {
    if (currentPage > 1) {
      setCurrentPage(currentPage - 1);
    }
  };

  const handleOrderdetails = (orderId) => {
    navigate(`/orderdetails/${orderId}`);
  };

  const handleOrdersPerPageChange = (e) => {
    setOrdersPerPage(Number(e.target.value));
    setCurrentPage(1);
  };

  const Allorders = orderlist?.data?.orders || [];
  const products = orderlist?.data?.products || [];

  const ordersWithProductDetails = Allorders.map((order) => {
    const pIds = Array.isArray(order.productId) ? order.productId : [order.productId];
    const qties = Array.isArray(order.quantity) ? order.quantity : [order.quantity];

    const filteredData = pIds.reduce(
      (acc, productId, index) => {
        const product = products.find((p) => p.id === productId);
        if (product) {
          acc.productId.push(productId);
          acc.quantity.push(qties[index] || 1);
          acc.productDetails.push({
            ...product,
            quantity: qties[index] || 1,
          });
        }
        return acc;
      },
      { productId: [], quantity: [], productDetails: [] }
    );

    return { ...order, ...filteredData };
  });

  const handlePageClick = (page) => {
    setCurrentPage(page);
  };

  const handlefilterData = (option) => {
    setFilterData(option);
    setIsFilterOpen(false);

    if (option.toLowerCase() === "online") {
      setSearch("upi");
    } else if (option.toLowerCase() === "offline") {
      setSearch("cod");
    } else if (option.toLowerCase() === "all") {
      setSearch("");
    } else {
      setSearch(option);
    }
  };

  const paymentOptions = ["All", "Paid", "Unpaid", "Offline", "Online"];

  const toggleFilters = () => {
    setIsFilterOpen(!isFilterOpen);
  };

  const handleClickOutside = (event) => {
    if (filterRef.current && !filterRef.current.contains(event.target)) {
      setIsFilterOpen(false);
    }
  };

  useEffect(() => {
    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  const handleExportCSV = () => {
    if (ordersWithProductDetails.length === 0) return;
    const headers = ["Order ID", "Date", "Customer", "Quantity", "Payment Method", "Status"];
    const rows = ordersWithProductDetails.map((o) => [
      o.id,
      new Date(o.createdAt).toLocaleDateString("en-GB"),
      `${o.userName || ""} ${o.userLastname || ""}`.trim(),
      Array.isArray(o.quantity) ? o.quantity.reduce((a, b) => a + b, 0) : o.quantity || 1,
      o.paymentMethod,
      o.status,
    ]);

    const csvContent =
      "data:text/csv;charset=utf-8," +
      [headers.join(","), ...rows.map((e) => e.join(","))].join("\n");
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", `seller_orders_${Date.now()}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  if (loading && ordersWithProductDetails.length === 0) return <Loader />;

  return (
    <div className="orderlist-container">
      {/* Header & Controls */}
      <div className="orderListHeader">
        <div>
          <h2>Merchant Orders</h2>
          <p>Track, manage, and process customer orders in real-time</p>
        </div>
      </div>

      <div className="filters">
        <div className="search-bar">
          <LuSearch className="search-icon-orderlist" />
          <input
            type="text"
            placeholder="Search by Order ID, Customer Name, Payment..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>

        <div className="button-grp-orderList" ref={filterRef}>
          <button className="filter-btn" onClick={toggleFilters}>
            <LuSettings2 />
            <span>Filter: {filterData}</span>
          </button>
          {isFilterOpen && (
            <div className="filter-popup">
              {paymentOptions.map((option) => (
                <label
                  key={option}
                  className={filterData === option ? "activeFilterOpt" : ""}
                  onClick={() => handlefilterData(option)}
                >
                  {option}
                </label>
              ))}
            </div>
          )}

          <button className="download-btn" onClick={handleExportCSV}>
            <FaFileCsv /> Export CSV
          </button>
        </div>
      </div>

      {/* Orders Table */}
      <div className="orderTableWrapper">
        <table className="order-table">
          <thead>
            <tr>
              <th>Product Details</th>
              <th>Order Date</th>
              <th>Quantity</th>
              <th>Customer</th>
              <th>Payment</th>
              <th>Status</th>
              <th>Action</th>
            </tr>
          </thead>
          <tbody>
            {ordersWithProductDetails.length === 0 ? (
              <tr>
                <td colSpan="7" className="noOrdersCell">
                  <p>No orders found matching your search.</p>
                </td>
              </tr>
            ) : (
              ordersWithProductDetails.map((order) => (
                <tr key={order.id}>
                  <td
                    onClick={() => handleOrderdetails(order.id)}
                    className="product-info clickable"
                  >
                    <div className="productThumbWrapper">
                      <img
                        src={
                          order?.productDetails?.[0]?.image?.[0] ||
                          order?.productDetails?.[0]?.image ||
                          "/favicon.ico"
                        }
                        alt="Product"
                      />
                      {order?.productDetails?.length > 1 && (
                        <span className="productCountChip">
                          +{order.productDetails.length - 1}
                        </span>
                      )}
                    </div>
                    <div className="product-info-content">
                      <span className="orderProductName">
                        {order?.productDetails?.[0]?.productName || "Pooja Item"}
                        {order?.productDetails?.length > 1 ? " & more" : ""}
                      </span>
                      <span className="order-id">Order #{order.id}</span>
                    </div>
                  </td>

                  <td>
                    {new Date(order.createdAt).toLocaleDateString("en-GB", {
                      day: "2-digit",
                      month: "short",
                      year: "numeric",
                    })}
                  </td>

                  <td>
                    <span className="qtyBadge">
                      {Array.isArray(order?.quantity)
                        ? order?.quantity.reduce((total, num) => total + num, 0)
                        : Number(order?.quantity) || 1}{" "}
                      Items
                    </span>
                  </td>

                  <td>
                    <span className="custName">
                      {order?.userName} {order?.userLastname || ""}
                    </span>
                  </td>

                  <td>
                    <span
                      className={`badge ${
                        order.paymentMethod === "COD"
                          ? "badge-amber"
                          : "badge-indigo"
                      }`}
                    >
                      {order.paymentMethod === "COD" ? "Cash on Delivery" : "Online Prepaid"}
                    </span>
                  </td>

                  <td>
                    <span
                      className={`badge ${
                        order.status?.toLowerCase() === "paid"
                          ? "badge-emerald"
                          : order.status?.toLowerCase() === "unpaid"
                          ? "badge-rose"
                          : "badge-amber"
                      }`}
                    >
                      {order.status || "Pending"}
                    </span>
                  </td>

                  <td>
                    <button
                      className="viewOrderBtn"
                      onClick={() => handleOrderdetails(order.id)}
                      title="View Order Details"
                    >
                      <FaEye /> View
                    </button>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* Pagination */}
      <div className="paginationCard">
        <div className="show-results">
          <span>Show result:</span>
          <select
            name="resultsPerPage"
            value={ordersPerPage}
            onChange={handleOrdersPerPageChange}
            className="results-dropdown"
          >
            <option value={5}>5</option>
            <option value={10}>10</option>
            <option value={20}>20</option>
            <option value={30}>30</option>
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

export default Orderlist;
