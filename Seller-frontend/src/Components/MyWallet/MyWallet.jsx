import React, { useEffect, useState, useRef } from "react";
import "./MyWallet.css";
import { FaPlus, FaTrashAlt, FaTimes } from "react-icons/fa";
import { BiSolidEdit } from "react-icons/bi";
import SellerBalance from "../SellerBalance/SellerBalance";
import useBankStore from "../../Store/BankStore/BankStore";
import useAuthStore from "../../Store/AuthStore/AuthStore";
import { FcCancel, FcCheckmark, FcExpired } from "react-icons/fc";
import { IoCheckmarkDoneSharp } from "react-icons/io5";
import { LuSettings2 } from "react-icons/lu";
import { FaRegFile } from "react-icons/fa";
import Swal from "sweetalert2";
import { jsPDF } from "jspdf";
import autoTable from "jspdf-autotable";
import logo from "../../Assest/logo.png";
import { PiWarningDiamondDuotone } from "react-icons/pi";
import { MdOutlineVerified } from "react-icons/md";
import Loader from "../loader/loader";

const MyWallet = () => {
  const [accountNumber, setAccountNumber] = useState("");
  const [accountHolder, setAccountHolder] = useState("");
  const [bankName, setBankName] = useState("");
  const [ifscCode, setIfscCode] = useState("");
  const [showForm, setShowForm] = useState(false);
  const [editingBank, setEditingBank] = useState(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(0);
  const [limit, setLimit] = useState(10);
  const [isFilterOpen, setIsFilterOpen] = useState(false);
  const filterRef = useRef(null);
  const [searchQ, setSearchQ] = useState("");
  const [filterData, setFillterData] = useState("");
  const [loading, setLoading] = useState(true);

  const {
    userBackGet,
    bank,
    userBackAdd,
    userBackDelete,
    userBackUpdate,
    withdrawalRequestGet,
    transactions,
    accountVerify,
  } = useBankStore();

  const { user } = useAuthStore();

  useEffect(() => {
    if (transactions) {
      setTotalPages(transactions?.totalPages);
    }
  }, [transactions]);

  useEffect(() => {
    if (user) {
      userBackGet(user?.id);
    }
  }, [user]);

  useEffect(() => {
    const fetchWithdrawalRequest = async () => {
      try {
        setLoading(true);
        await withdrawalRequestGet(user?.id, currentPage, limit, searchQ);
        setLoading(false);
      } catch (error) {
        console.error("Request Failed:", error);
        setLoading(false);
      }
    };

    fetchWithdrawalRequest();
  }, [user?.id, currentPage, limit, withdrawalRequestGet, searchQ]);

  const handleEdit = (bank) => {
    setEditingBank(bank.id);
    setBankName(bank.bank_name);
    setAccountHolder(bank.account_holder_name);
    setAccountNumber(bank.account_number);
    setIfscCode(bank.ifsc_number);
    setShowForm(true);
  };

  const handleEditClose = () => {
    setShowForm(false);
    setEditingBank(null);
    setBankName("");
    setAccountHolder("");
    setAccountNumber("");
    setIfscCode("");
  };

  const handleAddAccount = async () => {
    try {
      if (!user?.id) {
        Swal.fire({
          icon: "error",
          title: "Authentication Error",
          text: "Please log in before adding an account.",
        });
        return;
      }

      const response = await userBackAdd({
        account_holder_name: accountHolder,
        bank_name: bankName,
        account_number: accountNumber,
        ifsc_number: ifscCode,
        merchant_id: user?.id,
      });

      if (response?.success) {
        setAccountHolder("");
        setAccountNumber("");
        setBankName("");
        setIfscCode("");
        setShowForm(false);
        await userBackGet(user?.id);
        Swal.fire({
          icon: "success",
          title: "Success!",
          text: "Account added successfully.",
        });
      } else {
        Swal.fire({
          icon: "error",
          title: "Failed!",
          text: response?.data?.message || "Something went wrong.",
        });
      }
    } catch (error) {
      console.error("Error adding account:", error);
      Swal.fire({
        icon: "error",
        title: "Error!",
        text: "An error occurred while adding the account.",
      });
    }
  };

  const handleUpdateAccount = async () => {
    try {
      const response = await userBackUpdate(user?.id, {
        account_holder_name: accountHolder,
        bank_name: bankName,
        account_number: accountNumber,
        ifsc_number: ifscCode,
      });

      console.log(response, "lklklklk");

      if (response?.data?.success) {
        Swal.fire({
          icon: "success",
          title: "Updated!",
          text: "Account details updated successfully.",
        });
        setShowForm(false);
        setEditingBank(null);
        await userBackGet(user?.id);
      } else {
        Swal.fire({
          icon: "error",
          title: "Failed!",
          text: response?.data?.message || "Something went wrong.",
        });
      }
    } catch (error) {
      console.error("Error updating account:", error);
      Swal.fire({
        icon: "error",
        title: "Error!",
        text: "An error occurred while updating the account.",
      });
    }
  };

  const handleDeleteAccount = async () => {
    try {
      if (!user?.id) {
        Swal.fire({
          icon: "error",
          title: "User ID Missing",
          text: "Cannot delete account without a valid user ID.",
        });
        return;
      }

      const confirmDelete = await Swal.fire({
        title: "Are you sure?",
        text: "This action will delete your account permanently!",
        icon: "warning",
        showCancelButton: true,
        confirmButtonColor: "#d33",
        cancelButtonColor: "#3085d6",
        confirmButtonText: "Yes, delete it!",
      });

      if (!confirmDelete.isConfirmed) return;

      const response = await userBackDelete(user.id);

      if (response?.data?.success) {
        Swal.fire({
          icon: "success",
          title: "Deleted!",
          text: "Your account has been deleted successfully.",
        });

        await userBackGet(user?.id);
        setEditingBank(null);
        setAccountHolder("");
        setAccountNumber("");
        setBankName("");
        setIfscCode("");

        setShowForm(true);
      } else {
        Swal.fire({
          icon: "error",
          title: "Deletion Failed",
          text: response?.data?.message || "Something went wrong.",
        });
      }
    } catch (error) {
      console.error("Error deleting account:", error);
      Swal.fire({
        icon: "error",
        title: "Error!",
        text: "An error occurred while deleting the account.",
      });
    }
  };

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

  const options = [5, 10, 20, 40, 80, 150];

  const paymentOptions = [
    "All",
    "Processing",
    "Rejected",
    "Credited",
    "Approved",
  ];

  const handlefilterData = (option) => {
    console.log(option);
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

  const toggleFilters = () => {
    setIsFilterOpen(!isFilterOpen);
  };

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
          // Watermark add karna
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

  const handleVerifyAccount = async () => {
    const amount = await Swal.fire({
      title: "Verify Your Account",
      text: "Enter the last transaction amount (e.g., 0.2)",
      input: "text",
      inputPlaceholder: "0.2",
      showCancelButton: true,
      confirmButtonText: "Verify",
      showLoaderOnConfirm: true,
      preConfirm: async (value) => {
        if (!value || isNaN(value)) {
          Swal.showValidationMessage("Please enter a valid number");
          return false;
        }

        console.log(typeof parseFloat(value), "lkllklk");
        try {
          const response = await accountVerify(bank?.id, parseFloat(value));

          if (!response.data?.success) {
            throw new Error("Verification failed. Amount does not match.");
          }
          return response.data;
        } catch (error) {
          Swal.showValidationMessage(
            error?.response?.data.message || "Request failed"
          );
        }
      },
    }).then((result) => {
      if (result.isConfirmed) {
        Swal.fire("Verified!", "Your account has been verified.", "success");
        userBackGet(user?.id);
      }
    });
  };

  if (loading) return <Loader />;

  const isBankSaved = Boolean(bank && (bank.id || bank.bank_name));

  return (
    <div className="wallet-container">
      <div className="wallet-content">
        <div className="wallet-left">
          <div className="wallet-balance-card">
            <SellerBalance />
          </div>
          {isBankSaved && (
            <div className="saved-accounts-grid">
              <div className="saved-account-card" key={bank.id || 1}>
                <div className="icon">
                  <div
                    className="edit-icon"
                    title="Edit Account Details"
                    onClick={() => handleEdit(bank)}
                  >
                    <BiSolidEdit size={22} />
                  </div>
                  <div
                    className="delete-icon"
                    onClick={() => handleDeleteAccount(user?.id)}
                    title="Delete"
                  >
                    <FaTrashAlt size={20} />
                  </div>
                </div>
                <h3>Saved Account</h3>
                <p>
                  <strong>Bank Name:</strong> {bank.bank_name ? bank.bank_name.toUpperCase() : ""}
                </p>
                <p>
                  <strong>Holder Name:</strong>{" "}
                  {bank.account_holder_name ? bank.account_holder_name.toUpperCase() : ""}
                </p>
                <p>
                  <strong>Account Number:</strong> {bank.account_number || ""}
                </p>
                <p>
                  <strong>IFSC:</strong> {bank.ifsc_number ? bank.ifsc_number.toUpperCase() : ""}
                </p>
                {bank?.isVerify === 0 ? (
                  <span
                    className="accountnotVerify"
                    title="click to verify your bank account"
                    onClick={handleVerifyAccount}
                  >
                    <PiWarningDiamondDuotone />
                    Click to Verify Account
                  </span>
                ) : (
                  <span className="accountVerified">
                    <MdOutlineVerified />
                    Verified
                  </span>
                )}
              </div>
            </div>
          )}

          {(showForm || !isBankSaved) && (
            <div className="bank-details-card">
              {editingBank && (
                <span className="closeEditButton" onClick={handleEditClose}>
                  <FaTimes size={18} />
                </span>
              )}
              <h3>
                {editingBank ? "Edit Account Details" : "Add Bank Account"}
              </h3>
              <input
                type="text"
                placeholder="Bank Name"
                value={bankName}
                onChange={(e) => setBankName(e.target.value)}
              />
              <input
                type="text"
                placeholder="Account Holder Name"
                value={accountHolder}
                onChange={(e) => setAccountHolder(e.target.value)}
              />
              <input
                type="number"
                placeholder="Account Number"
                value={accountNumber}
                onChange={(e) => setAccountNumber(e.target.value)}
              />
              <input
                type="text"
                placeholder="IFSC Code"
                value={ifscCode}
                onChange={(e) => setIfscCode(e.target.value)}
              />
              <button
                onClick={editingBank ? handleUpdateAccount : handleAddAccount}
                className="add-account-btn"
              >
                <FaPlus /> {editingBank ? "Save Changes" : "Add Account"}
              </button>
            </div>
          )}
        </div>
        <div className="wallet-right">
          <div className="transaction-history">
            <div className="transation-history-header">
              <h3>Transaction History - ({transactions?.totalRequests || 0})</h3>
              <div className="filterBtn" ref={filterRef}>
                <button onClick={toggleFilters}>
                  <LuSettings2 />
                  <span>{filterData.length > 0 ? filterData : "Filters"}</span>
                </button>

                {isFilterOpen && (
                  <div className="filter-popup">
                    {paymentOptions.map((option) => (
                      <label
                        key={option}
                        onClick={() => handlefilterData(option)}
                      >
                        {option}
                      </label>
                    ))}{" "}
                  </div>
                )}
                <button
                  onClick={() => downloadTransactionHistory(transactions)}
                >
                  <FaRegFile />
                  <span>Download</span>
                </button>
              </div>
            </div>

            {!transactions?.data || transactions?.data?.length === 0 ? (
              <p className="no-transactions">No transactions found</p>
            ) : (
              transactions?.data?.map((txn, index) => (
                <div
                  key={index}
                  className={`transaction-card ${txn.status.toLowerCase()}`}
                >
                  <div className="txn-header">
                    <p className="txn-date">
                      {" "}
                      {new Date(txn.created_at).toLocaleDateString("en-GB", {
                        day: "2-digit",
                        month: "long",
                        year: "numeric",
                      })}
                    </p>
                    <span className={`txn-type ${txn.status.toLowerCase()}`}>
                      {txn.status.charAt(0).toUpperCase() +
                        txn.status.slice(1).toLowerCase()}
                      {txn.status.toLowerCase() === "approved" && (
                        <FcCheckmark size={22} />
                      )}
                      {txn.status.toLowerCase() === "rejected" && (
                        <FcCancel size={20} />
                      )}
                      {txn.status.toLowerCase() === "processing" && (
                        <FcExpired size={22} />
                      )}

                      {txn.status.toLowerCase() === "credited" && (
                        <IoCheckmarkDoneSharp size={20} />
                      )}
                    </span>
                  </div>
                  <div className="txn-details">
                    <p className="txn-amount">₹{txn.amount.toLocaleString()}</p>
                    <p className="txn-sender">
                      {txn.type === "Withdrawn"
                        ? txn.status === "processing"
                          ? "Your withdrawal request is being processed. It will be completed soon."
                          : txn.status === "rejected"
                          ? "Your withdrawal request has been rejected. Please contact support, and your amount will be credited back to your wallet."
                          : txn.status === "approved"
                          ? "Amount debited from your account and will be reflected in 24 hours."
                          : "Unknown status. Please check with support."
                        : txn.type === "Received"
                        ? "Amount received successfully in your seller wallet."
                        : "Invalid transaction type."}
                    </p>
                    <span>Txn Id: {txn.transactionId || "NA"}</span>
                  </div>
                </div>
              ))
            )}

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
      </div>
    </div>
  );
};

export default MyWallet;
