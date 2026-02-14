import { Swiper, SwiperSlide } from "swiper/react";
import "swiper/css";
import "swiper/css/navigation";
import { Navigation } from "swiper/modules";

import InnerImageZoom from "react-inner-image-zoom";
import "react-inner-image-zoom/lib/InnerImageZoom/styles.css";
import { useRef, useState, useMemo } from "react";

const ProductZoom = (props) => {
  const zoomSliderBig = useRef();
  const zoomSlider = useRef();

  // Combine videos and images - thumbnail first, then videos, then images
  const combinedMedia = useMemo(() => {
    const medias = [];

    // Add thumbnail first if it exists
    if (props?.thumbnail) {
      medias.push({
        type: "image",
        src: props.thumbnail,
        id: "thumbnail",
      });
    }

    const videos =
      props?.videos?.map((video, index) => ({
        type: "video",
        src: video,
        id: `video-${index}`,
      })) || [];
    const images =
      props?.images
        ?.filter((image) => image !== props?.thumbnail) // Remove thumbnail from images if it exists
        ?.map((image, index) => ({
          type: "image",
          src: image,
          id: `image-${index}`,
        })) || [];

    return [...medias, ...videos, ...images];
  }, [props?.videos, props?.images, props?.thumbnail]);

  // Determine initial slide index (thumbnail or first image)
  const [slideIndex, setSlideIndex] = useState(0);

  const goto = (index) => {
    setSlideIndex(index);
    zoomSlider.current.swiper.slideTo(index);
    zoomSliderBig.current.swiper.slideTo(index);
  };

  return (
    <div className="productZoom">
      <div className="productZoom productZoomBig position-relative mb-3">
        <div className="badge badge-primary">{props?.discount}%</div>
        <Swiper
          slidesPerView={1}
          spaceBetween={0}
          navigation={false}
          slidesPerGroup={1}
          modules={[Navigation]}
          className="zoomSliderBig"
          ref={zoomSliderBig}
          initialSlide={slideIndex}
        >
          {combinedMedia?.map((media, index) => {
            return (
              <SwiperSlide key={media.id}>
                <div className="item">
                  {media.type === "image" ? (
                    <div
                      style={{
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        width: "100%",
                        height: "100%",
                        backgroundColor: "#f5f5f5",
                      }}
                    >
                      <InnerImageZoom
                        zoomType="hover"
                        zoomScale={1}
                        src={media.src}
                        imgAttributes={{
                          alt: "product",
                          style: {
                            width: "100%",
                            height: "auto",
                            maxWidth: "100%",
                            display: "block",
                            objectFit: "contain",
                          },
                        }}
                      />
                    </div>
                  ) : (
                    <video
                      src={media.src}
                      controls
                      style={{
                        width: "100%",
                        height: "100%",
                        display: "block",
                        objectFit: "contain",
                        backgroundColor: "#000",
                      }}
                    />
                  )}
                </div>
              </SwiperSlide>
            );
          })}
        </Swiper>
      </div>

      <Swiper
        slidesPerView={5}
        spaceBetween={0}
        navigation={true}
        slidesPerGroup={1}
        modules={[Navigation]}
        className="zoomSlider"
        ref={zoomSlider}
        initialSlide={slideIndex}
      >
        {combinedMedia?.map((media, index) => {
          return (
            <SwiperSlide key={media.id}>
              <div className={`item ${slideIndex === index && "item_active"}`}>
                {media.type === "image" ? (
                  <img
                    src={media.src}
                    className="w-100"
                    onClick={() => goto(index)}
                    alt="product"
                  />
                ) : (
                  <div
                    style={{
                      position: "relative",
                      width: "100%",
                      paddingBottom: "100%",
                    }}
                  >
                    <video
                      src={media.src}
                      style={{
                        position: "absolute",
                        top: 0,
                        left: 0,
                        width: "100%",
                        height: "100%",
                        cursor: "pointer",
                        objectFit: "contain",
                        backgroundColor: "#000",
                      }}
                      onClick={() => goto(index)}
                    />
                    <div
                      style={{
                        position: "absolute",
                        top: "50%",
                        left: "50%",
                        transform: "translate(-50%, -50%)",
                        backgroundColor: "rgba(0,0,0,0.5)",
                        color: "white",
                        padding: "5px 10px",
                        borderRadius: "4px",
                        fontSize: "10px",
                        fontWeight: "bold",
                        pointerEvents: "none",
                        zIndex: 1,
                      }}
                    >
                      VIDEO
                    </div>
                  </div>
                )}
              </div>
            </SwiperSlide>
          );
        })}
      </Swiper>
    </div>
  );
};

export default ProductZoom;
