import React from "react";
import { Oval } from "react-loader-spinner";
import "./loader.css";

const Loader = () => (
  <div className="loader-overlay">
    <Oval
      height={50}
      width={50}
      color="#cd5702"
      wrapperStyle={{}}
      wrapperClass=""
      visible={true}
      ariaLabel="oval-loading"
      secondaryColor="#cd5702"
      strokeWidth={2}
      strokeWidthSecondary={2}
    />
  </div>
);

export default Loader;
