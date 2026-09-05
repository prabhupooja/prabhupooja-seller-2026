import React, { useEffect, useState } from "react";
import "./SellerBalance.css";
import { FaEye, FaEyeSlash } from "react-icons/fa";
import { PiHandWithdrawBold } from "react-icons/pi";
import { RiSecurePaymentLine } from "react-icons/ri";
import WithdrawBalance from "../WithdrawBalance/WithdrawBalance";
import useBankStore from "../../Store/BankStore/BankStore";
import useAuthStore from "../../Store/AuthStore/AuthStore";
import Swal from "sweetalert2";

const SellerBalance = () => {
  const [openWithdrawBalance, setOpenWithdrawBalance] = useState(false);
  const { userBackGet, bank } = useBankStore();
  const { user } = useAuthStore();
  const [isShowBalance, setIsShowBalance] = useState(true);

  useEffect(() => {
    if (user?.id && !bank) {
      userBackGet(user.id);
    }
  }, [user?.id]);

  const handleToggleWithdraw = () => {
    if (!bank || !bank.id) {
      Swal.fire({
        icon: "info",
        title: "Bank Account Required",
        text: "Please add your verified bank account details in 'My Wallet' before requesting payouts.",
        confirmButtonColor: "#4F46E5",
      });
      return;
    }
    if (bank?.isVerify === 0) {
      Swal.fire({
        icon: "warning",
        title: "Account Under Verification",
        text: "Your bank account verification is currently in progress. Payouts will unlock upon approval.",
        confirmButtonColor: "#F59E0B",
      });
      return;
    }
    setOpenWithdrawBalance(!openWithdrawBalance);
  };

  const formattedBalance = new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    minimumFractionDigits: 2,
  }).format(Number(user?.wallet_balance) || 0);

  return (
    <div className="sellerBalanceCard">
      <div className="balanceCardHeader">
        <h4>Payout Wallet</h4>
        <span className="secureBadge">
          <RiSecurePaymentLine size={13} /> Secured
        </span>
      </div>

      <div className="virtualCard">
        <div className="virtualCardTop">
          <span className="cardBrand">PrabhuPooja Merchant</span>
          <span className="cardChip" />
        </div>

        <div className="virtualCardMiddle">
          <span className="balanceLabel">Available Payout Balance</span>
          <div
            className="balanceAmountRow"
            onClick={() => setIsShowBalance(!isShowBalance)}
            title="Click to toggle visibility"
          >
            <span className="balanceValue">
              {isShowBalance ? formattedBalance : "₹ ••••••••"}
            </span>
            <button className="eyeToggleBtn" type="button">
              {isShowBalance ? <FaEye size={15} /> : <FaEyeSlash size={15} />}
            </button>
          </div>
        </div>

        <div className="virtualCardBottom">
          <span className="sellerNameText">
            {user?.seller_name || "Authorized Merchant"}
          </span>
          <button className="withdrawActionBtn" onClick={handleToggleWithdraw}>
            <PiHandWithdrawBold size={15} />
            Withdraw
          </button>
        </div>
      </div>

      {openWithdrawBalance && (
        <WithdrawBalance
          setIsOpen={handleToggleWithdraw}
          bankDetails={bank}
        />
      )}
    </div>
  );
};

export default SellerBalance;
