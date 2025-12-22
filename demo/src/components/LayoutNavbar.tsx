import React, { memo, useCallback, useState, useEffect } from "react";
import { Outlet, useNavigate, useLocation } from "react-router-dom";
import Navbar from "./Navbar";
import { routeHome, routeDemo, routeDocumentation } from "../utils/Routes";

const navMap = {
  Home: routeHome,
  Demo: routeDemo,
  Documentation: routeDocumentation,
};

function LayoutNavbar() {
  const navigate = useNavigate();
  const location = useLocation();
  const [active, setActive] = useState("Home");

  useEffect(() => {
    // Update active tab based on current route
    const currentPath = location.pathname;
    if (currentPath === routeDemo) setActive("Demo");
    else if (currentPath === routeDocumentation) setActive("Documentation");
    else setActive("Home");
  }, [location.pathname]);

  const handleNavChange = useCallback((tab) => {
    setActive(tab);
    const path = navMap[tab];
    if (path) navigate(path);
  }, [navigate]);

  return (
    <>
      <div className="p-4 w-full">
        <Navbar
          activeNav={active}
          currentPath={location.pathname}
          onNavChange={handleNavChange}
        />
      </div>
      <Outlet />
    </>
  );
}

export default memo(LayoutNavbar);