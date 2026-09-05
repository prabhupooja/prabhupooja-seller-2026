import React, { useEffect, useRef, useState } from "react";
import "./Productdetails.css";
import useProductStore from "../../Store/ProductStore/ProductStore";
import { useNavigate, useParams } from "react-router-dom";
import Swal from "sweetalert2";
import Loader from "../loader/loader";
import { FaArrowLeft, FaEdit, FaTrashAlt, FaCheck, FaTimes } from "react-icons/fa";

const Productdetails = () => {
  const { getProductDetail, productDetail, deleteProduct, productActive } =
    useProductStore();
  const { id } = useParams();
  const [mainImage, setMainImage] = useState("");
  const mainImageRef = useRef(null);
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);

  const handelProductDetail = async () => {
    try {
      setLoading(true);
      await getProductDetail(id);
    } catch (err) {
      console.error("Error fetching product detail:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    handelProductDetail();
  }, [id]);

  useEffect(() => {
    if (productDetail) {
      const img = Array.isArray(productDetail.image)
        ? productDetail.image[0]
        : productDetail.image;
      setMainImage(img || "/favicon.ico");
    }
  }, [productDetail]);

  const handleThumbnailClick = (image) => {
    setMainImage(image);
  };

  const handleMouseMove = (e) => {
    const image = mainImageRef.current;
    if (!image) return;
    const rect = image.getBoundingClientRect();
    const x = ((e.clientX - rect.left) / rect.width) * 100;
    const y = ((e.clientY - rect.top) / rect.height) * 100;
    image.style.transformOrigin = `${x}% ${y}%`;
    image.style.transform = "scale(1.8)";
    image.style.transition = "transform 0.15s ease-out";
  };

  const handleMouseLeave = () => {
    const image = mainImageRef.current;
    if (!image) return;
    image.style.transform = "scale(1)";
    image.style.transformOrigin = "center center";
  };

  const handleEditproduct = () => {
    navigate(`/editproductdetails/${id}`);
  };

  const handleDelete = async () => {
    const result = await Swal.fire({
      title: "Delete Product?",
      text: "This product listing will be removed from your catalog.",
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#EF4444",
      cancelButtonColor: "#64748B",
      confirmButtonText: "Yes, Delete",
    });

    if (result.isConfirmed) {
      try {
        Swal.fire({
          title: "Deleting Product...",
          allowOutsideClick: false,
          didOpen: () => Swal.showLoading(),
        });

        await deleteProduct(id);

        await Swal.fire({
          icon: "success",
          title: "Deleted!",
          text: "Product listing has been removed.",
          confirmButtonColor: "#10B981",
        });
        navigate("/products");
      } catch (error) {
        Swal.fire({
          icon: "error",
          title: "Error!",
          text: "Failed to delete product. Please try again.",
        });
      }
    }
  };

  const handleActive = async () => {
    try {
      const response = await productActive(id);
      if (response?.data?.success) {
        getProductDetail(id);
      }
    } catch (err) {
      console.error("Error toggling product status:", err);
    }
  };

  const stock = Number(productDetail?.noOfItems) || 0;
  const imageList = Array.isArray(productDetail?.image)
    ? productDetail.image
    : [productDetail?.image].filter(Boolean);

  if (loading && !productDetail) return <Loader />;

  return (
    <div className="product-details-page">
      {/* Top Header */}
      <div className="detailsTopHeader">
        <button className="backToListBtn" onClick={() => navigate("/products")}>
          <FaArrowLeft /> Back to Catalog
        </button>
        <div className="topHeaderRightActions">
          <button className="productdetails_editbtn" onClick={handleEditproduct}>
            <FaEdit size={13} /> Edit Product
          </button>
          <button className="productdetails_deletebtn" onClick={handleDelete}>
            <FaTrashAlt size={13} /> Delete Listing
          </button>
        </div>
      </div>

      <div className="product-details-container">
        {/* Left Column: Gallery */}
        <div className="product-details-image-container">
          <div
            className="image-container"
            onMouseMove={handleMouseMove}
            onMouseLeave={handleMouseLeave}
          >
            <img
              src={mainImage || "/favicon.ico"}
              alt={productDetail?.productName || "Product"}
              className="main-product-image"
              ref={mainImageRef}
            />
          </div>

          {imageList.length > 1 && (
            <div className="thumbnails">
              {imageList.map((thumbnail, index) => (
                <div
                  key={index}
                  className={`thumbBox ${thumbnail === mainImage ? "activeThumbBox" : ""}`}
                  onClick={() => handleThumbnailClick(thumbnail)}
                >
                  <img src={thumbnail} alt={`thumbnail-${index}`} />
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Right Column: Information & Specs */}
        <div className="product-details-info">
          <div className="productTitleHeader">
            <h2 className="product-name">{productDetail?.productName}</h2>
            <span className="productDetailSKU">
              SKU: {productDetail?.ProductCode || productDetail?.id}
            </span>
          </div>

          <div className="productPriceCard">
            <div className="priceFigures">
              <span className="priceCurrentLarge">
                ₹{productDetail?.offerPrice || productDetail?.price}
              </span>
              {productDetail?.offerPrice && (
                <span className="priceOriginalStrike">₹{productDetail?.price}</span>
              )}
            </div>
            <span
              className={`stockBadge ${
                stock > 10 ? "stockHigh" : stock > 0 ? "stockLow" : "stockOut"
              }`}
            >
              {stock > 0 ? `${stock} Units In Stock` : "Out of Stock"}
            </span>
          </div>

          <div className="productDescriptionBlock">
            <h4>Description</h4>
            <p>{productDetail?.description || "No description provided."}</p>
          </div>

          <div className="specsTableBlock">
            <h4>Technical Specifications</h4>
            <div className="specsGrid">
              <div className="specRow">
                <span>Brand</span>
                <strong>{productDetail?.brand || "PrabhuPooja Certified"}</strong>
              </div>
              <div className="specRow">
                <span>Material</span>
                <strong>{productDetail?.material || "Standard"}</strong>
              </div>
              <div className="specRow">
                <span>Color</span>
                <strong>{productDetail?.colour || "Original"}</strong>
              </div>
              <div className="specRow">
                <span>Theme / Deity</span>
                <strong>{productDetail?.theme || "Devotional"}</strong>
              </div>
              <div className="specRow">
                <span>Dimensions</span>
                <strong>{productDetail?.Dimension || productDetail?.height || "Standard"}</strong>
              </div>
              <div className="specRow">
                <span>Weight</span>
                <strong>{productDetail?.Weight || "N/A"}</strong>
              </div>
            </div>
          </div>

          <div className="productStatusBlock">
            <span>Listing Status:</span>
            <label className="switchToggle" onClick={handleActive}>
              <input
                type="checkbox"
                checked={productDetail?.isDeleted === 0}
                readOnly
              />
              <span className="switchSlider"></span>
            </label>
            <strong>{productDetail?.isDeleted === 0 ? "Active & Visible" : "Hidden from Store"}</strong>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Productdetails;
