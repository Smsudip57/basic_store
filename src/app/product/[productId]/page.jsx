"use client";
import ProductZoom from "@/Components/ProductZoom";
import Rating from "@mui/material/Rating";
import QuantityBox from "@/Components/QuantityBox";
import Button from "@mui/material/Button";
import { BsCartFill } from "react-icons/bs";
import { useContext, useEffect, useState, useRef } from "react";
import { FaRegHeart } from "react-icons/fa";
import { MdOutlineCompareArrows } from "react-icons/md";
import Tooltip from "@mui/material/Tooltip";
import RelatedProducts from "./RelatedProducts";
import { ChevronDown, Check, X } from "lucide-react";

import CircularProgress from "@mui/material/CircularProgress";
import { MyContext } from "@/context/ThemeContext";
import { FaHeart } from "react-icons/fa";
import { fetchDataFromApi, postData } from "@/utils/api";
import { useRouter } from "next/navigation";

const ProductDetails = ({ params }) => {
  const router = useRouter();
  const [activeSize, setActiveSize] = useState(null);
  const [activeTabs, setActiveTabs] = useState(0);
  const [productData, setProductData] = useState([]);
  const [relatedProductData, setRelatedProductData] = useState([]);
  const [recentlyViewdProducts, setRecentlyViewdProducts] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [reviewsData, setreviewsData] = useState([]);
  const [isAddedToMyList, setSsAddedToMyList] = useState(false);

  let [cartFields, setCartFields] = useState({});
  let [productQuantity, setProductQuantity] = useState();
  const [tabError, setTabError] = useState(false);
  const [expandedFaqIndex, setExpandedFaqIndex] = useState(null);
  const [showFloatingTabs, setShowFloatingTabs] = useState(false);
  const tabsRef = useRef(null);

  // Handle scroll event for floating tabs
  useEffect(() => {
    const handleScroll = () => {
      if (tabsRef.current) {
        const tabsTop = tabsRef.current.getBoundingClientRect().top;
        setShowFloatingTabs(tabsTop < 0);
      }
    };

    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const id = params.productId;

  const context = useContext(MyContext);

  // Helper function to truncate HTML by finding smallest font-size text blocks
  const truncateDescription = (html, charLimit = 200) => {
    if (!html) return "";

    const tempDiv = document.createElement("div");
    tempDiv.innerHTML = html;

    // Remove ALL <strong> elements and their contents
    const strongElements = tempDiv.querySelectorAll("strong");
    strongElements.forEach((el) => el.remove());

    // Split by <br> tags but keep as HTML
    let portions = [];
    if (html.includes("<br")) {
      portions = html
        .split(/<br\s*\/?>/i)
        .filter((part) => part.trim().length > 0);
    }

    // Select which portion to work with
    let workText = "";
    let selectedPortionDiv = null;

    if (portions.length > 0) {
      // Loop through each portion to find one with smallest font-size element containing >= 30 chars
      for (let i = 0; i < portions.length; i++) {
        const portionDiv = document.createElement("div");
        portionDiv.innerHTML = portions[i];

        // Find all elements in this portion and get the one with smallest font-size
        const elements = [];
        const walker = document.createTreeWalker(
          portionDiv,
          NodeFilter.SHOW_ELEMENT,
          null,
          false,
        );

        let node;
        while ((node = walker.nextNode())) {
          if (node.tagName === "SCRIPT" || node.tagName === "STYLE") continue;

          const text = (node.textContent || "").trim();
          if (text.length > 0) {
            const style = window.getComputedStyle(node);
            const fontSize = parseFloat(style.fontSize) || 16;

            elements.push({
              element: node,
              fontSize: fontSize,
              text: text,
            });
          }
        }

        // Find element with smallest font-size in this portion
        if (elements.length > 0) {
          const smallestElement = elements.reduce((prev, curr) =>
            curr.fontSize < prev.fontSize ? curr : prev,
          );

          // Check if this element has >= 30 chars
          if (smallestElement.text.length >= 30) {
            selectedPortionDiv = portionDiv;
            workText = smallestElement.text;
            break; // Found a good portion, exit loop
          } else if (!selectedPortionDiv) {
            // Store first portion as fallback
            selectedPortionDiv = portionDiv;
            workText = smallestElement.text;
          }
        }
      }
    }

    // If no portions found, use entire HTML
    if (!selectedPortionDiv) {
      workText = tempDiv.textContent.trim();
    }

    // Find first 3-4 parent elements that contain text
    const textElements = [];
    const walker = document.createTreeWalker(
      tempDiv,
      NodeFilter.SHOW_ELEMENT,
      null,
      false,
    );

    let node;
    while ((node = walker.nextNode() && textElements.length < 4)) {
      if (node.tagName === "SCRIPT" || node.tagName === "STYLE") continue;

      const text = (node.textContent || "").trim();
      if (text.length > 0) {
        const style = window.getComputedStyle(node);
        const fontSize = parseFloat(style.fontSize) || 16;

        textElements.push({
          element: node,
          fontSize: fontSize,
          text: text,
        });
      }
    }

    // Find element with smallest font-size
    if (textElements.length > 0) {
      const smallestElement = textElements.reduce((prev, curr) =>
        curr.fontSize < prev.fontSize ? curr : prev,
      );

      // Get 2 lines from this element (or 1 if only 1 line)
      let text = smallestElement.text;
      const lines = text.split("\n").filter((l) => l.trim());
      const linesToTake = Math.min(Math.max(lines.length, 1), 2);
      workText = lines.slice(0, linesToTake).join(" ");
    }

    // Clean up whitespace
    workText = workText.replace(/\s+/g, " ").trim();

    // Remove consecutive duplicate words
    const words = workText.split(" ");
    let filteredWords = [];
    for (let i = 0; i < words.length; i++) {
      if (i === 0 || words[i].toLowerCase() !== words[i - 1].toLowerCase()) {
        filteredWords.push(words[i]);
      }
    }
    workText = filteredWords.join(" ");

    // Check if truncation is needed
    const isTruncated = workText.length > charLimit;

    // Truncate to character limit
    let truncatedText = workText.substring(0, charLimit);

    // If truncated, cut at the last complete word
    if (isTruncated) {
      const lastSpaceIndex = truncatedText.lastIndexOf(" ");
      if (lastSpaceIndex > charLimit - 50) {
        truncatedText = truncatedText.substring(0, lastSpaceIndex);
      }
    }

    return { truncatedText, isTruncated };
  };

  // Filter specifications, RAM, size, and weight to remove null/empty values
  const filteredSpecifications =
    productData?.specifications?.filter(
      (spec) =>
        spec?.key && spec?.key.trim() && spec?.value && spec?.value.trim(),
    ) || [];

  const filteredProductRam =
    productData?.productRam?.filter((ram) => ram && ram.trim()) || [];

  const filteredSize =
    productData?.size?.filter((size) => size && size.trim()) || [];

  const filteredProductWeight =
    productData?.productWeight?.filter((weight) => weight && weight.trim()) ||
    [];

  // Filter FAQ data to remove items with empty questions/answers
  const filteredFaq =
    productData?.faq?.filter(
      (item) =>
        item?.question &&
        item?.question.trim() &&
        item?.answer &&
        item?.answer.trim(),
    ) || [];

  // Filter features data - keep categories with at least one feature
  const filteredFeatures =
    productData?.features?.map((feature) => ({
      featureCategory: feature?.featureCategory,
      featuresList:
        feature?.featuresList?.filter((item) => item?.featuresName?.trim()) ||
        [],
    })) || [];

  // Remove categories with no features
  const filteredFeaturesWithItems = filteredFeatures.filter(
    (feature) => feature?.featuresList?.length > 0,
  );

  // Check if any specifications data exists
  const hasSpecificationData =
    filteredSpecifications.length > 0 ||
    filteredProductRam.length > 0 ||
    filteredSize.length > 0 ||
    filteredProductWeight.length > 0;
  // Check if reviews data exists
  const hasReviewsData = reviewsData?.length > 0;
  // Check if FAQ data exists
  const hasFaqData = filteredFaq.length > 0;
  // Check if features data exists
  const hasFeatureData = filteredFeaturesWithItems.length > 0;
  const isActive = (index) => {
    setActiveSize(index);
    setTabError(false);
  };

  useEffect(() => {
    window.scrollTo(0, 0);
    setActiveSize(null);
    fetchDataFromApi(`/api/products/${id}`).then((res) => {
      setProductData(res);

      if (
        res?.productRam.length === 0 &&
        res?.productWeight.length === 0 &&
        res?.size.length === 0
      ) {
        setActiveSize(1);
      }

      fetchDataFromApi(`/api/products?subCatId=${res?.subCatId}`).then(
        (res) => {
          const filteredData = res?.products?.filter((item) => item.id !== id);
          setRelatedProductData(filteredData);
        },
      );
    });

    fetchDataFromApi(`/api/productReviews?productId=${id}`).then((res) => {
      setreviewsData(res);
    });

    const user = JSON.parse(localStorage.getItem("user"));

    fetchDataFromApi(
      `/api/my-list?productId=${id}&userId=${user?.userId}`,
    ).then((res) => {
      if (res.length !== 0) {
        setSsAddedToMyList(true);
      }
    });
  }, [id]);

  const [rating, setRating] = useState(1);
  const [reviews, setReviews] = useState({
    productId: "",
    customerName: "",
    customerId: "",
    review: "",
    customerRating: 0,
  });

  const onChangeInput = (e) => {
    setReviews(() => ({
      ...reviews,
      [e.target.name]: e.target.value,
    }));
  };

  const changeRating = (e) => {
    setRating(e.target.value);
    reviews.customerRating = e.target.value;
  };

  const addReview = (e) => {
    e.preventDefault();

    const user = JSON.parse(localStorage.getItem("user"));

    reviews.customerName = user?.name;
    reviews.customerId = user?.userId;
    reviews.productId = id;

    setIsLoading(true);

    postData("/api/productReviews/add", reviews).then((res) => {
      setIsLoading(false);

      reviews.customerRating = 1;

      setReviews({
        review: "",
        customerRating: 1,
      });

      fetchDataFromApi(`/api/productReviews?productId=${id}`).then((res) => {
        setreviewsData(res);
      });
    });
  };

  const quantity = (val) => {
    setProductQuantity(val);
  };

  const addtoCart = () => {
    if (activeSize !== null) {
      const user = JSON.parse(localStorage.getItem("user"));

      cartFields.productTitle = productData?.name;
      cartFields.image = productData?.images[0];
      cartFields.rating = productData?.rating;
      cartFields.price = productData?.price;
      cartFields.quantity = productQuantity;
      cartFields.subTotal = parseInt(productData?.price * productQuantity);
      cartFields.productId = productData?.id;
      cartFields.countInStock = productData?.countInStock;
      cartFields.userId = user?.userId;

      context.addToCart(cartFields);
    } else {
      setTabError(true);
    }
  };

  const selectedItem = () => {};

  const gotoReviews = () => {
    window.scrollTo({
      top: 550,
      behavior: "smooth",
    });

    setActiveTabs(2);
  };

  const addToMyList = (id) => {
    const user = JSON.parse(localStorage.getItem("user"));
    if (user !== undefined && user !== null && user !== "") {
      const data = {
        productTitle: productData?.name,
        image: productData?.images[0],
        rating: productData?.rating,
        price: productData?.price,
        productId: id,
        userId: user?.userId,
      };
      postData(`/api/my-list/add/`, data).then((res) => {
        if (res.status !== false) {
          context.setAlertBox({
            open: true,
            error: false,
            msg: "the product added in my list",
          });

          fetchDataFromApi(
            `/api/my-list?productId=${id}&userId=${user?.userId}`,
          ).then((res) => {
            if (res.length !== 0) {
              setSsAddedToMyList(true);
            }
          });
        } else {
          context.setAlertBox({
            open: true,
            error: true,
            msg: res.msg,
          });
        }
      });
    } else {
      context.setAlertBox({
        open: true,
        error: true,
        msg: "Please Login to continue",
      });
    }
  };

  return (
    <>
      {/* Floating Tabs Header */}
      {showFloatingTabs && (
        <division
          style={{
            position: "fixed",
            top: 0,
            left: 0,
            right: 0,
            backgroundColor: "#fff",
            boxShadow: "0 2px 8px rgba(0,0,0,0.1)",
            zIndex: 99999,
            animation: "slideDown 0.4s ease-out forwards",
          }}
          className="headerWrapperFixed kill_bootstrap"
        >
          <style>{`
            @keyframes slideDown {
              from {
                transform: translateY(-100%);
                opacity: 0;
              }
              to {
                transform: translateY(0);
                opacity: 1;
              }
            }
          `}</style>
          <div className="container">
            <div className="customTabs">
              <ul
                className="list list-inline"
                style={{ margin: 0, padding: "12px 0" }}
              >
                <li className="list-inline-item">
                  <Button
                    className={`${activeTabs === 0 && "active"}`}
                    onClick={() => {
                      setActiveTabs(0);
                      router.push("#description");
                    }}
                    style={{ fontSize: "14px", padding: "8px 16px" }}
                  >
                    Description
                  </Button>
                </li>
                {hasSpecificationData && (
                  <li className="list-inline-item">
                    <Button
                      className={`${activeTabs === 1 && "active"}`}
                      onClick={() => {
                        setActiveTabs(1);
                        router.push("#additionalinfo");
                      }}
                      style={{ fontSize: "14px", padding: "8px 16px" }}
                    >
                      Specification
                    </Button>
                  </li>
                )}
                {hasFeatureData && (
                  <li className="list-inline-item">
                    <Button
                      className={`${activeTabs === 2 && "active"}`}
                      onClick={() => {
                        setActiveTabs(2);
                        router.push("#features");
                      }}
                      style={{ fontSize: "14px", padding: "8px 16px" }}
                    >
                      Features
                    </Button>
                  </li>
                )}
                {hasFaqData && (
                  <li className="list-inline-item">
                    <Button
                      className={`${activeTabs === (hasFeatureData ? 3 : 2) && "active"}`}
                      onClick={() => {
                        setActiveTabs(hasFeatureData ? 3 : 2);
                        router.push("#faq");
                      }}
                      style={{ fontSize: "14px", padding: "8px 16px" }}
                    >
                      FAQ
                    </Button>
                  </li>
                )}
                {hasReviewsData && (
                  <li className="list-inline-item">
                    <Button
                      className={`${activeTabs === (hasFeatureData ? 4 : 3) && "active"}`}
                      onClick={() => {
                        setActiveTabs(hasFeatureData ? 4 : 3);
                        router.push("#reviews");
                      }}
                      style={{ fontSize: "14px", padding: "8px 16px" }}
                    >
                      Reviews ({reviewsData?.length})
                    </Button>
                  </li>
                )}
              </ul>
            </div>
          </div>
        </division>
      )}

      {productData?.length === 0 ? (
        <div
          className="d-flex align-items-center justify-content-center"
          style={{ minHeight: "300px" }}
        >
          <CircularProgress />
        </div>
      ) : (
        <section className="productDetails section">
          <div className="container">
            <div className="row">
              <div className="col-md-4 pl-5 part1">
                <ProductZoom
                  images={productData?.images}
                  videos={productData?.videos}
                  thumbnail={productData?.thumbnail}
                  discount={productData?.discount}
                />
              </div>

              <div className="col-md-7 pl-5 pr-5 part2">
                <h2 className="hd text-capitalize">{productData?.name}</h2>
                <ul className="list list-inline d-flex align-items-center">
                  <li className="list-inline-item">
                    <div className="d-flex align-items-center">
                      <span className="text-light mr-2">Brands : </span>
                      <span>{productData?.brand}</span>
                    </div>
                  </li>

                  <li className="list-inline-item">
                    <div className="d-flex align-items-center">
                      <Rating
                        name="read-only"
                        value={parseInt(productData?.rating)}
                        precision={0.5}
                        readOnly
                        size="small"
                      />

                      <span
                        className="text-light cursor ml-2"
                        onClick={gotoReviews}
                      >
                        {reviewsData?.length} Review
                      </span>
                    </div>
                  </li>
                </ul>

                <div className="d-flex info mb-3">
                  <span className="oldPrice">AED: {productData?.oldPrice}</span>
                  <span className="netPrice text-danger ml-2">
                    AED: {productData?.price}
                  </span>
                </div>

                {productData?.countInStock >= 1 ? (
                  <span className="badge badge-success">IN STOCK</span>
                ) : (
                  <span className="badge badge-danger">OUT OF STOCK</span>
                )}

                <div className="mt-3">
                  {productData?.description &&
                    (() => {
                      const { truncatedText, isTruncated } =
                        truncateDescription(productData?.description, 150);
                      return (
                        <>
                          <p
                            style={{
                              lineHeight: "1.6",
                              color: "#666",
                              fontSize: "14px",
                            }}
                          >
                            {truncatedText}
                            {isTruncated && (
                              <span
                                style={{
                                  color: "#7A55C1",
                                  fontWeight: "600",
                                  cursor: "pointer",
                                }}
                                onClick={() => router.push("#description")}
                              >
                                {" "}
                                Read More
                              </span>
                            )}
                          </p>
                        </>
                      );
                    })()}
                </div>

                {productData?.productRam?.length !== 0 && (
                  <div className="productSize d-flex align-items-center">
                    <span>RAM:</span>
                    <ul
                      className={`list list-inline mb-0 pl-4 ${
                        tabError === true && "error"
                      }`}
                    >
                      {productData?.productRam?.map((item, index) => {
                        return (
                          <li className="list-inline-item" key={index}>
                            <a
                              className={`tag ${
                                activeSize === index ? "active" : ""
                              }`}
                              onClick={() => isActive(index)}
                            >
                              {item}
                            </a>
                          </li>
                        );
                      })}
                    </ul>
                  </div>
                )}

                {productData?.size?.length !== 0 && (
                  <div className="productSize d-flex align-items-center">
                    <span>Size:</span>
                    <ul
                      className={`list list-inline mb-0 pl-4 ${
                        tabError === true && "error"
                      }`}
                    >
                      {productData?.size?.map((item, index) => {
                        return (
                          <li className="list-inline-item" key={index}>
                            <a
                              className={`tag ${
                                activeSize === index ? "active" : ""
                              }`}
                              onClick={() => isActive(index)}
                            >
                              {item}
                            </a>
                          </li>
                        );
                      })}
                    </ul>
                  </div>
                )}

                {productData?.productWeight?.length !== 0 && (
                  <div className="productSize d-flex align-items-center">
                    <span>Weight:</span>
                    <ul
                      className={`list list-inline mb-0 pl-4 ${
                        tabError === true && "error"
                      }`}
                    >
                      {productData?.productWeight?.map((item, index) => {
                        return (
                          <li className="list-inline-item" key={index}>
                            <a
                              className={`tag ${
                                activeSize === index ? "active" : ""
                              }`}
                              onClick={() => isActive(index)}
                            >
                              {item}
                            </a>
                          </li>
                        );
                      })}
                    </ul>
                  </div>
                )}

                <div className="d-flex align-items-center mt-3 actions_">
                  <QuantityBox
                    quantity={quantity}
                    item={productData}
                    selectedItem={selectedItem}
                    value={1}
                  />

                  <div className="d-flex align-items-center btnActions">
                    <Button
                      className={`btn-lg btn-big btn-round ${
                        context?.cartData?.find(
                          (item) => item?.productId === productData?._id,
                        )
                          ? "btn-disabled"
                          : "btn-blue bg-red"
                      }`}
                      disabled={
                        context?.cartData?.find(
                          (item) => item?.productId === productData?._id,
                        )
                          ? true
                          : false
                      }
                      onClick={() => addtoCart()}
                    >
                      <BsCartFill /> &nbsp;
                      {context?.cartData?.find(
                        (item) => item?.productId === productData?._id,
                      )
                        ? "Added"
                        : context.addingInCart === true
                          ? "adding..."
                          : " Add to cart"}
                    </Button>

                    <Tooltip
                      title={`${
                        isAddedToMyList === true
                          ? "Added to Wishlist"
                          : "Add to Wishlist"
                      }`}
                      placement="top"
                    >
                      <Button
                        className={`btn-blue btn-lg btn-big btn-circle ml-4`}
                        onClick={() => addToMyList(id)}
                      >
                        {isAddedToMyList === true ? (
                          <FaHeart className="text-danger" />
                        ) : (
                          <FaRegHeart />
                        )}
                      </Button>
                    </Tooltip>

                    <Tooltip title="Add to Compare" placement="top">
                      <Button className="btn-blue btn-lg btn-big btn-circle ml-2">
                        <MdOutlineCompareArrows />
                      </Button>
                    </Tooltip>
                  </div>
                </div>
              </div>
            </div>

            <br />
            <br />

            <br />
            <div className="customTabs" ref={tabsRef}>
              <ul className="list list-inline">
                <li className="list-inline-item">
                  <Button
                    className={`${activeTabs === 0 && "active"}`}
                    onClick={() => {
                      setActiveTabs(0);
                      router.push("#description");
                    }}
                  >
                    Description
                  </Button>
                </li>
                {hasSpecificationData && (
                  <li className="list-inline-item">
                    <Button
                      className={`${activeTabs === 1 && "active"}`}
                      onClick={() => {
                        setActiveTabs(1);
                        router.push("#additionalinfo");
                      }}
                    >
                      Specification
                    </Button>
                  </li>
                )}
                {hasFeatureData && (
                  <li className="list-inline-item">
                    <Button
                      className={`${activeTabs === 2 && "active"}`}
                      onClick={() => {
                        setActiveTabs(2);
                        router.push("#features");
                      }}
                    >
                      Features
                    </Button>
                  </li>
                )}
                {hasFaqData && (
                  <li className="list-inline-item">
                    <Button
                      className={`${activeTabs === (hasFeatureData ? 3 : 2) && "active"}`}
                      onClick={() => {
                        setActiveTabs(hasFeatureData ? 3 : 2);
                        router.push("#faq");
                      }}
                    >
                      FAQ
                    </Button>
                  </li>
                )}
                {hasReviewsData && (
                  <li className="list-inline-item">
                    <Button
                      className={`${activeTabs === (hasFeatureData ? 4 : 3) && "active"}`}
                      onClick={() => {
                        setActiveTabs(hasFeatureData ? 4 : 3);
                        router.push("#reviews");
                      }}
                    >
                      Reviews ({reviewsData?.length})
                    </Button>
                  </li>
                )}
              </ul>
            </div>
            <br />
          </div>
          <div style={{ backgroundColor: "#F5F5F5" }}>
            <div className="container" style={{ paddingTop: "1px" }}>
              <div
                className="card mt-5 detailsPageTabs"
                style={{ backgroundColor: "white", padding: "36px" }}
              >
                <div className="tabContent">
                  <h3>Product Description</h3>
                </div>

                <br />
                <div
                  id="description"
                  className="tabContent"
                  style={{ scrollMarginTop: "150px" }}
                >
                  <div
                    className="jodit-wysiwyg"
                    dangerouslySetInnerHTML={{
                      __html: productData?.description,
                    }}
                  />
                </div>
              </div>

              {hasSpecificationData && (
                <div
                  className="card mt-5 detailsPageTabs"
                  style={{ backgroundColor: "white", padding: "36px" }}
                >
                  <div
                    id="additionalinfo"
                    className="tabContent"
                    style={{ scrollMarginTop: "150px" }}
                  >
                    <div className="tabContent">
                      <h3>Product Specification</h3>
                    </div>

                    <br />
                    <div className="table-responsive">
                      <table className="spec-table">
                        <tbody>
                          {filteredSpecifications?.length > 0 &&
                            filteredSpecifications?.map((spec, index) => (
                              <tr key={index}>
                                <th style={{ backgroundColor: "#F5F5F5" }}>
                                  {spec?.key}
                                </th>
                                <td>
                                  <p style={{ marginBottom: "auto" }}>
                                    {spec?.value}
                                  </p>
                                </td>
                              </tr>
                            ))}
                          {filteredProductRam?.length > 0 &&
                            filteredProductRam?.map((ram, index) => (
                              <tr key={`ram-${index}`}>
                                <th style={{ backgroundColor: "#F5F5F5" }}>
                                  RAM
                                </th>
                                <td>
                                  <p>{ram}</p>
                                </td>
                              </tr>
                            ))}
                          {filteredSize?.length > 0 &&
                            filteredSize?.map((size, index) => (
                              <tr key={`size-${index}`}>
                                <th style={{ backgroundColor: "#F5F5F5" }}>
                                  Size
                                </th>
                                <td>
                                  <p>{size}</p>
                                </td>
                              </tr>
                            ))}
                          {filteredProductWeight?.length > 0 &&
                            filteredProductWeight?.map((weight, index) => (
                              <tr key={`weight-${index}`}>
                                <th style={{ backgroundColor: "#F5F5F5" }}>
                                  Weight
                                </th>
                                <td>
                                  <p>{weight}</p>
                                </td>
                              </tr>
                            ))}
                        </tbody>
                      </table>
                    </div>
                  </div>
                </div>
              )}

              {hasFeatureData && (
                <div
                  className="card mt-5 detailsPageTabs"
                  style={{ backgroundColor: "white", padding: "36px" }}
                >
                  <div
                    id="features"
                    className="tabContent"
                    style={{ scrollMarginTop: "150px" }}
                  >
                    <div className="row">
                      <div className="col-md-12">
                        <h3>Product Features</h3>
                        <br />
                        {filteredFeaturesWithItems?.map(
                          (featureCategory, categoryIndex) => (
                            <div
                              key={categoryIndex}
                              className="features_box mb-5"
                            >
                              <p
                                className="features_h1_text"
                                style={{
                                  fontSize: "16px",
                                  fontWeight: "600",
                                  marginBottom: "16px",
                                  color: "#333",
                                }}
                              >
                                {featureCategory?.featureCategory}
                              </p>
                              <div className="col-md-12">
                                <div
                                  style={{
                                    display: "grid",
                                    gridTemplateColumns: "repeat(3, 1fr)",
                                    gap: "0px",
                                    width: "100%",
                                  }}
                                >
                                  {featureCategory?.featuresList?.map(
                                    (feature, featureIndex) => (
                                      <div
                                        key={featureIndex}
                                        style={{
                                          display: "flex",
                                          alignItems: "center",
                                          padding: "8px",
                                          opacity:
                                            feature?.value === false ? 0.5 : 1,
                                        }}
                                        title={feature?.featuresName}
                                      >
                                        {feature?.value === true ? (
                                          <Check
                                            size={20}
                                            style={{
                                              color: "#7A55C1",
                                              marginRight: "12px",
                                              flexShrink: 0,
                                            }}
                                          />
                                        ) : (
                                          <X
                                            size={20}
                                            style={{
                                              color: "#999",
                                              marginRight: "12px",
                                              flexShrink: 0,
                                            }}
                                          />
                                        )}
                                        <span
                                          style={{
                                            color:
                                              feature?.value === false
                                                ? "#999"
                                                : "#333",
                                            fontSize: "14px",
                                          }}
                                        >
                                          {feature?.featuresName}
                                        </span>
                                      </div>
                                    ),
                                  )}
                                </div>
                              </div>
                            </div>
                          ),
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {hasFaqData && (
                <div
                  className="card mt-5 detailsPageTabs"
                  style={{ backgroundColor: "white", padding: "36px" }}
                >
                  <div
                    id="faq"
                    className="tabContent"
                    style={{ scrollMarginTop: "150px" }}
                  >
                    <div className="row">
                      <div className="col-md-12">
                        <h3>Frequently Asked Questions</h3>
                        <br />
                        {filteredFaq?.map((item, index) => (
                          <div key={index} className="faq-item mb-4">
                            <div
                              className="faq-question"
                              style={{
                                fontWeight: "600",
                                marginBottom: "0px",
                                cursor: "pointer",
                                display: "flex",
                                justifyContent: "space-between",
                                alignItems: "center",
                              }}
                              onClick={() =>
                                setExpandedFaqIndex(
                                  expandedFaqIndex === index ? null : index,
                                )
                              }
                            >
                              <p style={{ margin: 0, marginRight: "10px" }}>
                                Q: {item?.question}
                              </p>
                              <ChevronDown
                                size={20}
                                style={{
                                  transition: "transform 0.3s",
                                  transform:
                                    expandedFaqIndex === index
                                      ? "rotate(180deg)"
                                      : "rotate(0deg)",
                                  flexShrink: 0,
                                }}
                              />
                            </div>
                            {expandedFaqIndex === index && (
                              <div
                                className="faq-answer"
                                style={{
                                  marginTop: "12px",
                                  color: "#666",
                                  animation: "fadeIn 0.3s",
                                }}
                              >
                                <p style={{ margin: 0 }}>A. {item?.answer}</p>
                              </div>
                            )}
                            {index < filteredFaq.length - 1 && <hr />}
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {hasReviewsData && (
                <div
                  className="card mt-5 detailsPageTabs"
                  style={{ backgroundColor: "white", padding: "36px" }}
                >
                  <div
                    id="reviews"
                    className="tabContent"
                    style={{ scrollMarginTop: "150px" }}
                  >
                    <div className="row">
                      <div className="col-md-8">
                        <h3>Customer questions & answers</h3>
                        <br />

                        {reviewsData?.length !== 0 &&
                          reviewsData
                            ?.slice(0)
                            ?.reverse()
                            ?.map((item, index) => {
                              return (
                                <div
                                  className="reviewBox mb-4 border-bottom"
                                  key={index}
                                >
                                  <div className="info">
                                    <div className="d-flex align-items-center w-100">
                                      <h5>{item?.customerName}</h5>

                                      <div className="ml-auto">
                                        <Rating
                                          name="half-rating-read"
                                          value={item?.customerRating}
                                          readOnly
                                          size="small"
                                        />
                                      </div>
                                    </div>

                                    <h6 className="text-light">
                                      {item?.dateCreated}
                                    </h6>

                                    <p>{item?.review} </p>
                                  </div>
                                </div>
                              );
                            })}

                        <br className="res-hide" />

                        <form className="reviewForm" onSubmit={addReview}>
                          <h4>Add a review</h4>
                          <div className="form-group">
                            <textarea
                              className="form-control shadow"
                              placeholder="Write a Review"
                              name="review"
                              value={reviews.review}
                              onChange={onChangeInput}
                            ></textarea>
                          </div>

                          <div className="row">
                            <div className="col-md-6">
                              <div className="form-group">
                                <Rating
                                  name="rating"
                                  value={rating}
                                  precision={0.5}
                                  onChange={changeRating}
                                />
                              </div>
                            </div>
                          </div>

                          <br />
                          <div className="form-group mb-0">
                            <Button
                              type="submit"
                              className="btn-blue btn-lg btn-big btn-round"
                            >
                              {isLoading === true ? (
                                <CircularProgress
                                  color="inherit"
                                  className="loader"
                                />
                              ) : (
                                "Submit Review"
                              )}
                            </Button>
                          </div>
                        </form>
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </div>
            <br />
            <div className="container">
              {relatedProductData?.length !== 0 && (
                <RelatedProducts
                  title="RELATED PRODUCTS"
                  data={relatedProductData}
                />
              )}
            </div>
          </div>
        </section>
      )}
    </>
  );
};

export default ProductDetails;
