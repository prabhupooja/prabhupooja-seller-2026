import React, { useEffect } from "react";
import "./NotificationPop.css";
import { Link } from "react-router-dom";
import useNotificationStore from "../../Store/notificationStore/notificationStore";
import useAuthStore from "../../Store/AuthStore/AuthStore";
import moment from "moment";

const Notification = () => {
  const { notifications, getAllNotifications } = useNotificationStore();
  const { user } = useAuthStore();

  useEffect(() => {
    if (user?.id && (!notifications || notifications.length === 0)) {
      getAllNotifications(user.id).catch((error) => {
        console.error("Error fetching notifications:", error);
      });
    }
  }, [user?.id]);

  return (
    <div className="notification-container-pop">
      <div className="notification-header-pop">
        <h3>Notifications</h3>
      </div>

      <div className="notification-list-pop">
        {notifications?.map((notif) => (
          <div key={notif.id} className="notification-item-pop">
            <div className="notification-info-pop">
              <p className="notification-type-pop">{notif.message}</p>
              <span>
                {moment().diff(moment(notif.created_at), "hours") < 1
                  ? moment(notif.created_at).fromNow()
                  : moment(notif.created_at).format("MMMM Do YYYY, h:mm A")}
              </span>
            </div>
          </div>
        ))}
      </div>

      <div className="notification-view-all-pop">
        <Link to="/notification">
          <button>View All →</button>
        </Link>
      </div>
    </div>
  );
};

export default Notification;
