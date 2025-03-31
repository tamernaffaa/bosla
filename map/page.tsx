"use client";

import dynamic from "next/dynamic";

// تعطيل SSR باستخدام dynamic
const HomePage = dynamic(() => import("./Home"), { ssr: false });

export default HomePage;

