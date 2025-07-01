"use client";
import { usePathname } from "next/navigation";
import NavBar from "./NavBar";

export default function NavBarWrapper() {
  const pathname = usePathname();
  const hideNav = pathname === "/login" || pathname === "/register";
  
  if (hideNav) {
    return null;
  }
  
  return (
    <>
      <NavBar />
      <div className="pt-20"></div>
    </>
  );
} 