import React, { useEffect, useRef, useState } from "react";
import "./history.css";
import { FaRegFile } from "react-icons/fa";
import useBankStore from "../../Store/BankStore/BankStore";
import useAuthStore from "../../Store/AuthStore/AuthStore";
import { jsPDF } from "jspdf";
import autoTable from "jspdf-autotable";
import logo from "../../Assest/logo.png";
import Loader from "../loader/loader";

const History = () => {
  const { withdrawalRequestGet, transactions } = useBankStore();
  const { user } = useAuthStore();
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(0);
  const [limit, setLimit] = useState(10);
  const [activeTab, setActiveTab] = useState("all");
  const [searchQ, setSearchQ] = useState("");
  const [loading, setLoading] = useState(true);

  const handleTabClick = (tab) => {
    setActiveTab(tab);
    if (tab === "all") {
      setSearchQ("");
    } else {
      setSearchQ(tab);
    }
  };

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
  const options = [5, 10, 20, 40, 80, 150];

  useEffect(() => {
    const fetchWithdrawalRequest = async () => {
      try {
        setLoading(true);
        await withdrawalRequestGet(user?.id, currentPage, limit, searchQ);
      } catch (error) {
        console.error("Request Failed:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchWithdrawalRequest();
  }, [user?.id, currentPage, limit, withdrawalRequestGet, searchQ]);

  const downloadTransactionHistory = (transactions) => {
    if (!transactions || !transactions.data || transactions.data.length === 0) {
      alert("No transactions available to download.");
      return;
    }

    const doc = new jsPDF();
    const logoUrl = logo;
    const imgWidth = 100;
    const imgHeight = 100;
    const pageWidth = doc.internal.pageSize.getWidth();
    const pageHeight = doc.internal.pageSize.getHeight();

    const img = new Image();
    img.src = logoUrl;

    img.onload = function () {
      doc.setFontSize(18);
      doc.text("Transaction History", 14, 15);

      const headers = [["Date", "Status", "Amount", "Txn ID", "Details"]];

      const data = transactions.data.map((txn) => [
        new Date(txn.created_at).toLocaleDateString("en-GB", {
          day: "2-digit",
          month: "long",
          year: "numeric",
        }),
        txn.status.charAt(0).toUpperCase() + txn.status.slice(1).toLowerCase(),
        txn.amount.toLocaleString(),
        txn.transactionId || "NA",
        txn.type === "Withdrawn"
          ? txn.status === "processing"
            ? "Processing withdrawal"
            : txn.status === "rejected"
            ? "Rejected - Contact support"
            : txn.status === "approved"
            ? "Amount debited, will be credited in 24 hours"
            : "Unknown status"
          : txn.type === "Received"
          ? "Amount received successfully"
          : "Invalid transaction type.",
      ]);

      autoTable(doc, {
        head: headers,
        body: data,
        startY: 30,
        theme: "grid",
        headStyles: {
          fillColor: [255, 165, 0],
          textColor: [0, 0, 0],
          fontStyle: "bold",
        },
        styles: {
          cellPadding: 5,
          fontSize: 10,
        },
        didDrawPage: function (data) {
          doc.setGState(new doc.GState({ opacity: 0.1 }));
          doc.addImage(
            img,
            "PNG",
            pageWidth / 2 - imgWidth / 2,
            pageHeight / 2 - imgHeight / 2,
            imgWidth,
            imgHeight
          );
          doc.setGState(new doc.GState({ opacity: 1 }));
        },
      });

      doc.save("Transaction_History.pdf");
    };
  };

  useEffect(() => {
    if (transactions) {
      setTotalPages(transactions?.totalPages);
    }
  }, [transactions]);

  if (loading) return <Loader />;

  return (
    <div className="history-container">
      <div className="history-tabs">
        <button
          className={activeTab === "all" ? "active-tab" : ""}
          onClick={() => handleTabClick("all")}
        >
          All
        </button>
        <button
          className={activeTab === "processing" ? "active-tab" : ""}
          onClick={() => handleTabClick("processing")}
        >
          Processing
        </button>
        <button
          className={activeTab === "rejected" ? "active-tab" : ""}
          onClick={() => handleTabClick("rejected")}
        >
          Rejected
        </button>
        <button
          className={activeTab === "credited" ? "active-tab" : ""}
          onClick={() => handleTabClick("credited")}
        >
          Credited
        </button>
        <button
          className={activeTab === "approved" ? "active-tab" : ""}
          onClick={() => handleTabClick("approved")}
        >
          Approved
        </button>
      </div>

      <div className="history-controls">
        <button
          className="download-btn"
          onClick={() => downloadTransactionHistory(transactions)}
        >
          <FaRegFile /> Download
        </button>
      </div>

      <table className="history-table">
        <thead>
          <tr>
            <th>Transaction id</th>
            <th>Date</th>
            <th>Status</th>
            <th>Price</th>
            <th>Message</th>
          </tr>
        </thead>
        <tbody>
          {transactions?.data?.length === 0 ? (
            <tr>
              <td colSpan="5" style={{ textAlign: "center", padding: "32px 0", color: "#94a3b8" }}>
                No transactions found
              </td>
            </tr>
          ) : (
            transactions?.data?.map((order, index) => (
              <tr key={index}>
                <td>{order.transactionId}</td>
                <td>
                  {new Date(order.created_at).toLocaleDateString("en-GB", {
                    day: "2-digit",
                    month: "long",
                    year: "numeric",
                  })}
                </td>
                <td>
                  <span className={`status ${order.status.toLowerCase()}`}>
                    {order.status}
                  </span>
                </td>
                <td>₹{order.amount.toLocaleString()}</td>
                <td className="OrderMsg">
                  {" "}
                  {order.type === "Withdrawn"
                    ? order.status === "processing"
                      ? "Your withdrawal request is being processed. It will be completed soon."
                      : order.status === "rejected"
                      ? "Your withdrawal request has been rejected. Please contact support, and your amount will be credited back to your wallet."
                      : order.status === "approved"
                      ? "Amount debited from your account and will be reflected in 24 hours."
                      : "Unknown status. Please check with support."
                    : order.type === "Received"
                    ? "Amount received successfully in your seller wallet."
                    : "Invalid transaction type."}
                </td>
              </tr>
            ))
          )}
        </tbody>
      </table>

      <div className="paginationCard">
        <p>
          Show Result:
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
          {[...Array(totalPages)].map((_, i) => (
            <span
              key={i}
              className={`page-number ${currentPage === i + 1 ? "active" : ""}`}
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

export default History;
