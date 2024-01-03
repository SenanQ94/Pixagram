import React from "react";
import SigninForm from "./forms/SigninForm";
import SignupForm from "./forms/SignupForm";
import { Outlet, Navigate } from "react-router-dom";
import { useUserContext } from "@/context/AuthContext";

const AuthLayout = () => {
  const { isAuthenticated } = useUserContext();
  return (
    <>
      {isAuthenticated ? (
        <Navigate to="/" />
      ) : (
        <>
          <section className="flex flex-1 justify-center items-center flex-col py-10">
            <Outlet />
          </section>
          <img
            src="./assets/images/side-img.svg"
            alt="logo"
            className="hidden l:block xl:block h-full w-1/2 object-cover bg-no-repeat"
          />
        </>
      )}
    </>
  );
};

export default AuthLayout;
