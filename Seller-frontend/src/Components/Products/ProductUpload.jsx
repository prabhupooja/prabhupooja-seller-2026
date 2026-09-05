import React, { useState } from "react";
import "./ProductUpload.css";
import useProductStore from "../../Store/ProductStore/ProductStore";
import { useNavigate } from "react-router-dom";
import Swal from "sweetalert2";
import useAuthStore from "../../Store/AuthStore/AuthStore";
import { FaCloudUploadAlt, FaTimes, FaArrowLeft } from "react-icons/fa";

const ProductUpload = () => {
  const [productName, setProductName] = useState("");
  const [price, setPrice] = useState("");
  const [offerPrice, setOfferPrice] = useState("");
  const [theme, setTheme] = useState("");
  const [color, setColor] = useState("");
  const [style, setStyle] = useState("");
  const [material, setMaterial] = useState("");
  const [feature, setFeature] = useState("");
  const [item, setItem] = useState("");
  const [brand, setBrand] = useState("");
  const [file, setFile] = useState([]);
  const [description, setDescription] = useState("");
  const [selectedImage, setSelectedImage] = useState([]);
  const [activeImage, setActiveImage] = useState(null);
  const [height, setHeight] = useState("");
  const [dimension, setDimension] = useState("");
  const [weight, setWeight] = useState("");
  const [productCode, setProductCode] = useState("");
  const [productHighlights, setProductHighlights] = useState("");
  const [benefits, setBenefits] = useState("");
  const [usageAndCare, setUsageAndCare] = useState("");

  const { createProduct } = useProductStore();
  const { user } = useAuthStore();
  const navigate = useNavigate();

  const handleImageUpload = (event) => {
    const selectedFiles = event.target.files;
    if (selectedFiles && selectedFiles.length > 0) {
      const newFilesArray = Array.from(selectedFiles);
      const updatedFiles = [...file, ...newFilesArray].slice(0, 5);
      setFile(updatedFiles);

      const updatedPreviews = updatedFiles.map((f) => URL.createObjectURL(f));
      setSelectedImage(updatedPreviews);
      if (!activeImage && updatedPreviews.length > 0) {
        setActiveImage(updatedPreviews[0]);
      }
    }
  };

  const removeImage = (index, e) => {
    e.stopPropagation();
    const newFiles = file.filter((_, idx) => idx !== index);
    const newPreviews = selectedImage.filter((_, idx) => idx !== index);
    setFile(newFiles);
    setSelectedImage(newPreviews);
    if (activeImage === selectedImage[index]) {
      setActiveImage(newPreviews[0] || null);
    }
  };

  const handleCreate = async () => {
    const token = localStorage.getItem("authToken");
    if (!token) {
      navigate("/");
      return;
    }

    if (!productName.trim() || !price || !description.trim()) {
      Swal.fire({
        icon: "warning",
        title: "Required Fields Missing",
        text: "Please fill in Product Name, Price, and Description.",
        confirmButtonColor: "#4F46E5",
      });
      return;
    }

    const formData = new FormData();
    formData.append("productName", productName);
    formData.append("price", price);
    formData.append("offerPrice", offerPrice || price);
    formData.append("theme", theme);
    formData.append("colour", color);
    formData.append("style", style);
    formData.append("material", material);
    formData.append("specialFeature", feature);
    formData.append("noOfItems", item || "1");
    formData.append("brand", brand);
    formData.append("description", description);
    formData.append("merchantId", user?.id);
    formData.append("Height", height);
    formData.append("Dimension", dimension);
    formData.append("Weight", weight);
    formData.append("ProductCode", productCode || `PRD-${Date.now().toString().slice(-4)}`);
    formData.append("ProductHighlights", productHighlights);
    formData.append("Benefits", benefits);
    formData.append("UsageAndCareInstructions", usageAndCare);

    if (file && file.length > 0) {
      file.forEach((f) => formData.append("image", f));
    }

    try {
      Swal.fire({
        title: "Publishing Product...",
        text: "Uploading assets and creating catalog item",
        allowOutsideClick: false,
        didOpen: () => Swal.showLoading(),
      });

      await createProduct(formData);

      Swal.fire({
        icon: "success",
        title: "Product Published!",
        text: "Your pooja item is now listed in your catalog.",
        confirmButtonColor: "#10B981",
        confirmButtonText: "View Products",
      }).then(() => {
        navigate("/products");
      });
    } catch (error) {
      console.error("Error creating product:", error);
      Swal.fire({
        icon: "error",
        title: "Upload Failed",
        text: error?.response?.data?.message || "There was an error creating the product.",
        confirmButtonColor: "#EF4444",
      });
    }
  };

  const handleCancel = () => {
    navigate("/products");
  };

  return (
    <div className="product-upload-section">
      <div className="uploadTopHeader">
        <div>
          <h2>Add New Product Listing</h2>
          <p>Provide detailed specifications and high-resolution images for your buyers</p>
        </div>
        <button className="backToListBtn" onClick={() => navigate("/products")}>
          <FaArrowLeft /> Back to Products
        </button>
      </div>

      <div className="product-upload-container">
        {/* Left Column: Form Details */}
        <div className="product-upload-form-section">
          <div className="formBlock">
            <h3 className="blockTitle">Basic Information</h3>
            <div className="formInputFull">
              <label>Product Name / Title *</label>
              <input
                type="text"
                placeholder="e.g. Brass Ganesha Idol with Arch (6 Inch)"
                value={productName}
                onChange={(e) => setProductName(e.target.value)}
              />
            </div>

            <div className="formInputFull">
              <label>Product Description *</label>
              <textarea
                className="product-upload-textarea"
                placeholder="Describe product craftsmanship, significance, rituals, and packaging..."
                rows={4}
                value={description}
                onChange={(e) => setDescription(e.target.value)}
              />
            </div>
          </div>

          <div className="formBlock">
            <h3 className="blockTitle">Pricing & Stock</h3>
            <div className="formInputGrid">
              <div>
                <label>Regular MRP (₹) *</label>
                <input
                  type="number"
                  placeholder="e.g. 1499"
                  value={price}
                  onChange={(e) => setPrice(e.target.value)}
                />
              </div>
              <div>
                <label>Offer / Selling Price (₹)</label>
                <input
                  type="number"
                  placeholder="e.g. 999"
                  value={offerPrice}
                  onChange={(e) => setOfferPrice(e.target.value)}
                />
              </div>
              <div>
                <label>Stock Quantity *</label>
                <input
                  type="number"
                  placeholder="e.g. 25"
                  value={item}
                  onChange={(e) => setItem(e.target.value)}
                />
              </div>
              <div>
                <label>Product SKU / Code</label>
                <input
                  type="text"
                  placeholder="e.g. GAN-001"
                  value={productCode}
                  onChange={(e) => setProductCode(e.target.value)}
                />
              </div>
            </div>
          </div>

          <div className="formBlock">
            <h3 className="blockTitle">Attributes & Specifications</h3>
            <div className="formInputGrid">
              <div>
                <label>Material</label>
                <input
                  type="text"
                  placeholder="e.g. Brass, Copper, Clay"
                  value={material}
                  onChange={(e) => setMaterial(e.target.value)}
                />
              </div>
              <div>
                <label>Color</label>
                <input
                  type="text"
                  placeholder="e.g. Antique Gold"
                  value={color}
                  onChange={(e) => setColor(e.target.value)}
                />
              </div>
              <div>
                <label>Dimensions</label>
                <input
                  type="text"
                  placeholder="e.g. 15cm x 10cm x 20cm"
                  value={dimension}
                  onChange={(e) => setDimension(e.target.value)}
                />
              </div>
              <div>
                <label>Weight</label>
                <input
                  type="text"
                  placeholder="e.g. 850 grams"
                  value={weight}
                  onChange={(e) => setWeight(e.target.value)}
                />
              </div>
            </div>
          </div>

          <div className="formBlock">
            <h3 className="blockTitle">Highlights & Usage</h3>
            <div className="formInputFull">
              <label>Product Key Highlights (one per line)</label>
              <textarea
                placeholder="• Handcrafted by skilled artisans&#10;• Pure brass construction&#10;• Perfect for home altar and gifts"
                rows={3}
                value={productHighlights}
                onChange={(e) => setProductHighlights(e.target.value)}
              />
            </div>
            <div className="formInputFull">
              <label>Care & Cleaning Instructions</label>
              <textarea
                placeholder="Clean with a dry cloth. Use Pitambari powder occasionally for restoring brass shine."
                rows={2}
                value={usageAndCare}
                onChange={(e) => setUsageAndCare(e.target.value)}
              />
            </div>
          </div>

          <div className="formActionButtons">
            <button className="product-upload-discard" onClick={handleCancel}>
              Cancel
            </button>
            <button className="product-upload-publish" onClick={handleCreate}>
              Publish Product
            </button>
          </div>
        </div>

        {/* Right Column: Multi-Image Uploader */}
        <div className="product-upload-form-section-image">
          <h3 className="blockTitle">Product Images</h3>
          <p className="imageUploadNote">Upload up to 5 clear photos of your product from different angles.</p>

          <div className="imageDropZone">
            <div className="mainPreviewContainer">
              {activeImage || selectedImage[0] ? (
                <img src={activeImage || selectedImage[0]} alt="Active Preview" className="mainPreviewImg" />
              ) : (
                <div className="dropPrompt">
                  <FaCloudUploadAlt size={48} className="uploadIcon" />
                  <p>Click or drag photos to upload</p>
                  <span>PNG, JPG or WEBP up to 5MB</span>
                </div>
              )}
              <input
                type="file"
                multiple
                accept="image/*"
                onChange={handleImageUpload}
                className="fileInputOverlay"
              />
            </div>

            {selectedImage.length > 0 && (
              <div className="thumbnailGallery">
                {selectedImage.map((img, index) => (
                  <div
                    key={index}
                    className={`thumbWrapper ${img === (activeImage || selectedImage[0]) ? "thumbActive" : ""}`}
                    onClick={() => setActiveImage(img)}
                  >
                    <img src={img} alt={`Preview ${index + 1}`} />
                    <button
                      className="removeImgBtn"
                      onClick={(e) => removeImage(index, e)}
                      title="Remove Photo"
                    >
                      <FaTimes size={10} />
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProductUpload;
