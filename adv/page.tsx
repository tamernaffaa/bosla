"use client";

import { useState, useEffect } from "react";
import { supabase } from "../utils/supabaseClient"; // تأكد من إعداد Supabase Client
import Layout from "../components/Layout"; // استيراد Layout
import Image from "next/image";

interface Service {
  id: number;
  type1: string;
  ser_name: string;
  ser_nots: string;
  f_type: string;
  f_path: string;
  storeid: string;
  note: string;
}

interface insert_Service {
  
  type1: string;
  ser_name: string;
  ser_nots: string;
  f_type: string;
  f_path: string;
  storeid: string;
  note: string;
}



const ServicesPage = () => {
  const [services, setServices] = useState<Service[]>([]);
  const [selectedService, setSelectedService] = useState<Service | null>(null);
  const [loading, setLoading] = useState(true);
  const [modalOpen, setModalOpen] = useState(false); // نافذة تعديل الاعلان
  const [isProcessing, setIsProcessing] = useState(false); // حالة تنفيذ العمليات
  const [newServiceModalOpen, setNewServiceModalOpen] = useState(false); // نافذة إضافة إعلان جديدة
  const [newService, setNewService] = useState<insert_Service>({
    
    type1: "adv",
    ser_name: "",
    ser_nots: "",
    f_type: "",
    f_path: "",
    storeid: "0",
    note: "",
  });
  const [imageFile, setImageFile] = useState<File | null>(null); // الملف المختار للصورة

  // جلب البيانات من Supabase
  useEffect(() => {
    const fetchServices = async () => {
      setLoading(true);
      const { data, error } = await supabase
        .from("delv_first_table")
        .select("*")
        .eq("type1", "adv");

      if (error) {
        console.error("Error fetching services:", error);
      } else {
        setServices(data as Service[]);
      }

      setLoading(false);
    };

    fetchServices();
  }, []);

  // وظيفة رفع الصور إلى Supabase
  const uploadImage = async (file: File): Promise<string | null> => {
    try {
      const fileName = `${Date.now()}_${file.name}`; // اسم فريد للصورة
      const { error } = await supabase.storage
        .from("stor")
        .upload(fileName, file);

      if (error) {
        console.error("Error uploading image:", error);
        alert("حدث خطأ أثناء رفع الصورة");
        return null;
      }

      return fileName; // إرجاع اسم الصورة الجديدة
    } catch (err) {
      console.error("Unhandled error while uploading:", err);
      return null;
    }
  };

  // تعديل الاعلان
  const updateService = async (updatedService: Service) => {
    setIsProcessing(true);
    try {
      const { error } = await supabase
        .from("delv_first_table")
        .update({
          ser_name: updatedService.ser_name,
          ser_nots: updatedService.ser_nots,
          type1: updatedService.type1,
          f_type: updatedService.f_type,
          f_path: updatedService.f_path, // تحديث اسم الصورة
          storeid: updatedService.storeid,
          note: updatedService.note,
        })
        .eq("id", updatedService.id);

      if (error) {
        alert("حدث خطأ أثناء التحديث");
        console.error("Error updating service:", error);
      } else {
        //alert("تم تحديث الاعلان بنجاح");
        setServices((prev) =>
          prev.map((service) =>
            service.id === updatedService.id ? updatedService : service
          )
        );
        setModalOpen(false);
      }
    } catch (err) {
      console.error("Unhandled error:", err);
    } finally {
      setIsProcessing(false);
    }
  };

  // حذف الاعلان
  const deleteService = async (id: number) => {
    if (!confirm("هل أنت متأكد من أنك تريد حذف هذا الاعلان؟")) {
      return;
    }

    setIsProcessing(true);
    try {
      const { error } = await supabase
        .from("delv_first_table")
        .delete()
        .eq("id", id);

      if (error) {
        alert("حدث خطأ أثناء الحذف");
        console.error("Error deleting service:", error);
      } else {
        //alert("تم حذف الاعلان بنجاح");
        setServices((prev) => prev.filter((service) => service.id !== id));
        setModalOpen(false);
      }
    } catch (err) {
      console.error("Unhandled error while deleting:", err);
    } finally {
      setIsProcessing(false);
    }
  };

  // إضافة اعلان جديدة
  const addNewService = async () => {
    if (!newService || !imageFile) {
      alert("يرجى إدخال البيانات واختيار صورة");
      return;
    }

    setIsProcessing(true);

    const fileName = await uploadImage(imageFile);
    if (!fileName) {
      setIsProcessing(false);
      return;
    }

    try {
      const { data, error } = await supabase
        .from("delv_first_table")
        .insert([{ ...newService, f_path: fileName }])
        .select(); // استرجاع السجل المُضاف
    
      if (error) {
        alert("حدث خطأ أثناء إضافة الاعلان");
        console.error("Error adding service:", error);
      } else if (data && data.length > 0) {
        setServices((prev) => [...prev, data[0]]); // استخدام السجل المُضاف مع id الصحيح
        setNewServiceModalOpen(false);
        setNewService({
          type1: "adv",
          ser_name: "",
          ser_nots: "",
          f_type: "",
          f_path: "",
          storeid: "0",
          note: "",
        });
        setImageFile(null);
      }
    } catch (err) {
      console.error("Unhandled error while adding service:", err);
    } finally {
      setIsProcessing(false);
    }
    
  };

  return (
    <Layout>
      <div style={{ textAlign: "center" }}>
        {/* زر إضافة اعلان جديد */}
        <div style={{
          display: "flex",
          alignItems: "center", // لضمان محاذاة العناصر رأسياً
          justifyContent: "space-between", // لجعل الزر والنص متباعدين
          marginBottom: "2rem",
     }}>
          <button
            onClick={() => setNewServiceModalOpen(true)}
            style={{
              background: "#3498db",
              color: "#fff",
              border: "none",
              padding: "0.5rem 1rem",
              borderRadius: "4px",
              cursor: "pointer",
            }}
          >
            إضافة اعلان جديد
          </button>
          <h1    style={{
        color: "#333",
        fontSize: "32px",
        margin: 0, // إزالة المسافة الافتراضية
        textAlign: "center", // لضمان أن النص في منتصف الحاوية
        flexGrow: 1, // يجعل النص يأخذ المساحة الوسطى
        }}>الإعلانات</h1>
        </div>

        

        {loading ? (
          <p>Loading...</p>
        ) : (
          <ul
          style={{
            listStyle: "none",
            padding: 0,
            margin: "1rem auto",
            display: "grid",
            gridTemplateColumns: "repeat(auto-fit, minmax(300px, 1fr))",
            gap: "1rem",
            
            
            borderRadius: "8px",
            textAlign: "center",
          }}
          
          >
            {services.map((service) => (
              <li
                key={service.id}
                onClick={() => {
                  setSelectedService(service);
                  setModalOpen(true);
                }}
                style={{
                  border: "1px solid #ccc",
                  borderRadius: "8px",
                  padding: "1rem",
                  textAlign: "center",
                  background: "#f9f9f9",
                  cursor: "pointer",
                }}
              >
                <Image
  src={supabase.storage
    .from("stor")
    .getPublicUrl(service.f_path).data.publicUrl}
  alt={service.ser_name}
  width={300} // Set the appropriate width
  height={150} // Set the appropriate height
  style={{
    objectFit: "cover",
    borderRadius: "4px",
    marginBottom: "1rem",
    display: "block", // Center alignment
    margin: "0 auto",
  }}
/>
                <h3 style={{ fontSize: "1.2rem", marginBottom: "0.5rem" }}>
                  {service.ser_name}
                </h3>
              </li>
            ))}
          </ul>
        )}

        {/* نافذة تعديل الاعلان */}
        {modalOpen && selectedService && (
          <div
            style={{
              position: "fixed",
              top: "50%",
              left: "50%",
              transform: "translate(-50%, -50%)",
              background: "#fff",
              padding: "2rem",
              borderRadius: "8px",
              boxShadow: "0 4px 6px rgba(0, 0, 0, 0.1)",
              zIndex: 1000,
              width: "400px",
            }}
          >
            <h2 style={{ marginBottom: "1rem" }}>تعديل الاعلان</h2>
            <Image
  src={supabase.storage
    .from("stor")
    .getPublicUrl(selectedService.f_path).data.publicUrl}
  alt={selectedService.ser_name}
  onClick={() => document.getElementById("imageUpload")?.click()} // فتح اختيار الصورة
  width={200} // عرض الصورة (يُضبط بناءً على احتياجاتك)
  height={100} // ارتفاع الصورة (يُضبط بناءً على احتياجاتك)
  style={{
    objectFit: "cover",
    borderRadius: "4px",
    marginBottom: "1rem",
    cursor: "pointer",
    display: "block", // لضمان أن تكون في المنتصف
    margin: "0 auto",
  }}
/>
                        <input
              id="imageUpload"
              type="file"
              accept="image/*"
              style={{ display: "none" }}
              onChange={async (e) => {
                if (e.target.files && e.target.files[0] && selectedService) {
                  const file = e.target.files[0];
                  const fileName = await uploadImage(file); // رفع الصورة
                  if (fileName) {
                    const updatedService = { ...selectedService, f_path: fileName };
                    updateService(updatedService); // تحديث البيانات في قاعدة البيانات
                    setSelectedService(updatedService); // تحديث الحالة
                  }
                }
              }}
            />
            <form
              onSubmit={(e) => {
                e.preventDefault();
                if (selectedService) {
                  updateService(selectedService);
                }
              }}
            >
              <div style={{ marginBottom: "1rem" }}>
                <label>اسم الاعلان:</label>
                <input
                  type="text"
                  value={selectedService.ser_name}
                  onChange={(e) =>
                    setSelectedService({
                      ...selectedService,
                      ser_name: e.target.value,
                    })
                  }
                  style={{
                    width: "100%",
                    padding: "0.5rem",
                    marginTop: "0.5rem",
                    borderRadius: "4px",
                    border: "1px solid #ccc",
                  }}
                />
              </div>
              <div style={{ marginBottom: "1rem" }}>
                <label>ملاحظات:</label>
                <textarea
                  value={selectedService.ser_nots}
                  onChange={(e) =>
                    setSelectedService({
                      ...selectedService,
                      ser_nots: e.target.value,
                    })
                  }
                  style={{
                    width: "100%",
                    padding: "0.5rem",
                    marginTop: "0.5rem",
                    borderRadius: "4px",
                    border: "1px solid #ccc",
                  }}
                />
              </div>
              <div style={{ display: "flex", justifyContent: "space-between" }}>
                <button
                  type="button"
                  onClick={() => deleteService(selectedService.id)}
                  disabled={isProcessing}
                  style={{
                    background: "#e74c3c",
                    color: "#fff",
                    border: "none",
                    padding: "0.5rem 1rem",
                    borderRadius: "4px",
                    cursor: isProcessing ? "not-allowed" : "pointer",
                  }}
                >
                  {isProcessing ? "جارٍ الحذف..." : "حذف"}
                </button>
                <button
                  type="submit"
                  disabled={isProcessing}
                  style={{
                    background: "#2ecc71",
                    color: "#fff",
                    border: "none",
                    padding: "0.5rem 1rem",
                    borderRadius: "4px",
                    cursor: isProcessing ? "not-allowed" : "pointer",
                  }}
                >
                  {isProcessing ? "جارٍ الحفظ..." : "حفظ"}
                </button>
              </div>
            </form>
            <button
              onClick={() => setModalOpen(false)}
              style={{
                marginTop: "1rem",
                background: "#ccc",
                border: "none",
                padding: "0.5rem 1rem",
                borderRadius: "4px",
                cursor: "pointer",
                width: "100%",
              }}
            >
              إغلاق
            </button>
          </div>
        )}

        {/* نافذة إضافة اعلان جديدة */}
        {newServiceModalOpen && (
          <div
            style={{
              position: "fixed",
              top: "50%",
              left: "50%",
              transform: "translate(-50%, -50%)",
              background: "#fff",
              padding: "2rem",
              borderRadius: "8px",
              boxShadow: "0 4px 6px rgba(0, 0, 0, 0.1)",
              zIndex: 1000,
              width: "400px",
            }}
          >
            <h2 style={{ marginBottom: "1rem" }}>إضافة اعلان جديد</h2>
            <form
              onSubmit={(e) => {
                e.preventDefault();
                addNewService();
              }}
            >
              <div style={{ marginBottom: "1rem" }}>
                <label>اسم الاعلان:</label>
                <input
                  type="text"
                  onChange={(e) =>
                    setNewService({
                      ...newService,
                      ser_name: e.target.value,
                    })
                  }
                  style={{
                    width: "100%",
                    padding: "0.5rem",
                    marginTop: "0.5rem",
                    borderRadius: "4px",
                    border: "1px solid #ccc",
                  }}
                />
              </div>
              <div style={{ marginBottom: "1rem" }}>
                <label>ملاحظات:</label>
                <textarea
                  onChange={(e) =>
                    setNewService({
                      ...newService,
                      ser_nots: e.target.value,
                    })
                  }
                  style={{
                    width: "100%",
                    padding: "0.5rem",
                    marginTop: "0.5rem",
                    borderRadius: "4px",
                    border: "1px solid #ccc",
                  }}
                />
              </div>
              <div style={{ marginBottom: "1rem" }}>
                <label>اختيار صورة:</label>
                <input
                  type="file"
                  accept="image/*"
                  onChange={(e) => {
                    if (e.target.files) {
                      setImageFile(e.target.files[0]);
                    }
                  }}
                  style={{
                    width: "100%",
                    marginTop: "0.5rem",
                  }}
                />
              </div>
              <button
                type="submit"
                disabled={isProcessing}
                style={{
                  background: "#2ecc71",
                  color: "#fff",
                  border: "none",
                  padding: "0.5rem 1rem",
                  borderRadius: "4px",
                  cursor: isProcessing ? "not-allowed" : "pointer",
                  width: "100%",
                }}
              >
                {isProcessing ? "جارٍ الإضافة..." : "إضافة"}
              </button>
            </form>
            <button
              onClick={() => setNewServiceModalOpen(false)}
              style={{
                marginTop: "1rem",
                background: "#ccc",
                border: "none",
                padding: "0.5rem 1rem",
                borderRadius: "4px",
                cursor: "pointer",
                width: "100%",
              }}
            >
              إلغاء
            </button>
          </div>
        )}
      </div>
    </Layout>
  );
};

export default ServicesPage;

