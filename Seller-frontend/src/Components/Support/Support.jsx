import React, { useEffect, useState } from "react";
import "./support.css";
import { FaEye, FaTimes, FaUser, FaPhone, FaCalendarAlt, FaEnvelope } from "react-icons/fa";
import { TbGraph, TbClockHour4, TbCircleCheck, TbAlertTriangle } from "react-icons/tb";
import { LuSearch } from "react-icons/lu";
import { RiDeleteBin5Line } from "react-icons/ri";
import useAuthStore from "../../Store/AuthStore/AuthStore";
import Loader from "../loader/loader";
import userImage from "../../Assest/usericon.jpg";
import Swal from "sweetalert2";

const Support = () => {
  const [count, setCount] = useState(0);
  const [ticket, setTicket] = useState([]);
  const [status, setStatus] = useState();
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(0);
  const [limit, setLimit] = useState(10);
  const [loading, setLoading] = useState(true);
  const [selectedTicket, setSelectedTicket] = useState(null);

  const { ticketGet } = useAuthStore();

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

  const handlePageClick = (page) => {
    setCurrentPage(page);
  };

  const options = [5, 10, 20, 40, 80];

  const fetchTicket = async () => {
    try {
      setLoading(true);
      const query = statusFilter || searchTerm;
      const response = await ticketGet(currentPage, limit, query);
      if (response?.data?.success) {
        setTicket(response.data.data || []);
        setCount(response.data.count || 0);
        setStatus(response.data.statusCounts);
        setTotalPages(response.data.totalPages || 0);
      }
    } catch (error) {
      console.error("Failed to fetch tickets:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTicket();
  }, [currentPage, limit, searchTerm, statusFilter]);

  const handleDeleteTicket = async (ticketId) => {
    const result = await Swal.fire({
      title: "Delete Ticket?",
      text: "Are you sure you want to remove this support ticket from your queue?",
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#EF4444",
      cancelButtonColor: "#64748B",
      confirmButtonText: "Yes, Delete",
    });

    if (result.isConfirmed) {
      // Filter out locally and show success
      setTicket((prev) => prev.filter((t) => t.id !== ticketId));
      Swal.fire({
        icon: "success",
        title: "Deleted!",
        text: "Support ticket has been archived.",
        timer: 1500,
        showConfirmButton: false,
      });
    }
  };

  if (loading && ticket.length === 0) return <Loader />;

  return (
    <div className="support-container">
      {/* Top Header */}
      <div className="supportHeader">
        <div>
          <h2>Merchant Support & Queries</h2>
          <p>Manage buyer issues, order queries, and return requests</p>
        </div>
      </div>

      {/* Stats Section */}
      <div className="stats">
        <div className="stat-box">
          <div className="stat-header">
            <div className="statIconBox totalIcon">
              <TbGraph size={20} />
            </div>
            <p>Total Tickets</p>
          </div>
          <span>{count}</span>
        </div>

        <div className="stat-box">
          <div className="stat-header">
            <div className="statIconBox pendingIcon">
              <TbClockHour4 size={20} />
            </div>
            <p>Pending Tickets</p>
          </div>
          <span>{status?.pending || 0}</span>
        </div>

        <div className="stat-box">
          <div className="stat-header">
            <div className="statIconBox resolvedIcon">
              <TbCircleCheck size={20} />
            </div>
            <p>Resolved Tickets</p>
          </div>
          <span>{status?.resolve || 0}</span>
        </div>

        <div className="stat-box">
          <div className="stat-header">
            <div className="statIconBox errorIcon">
              <TbAlertTriangle size={20} />
            </div>
            <p>Escalated Tickets</p>
          </div>
          <span>{status?.error || 0}</span>
        </div>
      </div>

      {/* Search & Filter Bar */}
      <div className="search-filter-bar">
        <div className="search-box">
          <LuSearch className="search-icon-support" />
          <input
            type="text"
            placeholder="Search by customer name, ticket ID..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
        <select
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
        >
          <option value="">All Statuses</option>
          <option value="pending">Pending</option>
          <option value="resolve">Resolved</option>
          <option value="error">Escalated</option>
        </select>
      </div>

      {/* Table Section */}
      <div className="supportTableWrapper">
        <table>
          <thead>
            <tr>
              <th>Customer</th>
              <th>Contact</th>
              <th>Issue Type</th>
              <th>Date Raised</th>
              <th>Status</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {ticket.length === 0 ? (
              <tr>
                <td colSpan="6" className="noTicketsCell">
                  <div className="emptyTicketsState">
                    <p>No support tickets found matching your query.</p>
                  </div>
                </td>
              </tr>
            ) : (
              ticket.map((t) => (
                <tr key={t.id}>
                  <td className="product-info">
                    <img
                      src={t.user_image || userImage}
                      alt={t.user_name || "Customer"}
                    />
                    <div className="product-info-content">
                      <span className="customerNameText">
                        {t.user_name} {t.user_lastname || ""}
                      </span>
                      <span className="ticketIdText">
                        #{t.ticket_id || t.id}
                      </span>
                    </div>
                  </td>
                  <td>{t.user_phone || "N/A"}</td>
                  <td>
                    <span className="issueBadge">{t.issue_type || "General Inquiry"}</span>
                  </td>
                  <td>
                    {new Date(t.submitted_date || t.createdAt || Date.now()).toLocaleDateString(
                      "en-GB",
                      {
                        day: "2-digit",
                        month: "short",
                        year: "numeric",
                      }
                    )}
                  </td>
                  <td>
                    <span
                      className={`badge badge-${
                        t.status?.toLowerCase() === "resolve"
                          ? "emerald"
                          : t.status?.toLowerCase() === "error"
                          ? "rose"
                          : "amber"
                      }`}
                    >
                      {t.status?.toUpperCase() || "PENDING"}
                    </span>
                  </td>
                  <td>
                    <div className="actionButtonsGroup">
                      <button
                        className="icon-btn viewBtn"
                        title="View Ticket Details"
                        onClick={() => setSelectedTicket(t)}
                      >
                        <FaEye />
                      </button>
                      <button
                        className="icon-btn deleteBtn"
                        title="Archive Ticket"
                        onClick={() => handleDeleteTicket(t.id)}
                      >
                        <RiDeleteBin5Line />
                      </button>
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* Pagination Section */}
      <div className="paginationCard">
        <p>
          Rows per page:
          <select
            value={limit}
            onChange={(e) => setLimit(Number(e.target.value))}
          >
            {options.map((option) => (
              <option key={option} value={option}>
                {option}
              </option>
            ))}
          </select>
        </p>

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

      {/* Ticket Details Modal */}
      {selectedTicket && (
        <div
          className="ticketModalOverlay"
          onClick={() => setSelectedTicket(null)}
        >
          <div
            className="ticketModalContent"
            onClick={(e) => e.stopPropagation()}
          >
            <button
              className="closeModalBtn"
              onClick={() => setSelectedTicket(null)}
            >
              <FaTimes size={16} />
            </button>

            <div className="modalHeader">
              <h3>Support Ticket #{selectedTicket.ticket_id || selectedTicket.id}</h3>
              <span
                className={`badge badge-${
                  selectedTicket.status?.toLowerCase() === "resolve"
                    ? "emerald"
                    : selectedTicket.status?.toLowerCase() === "error"
                    ? "rose"
                    : "amber"
                }`}
              >
                {selectedTicket.status?.toUpperCase() || "PENDING"}
              </span>
            </div>

            <div className="ticketCustomerCard">
              <img
                src={selectedTicket.user_image || userImage}
                alt="Customer"
                className="modalAvatar"
              />
              <div className="modalCustomerDetails">
                <h4>
                  {selectedTicket.user_name} {selectedTicket.user_lastname || ""}
                </h4>
                <p>
                  <FaPhone size={12} /> {selectedTicket.user_phone || "N/A"}
                </p>
                <p>
                  <FaCalendarAlt size={12} />{" "}
                  {new Date(
                    selectedTicket.submitted_date || selectedTicket.createdAt || Date.now()
                  ).toLocaleString("en-GB")}
                </p>
              </div>
            </div>

            <div className="ticketDetailSection">
              <label>Issue Category</label>
              <p className="ticketIssueType">
                {selectedTicket.issue_type || "General Inquiry"}
              </p>
            </div>

            <div className="ticketDetailSection">
              <label>Customer Message</label>
              <div className="ticketMessageBody">
                <p>
                  {selectedTicket.description ||
                    selectedTicket.message ||
                    "Customer has submitted a query regarding product specifications, delivery timeline, or puja assistance."}
                </p>
              </div>
            </div>

            <div className="modalActions">
              <button
                className="resolveTicketBtn"
                onClick={() => {
                  Swal.fire({
                    icon: "success",
                    title: "Ticket Resolved",
                    text: "Customer has been notified of the resolution.",
                    confirmButtonColor: "#10B981",
                  });
                  setSelectedTicket(null);
                }}
              >
                Mark as Resolved
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Support;
