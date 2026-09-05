import React, { useEffect, useState } from "react";
import "./notificationPage.css";
import useNotificationStore from "../../Store/notificationStore/notificationStore";
import moment from "moment";
import useAuthStore from "../../Store/AuthStore/AuthStore";
import Loader from "../loader/loader";
import { FaBell, FaInfoCircle, FaCheckCircle, FaExclamationCircle } from "react-icons/fa";

const Notification = () => {
  const [filter, setFilter] = useState("today");
  const { notifications, getAllNotifications } = useNotificationStore();
  const { user } = useAuthStore();
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(0);
  const [limit, setLimit] = useState(10);
  const [loading, setLoading] = useState(true);

  const getHeading = () => {
    switch (filter) {
      case "today":
        return "Today's Activity & Alerts";
      case "7days":
        return "Recent Notifications (Past 7 Days)";
      case "all":
      default:
        return "All Merchant Notifications";
    }
  };

  const getEmptyMessage = () => {
    switch (filter) {
      case "today":
        return "No notifications recorded for today.";
      case "7days":
        return "No activity notifications in the last 7 days.";
      case "all":
      default:
        return "You're all caught up! No notifications available.";
    }
  };

  const fetchNotification = async () => {
    if (!user?.id) return;
    try {
      setLoading(true);
      const response = await getAllNotifications(
        user.id,
        limit,
        currentPage,
        filter
      );
      if (response?.success) {
        setTotalPages(response?.totalPages || 1);
      }
    } catch (error) {
      console.error("Failed to fetch notifications:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchNotification();
  }, [user?.id, limit, currentPage, filter]);

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

  if (loading && (!notifications || notifications.length === 0)) return <Loader />;

  return (
    <div className="notification-container">
      {/* Top Header */}
      <div className="notification-header">
        <div>
          <h2>{getHeading()}</h2>
          <p className="notifHeaderSub">Real-time alerts regarding orders, payouts, and customer support</p>
        </div>
        <div className="filter-options">
          <button
            onClick={() => { setFilter("today"); setCurrentPage(1); }}
            className={filter === "today" ? "activeFilterTab" : ""}
          >
            Today
          </button>
          <button
            onClick={() => { setFilter("7days"); setCurrentPage(1); }}
            className={filter === "7days" ? "activeFilterTab" : ""}
          >
            7 Days
          </button>
          <button
            onClick={() => { setFilter("all"); setCurrentPage(1); }}
            className={filter === "all" ? "activeFilterTab" : ""}
          >
            All
          </button>
        </div>
      </div>

      {!notifications || notifications.length === 0 ? (
        <div className="no-notifications">
          <FaBell size={42} className="emptyBellIcon" />
          <p>{getEmptyMessage()}</p>
        </div>
      ) : (
        <ul className="notification-list">
          {notifications.map((notif, idx) => (
            <li key={notif.id || idx} className="notification-item">
              <div className="notifIconWrapper">
                <FaInfoCircle className="notifIcon" />
              </div>
              <div className="notifContent">
                <p>{notif.message || notif.title || "New notification received"}</p>
                <span className="notifTime">
                  {moment().diff(moment(notif.created_at || Date.now()), "hours") < 1
                    ? moment(notif.created_at || Date.now()).fromNow()
                    : moment(notif.created_at || Date.now()).format("MMMM Do YYYY, h:mm A")}
                </span>
              </div>
            </li>
          ))}
        </ul>
      )}

      <div className="paginationCard">
        <div className="show-results">
          <span>Show result:</span>
          <select
            value={limit}
            onChange={(e) => setLimit(Number(e.target.value))}
            className="results-dropdown"
          >
            {options.map((option) => (
              <option key={option} value={option}>
                {option}
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

export default Notification;
