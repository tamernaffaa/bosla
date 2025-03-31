"use client";

import { useState } from "react";
import Link from "next/link";
import { FaHome, FaCog,  FaServicestack, FaAdversal,  FaUserCircle } from "react-icons/fa";
import {  FaMapLocation } from "react-icons/fa6";

const Sidebar = () => {
  const [activeIndex, setActiveIndex] = useState<number | null>(null);

  const menuItems = [
    { label: "", icon: <FaHome />, href: "/" },
    { label: "خدمات", icon: <FaServicestack />, href: "/ser_adv" },
    { label: "أعلانات", icon: <FaAdversal />, href: "/adv" },
    { label: "خريطة", icon: <FaMapLocation />, href: "/map" },
    { label: "كباتن", icon: <FaUserCircle />, href: "/users" },
    { label: "Settings", icon: <FaCog />, href: "/settings" },
    // يمكنك إضافة المزيد لاختبار التمرير
  ];

  return (
    <aside
      style={{
        width: "80px",
        background: "#FFD700",
        padding: "1rem",
        position: "fixed",
        height: "100vh",
        top: 0,
        left: 0,
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        overflowY: "auto", // تفعيل التمرير العمودي
        scrollbarWidth: "none", // إخفاء شريط التمرير
      }}
    >
      <style>
        {`
          /* إخفاء شريط التمرير للمتصفحات مثل Chrome و Edge */
          aside::-webkit-scrollbar {
            display: none;
          }
        `}
      </style>
      <ul
        style={{
          listStyle: "none",
          padding: 0,
          margin: 0,
          maxHeight: "100%", // ارتفاع الحاوية
        }}
      >
        {menuItems.map((item, index) => (
          <li
            key={index}
            style={{
              marginBottom: "1.5rem",
              textAlign: "center",
              background: activeIndex === index ? "#FFFFFF" : "transparent",
              borderRadius: "8px",
            }}
            onClick={() => setActiveIndex(index)} // تحديد العنصر النشط
          >
            <Link href={item.href}>
              <div
                style={{
                  display: "flex",
                  flexDirection: "column",
                  alignItems: "center",
                  textDecoration: "none",
                  color: "inherit",
                  cursor: "pointer",
                  padding: "0.5rem",
                }}
              >
                <span style={{ fontSize: "1.5rem", marginBottom: "0.5rem" }}>
                  {item.icon}
                </span>
                <span style={{ fontSize: "0.9rem", color: "#000" }}>
                  {item.label}
                </span>
              </div>
            </Link>
          </li>
        ))}
      </ul>
    </aside>
  );
};

export default Sidebar;
