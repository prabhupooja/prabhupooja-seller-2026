import { useState, useEffect } from "react";
import "./createcoupon.css";
import { FaGift, FaCopy, FaEdit, FaCheck } from "react-icons/fa";
import { RiDeleteBin5Line } from "react-icons/ri";
import useProductStore from "../../Store/ProductStore/ProductStore";
import useAuthStore from "../../Store/AuthStore/AuthStore";
import Swal from "sweetalert2";
import Loader from "../loader/loader";

const CreateCoupon = () => {
  const {
    createProductCoupon,
    getProductCouponByMerchatId,
    updateProductCoupon,
    deleteProductCoupon,
  } = useProductStore();
  const { user } = useAuthStore();
  const [coupons, setCoupons] = useState([]);
  const [showModal, setShowModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [copiedCode, setCopiedCode] = useState(null);
  const [loading, setLoading] = useState(true);
  const [editingCouponId, setEditingCouponId] = useState(null);

  const [formData, setFormData] = useState({
    code: "",
    discount_type: "flat",
    discount_value: "",
    expiry_date: "",
  });

  const [editFormData, setEditFormData] = useState({
    code: "",
    discount_type: "flat",
    discount_value: "",
    expiry_date: "",
  });

  const fetchCoupons = async () => {
    try {
      setLoading(true);
      const response = await getProductCouponByMerchatId(user?.id);
      if (response?.data?.success) {
        setCoupons(response.data.coupons || []);
      }
    } catch (error) {
      console.error("Failed to fetch coupons", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (user?.id) {
      fetchCoupons();
    }
  }, [user?.id]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSubmit = async () => {
    try {
      const { code, discount_type, discount_value, expiry_date } = formData;
      if (!code || !discount_type || !discount_value || !expiry_date) {
        Swal.fire({
          icon: "warning",
          text: "Please fill in all required coupon fields.",
        });
        return;
      }

      const response = await createProductCoupon({
        code: code.trim().toUpperCase(),
        discount_type,
        discount_value,
        expiry_date,
        sellerId: user.id,
      });

      if (response?.data?.success) {
        Swal.fire({
          icon: "success",
          title: "Coupon Created!",
          text: `Coupon code ${code.toUpperCase()} is now live.`,
          confirmButtonColor: "#4F46E5",
        });
        setFormData({
          code: "",
          discount_type: "flat",
          discount_value: "",
          expiry_date: "",
        });
        setShowModal(false);
        fetchCoupons();
      } else {
        Swal.fire({
          icon: "error",
          text: response?.data?.message || "Failed to create coupon.",
        });
      }
    } catch (error) {
      Swal.fire({
        icon: "error",
        title: "Error",
        text: error?.response?.data?.message || "Something went wrong.",
      });
    }
  };

  const handleEditClick = (coupon) => {
    setEditFormData({
      code: coupon.code,
      discount_type: coupon.discount_type,
      discount_value: coupon.discount_value,
      expiry_date: coupon.expiry_date?.split("T")[0],
    });
    setEditingCouponId(coupon.id);
    setShowEditModal(true);
  };

  const handleDeleteCoupan = async (id) => {
    const result = await Swal.fire({
      title: "Delete Coupon?",
      text: "This promo code will immediately become invalid for buyers.",
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#EF4444",
      cancelButtonColor: "#64748B",
      confirmButtonText: "Yes, Delete",
    });

    if (result.isConfirmed) {
      try {
        await deleteProductCoupon(id);
        Swal.fire("Deleted!", "Coupon has been removed.", "success");
        fetchCoupons();
      } catch (error) {
        Swal.fire("Error!", "Failed to delete coupon.", "error");
      }
    }
  };

  const handleEditSubmit = async () => {
    const { code, discount_type, discount_value, expiry_date } = editFormData;

    if (!code || !discount_type || !discount_value || !expiry_date) {
      Swal.fire({
        icon: "warning",
        text: "Please fill in all required fields.",
      });
      return;
    }

    try {
      const response = await updateProductCoupon(editingCouponId, {
        code: code.trim().toUpperCase(),
        discount_type,
        discount_value,
        expiry_date,
      });

      if (response?.data?.success) {
        Swal.fire({
          icon: "success",
          text: "Coupon updated successfully.",
          confirmButtonColor: "#4F46E5",
        });
        setShowEditModal(false);
        setEditingCouponId(null);
        fetchCoupons();
      }
    } catch (error) {
      Swal.fire({
        icon: "error",
        title: "Error",
        text: error?.response?.data?.message || "Failed to update coupon.",
      });
    }
  };

  const handleCopyCode = (code) => {
    navigator.clipboard.writeText(code);
    setCopiedCode(code);
    setTimeout(() => setCopiedCode(null), 2000);
  };

  if (loading && coupons.length === 0) return <Loader />;

  return (
    <div className="coupon-main-wrapper">
      <div className="couponHeaderRow">
        <div>
          <h2>Merchant Promotional Coupons</h2>
          <p>Create discount codes and vouchers to boost festival sales</p>
        </div>
        <button className="open-modal-btn" onClick={() => setShowModal(true)}>
          + Create New Coupon
        </button>
      </div>

      {coupons.length === 0 ? (
        <div className="emptyCouponsState">
          <FaGift size={48} className="emptyGiftIcon" />
          <h3>No Active Coupons</h3>
          <p>Create your first discount coupon to attract more buyers</p>
          <button className="createFirstBtn" onClick={() => setShowModal(true)}>
            Create Coupon
          </button>
        </div>
      ) : (
        <div className="coupon-list">
          {coupons.map((coupon) => (
            <div className="coupon-card" key={coupon.id}>
              <div className="card-top">
                <span className="gift-label">DISCOUNT VOUCHER</span>
                <FaGift className="gift-icon" />
              </div>

              <div className="card-middle">
                <h4>
                  {coupon.discount_type === "percent"
                    ? `${coupon.discount_value}% OFF`
                    : coupon.discount_type === "flat"
                    ? `₹${coupon.discount_value} OFF`
                    : `Up to ₹${coupon.discount_value} OFF`}
                </h4>

                <div
                  className="couponCodeBox"
                  onClick={() => handleCopyCode(coupon.code)}
                  title="Click to copy promo code"
                >
                  <span className="codeText">{coupon.code}</span>
                  <button className="copyBtn" type="button">
                    {copiedCode === coupon.code ? <FaCheck size={12} /> : <FaCopy size={12} />}
                  </button>
                </div>
              </div>

              <div className="card-bottom">
                {coupon.expiry_date && (
                  <span className="expiry">
                    Exp:{" "}
                    {new Date(coupon.expiry_date).toLocaleDateString("en-GB", {
                      day: "2-digit",
                      month: "short",
                      year: "numeric",
                    })}
                  </span>
                )}

                <div className="cardActionsGroup">
                  <button
                    className="cardActionBtn editBtn"
                    onClick={() => handleEditClick(coupon)}
                    title="Edit Coupon"
                  >
                    <FaEdit size={14} />
                  </button>
                  <button
                    className="cardActionBtn delBtn"
                    onClick={() => handleDeleteCoupan(coupon.id)}
                    title="Delete Coupon"
                  >
                    <RiDeleteBin5Line size={14} />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Create Modal */}
      {showModal && (
        <div className="modal-overlay" onClick={() => setShowModal(false)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <button className="close-btn" onClick={() => setShowModal(false)}>
              ×
            </button>
            <h3>Create New Coupon</h3>
            <p className="modalSub">Generate special discounts for your buyers</p>

            <div className="formGroup">
              <label>Coupon Code</label>
              <input
                type="text"
                name="code"
                placeholder="e.g. DIWALI50, POOJA20"
                className="input-field"
                value={formData.code}
                onChange={handleChange}
              />
            </div>

            <div className="formGroup">
              <label>Discount Type</label>
              <div className="radio-group">
                <label className={formData.discount_type === "flat" ? "radioActive" : ""}>
                  <input
                    type="radio"
                    name="discount_type"
                    value="flat"
                    checked={formData.discount_type === "flat"}
                    onChange={handleChange}
                  />
                  Flat (₹)
                </label>
                <label className={formData.discount_type === "percent" ? "radioActive" : ""}>
                  <input
                    type="radio"
                    name="discount_type"
                    value="percent"
                    checked={formData.discount_type === "percent"}
                    onChange={handleChange}
                  />
                  Percent (%)
                </label>
                <label className={formData.discount_type === "upto" ? "radioActive" : ""}>
                  <input
                    type="radio"
                    name="discount_type"
                    value="upto"
                    checked={formData.discount_type === "upto"}
                    onChange={handleChange}
                  />
                  Up to (₹)
                </label>
              </div>
            </div>

            <div className="formGroup">
              <label>Discount Value</label>
              <input
                type="number"
                name="discount_value"
                placeholder="e.g. 100 or 15"
                className="input-field"
                value={formData.discount_value}
                onChange={handleChange}
              />
            </div>

            <div className="formGroup">
              <label>Expiry Date</label>
              <input
                type="date"
                name="expiry_date"
                className="input-field"
                value={formData.expiry_date}
                onChange={handleChange}
              />
            </div>

            <button className="create-btn" onClick={handleSubmit}>
              Create Live Coupon
            </button>
          </div>
        </div>
      )}

      {/* Edit Modal */}
      {showEditModal && (
        <div className="modal-overlay" onClick={() => setShowEditModal(false)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <button className="close-btn" onClick={() => setShowEditModal(false)}>
              ×
            </button>
            <h3>Edit Coupon</h3>

            <div className="formGroup">
              <label>Coupon Code</label>
              <input
                type="text"
                name="code"
                className="input-field"
                value={editFormData.code}
                onChange={(e) =>
                  setEditFormData({ ...editFormData, code: e.target.value })
                }
              />
            </div>

            <div className="formGroup">
              <label>Discount Type</label>
              <div className="radio-group">
                {["flat", "percent", "upto"].map((type) => (
                  <label
                    key={type}
                    className={editFormData.discount_type === type ? "radioActive" : ""}
                  >
                    <input
                      type="radio"
                      name="discount_type"
                      value={type}
                      checked={editFormData.discount_type === type}
                      onChange={(e) =>
                        setEditFormData({
                          ...editFormData,
                          discount_type: e.target.value,
                        })
                      }
                    />
                    {type.charAt(0).toUpperCase() + type.slice(1)}
                  </label>
                ))}
              </div>
            </div>

            <div className="formGroup">
              <label>Discount Value</label>
              <input
                type="number"
                name="discount_value"
                className="input-field"
                value={editFormData.discount_value}
                onChange={(e) =>
                  setEditFormData({
                    ...editFormData,
                    discount_value: e.target.value,
                  })
                }
              />
            </div>

            <div className="formGroup">
              <label>Expiry Date</label>
              <input
                type="date"
                name="expiry_date"
                className="input-field"
                value={editFormData.expiry_date}
                onChange={(e) =>
                  setEditFormData({
                    ...editFormData,
                    expiry_date: e.target.value,
                  })
                }
              />
            </div>

            <button className="create-btn" onClick={handleEditSubmit}>
              Update Coupon
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default CreateCoupon;
