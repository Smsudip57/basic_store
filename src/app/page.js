"use client";
import banner1 from "../assets/images/banner1.jpg";
import banner2 from "../assets/images/banner2.jpg";
import Button from "@mui/material/Button";
import { IoIosArrowRoundForward } from "react-icons/io";
import React, { useContext, useEffect, useState } from "react";
import { Swiper, SwiperSlide } from "swiper/react";
import "swiper/css";
import "swiper/css/navigation";
import { Navigation } from "swiper/modules";
import ProductItem from "@/Components/ProductItem";
import HomeCat from "@/Components/HomeCat";

import CircularProgress from "@mui/material/CircularProgress";

import { MyContext } from "@/context/ThemeContext";
import Tabs from "@mui/material/Tabs";
import Tab from "@mui/material/Tab";
import { fetchDataFromApi } from "@/utils/api";
import HomeBanner from "@/Components/HomeBanner";
import Image from "next/image";

import homeBannerPlaceholder from "../assets/images/homeBannerPlaceholder.jpg";
import Banners from "@/Components/banners";

export default function Home() {
  const [featuredProducts, setFeaturedProducts] = useState([]);
  const [productsData, setProductsData] = useState([]);
  const [selectedCat, setselectedCat] = useState();
  const [filterData, setFilterData] = useState([]);
  const [homeSlides, setHomeSlides] = useState([]);
  const [isLoading, setIsLoading] = useState(false);

  const [value, setValue] = React.useState(0);
  

  const context = useContext(MyContext);

  const handleChange = (event, newValue) => {
    setValue(newValue);
  };

  const selectCat = (cat) => {
    setselectedCat(cat);
  };

  useEffect(() => {
    window.scrollTo(0, 0);

    setselectedCat(context.categoryData[0]?.name);

    const location = localStorage.getItem("location");
    if (location !== null && location !== "" && location !== undefined) {
      fetchDataFromApi(`/api/products/featured?location=${location}`).then(
        (res) => {
        if (!res.ok) {
          setIsLoading(false);
          return; 
        }
          setFeaturedProducts(res);
        }
      );

      fetchDataFromApi(
        `/api/products?page=1&perPage=8&location=${location}`
      ).then((res) => {
        if (!res.ok) {
          setIsLoading(false);
          return; 
        }
        setProductsData(res);
      });
    } else {
      // setselectedCountry("All");
      localStorage.setItem("location", "All");
    }

    fetchDataFromApi("/api/homeBanner").then((res) => {
        if (!res.ok) {
          setIsLoading(false);
          return; 
        }
      setHomeSlides(res);
    });

   
  }, []);

  useEffect(() => {
    if (context.categoryData[0] !== undefined)
      setselectedCat(context.categoryData[0].name);
  }, [context.categoryData]);

  useEffect(() => {
    if (selectedCat !== undefined) {
      setIsLoading(true);
      const location = localStorage.getItem("location");
      fetchDataFromApi(
        `/api/products/catName?catName=${selectedCat}&location=${location}`
      ).then((res) => {
        if (!res.ok) {
          setIsLoading(false);
          return; 
        }
        setFilterData(res.products);
        setIsLoading(false);
        // console.log(selectedCat)
      });
    }
  }, [selectedCat]);

  return (
    <>
      <div className="marginTop"></div>
      {homeSlides?.length !== 0 ? (
        <HomeBanner data={homeSlides} />
      ) : (
        <div className="container mt-3">
          <div className="homeBannerSection">
            <Image
              src={homeBannerPlaceholder}
              className="w-100"
              width={1000}
              height={500}
              style={{ height: "auto" }}
              alt="placeholder"
            />
          </div>
        </div>
      )}

      {context.categoryData?.length !== 0 && (
        <HomeCat catData={context.categoryData} />
      )}

      <section className="homeProducts">
        <div className="container">
          <div className="row homeProductsRow">
            <div className="col-md-3">
              <div className="sticky">
                <div className="banner">
                  <Image src={banner1} className="cursor w-100" alt="image" />
                </div>

                <div className="banner mt-4">
                  <Image src={banner2} className="cursor w-100" alt="image" />
                </div>
              </div>
            </div>

            <div className="col-md-9 productRow">
              <div className="d-flex align-items-center res-flex-column">
                <div className="info" style={{ width: "35%" }}>
                  <h3 className="mb-0 hd">Popular Products</h3>
                  <p className="text-light text-sml mb-0">
                    Do not miss the current offers until the end of March.
                  </p>
                </div>

                <div
                  className="ml-auto d-flex align-items-center justify-content-end res-full"
                  style={{ width: "65%" }}
                >
                  <Tabs
                    value={value}
                    onChange={handleChange}
                    variant="scrollable"
                    scrollButtons="auto"
                    className="filterTabs"
                  >
                    {context.categoryData?.map((item, index) => {
                      return (
                        <Tab
                          className="item"
                          label={item.name}
                          onClick={() => selectCat(item.name)}
                        />
                      );
                    })}
                  </Tabs>
                </div>
              </div>

              <div
                className="product_row w-100 mt-2"
                style={{ opacity: `${isLoading === true ? "0.5" : "1"}` }}
              >
                {filterData?.length === 0 && (
                  <div
                    className="d-flex align-items-center justify-content-center"
                    style={{ minHeight: "300px" }}
                  >
                    <CircularProgress />
                  </div>
                )}

                {context.windowWidth > 992 ? (
                  <Swiper
                    slidesPerView={4}
                    spaceBetween={0}
                    navigation={true}
                    slidesPerGroup={context.windowWidth > 992 ? 3 : 1}
                    modules={[Navigation]}
                    className="mySwiper"
                  >
                    {filterData?.length !== 0 &&
                      filterData
                        ?.slice(0)
                        ?.reverse()
                        ?.map((item, index) => {
                          return (
                            <SwiperSlide key={index}>
                              <ProductItem item={item} />
                            </SwiperSlide>
                          );
                        })}
                    <SwiperSlide style={{ opacity: 0 }}>
                      <div className={`productItem`}></div>
                    </SwiperSlide>
                  </Swiper>
                ) : (
                  <div className="productScroller">
                    {filterData?.length !== 0 &&
                      filterData
                        ?.slice(0)
                        ?.reverse()
                        ?.map((item, index) => {
                          return <ProductItem item={item} key={index} />;
                        })}
                  </div>
                )}
              </div>

             
              <div className="d-flex align-items-center mt-4">
                <div className="info w-75">
                  <h3 className="mb-0 hd">NEW PRODUCTS</h3>
                  <p className="text-light text-sml mb-0">
                    New products with updated stocks.
                  </p>
                </div>
              </div>

              <div className="product_row productRow2 w-100 mt-4 d-flex productScroller">
                {productsData?.products?.length === 0 && (
                  <div
                    className="d-flex align-items-center justify-content-center"
                    style={{ minHeight: "300px" }}
                  >
                    <CircularProgress />
                  </div>
                )}

                {productsData?.products?.length !== 0 &&
                  productsData?.products
                    ?.slice(0)
                    .reverse()
                    .map((item, index) => {
                      return <ProductItem key={index} item={item} />;
                    })}
              </div>

              <div className="d-flex align-items-center mt-4">
                <div className="info">
                  <h3 className="mb-0 hd">featured products</h3>
                  <p className="text-light text-sml mb-0">
                    Do not miss the current offers until the end of March.
                  </p>
                </div>
              </div>

              {featuredProducts?.length === 0 && (
                <div
                  className="d-flex align-items-center justify-content-center"
                  style={{ minHeight: "300px" }}
                >
                  <CircularProgress />
                </div>
              )}

              <div className="product_row w-100 mt-2">
                {context.windowWidth > 992 ? (
                  <Swiper
                    slidesPerView={4}
                    spaceBetween={0}
                    navigation={true}
                    slidesPerGroup={context.windowWidth > 992 ? 3 : 1}
                    modules={[Navigation]}
                    className="mySwiper"
                    breakpoints={{
                      300: {
                        slidesPerView: 1,
                        spaceBetween: 5,
                      },
                      400: {
                        slidesPerView: 2,
                        spaceBetween: 5,
                      },
                      600: {
                        slidesPerView: 3,
                        spaceBetween: 5,
                      },
                      750: {
                        slidesPerView: 4,
                        spaceBetween: 5,
                      },
                    }}
                  >
                    {featuredProducts?.length !== 0 &&
                      featuredProducts
                        ?.slice(0)
                        ?.reverse()
                        ?.map((item, index) => {
                          return (
                            <SwiperSlide key={index}>
                              <ProductItem item={item} />
                            </SwiperSlide>
                          );
                        })}
                    <SwiperSlide style={{ opacity: 0 }}>
                      <div className={`productItem`}></div>
                    </SwiperSlide>
                  </Swiper>
                ) : (
                  <div className="productScroller">
                    {featuredProducts?.length !== 0 &&
                      featuredProducts
                        ?.slice(0)
                        ?.reverse()
                        ?.map((item, index) => {
                          return <ProductItem item={item} key={index} />;
                        })}
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </section>
    </>
  );
}
