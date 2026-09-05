import React from "react";
import CustomerDetails from "../CustomerDetails/CustomerDetails";
import SellerBalance from "../SellerBalance/SellerBalance";
import "./Transaction.css";

const Transaction = () => {
  return (
    <>
      <div className="transactionContainer">
        <div className="transactionBox1">
          <CustomerDetails />
        </div>
        <div className="transactionBox2">
          <SellerBalance />
        </div>
      </div>
    </>
  );
};

export default Transaction;
