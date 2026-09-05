import React, { useState } from "react";
import { FaTimes, FaUniversity, FaMoneyCheckAlt, FaCheckCircle } from "react-icons/fa";
import "./WithdrawBalance.css";
import { PiHandWithdrawBold } from "react-icons/pi";
import { FaBarcode } from "react-icons/fa6";
import useBankStore from "../../Store/BankStore/BankStore";
import useAuthStore from "../../Store/AuthStore/AuthStore";
import Swal from "sweetalert2";

const WithdrawBalance = ({ setIsOpen, bankDetails }) => {
  const [amount, setAmount] = useState("");
  const [error, setError] = useState("");
  const { withdrawalRequest } = useBankStore();
  const [loading, setLoading] = useState(false);
  const { user } = useAuthStore();

  const isBankSaved = Boolean(bankDetails && (bankDetails.id || bankDetails.bank_name));
  const walletBal = Number(user?.wallet_balance || 0);

  const presets = [1000, 2500, 5000, 10000];

  const handleWithdraw = async () => {
    if (!isBankSaved) {
      setError("Please add bank account details in My Wallet first.");
      return;
    }
    const numAmount = Number(amount);
    if (!amount || numAmount < 1000) {
      setError("Minimum withdrawal amount is ₹1,000.");
      return;
    }
    if (walletBal < numAmount) {
      setError("Insufficient wallet balance.");
      return;
    }

    setLoading(true);
    setError("");

    try {
      const response = await withdrawalRequest({
        seller_id: user?.id,
        amount: numAmount,
      });

      if (response?.data?.success) {
        Swal.fire({
          title: "Withdrawal Submitted!",
          text: `Your request for ₹${numAmount.toLocaleString()} has been queued for payout.`,
          icon: "success",
          confirmButtonColor: "#4F46E5",
        });
        setAmount("");
        setIsOpen(false);
      } else {
        setError(response?.data?.message || "Failed to submit withdrawal request.");
      }
    } catch (err) {
      setError("Something went wrong while submitting request.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="withdrawBalancepopup" onClick={() => setIsOpen(false)}>
      <div className="popup-content" onClick={(e) => e.stopPropagation()}>
        <button className="close-btn" onClick={() => setIsOpen(false)}>
          <FaTimes size={18} />
        </button>

        <div className="popupHeader">
          <h3>Request Payout</h3>
          <p>Transfer earnings directly to your verified bank account</p>
        </div>

        <div className="walletBalWidget">
          <span>Available for Payout</span>
          <h4>₹{walletBal.toLocaleString("en-IN", { minimumFractionDigits: 2 })}</h4>
        </div>

        {isBankSaved && (
          <div className="payoutBankCard">
            <div className="payoutBankRow">
              <span className="payoutBankLabel">
                <FaUniversity /> Bank Name
              </span>
              <strong>{bankDetails.bank_name || "N/A"}</strong>
            </div>
            <div className="payoutBankRow">
              <span className="payoutBankLabel">
                <FaMoneyCheckAlt /> Account No.
              </span>
              <strong>
                •••• •••• {String(bankDetails.account_number || "").slice(-4)}
              </strong>
            </div>
            <div className="payoutBankRow">
              <span className="payoutBankLabel">
                <FaBarcode /> IFSC
              </span>
              <strong>{bankDetails.ifsc_number || "N/A"}</strong>
            </div>
          </div>
        )}

        <div className="amountInputGroup">
          <label>Withdrawal Amount (₹)</label>
          <div className="amountInputWrapper">
            <span className="rupeePrefix">₹</span>
            <input
              type="number"
              placeholder="e.g. 2500"
              value={amount}
              onChange={(e) => {
                setAmount(e.target.value);
                setError("");
              }}
              min="1000"
            />
          </div>

          <div className="presetChips">
            {presets.map((preset) => (
              <button
                key={preset}
                type="button"
                className={`presetChip ${Number(amount) === preset ? "selected" : ""}`}
                onClick={() => {
                  setAmount(String(preset));
                  setError("");
                }}
              >
                ₹{preset.toLocaleString()}
              </button>
            ))}
            {walletBal >= 1000 && (
              <button
                type="button"
                className="presetChip maxChip"
                onClick={() => {
                  setAmount(String(Math.floor(walletBal)));
                  setError("");
                }}
              >
                Max
              </button>
            )}
          </div>
        </div>

        {error && <span className="error-msg">{error}</span>}

        <button
          className="withdraw-btn"
          onClick={handleWithdraw}
          disabled={loading}
        >
          <PiHandWithdrawBold size={18} />
          {loading ? "Processing Payout..." : "Confirm Withdrawal"}
        </button>
      </div>
    </div>
  );
};

export default WithdrawBalance;
