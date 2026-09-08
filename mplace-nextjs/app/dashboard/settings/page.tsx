"use client";

import Footer from "@/components/Footer";
import Header from "@/components/Header";
import Preloader from "@/components/Preloader";
import ScrollToTop from "@/components/ScrollToTop";
import Breadcrumb from "@/components/common/Breadcrumb";
import ImageCropper from "@/components/common/ImageCropper";
import DashboardMenu from "@/components/dashboard/DashboardMenu";
import { getApiUrl, withBasePath } from "@/utils/paths";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { useEffect, useRef, useState } from "react";

interface UserSettings {
  name?: string | null;
  email?: string | null;
  username?: string | null;
  bio?: string | null;
  profileHeading?: string | null;
  website?: string | null;
  country?: string | null;
  password?: string;
  confirmPassword?: string;
  image?: string | null;
  coverImage?: string | null;
  facebookUrl?: string | null;
  twitterUrl?: string | null;
  behanceUrl?: string | null;
  dribbbleUrl?: string | null;
  billingFirstName?: string | null;
  billingLastName?: string | null;
  billingCompany?: string | null;
  billingEmail?: string | null;
  billingCountry?: string | null;
  billingAddress1?: string | null;
  billingAddress2?: string | null;
  billingCity?: string | null;
  billingZipCode?: string | null;
  emailRatingReminder?: boolean;
  emailUpdateNotifications?: boolean;
  emailCommentNotifications?: boolean;
  emailReviewNotifications?: boolean;
  emailItemReviewNotifications?: boolean;
  emailSupportNotifications?: boolean;
  emailWeeklySummary?: boolean;
  emailNewsletter?: boolean;
}

export default function DashboardSettingsPage() {
  const router = useRouter();
  const [personalInfoOpen, setPersonalInfoOpen] = useState(true);
  const [billingInfoOpen, setBillingInfoOpen] = useState(false);
  const [profileImageOpen, setProfileImageOpen] = useState(false);
  const [socialProfilesOpen, setSocialProfilesOpen] = useState(false);
  const [emailSettingsOpen, setEmailSettingsOpen] = useState(false);

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  // Image cropper states
  const [showProfileCropper, setShowProfileCropper] = useState(false);
  const [showCoverCropper, setShowCoverCropper] = useState(false);
  const [profileImagePreview, setProfileImagePreview] = useState<string | null>(
    null
  );
  const [coverImagePreview, setCoverImagePreview] = useState<string | null>(
    null
  );

  const profileImageInputRef = useRef<HTMLInputElement>(null);
  const coverImageInputRef = useRef<HTMLInputElement>(null);

  const [formData, setFormData] = useState<UserSettings>({
    name: "",
    email: "",
    username: "",
    bio: "",
    profileHeading: "",
    website: "",
    country: "",
    password: "",
    confirmPassword: "",
    facebookUrl: "",
    twitterUrl: "",
    behanceUrl: "",
    dribbbleUrl: "",
    billingFirstName: "",
    billingLastName: "",
    billingCompany: "",
    billingEmail: "",
    billingCountry: "",
    billingAddress1: "",
    billingAddress2: "",
    billingCity: "",
    billingZipCode: "",
    emailRatingReminder: true,
    emailUpdateNotifications: true,
    emailCommentNotifications: true,
    emailReviewNotifications: true,
    emailItemReviewNotifications: true,
    emailSupportNotifications: true,
    emailWeeklySummary: false,
    emailNewsletter: false,
  });

  // Fetch user settings on mount
  useEffect(() => {
    const fetchSettings = async () => {
      try {
        const response = await fetch(getApiUrl("/api/user/settings"));
        if (!response.ok) {
          if (response.status === 401) {
            router.push(withBasePath("/login"));
            return;
          }
          throw new Error("Failed to fetch settings");
        }
        const data = await response.json();
        setFormData({
          ...data,
          password: "",
          confirmPassword: "",
        });
      } catch (err: any) {
        setError("Failed to load settings");
      } finally {
        setLoading(false);
      }
    };

    fetchSettings();
  }, [router]);

  const handleImageSelect = (
    e: React.ChangeEvent<HTMLInputElement>,
    type: "profile" | "cover"
  ) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Validate file type
    if (!file.type.startsWith("image/")) {
      alert("Please select an image file");
      return;
    }

    // Validate file size (max 5MB)
    if (file.size > 5 * 1024 * 1024) {
      alert("File size must be less than 5MB");
      return;
    }

    // Create preview URL
    const reader = new FileReader();
    reader.onload = (event) => {
      const imageUrl = event.target?.result as string;
      if (type === "profile") {
        setProfileImagePreview(imageUrl);
        setShowProfileCropper(true);
      } else {
        setCoverImagePreview(imageUrl);
        setShowCoverCropper(true);
      }
    };
    reader.readAsDataURL(file);
  };

  const handleImageSave = async (
    imageUrl: string,
    type: "profile" | "cover"
  ) => {
    // Update form data with new image URL
    if (type === "profile") {
      setFormData((prev) => ({ ...prev, image: imageUrl }));
      setShowProfileCropper(false);
      setProfileImagePreview(null);
      if (profileImageInputRef.current) {
        profileImageInputRef.current.value = "";
      }
    } else {
      setFormData((prev) => ({ ...prev, coverImage: imageUrl }));
      setShowCoverCropper(false);
      setCoverImagePreview(null);
      if (coverImageInputRef.current) {
        coverImageInputRef.current.value = "";
      }
    }
  };

  const handleImageCancel = (type: "profile" | "cover") => {
    if (type === "profile") {
      setShowProfileCropper(false);
      setProfileImagePreview(null);
      if (profileImageInputRef.current) {
        profileImageInputRef.current.value = "";
      }
    } else {
      setShowCoverCropper(false);
      setCoverImagePreview(null);
      if (coverImageInputRef.current) {
        coverImageInputRef.current.value = "";
      }
    }
  };

  const handleInputChange = (
    e: React.ChangeEvent<
      HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement
    >
  ) => {
    const { name, value, type } = e.target;
    const checked = (e.target as HTMLInputElement).checked;

    if (type === "checkbox") {
      setFormData((prev) => ({
        ...prev,
        [name]: checked,
      }));
    } else {
      setFormData((prev) => ({
        ...prev,
        [name]: value,
      }));
    }
  };

  const handleFormSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setMessage("");
    setSaving(true);

    try {
      const response = await fetch(getApiUrl("/api/user/settings"), {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(formData),
      });

      const data = await response.json();

      if (!response.ok) {
        setError(data.error || "Failed to update settings");
        setSaving(false);
        return;
      }

      setMessage("Settings updated successfully!");
      setSaving(false);

      // Clear password fields after successful save
      setFormData((prev) => ({
        ...prev,
        password: "",
        confirmPassword: "",
      }));

      // Clear message after 3 seconds
      setTimeout(() => {
        setMessage("");
      }, 3000);
    } catch (err: any) {
      setError("Failed to update settings. Please try again.");
      setSaving(false);
    }
  };

  return (
    <div className="preload dashboard-page">
      <Preloader />
      <Header />
      <Breadcrumb
        pageTitle="Author's Settings"
        paths={[
          { name: "Dashboard", link: "/dashboard" },
          { name: "Settings", link: "/dashboard/settings" },
        ]}
      />

      <section className="dashboard-area">
        <DashboardMenu />

        <div className="dashboard_contents">
          <div className="container">
            <div className="row">
              <div className="col-md-12">
                <div className="dashboard_title_area">
                  <div className="dashboard__title">
                    <h3>Account Settings</h3>
                  </div>
                </div>
              </div>
            </div>

            {loading ? (
              <div className="text-center" style={{ padding: "40px" }}>
                <p>Loading settings...</p>
              </div>
            ) : (
              <form
                action="#"
                className="setting_form"
                onSubmit={handleFormSubmit}
              >
                {message && (
                  <div
                    className="alert alert-success"
                    style={{
                      marginBottom: "20px",
                      padding: "15px",
                      backgroundColor: "#d4edda",
                      color: "#155724",
                      borderRadius: "4px",
                    }}
                  >
                    {message}
                  </div>
                )}
                {error && (
                  <div
                    className="alert alert-danger"
                    style={{
                      marginBottom: "20px",
                      padding: "15px",
                      backgroundColor: "#f8d7da",
                      color: "#721c24",
                      borderRadius: "4px",
                    }}
                  >
                    {error}
                  </div>
                )}

                <div className="row">
                  <div className="col-lg-6">
                    <div className="information_module">
                      <a
                        className="toggle_title"
                        href="#collapse2"
                        role="button"
                        onClick={(e) => {
                          e.preventDefault();
                          setPersonalInfoOpen(!personalInfoOpen);
                        }}
                      >
                        <h4>
                          Personal Information
                          <span
                            className={`lnr lnr-chevron-down ${
                              personalInfoOpen ? "" : "rotate"
                            }`}
                          ></span>
                        </h4>
                      </a>

                      <div
                        className={`information__set toggle_module collapse ${
                          personalInfoOpen ? "show" : ""
                        }`}
                        id="collapse2"
                      >
                        <div className="information_wrapper form--fields">
                          <div className="form-group">
                            <label htmlFor="acname">
                              Account Name<sup>*</sup>
                            </label>
                            <input
                              type="text"
                              id="acname"
                              name="name"
                              className="text_field"
                              placeholder="Account Name"
                              value={formData.name || ""}
                              onChange={handleInputChange}
                            />
                          </div>

                          <div className="form-group">
                            <label htmlFor="usrname">
                              Username<sup>*</sup>
                            </label>
                            <input
                              type="text"
                              id="usrname"
                              name="username"
                              className="text_field"
                              placeholder="Username"
                              value={formData.username || ""}
                              onChange={handleInputChange}
                            />
                            <p>
                              Your MarketNest profile URL{" "}
                              <span>{formData.username || "username"}</span>
                            </p>
                          </div>

                          <div className="form-group">
                            <label htmlFor="emailad">
                              Email Address<sup>*</sup>
                            </label>
                            <input
                              type="email"
                              id="emailad"
                              name="email"
                              className="text_field"
                              placeholder="Email address"
                              value={formData.email || ""}
                              onChange={handleInputChange}
                              required
                            />
                          </div>

                          <div className="row">
                            <div className="col-md-6">
                              <div className="form-group">
                                <label htmlFor="password">New Password</label>
                                <input
                                  type="password"
                                  id="password"
                                  name="password"
                                  className="text_field"
                                  placeholder="New password"
                                  value={formData.password || ""}
                                  onChange={handleInputChange}
                                />
                              </div>
                            </div>

                            <div className="col-md-6">
                              <div className="form-group">
                                <label htmlFor="conpassword">
                                  Confirm Password
                                </label>
                                <input
                                  type="password"
                                  id="conpassword"
                                  name="confirmPassword"
                                  className="text_field"
                                  placeholder="Confirm password"
                                  value={formData.confirmPassword || ""}
                                  onChange={handleInputChange}
                                />
                              </div>
                            </div>
                          </div>

                          <div className="form-group">
                            <label htmlFor="website">Website</label>
                            <input
                              type="url"
                              id="website"
                              name="website"
                              className="text_field"
                              placeholder="Website"
                              value={formData.website || ""}
                              onChange={handleInputChange}
                            />
                          </div>

                          <div className="form-group">
                            <label htmlFor="country">
                              Country<sup>*</sup>
                            </label>
                            <div className="select-wrap select-wrap2">
                              <select
                                name="country"
                                id="country"
                                className="text_field"
                                value={formData.country || ""}
                                onChange={handleInputChange}
                              >
                                <option value="">Select one</option>
                                <option value="bangladesh">Bangladesh</option>
                                <option value="india">India</option>
                                <option value="uruguye">Uruguye</option>
                                <option value="australia">Australia</option>
                                <option value="neverland">Neverland</option>
                                <option value="atlantis">Atlantis</option>
                              </select>
                              <span className="lnr lnr-chevron-down"></span>
                            </div>
                          </div>

                          <div className="form-group">
                            <label htmlFor="prohead">Profile Heading</label>
                            <input
                              type="text"
                              id="prohead"
                              name="profileHeading"
                              className="text_field"
                              placeholder="Ex: Webdesign & Development Service"
                              value={formData.profileHeading || ""}
                              onChange={handleInputChange}
                            />
                          </div>

                          <div className="form-group">
                            <label htmlFor="authbio">Author Bio</label>
                            <textarea
                              name="bio"
                              id="authbio"
                              className="text_field"
                              placeholder="Short brief about yourself or your account..."
                              value={formData.bio || ""}
                              onChange={handleInputChange}
                              rows={5}
                            ></textarea>
                          </div>
                        </div>
                      </div>
                    </div>

                    <div className="information_module">
                      <a
                        className="toggle_title"
                        href="#collapse1"
                        role="button"
                        onClick={(e) => {
                          e.preventDefault();
                          setBillingInfoOpen(!billingInfoOpen);
                        }}
                      >
                        <h4>
                          Biling Information
                          <span
                            className={`lnr lnr-chevron-down ${
                              billingInfoOpen ? "" : "rotate"
                            }`}
                          ></span>
                        </h4>
                      </a>

                      <div
                        className={`information__set toggle_module collapse ${
                          billingInfoOpen ? "show" : ""
                        }`}
                        id="collapse1"
                      >
                        <div className="information_wrapper form--fields">
                          <div className="row">
                            <div className="col-md-6">
                              <div className="form-group">
                                <label htmlFor="first_name">
                                  First Name<sup>*</sup>
                                </label>
                                <input
                                  type="text"
                                  id="first_name"
                                  name="billingFirstName"
                                  className="text_field"
                                  placeholder="First Name"
                                  value={formData.billingFirstName || ""}
                                  onChange={handleInputChange}
                                />
                              </div>
                            </div>

                            <div className="col-md-6">
                              <div className="form-group">
                                <label htmlFor="last_name">
                                  Last Name<sup>*</sup>
                                </label>
                                <input
                                  type="text"
                                  id="last_name"
                                  name="billingLastName"
                                  className="text_field"
                                  placeholder="Last name"
                                  value={formData.billingLastName || ""}
                                  onChange={handleInputChange}
                                />
                              </div>
                            </div>
                          </div>

                          <div className="form-group">
                            <label htmlFor="company_name">
                              Company Name<sup>*</sup>
                            </label>
                            <input
                              type="text"
                              id="company_name"
                              name="billingCompany"
                              className="text_field"
                              placeholder="Company Name"
                              value={formData.billingCompany || ""}
                              onChange={handleInputChange}
                            />
                          </div>

                          <div className="form-group">
                            <label htmlFor="email1">
                              Email Address<sup>*</sup>
                            </label>
                            <input
                              type="email"
                              id="email1"
                              name="billingEmail"
                              className="text_field"
                              placeholder="Email address"
                              value={formData.billingEmail || ""}
                              onChange={handleInputChange}
                            />
                          </div>

                          <div className="form-group">
                            <label htmlFor="country1">
                              Country<sup>*</sup>
                            </label>
                            <div className="select-wrap select-wrap2">
                              <select
                                name="billingCountry"
                                id="country1"
                                className="text_field"
                                value={formData.billingCountry || ""}
                                onChange={handleInputChange}
                              >
                                <option value="">Select one</option>
                                <option value="bangladesh">Bangladesh</option>
                                <option value="india">India</option>
                                <option value="uruguye">Uruguye</option>
                                <option value="australia">Australia</option>
                                <option value="neverland">Neverland</option>
                                <option value="atlantis">Atlantis</option>
                              </select>
                              <span className="lnr lnr-chevron-down"></span>
                            </div>
                          </div>

                          <div className="form-group">
                            <label htmlFor="address1">Address Line 1</label>
                            <input
                              type="text"
                              id="address1"
                              name="billingAddress1"
                              className="text_field"
                              placeholder="Address line one"
                              value={formData.billingAddress1 || ""}
                              onChange={handleInputChange}
                            />
                          </div>

                          <div className="form-group">
                            <label htmlFor="address2">Address Line 2</label>
                            <input
                              type="text"
                              id="address2"
                              name="billingAddress2"
                              className="text_field"
                              placeholder="Address line two"
                              value={formData.billingAddress2 || ""}
                              onChange={handleInputChange}
                            />
                          </div>

                          <div className="row">
                            <div className="col-md-6">
                              <div className="form-group">
                                <label htmlFor="city">
                                  City / State<sup>*</sup>
                                </label>
                                <input
                                  type="text"
                                  id="city"
                                  name="billingCity"
                                  className="text_field"
                                  placeholder="City / State"
                                  value={formData.billingCity || ""}
                                  onChange={handleInputChange}
                                />
                              </div>
                            </div>
                            <div className="col-md-6">
                              <div className="form-group">
                                <label htmlFor="zipcode">
                                  Zip / Postal Code<sup>*</sup>
                                </label>
                                <input
                                  type="text"
                                  id="zipcode"
                                  name="billingZipCode"
                                  className="text_field"
                                  placeholder="zip/postal code"
                                  value={formData.billingZipCode || ""}
                                  onChange={handleInputChange}
                                />
                              </div>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="col-lg-6">
                    <div className="information_module">
                      <a
                        className="toggle_title"
                        href="#collapse3"
                        role="button"
                        onClick={(e) => {
                          e.preventDefault();
                          setProfileImageOpen(!profileImageOpen);
                        }}
                      >
                        <h4>
                          Profile Image & Cover
                          <span
                            className={`lnr lnr-chevron-down ${
                              profileImageOpen ? "" : "rotate"
                            }`}
                          ></span>
                        </h4>
                      </a>

                      <div
                        className={`information__set profile_images toggle_module collapse ${
                          profileImageOpen ? "show" : ""
                        }`}
                        id="collapse3"
                      >
                        <div className="information_wrapper">
                          <div className="profile_image_area">
                            <Image
                              src={
                                formData.image ||
                                withBasePath("/images/authplc.png")
                              }
                              alt="Author profile area"
                              width={100}
                              height={100}
                            />
                            <div className="img_info">
                              <p className="bold">Profile Image</p>
                              <p className="subtitle">
                                JPG, GIF or PNG 100x100 px
                              </p>
                            </div>

                            <label
                              htmlFor="profile_image"
                              className="upload_btn"
                            >
                              <input
                                ref={profileImageInputRef}
                                type="file"
                                id="profile_image"
                                accept="image/*"
                                onChange={(e) =>
                                  handleImageSelect(e, "profile")
                                }
                                style={{ display: "none" }}
                              />
                              <span
                                className="btn btn--sm btn--round"
                                aria-hidden="true"
                              >
                                Upload Image
                              </span>
                            </label>
                            {showProfileCropper && profileImagePreview && (
                              <ImageCropper
                                image={profileImagePreview}
                                onSave={(url) =>
                                  handleImageSave(url, "profile")
                                }
                                onCancel={() => handleImageCancel("profile")}
                                type="profile"
                                aspectRatio={1}
                              />
                            )}
                          </div>

                          <div className="prof_img_upload">
                            <p className="bold">Cover Image</p>
                            <Image
                              src={
                                formData.coverImage ||
                                withBasePath("/images/cvrplc.jpg")
                              }
                              alt="Cover image"
                              width={750}
                              height={370}
                            />

                            <div className="upload_title">
                              <p>JPG, GIF or PNG 750x370 px</p>
                              <label
                                htmlFor="cover_image"
                                className="upload_btn"
                              >
                                <input
                                  ref={coverImageInputRef}
                                  type="file"
                                  id="cover_image"
                                  accept="image/*"
                                  onChange={(e) =>
                                    handleImageSelect(e, "cover")
                                  }
                                  style={{ display: "none" }}
                                />
                                <span
                                  className="btn btn--sm btn--round"
                                  aria-hidden="true"
                                >
                                  Upload Image
                                </span>
                              </label>
                              {showCoverCropper && coverImagePreview && (
                                <ImageCropper
                                  image={coverImagePreview}
                                  onSave={(url) =>
                                    handleImageSave(url, "cover")
                                  }
                                  onCancel={() => handleImageCancel("cover")}
                                  type="cover"
                                  aspectRatio={750 / 370}
                                />
                              )}
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>

                    <div className="information_module">
                      <a
                        className="toggle_title"
                        href="#collapse5"
                        role="button"
                        onClick={(e) => {
                          e.preventDefault();
                          setSocialProfilesOpen(!socialProfilesOpen);
                        }}
                      >
                        <h4>
                          Social Profiles
                          <span
                            className={`lnr lnr-chevron-down ${
                              socialProfilesOpen ? "" : "rotate"
                            }`}
                          ></span>
                        </h4>
                      </a>

                      <div
                        className={`information__set social_profile toggle_module collapse ${
                          socialProfilesOpen ? "show" : ""
                        }`}
                        id="collapse5"
                      >
                        <div className="information_wrapper">
                          <div className="social__single">
                            <div className="social_icon">
                              <span className="fa fa-facebook"></span>
                            </div>

                            <div className="link_field">
                              <input
                                type="url"
                                name="facebookUrl"
                                className="text_field"
                                placeholder="ex: www.facebook.com/backtheme"
                                value={formData.facebookUrl || ""}
                                onChange={handleInputChange}
                              />
                            </div>
                          </div>

                          <div className="social__single">
                            <div className="social_icon">
                              <span className="fa fa-twitter"></span>
                            </div>

                            <div className="link_field">
                              <input
                                type="url"
                                name="twitterUrl"
                                className="text_field"
                                placeholder="ex: www.twitter.com/backtheme"
                                value={formData.twitterUrl || ""}
                                onChange={handleInputChange}
                              />
                            </div>
                          </div>

                          <div className="social__single">
                            <div className="social_icon">
                              <span className="fa fa-behance"></span>
                            </div>

                            <div className="link_field">
                              <input
                                type="url"
                                name="behanceUrl"
                                className="text_field"
                                placeholder="ex: www.behance.com/backtheme"
                                value={formData.behanceUrl || ""}
                                onChange={handleInputChange}
                              />
                            </div>
                          </div>

                          <div className="social__single">
                            <div className="social_icon">
                              <span className="fa fa-dribbble"></span>
                            </div>

                            <div className="link_field">
                              <input
                                type="url"
                                name="dribbbleUrl"
                                className="text_field"
                                placeholder="ex: www.dribbble.com/backtheme"
                                value={formData.dribbbleUrl || ""}
                                onChange={handleInputChange}
                              />
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>

                    <div className="information_module">
                      <a
                        className="toggle_title"
                        href="#collapse4"
                        role="button"
                        onClick={(e) => {
                          e.preventDefault();
                          setEmailSettingsOpen(!emailSettingsOpen);
                        }}
                      >
                        <h4>
                          Email Settings
                          <span
                            className={`lnr lnr-chevron-down ${
                              emailSettingsOpen ? "" : "rotate"
                            }`}
                          ></span>
                        </h4>
                      </a>

                      <div
                        className={`information__set mail_setting toggle_module collapse ${
                          emailSettingsOpen ? "show" : ""
                        }`}
                        id="collapse4"
                      >
                        <div className="information_wrapper">
                          <div className="custom_checkbox">
                            <input
                              type="checkbox"
                              id="opt1"
                              name="emailRatingReminder"
                              checked={formData.emailRatingReminder || false}
                              onChange={handleInputChange}
                            />
                            <label htmlFor="opt1">
                              <span className="shadow_checkbox"></span>
                              <span className="radio_title">
                                Rating Reminders
                              </span>
                              <span className="desc">
                                Send an email reminding me to rate an item after
                                purchase
                              </span>
                            </label>
                          </div>

                          <div className="custom_checkbox">
                            <input
                              type="checkbox"
                              id="opt2"
                              name="emailUpdateNotifications"
                              checked={
                                formData.emailUpdateNotifications || false
                              }
                              onChange={handleInputChange}
                            />
                            <label htmlFor="opt2">
                              <span className="shadow_checkbox"></span>
                              <span className="radio_title">
                                Item Update Notifications
                              </span>
                              <span className="desc">
                                Send an email when an item I've purchased is
                                updated
                              </span>
                            </label>
                          </div>

                          <div className="custom_checkbox">
                            <input
                              type="checkbox"
                              id="opt3"
                              name="emailCommentNotifications"
                              checked={
                                formData.emailCommentNotifications || false
                              }
                              onChange={handleInputChange}
                            />
                            <label htmlFor="opt3">
                              <span className="shadow_checkbox"></span>
                              <span className="radio_title">
                                Item Comment Notifications
                              </span>
                              <span className="desc">
                                Send me an email when someone comments on one of
                                my items
                              </span>
                            </label>
                          </div>

                          <div className="custom_checkbox">
                            <input
                              type="checkbox"
                              id="opt4"
                              name="emailItemReviewNotifications"
                              checked={
                                formData.emailItemReviewNotifications || false
                              }
                              onChange={handleInputChange}
                            />
                            <label htmlFor="opt4">
                              <span className="shadow_checkbox"></span>
                              <span className="radio_title">
                                Item Review Notifications
                              </span>
                              <span className="desc">
                                Send me an email when my items are approved or
                                rejected
                              </span>
                            </label>
                          </div>

                          <div className="custom_checkbox">
                            <input
                              type="checkbox"
                              id="opt5"
                              name="emailReviewNotifications"
                              checked={
                                formData.emailReviewNotifications || false
                              }
                              onChange={handleInputChange}
                            />
                            <label htmlFor="opt5">
                              <span className="shadow_checkbox"></span>
                              <span className="radio_title">
                                Buyer Review Notifications
                              </span>
                              <span className="desc">
                                Send me an email when someone leaves a review
                                with their rating
                              </span>
                            </label>
                          </div>

                          <div className="custom_checkbox">
                            <input
                              type="checkbox"
                              id="opt6"
                              name="emailSupportNotifications"
                              checked={
                                formData.emailSupportNotifications || false
                              }
                              onChange={handleInputChange}
                            />
                            <label htmlFor="opt6">
                              <span className="shadow_checkbox"></span>
                              <span className="radio_title">
                                Support Notifications
                              </span>
                              <span className="desc">
                                Send me emails showing my soon to expire support
                                entitlements
                              </span>
                            </label>
                          </div>

                          <div className="custom_checkbox">
                            <input
                              type="checkbox"
                              id="opt7"
                              name="emailWeeklySummary"
                              checked={formData.emailWeeklySummary || false}
                              onChange={handleInputChange}
                            />
                            <label htmlFor="opt7">
                              <span className="shadow_checkbox"></span>
                              <span className="radio_title">
                                Weekly Summary Emails
                              </span>
                              <span className="desc">
                                Send me emails showing my soon to expire support
                                entitlements
                              </span>
                            </label>
                          </div>

                          <div className="custom_checkbox">
                            <input
                              type="checkbox"
                              id="opt8"
                              name="emailNewsletter"
                              checked={formData.emailNewsletter || false}
                              onChange={handleInputChange}
                            />
                            <label htmlFor="opt8">
                              <span className="shadow_checkbox"></span>
                              <span className="radio_title">
                                MarketNest Newsletter
                              </span>
                              <span className="desc">
                                Get update about latest news, update and more.
                              </span>
                            </label>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="col-md-12">
                    <div className="dashboard_setting_btn">
                      <button
                        type="submit"
                        className="btn btn--round btn--md"
                        disabled={saving}
                      >
                        {saving ? "Saving..." : "Save Change"}
                      </button>
                    </div>
                  </div>
                </div>
              </form>
            )}
          </div>
        </div>
      </section>

      <Footer />
      <ScrollToTop />
    </div>
  );
}
