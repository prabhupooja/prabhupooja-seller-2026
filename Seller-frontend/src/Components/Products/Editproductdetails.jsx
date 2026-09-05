import React, { useEffect, useRef, useState } from "react";
import { IoCloudUploadOutline } from "react-icons/io5";
import "./editproductdetails.css";
import { useParams, useNavigate } from "react-router-dom";
import Swal from "sweetalert2";
import useProductStore from "../../Store/ProductStore/ProductStore";
import Loader from "../loader/loader";
import { FaArrowLeft } from "react-icons/fa";

const Editproductdetails = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [productName, setProductName] = useState("");
  const [offerPrice, setOfferPrice] = useState("");
  const [price, setPrice] = useState("");
  const [theam, setTheam] = useState("");
  const [brand, setBrand] = useState("");
  const [color, setColor] = useState("");
  const [style, setStyle] = useState("");
  const [material, setMaterial] = useState("");
  const [specialFeature, setSpecialFeature] = useState("");
  const [noOfItems, setNoOfItems] = useState("");
  const [image, setImage] = useState(null);
  const [mainImage, setMainImage] = useState("");
  const [description, setDescription] = useState("");
  const [height, setHeight] = useState("");
  const [dimension, setDimension] = useState("");
  const [weight, setWeight] = useState("");
  const [productCode, setProductCode] = useState("");
  const [productHighlights, setProductHighlights] = useState("");
  const [benefits, setBenefits] = useState("");
  const [usageAndCare, setUsageAndCare] = useState("");
  const [file, setFile] = useState(null);
  const [loading, setLoading] = useState(true);
  const { editProduct, getProductDetail } = useProductStore();
  const mainImageRef = useRef(null);
  const [selectedImageIndex, setSelectedImageIndex] = useState(null);

  const fetchProduct = async () => {
    try {
      setLoading(true);
      const response = await getProductDetail(id);
      const product = response?.data?.product || response?.data?.data || response?.data;
      if (product) {
        setProductName(product.productName || "");
        setDescription(product.description || "");
        setHeight(product.Height || "");
        setDimension(product.Dimension || "");
        setWeight(product.Weight || "");
        setProductCode(product.ProductCode || "");
        setProductHighlights(product.ProductHighlights || "");
        setBenefits(product.Benefits || "");
        setUsageAndCare(product.UsageAndCareInstructions || "");
        setOfferPrice(product.offerPrice || "");
        setPrice(product.price || "");
        setTheam(product.theme || "");
        setBrand(product.brand || "");
        setColor(product.colour || "");
        setStyle(product.style || "");
        setMaterial(product.material || "");
        setSpecialFeature(product.specialFeature || "");
        setNoOfItems(product.noOfItems || "");
        const imgs = Array.isArray(product.image) ? product.image : [product.image].filter(Boolean);
        setImage(imgs);
        setMainImage(imgs[0] || "/favicon.ico");
      }
    } catch (err) {
      console.error("Failed to fetch product:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (id) {
      fetchProduct();
    }
  }, [id]);

  const handleImageUpload = (event) => {
    const selectedFiles = event.target.files;
    if (selectedFiles && selectedFiles.length > 0) {
      const newFile = selectedFiles[0];
      const newPreviewUrl = URL.createObjectURL(newFile);

      if (selectedImageIndex !== null && image) {
        const updatedImages = [...image];
        updatedImages[selectedImageIndex] = newPreviewUrl;
        setImage(updatedImages);

        const updatedFiles = file ? [...file] : [];
        updatedFiles[selectedImageIndex] = newFile;
        setFile(updatedFiles);
      } else {
        const filesArray = Array.from(selectedFiles).slice(0, 5);
        const previewUrls = filesArray.map((f) => URL.createObjectURL(f));
        setFile(filesArray);
        setImage(previewUrls);
      }
    }
  };

  const handleThumbnailClick = (img, index) => {
    setMainImage(img);
    setSelectedImageIndex(index);
  };

  const handleUpdate = async () => {
    try {
      Swal.fire({
        title: "Updating Product...",
        allowOutsideClick: false,
        didOpen: () => Swal.showLoading(),
      });

      const response = await editProduct(id, {
        productName,
        image: file,
        description,
        Height: height,
        Dimension: dimension,
        Weight: weight,
        ProductCode: productCode,
        ProductHighlights: productHighlights,
        Benefits: benefits,
        UsageAndCareInstructions: usageAndCare,
        offerPrice,
        price,
        theme: theam,
        brand,
        colour: color,
        style,
        material,
        specialFeature,
        noOfItems,
      });

      if (response?.data?.success) {
        Swal.fire({
          icon: "success",
          title: "Saved!",
          text: "Product updated successfully!",
          confirmButtonColor: "#10B981",
        }).then(() => {
          navigate(`/productdetails/${id}`);
        });
      } else {
        Swal.fire({
          icon: "error",
          title: "Failed!",
          text: response?.data?.message || "Failed to update product. Please try again.",
        });
      }
    } catch (error) {
      console.error("Error updating product:", error);
      Swal.fire({
        icon: "error",
        title: "Error!",
        text: "An error occurred. Please try again.",
      });
    }
  };

  if (loading) return <Loader />;

  return (
    <div className="product_edit_section">
      <div className="detailsTopHeader" style={{ padding: "0 20px 20px" }}>
        <button className="backToListBtn" onClick={() => navigate(`/productdetails/${id}`)}>
          <FaArrowLeft /> Back to Product Details
        </button>
      </div>

      <div className="productcontainer">
        <div className="category_edit">
          <div className="product-info">
            <h5>Product Overview</h5>
            <img
              src={mainImage || "/favicon.ico"}
              alt="Main Product"
              ref={mainImageRef}
              className="product-image"
            />
            <div className="thumbnails">
              {image &&
                image.map((thumbnail, index) => (
                  <img
                    key={index}
                    src={thumbnail}
                    alt={`Thumbnail ${index + 1}`}
                    className={`thumbnail-img ${thumbnail === mainImage ? "thumbActive" : ""}`}
                    onClick={() => handleThumbnailClick(thumbnail, index)}
                  />
                ))}
            </div>
            <div>
              <div className="product_leftcontent">
                <p>Product: <span>{productName}</span></p>
                <p>Price: <span>₹{price}</span></p>
                <p>Offer Price: <span>₹{offerPrice}</span></p>
                <p>Brand: <span>{brand || "N/A"}</span></p>
                <p>Color: <span>{color || "N/A"}</span></p>
                <p>Material: <span>{material || "N/A"}</span></p>
                <p>Stock: <span>{noOfItems} units</span></p>
              </div>
            </div>
          </div>

          <div className="form-wrapper">
            <div className="image-upload">
              <label className="upload-box">
                <IoCloudUploadOutline className="upload_icon" />
                <p>Drop replacement photos here, or <span className="browse-text">click to browse</span></p>
                <p className="upload-info">PNG, JPG, and WEBP files allowed</p>
                <input type="file" onChange={handleImageUpload} hidden />
              </label>
            </div>

            <div className="general-info">
              <h3>General Information</h3>
              <div className="info-grid">
                <input
                  type="text"
                  placeholder="Product Name"
                  value={productName}
                  onChange={(e) => setProductName(e.target.value)}
                />
                <textarea
                  placeholder="Description"
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                />
                <input
                  type="number"
                  placeholder="Offer Price"
                  value={offerPrice}
                  onChange={(e) => setOfferPrice(e.target.value)}
                />
                <input
                  type="number"
                  placeholder="Price"
                  value={price}
                  onChange={(e) => setPrice(e.target.value)}
                />
                <input
                  type="text"
                  placeholder="Theme"
                  value={theam}
                  onChange={(e) => setTheam(e.target.value)}
                />
                <input
                  type="text"
                  placeholder="Brand"
                  value={brand}
                  onChange={(e) => setBrand(e.target.value)}
                />
                <input
                  type="text"
                  placeholder="Color"
                  value={color}
                  onChange={(e) => setColor(e.target.value)}
                />
                <input
                  type="text"
                  placeholder="Style"
                  value={style}
                  onChange={(e) => setStyle(e.target.value)}
                />
                <input
                  type="text"
                  placeholder="Material"
                  value={material}
                  onChange={(e) => setMaterial(e.target.value)}
                />
                <input
                  type="text"
                  placeholder="Special Feature"
                  value={specialFeature}
                  onChange={(e) => setSpecialFeature(e.target.value)}
                />
                <input
                  type="number"
                  placeholder="Number of Items"
                  value={noOfItems}
                  onChange={(e) => setNoOfItems(e.target.value)}
                />
                <input
                  type="text"
                  placeholder="Height"
                  value={height}
                  onChange={(e) => setHeight(e.target.value)}
                />
                <input
                  type="text"
                  placeholder="Dimension"
                  value={dimension}
                  onChange={(e) => setDimension(e.target.value)}
                />
                <input
                  type="text"
                  placeholder="Weight"
                  value={weight}
                  onChange={(e) => setWeight(e.target.value)}
                />
                <input
                  type="text"
                  placeholder="Product Code"
                  value={productCode}
                  onChange={(e) => setProductCode(e.target.value)}
                />
                <textarea
                  placeholder="Product Highlights"
                  value={productHighlights}
                  onChange={(e) => setProductHighlights(e.target.value)}
                />
                <textarea
                  placeholder="Benefits"
                  value={benefits}
                  onChange={(e) => setBenefits(e.target.value)}
                />
                <textarea
                  placeholder="Usage and Care"
                  value={usageAndCare}
                  onChange={(e) => setUsageAndCare(e.target.value)}
                />
              </div>
            </div>

            <div className="button-group">
              <button className="product-save-button" onClick={handleUpdate}>
                Save Changes
              </button>
              <button className="cancelbtn" onClick={() => navigate(`/productdetails/${id}`)}>
                Cancel
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Editproductdetails;
