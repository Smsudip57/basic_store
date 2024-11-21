import React, { useContext } from "react";
import "./style.css";
import { Swiper, SwiperSlide } from "swiper/react";
import "swiper/css";
import "swiper/css/navigation";
import { Navigation } from "swiper/modules";
import { MyContext } from "@/context/ThemeContext";
import Link from "next/link";

const Banners = (props) => {
  const context = useContext(MyContext);

  return (
    <>
      <div className="container bannerAds pt-3 pb-3">
        {context?.windowWidth > 992 ? (
          <Swiper
            slidesPerView={4}
            spaceBetween={0}
            navigation={true}
            slidesPerGroup={props?.col}
            modules={[Navigation]}
            className="bannerSection pt-3"
            breakpoints={{
              300: {
                slidesPerView: 1,
                spaceBetween: 10,
              },
              400: {
                slidesPerView: 2,
                spaceBetween: 10,
              },
              600: {
                slidesPerView: 3,
                spaceBetween: 10,
              },
              750: {
                slidesPerView: 4,
                spaceBetween: 10,
              },
            }}
          >
            {props?.data?.length !== 0 &&
              props?.data?.map((item, index) => {
                return (
                  <SwiperSlide key={index}>
                    <div className={`col_`}>
                      {item?.subCatId !== null ? (
                        <Link
                          href={`/category/subCat/${item?.subCatId}`}
                          className="box"
                        >
                          <img
                            src={item?.images[0]}
                            className="w-100 transition"
                            alt="banner img"
                          />
                        </Link>
                      ) : (
                        <Link
                          href={`/category/${item?.catId}`}
                          className="box"
                        >
                          <img
                            src={item?.images[0]}
                            className="w-100 transition"
                            alt="banner img"
                          />
                        </Link>
                      )}
                    </div>
                  </SwiperSlide>
                );
              })}
          </Swiper>
        ) : (
          <div
            className="bannerSection pt-3"
            style={{ gridTemplateColumns: `repeat(${props?.col},1fr)` }}
          >
            {props?.data?.length !== 0 &&
              props?.data?.map((item, index) => {
                return (
                  <div className={`col_`}>
                      {item?.subCatId !== null ? (
                        <Link
                          href={`/category/subCat/${item?.subCatId}`}
                          className="box"
                        >
                          <img
                            src={item?.images[0]}
                            className="w-100 transition"
                            alt="banner img"
                          />
                        </Link>
                      ) : (
                        <Link
                          href={`/category/${item?.catId}`}
                          className="box"
                        >
                          <img
                            src={item?.images[0]}
                            className="w-100 transition"
                            alt="banner img"
                          />
                        </Link>
                      )}
                    </div>
                );
              })}
          </div>
        )}
      </div>
    </>
  );
};

export default Banners;
