import Button from "@mui/material/Button";
import { IoIosMenu } from "react-icons/io";
import { FaAngleDown } from "react-icons/fa6";
import { useContext, useEffect, useState, useRef } from "react";
import { FaAngleRight } from "react-icons/fa6";
import { MyContext } from "@/context/ThemeContext";
import CountryDropdown from "@/Components/CountryDropdown";
import Link from "next/link";
import Tabs from "@mui/material/Tabs";
import Tab from "@mui/material/Tab";

const Navigation = (props) => {
  const [isopenSidebarVal, setisopenSidebarVal] = useState(false);
  const [isOpenNav, setIsOpenNav] = useState(false);
  const [isOpenSubMenuIndex, setIsOpenSubMenuIndex] = useState(null);
  const [isOpenSubMenu_, setIsOpenSubMenu_] = useState(false);

  const context = useContext(MyContext);

  useEffect(() => {
    setIsOpenNav(props.isOpenNav);
  }, [props.isOpenNav]);

  const IsOpenSubMenu = (index) => {
    setIsOpenSubMenuIndex(index);
    setIsOpenSubMenu_(!isOpenSubMenu_);
  };

  return (
    <nav>
      <div className="container">
        <div className="row">
          <div className="col-sm-2 navPart1 ">
            <div className="catWrapper">
              <Button
                className="allCatTab align-items-center res-hide"
                onClick={() => setisopenSidebarVal(!isopenSidebarVal)}
              >
                <span className="icon1 mr-2">
                  <IoIosMenu />
                </span>
                <span className="text">ALL CATEGORIES</span>
                <span className="icon2  ml-2">
                  <FaAngleDown />
                </span>
              </Button>

              <div
                className={`sidebarNav ${
                  isopenSidebarVal === true ? "open" : ""
                }`}
                style={{ backgroundColor: "#7A55C1", borderRadius: "16px" }}
              >
                <ul>
                  {props.navData?.map((item, index) => {
                    return (
                      <li key={index}>
                        <Link href={`/category/${item?._id}`}>
                          <div
                            className="navCategoryButton"
                            style={{ color: "white", fontSize: "14px"}}
                          >
                            {item?.name} <FaAngleRight className="ml-auto" />
                          </div>
                        </Link>
                        {item?.children?.length !== 0 && (
                          <div className="submenu">
                            {item?.children?.map((subCat, key) => {
                              return (
                                <Link
                                  href={`/category/subCat/${subCat?._id}`}
                                  key={key}
                                >
                                  <div
                                    className="navCategoryButton"
                                    style={{ color: "white", fontSize: "14px" }}
                                  >
                                    {subCat?.name}
                                  </div>
                                </Link>
                              );
                            })}
                          </div>
                        )}
                      </li>
                    );
                  })}
                </ul>
              </div>
            </div>
          </div>

          <div
            className={`col-sm-10 navPart2 d-flex align-items-center res-nav-wrapper ${
              isOpenNav === true ? "open" : "close"
            }`}
          >
            <div className="res-nav-overlay" onClick={props.closeNav}></div>

            <ul
              className="list list-inline ml-auto res-nav"
              style={{ display: "flex", overflow: "auto" }}
            >
              {context.windowWidth < 992 && (
                <>
                  {context.isLogin !== true && (
                    <li
                      className="list-inline-item pl-3"
                      style={{ display: "flex" }}
                    >
                      <Link href="/signIn">
                        <Button className="btn-blue btn-round mr-3">
                          Sign In
                        </Button>
                      </Link>
                    </li>
                  )}

                  <li className="list-inline-item">
                    <div className="p-3">
                      {context.countryList.length !== 0 &&
                        context.windowWidth < 992 && <CountryDropdown />}
                    </div>
                  </li>
                </>
              )}
              {
                //  <li className="list-inline-item" onClick={props.closeNav}>
                //   <Link href="/">
                //     <Button>Home</Button>
                //   </Link>
                // </li>
              }
              <Tabs
                variant="scrollable"
                scrollButtons="auto"
                className="filterTabs "
                style={{
                  display: "flex",
                  justifyContent: "center",
                  alignItems: "center",
                }}
              >
                {props?.navData
                  ?.filter((item, idx) => idx < 8)
                  .map((item, index) => {
                    return (
                      <li
                        className="list-inline-item"
                        key={index}
                        style={{ paddingBottom: "0px" }}
                      >
                        <Link
                          href={`/category/${item?._id}`}
                          onClick={props.closeNav}
                        >
                          <Button className="" style={{ textWrap: "nowrap" }}>
                            {item?.name}
                          </Button>
                        </Link>

                        {item?.children?.length !== 0 &&
                          context.windowWidth < 992 && (
                            <span
                              className={`arrow ${
                                isOpenSubMenuIndex === index &&
                                isOpenSubMenu_ === true &&
                                "rotate"
                              }`}
                              onClick={() => IsOpenSubMenu(index)}
                            >
                              <FaAngleDown />
                            </span>
                          )}

                        {item?.children?.length !== 0 && (
                          <div
                            className={`submenu ${
                              isOpenSubMenuIndex === index &&
                              isOpenSubMenu_ === true &&
                              "open"
                            }`}
                          >
                            {item?.children?.map((subCat, key) => {
                              return (
                                <Link
                                  href={`/category/subCat/${subCat?._id}`}
                                  key={key}
                                  onClick={props.closeNav}
                                >
                                  <Button>{subCat?.name}</Button>
                                </Link>
                              );
                            })}
                          </div>
                        )}
                      </li>
                    );
                  })}
              </Tabs>
            </ul>
          </div>
        </div>
      </div>
    </nav>
  );
};

export default Navigation;
