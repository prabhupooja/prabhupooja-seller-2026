import React, { useEffect, useState, useRef, useCallback } from "react";
import "./CustomerDetails.css";
import { FaRegCalendarAlt, FaRegFile } from "react-icons/fa";
import { LuSettings2, LuSearch } from "react-icons/lu";
import useOrderStore from "../../Store/OrderStore/OrderStore";
import useAuthStore from "../../Store/AuthStore/AuthStore";
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";
import usericon from "../../Assest/usericon.jpg";
import Loader from "../loader/loader";

const CustomerDetails = () => {
  const [currentPage, setCurrentPage] = useState(1);
  const [resultsPerPage, setResultsPerPage] = useState(10);
  const { orderlist, getAllOrders } = useOrderStore();
  const [totalPages, setTotalPages] = useState(0);
  const { user } = useAuthStore();
  const [limit, setLimit] = useState(10);
  const [page, setPage] = useState(1);
  const [dateRange, setDateRange] = useState([null, null]);
  const [startDate, endDate] = dateRange;
  const [isDateOpen, setIsDateOpen] = useState(false);
  const [isFilterOpen, setIsFilterOpen] = useState(false);
  const [filterData, setFillterData] = useState("");
  const [searchQ, setSearchQ] = useState("");
  const [loading, setLoading] = useState(true);

  const dateRef = useRef(null);
  const filterRef = useRef(null);

  const fetchOrderList = useCallback(async () => {
    if (!user?.id) return;
    try {
      setLoading(true);
      await getAllOrders(user.id, resultsPerPage, currentPage, searchQ);
    } catch (error) {
      console.error("Error fetching orders:", error);
    } finally {
      setLoading(false);
    }
  }, [user?.id, resultsPerPage, currentPage, searchQ, getAllOrders]);

  useEffect(() => {
    fetchOrderList();
  }, [fetchOrderList]);

  useEffect(() => {
    if (orderlist) {
      setTotalPages(orderlist?.data?.totalPages || 0);
    }
  }, [orderlist]);

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
    setPage(page);
    fetchOrderList();
  };

  const toggleCalendar = () => {
    setIsDateOpen(!isDateOpen);
    setIsFilterOpen(false);
  };

  const toggleFilters = () => {
    setIsFilterOpen(!isFilterOpen);
    setIsDateOpen(false);
  };

  const handleClickOutside = (event) => {
    if (
      dateRef.current &&
      !dateRef.current.contains(event.target) &&
      filterRef.current &&
      !filterRef.current.contains(event.target)
    ) {
      setIsDateOpen(false);
      setIsFilterOpen(false);
    }
  };

  useEffect(() => {
    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  const paymentOptions = ["All", "Paid", "Unpaid", "Offline", "Online"];

  const handlefilterData = (option) => {
    setFillterData(option);

    if (option.toLowerCase() === "online") {
      setSearchQ("upi");
    } else if (option.toLowerCase() === "offline") {
      setSearchQ("cod");
    } else if (option.toLowerCase() === "all") {
      setSearchQ("");
    } else {
      setSearchQ(option);
    }
  };

  useEffect(() => {
    if (startDate && endDate) {
      // Get local date without timezone shift
      const formattedStart = new Date(startDate).toLocaleDateString("en-CA");
      const formattedEnd = new Date(endDate).toLocaleDateString("en-CA");

      // Set search query
      const searchQuery = `startdate=${encodeURIComponent(
        formattedStart
      )}&enddate=${encodeURIComponent(formattedEnd)}`;
      console.log("Corrected Date Query:", searchQuery);
      setSearchQ(searchQuery.toLowerCase());
    }
  }, [startDate, endDate]);

  const handleDownloadBtn = (orderlist) => {
    console.log(orderlist, "llllll");
    if (!orderlist?.data?.orders?.length) {
      alert("No orders available to download.");
      return;
    }

    const formattedData = orderlist.data.orders.map((customer) => {
      const productIds = Array.isArray(customer.productId)
        ? customer.productId
        : [customer.productId];
      const matchingProducts = orderlist.data.products.filter((product) =>
        productIds.includes(product.id)
      );
      const totalProductPrice = matchingProducts.reduce(
        (sum, product) => sum + Number(product.offerPrice),
        0
      );
    });

    const csvRows = [];
    const headers = Object.keys(formattedData[0]);
    csvRows.push(headers.join(","));

    formattedData.forEach((row) => {
      const values = headers.map((header) => `"${row[header]}"`);
      csvRows.push(values.join(","));
    });

    const csvString = csvRows.join("\n");

    const blob = new Blob([csvString], { type: "text/csv" });
    const url = URL.createObjectURL(blob);

    const a = document.createElement("a");
    a.href = url;
    a.download = "transations.csv";
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
  };

  if (loading) return <Loader />;

  return (
    <div className="customer-container">
      <div className="top-bar">
        <div className="search-container">
          <LuSearch className="search-icon" />
          <input
            type="text"
            placeholder="Search by ID, product, or others..."
            className="search-bar"
            onChange={(e) => setSearchQ(e.target.value)}
          />
        </div>
        <div className="buttons-group">
          <div className="filter-container" ref={filterRef}>
            <button className="filter-btn" onClick={toggleFilters}>
              <LuSettings2 />
              <span>{filterData.length > 0 ? filterData : "Filters"}</span>
            </button>

            {isFilterOpen && (
              <div className="filter-popup">
                {paymentOptions.map((option) => (
                  <label key={option} onClick={() => handlefilterData(option)}>
                    {option}
                  </label>
                ))}
              </div>
            )}
          </div>

          <div className="date-container" ref={dateRef}>
            <button className="date-range" onClick={toggleCalendar}>
              <FaRegCalendarAlt />
              <span>
                {startDate && endDate
                  ? `${startDate.toLocaleDateString()} - ${endDate.toLocaleDateString()}`
                  : "Select Date Range"}
              </span>
            </button>

            {isDateOpen && (
              <div className="calendar-popup">
                <DatePicker
                  selectsRange={true}
                  startDate={startDate}
                  endDate={endDate}
                  onChange={(update) => setDateRange(update)}
                  isClearable={true}
                  inline
                />
              </div>
            )}
          </div>
          <button
            className="download-btn"
            onClick={() => handleDownloadBtn(orderlist)}
          >
            <FaRegFile />
            Download
          </button>
        </div>
      </div>

      <table className="customer-table">
        <thead>
          <tr>
            <th>Customer Name</th>
            <th>Order Id</th>
            <th>Date</th>
            <th>Amount</th>
            <th>Payment</th>
            <th>Status</th>
          </tr>
        </thead>
        <tbody>
          {orderlist?.data?.orders?.length > 0 ? (
            orderlist.data.orders.map((customer, index) => {
              const productIds = Array.isArray(customer.productId)
                ? customer.productId
                : [customer.productId];
              const matchingProducts = orderlist.data.products.filter(
                (product) => productIds.includes(product.id)
              );
              const totalProductPrice = matchingProducts.reduce(
                (sum, product) => sum + Number(product.offerPrice),
                0
              );
              return (
                <tr key={index}>
                  <td>
                    <div className="profile">
                      <img
                        className="avatar"
                        src={
                          customer.userImage ||
                          //
                          usericon
                        }
                        alt="avatar-img"
                      />
                      {/* <span>
                        {customer.userName.charAt(0).toUpperCase() +
                          customer.userName.slice(1).toLowerCase() +
                          " " +
                          customer.userLastName.charAt(0).toUpperCase() +
                          customer.userLastName.slice(1).toLowerCase()}
                      </span> */}
                    </div>
                  </td>
                  <td>
                    <span>#{customer.id + 1000}</span>
                  </td>
                  <td>
                    {new Date(customer.createdAt).toLocaleDateString("en-GB", {
                      day: "2-digit",
                      month: "long",
                      year: "numeric",
                    })}
                  </td>
                  <td>₹{totalProductPrice}.00</td>
                  <td>
                    <span
                      className={`payment ${customer.paymentMethod.toLowerCase()}`}
                    >
                      {customer.paymentMethod
                        ? customer.paymentMethod.toUpperCase() === "COD"
                          ? "Offline"
                          : customer.paymentMethod.toUpperCase() === "UPI"
                          ? "Online"
                          : "Unknown Source"
                        : "N/A"}
                    </span>
                  </td>
                  <td>
                    <span className={`status ${customer.status.toLowerCase()}`}>
                      {customer?.status.charAt(0).toUpperCase() +
                        customer.status.slice(1).toLowerCase()}
                    </span>
                  </td>
                </tr>
              );
            })
          ) : (
            <td colSpan="6" className="text-center">
              No data available
            </td>
          )}
        </tbody>
      </table>

      <div className="tabeFooter">
        <div className="resultCount">
          <label>Show result: </label>
          <select
            className="custom-select"
            value={resultsPerPage}
            onChange={(e) => {
              setResultsPerPage(Number(e.target.value));
            }}
          >
            {[5, 10, 20, 50, 100].map((size, i) => (
              <option key={i} value={size}>
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

          {[...Array(totalPages)].map((_, i) => {
            const page = i + 1;

            if (totalPages > 5) {
              if (page <= 4) {
                return (
                  <span
                    key={i}
                    className={`page-number ${
                      currentPage === page ? "active" : ""
                    }`}
                    onClick={() => handlePageClick(page)}
                  >
                    {page}
                  </span>
                );
              }

              if (page === 5 && currentPage === 4) {
                return (
                  <span
                    key={i}
                    className="page-number"
                    onClick={() => handlePageClick(page)}
                  >
                    ...
                  </span>
                );
              }

              if (page === totalPages - 1 || page === totalPages) {
                return (
                  <span
                    key={i}
                    className={`page-number ${
                      currentPage === page ? "active" : ""
                    }`}
                    onClick={() => handlePageClick(page)}
                  >
                    {page}
                  </span>
                );
              }

              return null;
            } else {
              return (
                <span
                  key={i}
                  className={`page-number ${
                    currentPage === page ? "active" : ""
                  }`}
                  onClick={() => handlePageClick(page)}
                >
                  {page}
                </span>
              );
            }
          })}

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

export default CustomerDetails;
