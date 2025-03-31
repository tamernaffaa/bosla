"use client";

import React, { useState } from "react";
import MapComponent from "../components/MapComponent";
import Layout from "../components/Layout";
import { supabase } from "../utils/supabaseClient";

// تعريف واجهة الطرق
interface Route {
  start_point: { lat: number; lon: number };
  end_point: { lat: number; lon: number };
  status: string;
}

// تعريف واجهة نتائج البحث
interface SearchResult {
  lat: string;
  lon: string;
  display_name: string;
}

// واجهة لتحديد شكل البيانات الخام القادمة من Supabase
interface RawRoute {
  start_point: string;
  end_point: string;
  status: string;
}

export default function Home() {
  const [searchText, setSearchText] = useState<string>("");
  const [coordinates, setCoordinates] = useState<[number, number]>([33.5138, 36.2765]);
  const [results, setResults] = useState<SearchResult[]>([]);
  const [routes, setRoutes] = useState<Route[]>([]);
  const [loading, setLoading] = useState<boolean>(false);
  const [isChecked, setIsChecked] = useState<boolean>(false);

  // وظيفة البحث عن المواقع
  const handleSearch = async () => {
    if (!searchText.trim()) {
      alert("يرجى إدخال نص للبحث");
      return;
    }

    try {
      const response = await fetch(
        `https://nominatim.openstreetmap.org/search?format=json&q=${searchText}&countrycodes=sy`
      );
      const data: SearchResult[] = await response.json();

      if (data.length > 0) {
        setResults(data);
      } else {
        alert("لم يتم العثور على نتائج.");
        setResults([]);
      }
    } catch (error) {
      console.error("حدث خطأ أثناء البحث:", error);
      alert("حدث خطأ أثناء البحث، يرجى المحاولة مرة أخرى.");
    }
  };

  // وظيفة جلب الطرق من قاعدة البيانات
  const fetchRoutes = async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from("delv_orders")
        .select("start_point, end_point, status")
        .not("status", "in", "(cancel,end,finish)");

      if (error) {
        console.error("Error fetching data:", error);
        alert("حدث خطأ أثناء جلب البيانات.");
        return;
      }

      if (data && data.length > 0) {
        const formattedData = data
          .map((route: RawRoute) => {
            const [startLat, startLon] = route.start_point.split(",").map(Number);
            const [endLat, endLon] = route.end_point.split(",").map(Number);

            if (
              isNaN(startLat) || isNaN(startLon) || 
              isNaN(endLat) || isNaN(endLon)
            ) {
              console.error("Invalid coordinates in route:", route);
              return null; // تجاهل البيانات غير الصحيحة
            }

            return {
              start_point: { lat: startLat, lon: startLon },
              end_point: { lat: endLat, lon: endLon },
              status: route.status,
            };
          })
          .filter((route) => route !== null); // إزالة الكائنات غير الصالحة

        setRoutes(formattedData as Route[]);
      } else {
        alert("لا توجد طرق متاحة.");
        setRoutes([]);
      }
    } catch (error) {
      console.error("Unexpected error:", error);
      alert("حدث خطأ غير متوقع.");
    } finally {
      setLoading(false);
    }
  };

  // التحكم بالنقر على النتائج
  const handleResultClick = (lat: string, lon: string) => {
    const parsedLat = parseFloat(lat);
    const parsedLon = parseFloat(lon);

    if (isNaN(parsedLat) || isNaN(parsedLon)) {
      console.error("Invalid coordinates selected:", { lat, lon });
      alert("الإحداثيات غير صحيحة.");
      return;
    }

    setCoordinates([parsedLat, parsedLon]);
    setResults([]);
  };

  // الكشف عن الضغط على Enter
  const handleKeyDown = (event: React.KeyboardEvent<HTMLInputElement>) => {
    if (event.key === "Enter") {
      handleSearch();
    }
  };

  // التحكم بتغيير حالة زر Check
  const handleCheckboxChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const checked = event.target.checked;
    setIsChecked(checked);

    if (checked) {
      fetchRoutes();
    } else {
      console.log("Checkbox is unchecked, clearing routes.");
      setRoutes([]);
    }
  };

  return (
    <Layout>
      {/* القائمة العلوية */}
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          padding: "1rem",
          background: "#f8f9fa",
          borderBottom: "1px solid #ddd",
        }}
      >
        <label style={{ display: "flex", alignItems: "center" }}>
          <input
            type="checkbox"
            checked={isChecked}
            onChange={handleCheckboxChange}
            style={{ marginRight: "0.5rem" }}
          />
          {loading ? "جاري التحميل..." : "الطلبات الحالية"}
        </label>
      </div>

      {/* المحتوى الرئيسي */}
      <div style={{ padding: "2rem", textAlign: "center" }}>
        {/* مربع البحث */}
        <input
          type="text"
          value={searchText}
          onChange={(e) => setSearchText(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder="ابحث عن موقع"
          style={{
            padding: "0.5rem",
            width: "60%",
            borderRadius: "4px",
            border: "1px solid #ccc",
            marginBottom: "1rem",
          }}
        />

        {/* قائمة النتائج */}
        {results.length > 0 && (
          <ul
            style={{
              listStyle: "none",
              padding: 0,
              background: "#f5f5f7",
              width: "60%",
              margin: "0 auto",
              borderRadius: "4px",
              border: "1px solid #ddd",
              textAlign: "left",
            }}
          >
            {results.map((result, index) => (
              <li
                key={index}
                onClick={() => handleResultClick(result.lat, result.lon)}
                style={{
                  cursor: "pointer",
                  padding: "0.5rem",
                  borderBottom: "1px solid #ddd",
                }}
              >
                {result.display_name}
              </li>
            ))}
          </ul>
        )}

        {/* الخريطة */}
        <MapComponent coordinates={coordinates} routes={routes} />
      </div>
    </Layout>
  );
}
