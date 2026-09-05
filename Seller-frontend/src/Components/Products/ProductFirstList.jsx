import React, { useCallback, useEffect, useRef, useState } from "react";
import "./productfirstlist.css";
import { LuSettings2, LuSearch } from "react-icons/lu";
import { BsGrid3X3Gap, BsListUl } from "react-icons/bs";
import { FaPlus, FaBoxOpen, FaRupeeSign } from "react-icons/fa";
import { useNavigate } from "react-router-dom";
import useProductStore from "../../Store/ProductStore/ProductStore";
import useAuthStore from "../../Store/AuthStore/AuthStore";
import Loader from "../loader/loader";

const ProductFirstList = () => {
  const [currentPage, setCurrentPage] = useState(1);
  const [resultsPerPage, setResultsPerPage] = useState(10);
  const [totalPages, setTotalPages] = useState(1);
  const [isFilterOpen, setIsFilterOpen] = useState(false);
  const [searchQ, setSearchQ] = useState("");
  const [filterData, setFilterData] = useState("All");
  const [viewMode, setViewMode] = useState("table"); // 'table' or 'grid'
  const [loading, setLoading] = useState(true);

  const navigate = useNavigate();
  const { user } = useAuthStore();
  const { getAllProducts, productList, productActive } = useProductStore();
  const filterRef = useRef(null);

  const handleAddProduct = () => {
    navigate("/productUpload");
  };

  const handleProductdetails = (id) => {
    navigate(`/productdetails/${id}`);
  };

  const handleActive = async (id, e) => {
    e.stopPropagation();
    try {
      const response = await productActive(id);
      if (response?.data?.success) {
        fetchProductList();
      }
    } catch (err) {
      console.error("Error toggling product status:", err);
    }
  };

  const fetchProductList = useCallback(async () => {
    if (!user?.id) return;
    try {
      setLoading(true);
      await getAllProducts(user.id, resultsPerPage, currentPage, searchQ);
    } catch (error) {
      console.error("Error fetching product list:", error);
    } finally {
      setLoading(false);
    }
  }, [user?.id, resultsPerPage, currentPage, searchQ, getAllProducts]);

  useEffect(() => {
    fetchProductList();
  }, [fetchProductList]);

  useEffect(() => {
    if (productList?.totalPages) {
      setTotalPages(productList.totalPages);
    }
  }, [productList]);

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

  const handleFilterSelect = (option) => {
    setFilterData(option);
    setIsFilterOpen(false);
    if (option.toLowerCase() === "all") {
      setSearchQ("");
    } else {
      setSearchQ(option);
    }
  };

  const products = productList?.products || [];

  if (loading && products.length === 0) return <Loader />;

  return (
    <div className="product_section">
      {/* Top Header & Actions */}
      <div className="productPageHeader">
        <div>
          <h2>Merchant Catalog & Inventory</h2>
          <p>Manage product listings, pricing, stock levels, and store visibility</p>
        </div>

        <div className="headerActions">
          <div className="viewToggleGroup">
            <button
              className={`viewBtn ${viewMode === "table" ? "activeView" : ""}`}
              onClick={() => setViewMode("table")}
              title="Table View"
            >
              <BsListUl size={16} />
            </button>
            <button
              className={`viewBtn ${viewMode === "grid" ? "activeView" : ""}`}
              onClick={() => setViewMode("grid")}
              title="Grid View"
            >
              <BsGrid3X3Gap size={15} />
            </button>
          </div>

          <button className="addProductMainBtn" onClick={handleAddProduct}>
            <FaPlus size={12} /> Add New Product
          </button>
        </div>
      </div>

      {/* Search & Filter Bar */}
      <div className="productToolbar">
        <div className="searchBarContainer">
          <LuSearch className="searchIcon" />
          <input
            type="text"
            placeholder="Search products by title, category, code..."
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
              {["All", "Pooja Samagri", "Idols & Murtis", "Incense & Dhoop", "Diya & Lamps", "Books"].map(
                (opt) => (
                  <label
                    key={opt}
                    className={filterData === opt ? "selectedOpt" : ""}
                    onClick={() => handleFilterSelect(opt)}
                  >
                    {opt}
                  </label>
                )
              )}
            </div>
          )}
        </div>
      </div>

      {/* Main View: Table or Grid */}
      {viewMode === "table" ? (
        <div className="productTableWrapper">
          <table className="productsTable">
            <thead>
              <tr>
                <th>Product Details</th>
                <th>Selling Price</th>
                <th>Offer Price</th>
                <th>Stock Level</th>
                <th>Status</th>
                <th>Visible</th>
              </tr>
            </thead>
            <tbody>
              {products.length === 0 ? (
                <tr>
                  <td colSpan="6" className="emptyStateCell">
                    <div className="emptyProductState">
                      <FaBoxOpen size={40} />
                      <p>No products found matching your catalog search.</p>
                      <button className="addFirstBtn" onClick={handleAddProduct}>
                        Upload Product
                      </button>
                    </div>
                  </td>
                </tr>
              ) : (
                products.map((item) => {
                  const img = Array.isArray(item.image)
                    ? item.image[0]
                    : item.image || "/favicon.ico";

                  const stock = Number(item.noOfItems) || 0;

                  return (
                    <tr
                      key={item.id}
                      onClick={() => handleProductdetails(item.id)}
                      className="productRowClickable"
                    >
                      <td className="productInfoCell">
                        <img
                          src={img}
                          alt={item.productName}
                          className="productRowThumb"
                        />
                        <div className="productRowMeta">
                          <span className="productRowTitle">{item.productName}</span>
                          <span className="productRowCode">
                            Item Code: {item.ProductCode || item.id}
                          </span>
                        </div>
                      </td>

                      <td className="productPriceCell">
                        <span className="priceMain">₹{Number(item.price || 0).toFixed(2)}</span>
                      </td>

                      <td className="productOfferCell">
                        {item.offerPrice ? (
                          <span className="offerPriceText">
                            ₹{Number(item.offerPrice).toFixed(2)}
                          </span>
                        ) : (
                          <span className="noOfferText">—</span>
                        )}
                      </td>

                      <td>
                        <span
                          className={`stockBadge ${
                            stock > 10
                              ? "stockHigh"
                              : stock > 0
                              ? "stockLow"
                              : "stockOut"
                          }`}
                        >
                          {stock > 0 ? `${stock} In Stock` : "Out of Stock"}
                        </span>
                      </td>

                      <td>
                        <span
                          className={`badge ${
                            item.isDeleted === 0 ? "badge-emerald" : "badge-rose"
                          }`}
                        >
                          {item.isDeleted === 0 ? "LIVE" : "PAUSED"}
                        </span>
                      </td>

                      <td onClick={(e) => e.stopPropagation()}>
                        <label className="switchToggle">
                          <input
                            type="checkbox"
                            checked={item.isDeleted === 0}
                            onChange={(e) => handleActive(item.id, e)}
                          />
                          <span className="switchSlider"></span>
                        </label>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      ) : (
        <div className="productGridContainer">
          {products.length === 0 ? (
            <div className="emptyProductState">
              <FaBoxOpen size={40} />
              <p>No products found in catalog.</p>
            </div>
          ) : (
            <div className="productCardsGrid">
              {products.map((item) => {
                const img = Array.isArray(item.image)
                  ? item.image[0]
                  : item.image || "/favicon.ico";

                const stock = Number(item.noOfItems) || 0;

                return (
                  <div
                    key={item.id}
                    className="productCardItem"
                    onClick={() => handleProductdetails(item.id)}
                  >
                    <div className="productCardImageWrap">
                      <img src={img} alt={item.productName} />
                      <span
                        className={`cardStockBadge ${
                          stock > 0 ? "badgeInStock" : "badgeOutOfStock"
                        }`}
                      >
                        {stock > 0 ? `${stock} in stock` : "Out of Stock"}
                      </span>
                    </div>

                    <div className="productCardBody">
                      <h4 className="cardItemTitle">{item.productName}</h4>
                      <div className="cardPriceRow">
                        <div>
                          <span className="cardCurrentPrice">
                            ₹{item.offerPrice || item.price}
                          </span>
                          {item.offerPrice && (
                            <span className="cardOriginalPrice">₹{item.price}</span>
                          )}
                        </div>
                        <span
                          className={`badge ${
                            item.isDeleted === 0 ? "badge-emerald" : "badge-rose"
                          }`}
                        >
                          {item.isDeleted === 0 ? "Active" : "Inactive"}
                        </span>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}

      {/* Pagination Footer */}
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
  );
};

export default ProductFirstList;
