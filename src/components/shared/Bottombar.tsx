import { bottombarLinks } from "@/constants";
import React from "react";
import { Link, NavLink, useLocation } from "react-router-dom";
import { Separator } from "../ui/separator";

const Bottombar = () => {
  const { pathname } = useLocation();
  return (
    <section className="bottom-bar">
      {bottombarLinks.map((link, index) => {
        const isActive = pathname === link.route;
        const isLastLink = index === bottombarLinks.length - 1;
        return (
          <div key={index} className="flex h-7 items-center w-full text-sm">
            <Link
              to={link.route}
              key={link.label}
              className={`${
                isActive && "bg-primary-500 rounded-[10px]"
              } flex-center m-1.5 flex-col gap-1 p-1 transition min-w-[80px]`}
            >
              <img
                src={link.imgURL}
                alt={link.label}
                width={isActive ? 20 : 16}
                height={16}
                className={` ${isActive && "invert-white"}`}
              />

              <p className={` text-light-2 ${isActive ? "" : "tiny-medium"}`}>
                {" "}
                {link.label}
              </p>
            </Link>
            {!isLastLink && <Separator orientation="vertical" />}
          </div>
        );
      })}
    </section>
  );
};

export default Bottombar;
