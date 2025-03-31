"use client";

import Sidebar from "./Sidebar"; // استيراد القائمة الجانبية

interface LayoutProps {
  children: React.ReactNode;
}

const Layout = ({ children }: LayoutProps) => {
  return (
    <div style={{ display: "flex" }}>
      {/* Sidebar */}
      <Sidebar />

      {/* Main Content */}
      <div style={{ marginLeft: "80px", padding: "1rem", flex: 1 }}>
        {children}
      </div>
    </div>
  );
};

export default Layout;
