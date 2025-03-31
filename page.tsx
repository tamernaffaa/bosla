"use client";
import { useEffect, useState } from "react";
import Sidebar from "./components/Sidebar";
import { supabase } from "./utils/supabaseClient";

const getOrderCounts = async (startDate: number, endDate: number): Promise<{
  incomplete: number;
  completed: number;
  canceled: number;
}> => {
  const { count: incompleteCount, error: incompleteError } = await supabase
    .from("delv_orders")
    .select("*", { count: "exact" })
    .not("status", "in", "(cancel,end,finish)")
    .gte("start_time", startDate)
    .lte("start_time", endDate);

  const { count: completedCount, error: completedError } = await supabase
    .from("delv_orders")
    .select("*", { count: "exact" })
    .in("status", ["finish", "end"])
    .gte("start_time", startDate)
    .lte("start_time", endDate);

  const { count: canceledCount, error: canceledError } = await supabase
    .from("delv_orders")
    .select("*", { count: "exact" })
    .eq("status", "cancel")
    .gte("start_time", startDate)
    .lte("start_time", endDate);

  if (incompleteError || completedError || canceledError) {
    console.error("Error fetching data:", { incompleteError, completedError, canceledError });
    throw new Error("Failed to fetch data");
  }

  return {
    incomplete: incompleteCount || 0,
    completed: completedCount || 0,
    canceled: canceledCount || 0,
  };
};

const FiltersPanel = ({
  onFilterChange,
  setIsLoading,
  setError,
  setActiveButton,
  activeButton,
}: {
  onFilterChange: (counts: { incomplete: number; completed: number; canceled: number }) => void;
  setIsLoading: (value: boolean) => void;
  setError: (message: string) => void;
  setActiveButton: (button: string) => void;
  activeButton: string;
}) => {
  const [isCustomSearchVisible, setCustomSearchVisible] = useState(false);

  const handleFilter = async (type: string) => {
    setIsLoading(true);
    setError("");
    setActiveButton(type);
    const today = new Date();
    let startDate: number, endDate: number;

    try {
      switch (type) {
        case "today":
          startDate = new Date(today.setHours(0, 0, 0, 0)).getTime();
          endDate = new Date(today.setHours(23, 59, 59, 999)).getTime();
          break;
        case "lastWeek":
          const lastWeekStart = new Date(today.setDate(today.getDate() - 7));
          startDate = new Date(lastWeekStart.setHours(0, 0, 0, 0)).getTime();
          endDate = new Date().setHours(23, 59, 59, 999);
          break;
        case "lastMonth":
          const startOfCurrentMonth = new Date(today.getFullYear(), today.getMonth(), 1);
          startDate = new Date(startOfCurrentMonth.setHours(0, 0, 0, 0)).getTime();
          endDate = new Date(today.setHours(23, 59, 59, 999)).getTime();
          break;
        default:
          return;
      }

      const counts = await getOrderCounts(startDate, endDate);
      onFilterChange(counts);
    } catch (error) {
      console.error("Error fetching data:", error);
      setError("حدث خطأ أثناء جلب البيانات. حاول مرة أخرى.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleCustomDate = async () => {
    setIsLoading(true);
    setError("");
    setActiveButton("custom");
    const startDate = new Date(`${(document.getElementById("startDate") as HTMLInputElement).value}T00:00:00`).getTime();
    const endDate = new Date(`${(document.getElementById("endDate") as HTMLInputElement).value}T23:59:59`).getTime();

    try {
      const counts = await getOrderCounts(startDate, endDate);
      onFilterChange(counts);
    } catch (error) {
      console.error("Error fetching data:", error);
      setError("حدث خطأ أثناء جلب البيانات بين التاريخين. حاول مرة أخرى.");
    } finally {
      setIsLoading(false);
    }
  };

  const buttonStyle = (type: string) => ({
    padding: "0.75rem 1.5rem",
    backgroundColor: activeButton === type ? "#f39c12" : "#4caf50",
    color: "#fff",
    border: "none",
    borderRadius: "5px",
    fontWeight: "bold",
    cursor: "pointer",
    transition: "background-color 0.3s ease",
  });

  return (
    <div
      style={{
        display: "flex",
        flexWrap: "wrap", // للسماح بالتفاف العناصر في حالة صغر الشاشة
        gap: "1rem",
        marginBottom: "2rem",
        padding: "1rem",
        background: "#f5f7fa",
        borderRadius: "8px",
        boxShadow: "0 2px 5px rgba(0, 0, 0, 0.1)",
        justifyContent: "center", // يجعل العناصر في المنتصف
        flexDirection: "row-reverse", // ترتيب العناصر من اليمين لليسار
         // ضمان عدم التداخل مع Sidebar
      }}
    >
      <button onClick={() => handleFilter("today")} style={buttonStyle("today")}>
        اليوم
      </button>
      <button onClick={() => handleFilter("lastWeek")} style={buttonStyle("lastWeek")}>
        الأسبوع الماضي
      </button>
      <button onClick={() => handleFilter("lastMonth")} style={buttonStyle("lastMonth")}>
        الشهر الحالي
      </button>
      <button
        onClick={() => setCustomSearchVisible(!isCustomSearchVisible)}
        style={{
          padding: "0.75rem 1.5rem",
          backgroundColor: "#3498db",
          color: "#fff",
          border: "none",
          borderRadius: "5px",
          fontWeight: "bold",
          cursor: "pointer",
        }}
      >
        {isCustomSearchVisible ? "إخفاء البحث" : "إظهار البحث"}
      </button>
      {isCustomSearchVisible && (
        <div
          style={{
            display: "flex",
            flexWrap: "wrap", // يجعل الحقول مرنة للشاشات الصغيرة
            alignItems: "center",
            gap: "0.5rem",
            marginTop: "1rem",
            justifyContent: "center",
            flexDirection: "row-reverse", // ترتيب الحقول والأزرار من اليمين لليسار
          }}
        >
          <span>من</span>
          <input
            type="date"
            id="startDate"
            style={{
              padding: "0.5rem",
              borderRadius: "5px",
              border: "1px solid #ccc",
              flex: "1",
              minWidth: "120px",
            }}
          />
          <span>إلى</span>
          <input
            type="date"
            id="endDate"
            style={{
              padding: "0.5rem",
              borderRadius: "5px",
              border: "1px solid #ccc",
              flex: "1",
              minWidth: "120px",
            }}
          />
          
          <button onClick={handleCustomDate} style={buttonStyle("custom")}>
            تطبيق
          </button>
        </div>
      )}
    </div>
  );
  
};

const Home = () => {
  const [counts, setCounts] = useState({ incomplete: 0, completed: 0, canceled: 0 });
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");
  const [activeButton, setActiveButton] = useState("today");

  useEffect(() => {
    const fetchTodayData = async () => {
      setIsLoading(true);
      setError("");
      const today = new Date();
      const startDate = new Date(today.setHours(0, 0, 0, 0)).getTime();
      const endDate = new Date(today.setHours(23, 59, 59, 999)).getTime();
      try {
        const counts = await getOrderCounts(startDate, endDate);
        setCounts(counts);
      } catch (error) {
        console.error("Error fetching data:", error);
        setError("حدث خطأ أثناء جلب بيانات اليوم.");
      } finally {
        setIsLoading(false);
      }
    };

    fetchTodayData();
  }, []);

  return (
    <div
      style={{
        display: "flex",
        minHeight: "100vh", // ضمان امتداد الصفحة بالكامل
      }}
    >
      <Sidebar />
      <div
        style={{
          flex: "1",
          marginLeft: "80px", // ضمان عدم التداخل مع Sidebar
          padding: "2rem",
          fontFamily: "Arial, sans-serif",
        }}
      >
        <h1
          style={{
            color: "#333",
            fontSize: "24px",
            marginBottom: "1rem",
            textAlign: "center",
          }}
        >
          إدارة تطبيق بوصلة
        </h1>
        {error && (
          <div
            style={{
              color: "red",
              backgroundColor: "#ffe6e6",
              padding: "1rem",
              borderRadius: "8px",
              marginBottom: "1rem",
              textAlign: "center",
            }}
          >
            {error}
          </div>
        )}
        <FiltersPanel
          onFilterChange={setCounts}
          setIsLoading={setIsLoading}
          setError={setError}
          activeButton={activeButton}
          setActiveButton={setActiveButton}
        />
        {isLoading ? (
          <div style={{ textAlign: "center", fontSize: "18px", margin: "2rem" }}>
            جاري التحميل...
          </div>
        ) : (
          <div
            style={{
              display: "flex",
              flexWrap: "wrap", // السماح بتغليف العناصر عند تصغير الشاشة
              justifyContent: "center",
              alignItems: "center",
              gap: "1rem",
              marginTop: "2rem",
            }}
          >
            <div
              style={{
                border: "1px solid #e74c3c",
                width: "200px",
                padding: "1rem",
                borderRadius: "8px",
                background: "#fdecea",
                textAlign: "center",
                boxShadow: "0 2px 5px rgba(0, 0, 0, 0.1)",
              }}
            >
              <h3 style={{ color: "#e74c3c", fontSize: "18px" }}>الطلبات غير المكتملة</h3>
              <p style={{ fontSize: "16px", fontWeight: "bold" }}>{`الإجمالي: ${counts.incomplete} طلب`}</p>
            </div>
            <div
              style={{
                border: "1px solid #4caf50",
                width: "200px",
                padding: "1rem",
                borderRadius: "8px",
                background: "#e8f5e9",
                textAlign: "center",
                boxShadow: "0 2px 5px rgba(0, 0, 0, 0.1)",
              }}
            >
              <h3 style={{ color: "#4caf50", fontSize: "18px" }}>الطلبات المكتملة</h3>
              <p style={{ fontSize: "16px", fontWeight: "bold" }}>{`الإجمالي: ${counts.completed} طلب`}</p>
            </div>
            <div
              style={{
                border: "1px solid #ff9800",
                width: "200px",
                padding: "1rem",
                borderRadius: "8px",
                background: "#fff3e0",
                textAlign: "center",
                boxShadow: "0 2px 5px rgba(0, 0, 0, 0.1)",
              }}
            >
              <h3 style={{ color: "#ff9800", fontSize: "18px" }}>الطلبات الملغاة</h3>
              <p style={{ fontSize: "16px", fontWeight: "bold" }}>{`الإجمالي: ${counts.canceled} طلب`}</p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default Home;
