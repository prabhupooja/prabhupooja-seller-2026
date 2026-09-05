import React, { useCallback, useEffect, useRef, useState } from "react";
import "./customerlist.css";
import { LuSettings2, LuSearch } from "react-icons/lu";
import useCustomerStore from "../../Store/CustomerStore/CustomerStore";
import useAuthStore from "../../Store/AuthStore/AuthStore";
import { useNavigate } from "react-router-dom";
import Loader from "../loader/loader";
import { FaUserFriends, FaShoppingBag, FaEnvelope, FaMapMarkerAlt } from "react-icons/fa";

const Customerlist = () => {
  const { customerlist, getAllCustomer } = useCustomerStore();
  const { user } = useAuthStore();
  const [totalPages, setTotalPages] = useState(1);
  const [currentPage, setCurrentPage] = useState(1);
  const [resultsPerPage, setResultsPerPage] = useState(10);
  const [isFilterOpen, setIsFilterOpen] = useState(false);
  const [filterData, setFilterData] = useState("All");
  const [searchQ, setSearchQ] = useState("");
  const filterRef = useRef(null);
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);

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

  useEffect(() => {
    if (customerlist?.totalPages) {
      setTotalPages(customerlist.totalPages);
    }
  }, [customerlist]);

  const fetchCustomer = useCallback(async () => {
    if (!user?.id) return;
    try {
      setLoading(true);
      await getAllCustomer(user.id, resultsPerPage, currentPage, searchQ);
    } catch (error) {
      console.error("Error fetching customers:", error);
    } finally {
      setLoading(false);
    }
  }, [user?.id, resultsPerPage, currentPage, searchQ, getAllCustomer]);

  useEffect(() => {
    fetchCustomer();
  }, [fetchCustomer]);

  const handleCustomerDetail = (id) => {
    if (id) {
      navigate(`/customerdetails/${id}`);
    }
  };

  const filterOptions = ["All", "Top Buyers (> ₹5000)", "Frequent Buyers (> 3 Orders)", "New Customers"];

  const handleFilterSelect = (opt) => {
    setFilterData(opt);
    setIsFilterOpen(false);
  };

  const customers = customerlist?.users || [];

  if (loading && customers.length === 0) return <Loader />;

  return (
    <div className="customer_section">
      {/* Top Header */}
      <div className="customerPageHeader">
        <div>
          <h2>Customer Directory</h2>
          <p>View repeat buyers, purchase history, delivery addresses, and customer lifetime value</p>
        </div>
      </div>

      {/* Toolbar */}
      <div className="customerToolbar">
        <div className="searchBarContainer">
          <LuSearch className="searchIcon" />
          <input
            type="text"
            placeholder="Search customers by name, email, city..."
            value={searchQ}
            onChange={(e) => setSearchQ(e.target.value)}
          />
        </div>

        <div className="filterGroupRelative" ref={filterRef}>
          <button
            className="filterToggleBtn"
            onClick={() => setIsFilterOpen(!isFilterOpen)}
          >
            <LuSettings2 size={14} />
            <span>Filter: {filterData}</span>
          </button>

          {isFilterOpen && (
            <div className="filterMenuDropdown">
              {filterOptions.map((opt) => (
                <label
                  key={opt}
                  className={filterData === opt ? "selectedOpt" : ""}
                  onClick={() => handleFilterSelect(opt)}
                >
                  {opt}
                </label>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Table Container */}
      <div className="customerTableCard">
        <table className="customersTable">
          <thead>
            <tr>
              <th>Customer</th>
              <th>Contact Email</th>
              <th>Shipping City / Address</th>
              <th>Orders Placed</th>
              <th>Total Spent</th>
            </tr>
          </thead>
          <tbody>
            {customers.length === 0 ? (
              <tr>
                <td colSpan="5" className="emptyStateCell">
                  <div className="emptyCustomerState">
                    <FaUserFriends size={36} />
                    <p>No customers found matching your criteria.</p>
                  </div>
                </td>
              </tr>
            ) : (
              customers.map((c, index) => {
                const fullName = `${c.userName || "Customer"} ${c.userLastName || ""}`.trim();
                const initial = fullName.charAt(0).toUpperCase() || "C";

                return (
                  <tr
                    key={c.userId || index}
                    onClick={() => handleCustomerDetail(c.userId)}
                    className="customerRowClickable"
                  >
                    <td>
                      <div className="customerAvatarCell">
                        {c.userImage ? (
                          <img
                            src={c.userImage}
                            alt={fullName}
                            className="customerAvatarImg"
                          />
                        ) : (
                          <div className="customerAvatarInitial">{initial}</div>
                        )}
                        <div className="customerNameGroup">
                          <span className="customerFullName">{fullName}</span>
                          <span className="customerIdLabel">ID: #{c.userId || index + 1}</span>
                        </div>
                      </div>
                    </td>

                    <td>
                      <div className="customerEmailCell">
                        <FaEnvelope size={11} className="emailIcon" />
                        <span>{c.userEmail || "—"}</span>
                      </div>
                    </td>

                    <td>
                      <div className="customerLocationCell">
                        <FaMapMarkerAlt size={11} className="locIcon" />
                        <span>{c.userAddress || c.city || "Not Specified"}</span>
                      </div>
                    </td>

                    <td>
                      <span className="orderCountBadge">
                        <FaShoppingBag size={10} />
                        {c.orderCount || 1} {Number(c.orderCount) === 1 ? "order" : "orders"}
                      </span>
                    </td>

                    <td>
                      <span className="totalSpentFigure">
                        ₹{Number(c.totalAmountSpent || 0).toLocaleString("en-IN")}
                      </span>
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>

        {/* Pagination */}
        <div className="paginationCard">
          <div className="show-results">
            <span>Show result:</span>
            <select
              value={resultsPerPage}
              onChange={(e) => {
                setResultsPerPage(Number(e.target.value));
                setCurrentPage(1);
              }}
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
    </div>
  );
};

export default Customerlist;
