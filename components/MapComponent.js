import dynamic from "next/dynamic";
import React, { useEffect } from "react";
import L from "leaflet";
import { useMap } from "react-leaflet";
import "leaflet/dist/leaflet.css";

const MapContainer = dynamic(() => import("react-leaflet").then((mod) => mod.MapContainer), {
  ssr: false,
});
const TileLayer = dynamic(() => import("react-leaflet").then((mod) => mod.TileLayer), { ssr: false });
const Marker = dynamic(() => import("react-leaflet").then((mod) => mod.Marker), { ssr: false });
const Popup = dynamic(() => import("react-leaflet").then((mod) => mod.Popup), { ssr: false });
const Polyline = dynamic(() => import("react-leaflet").then((mod) => mod.Polyline), { ssr: false });

const svgIcon = encodeURIComponent(
  `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="red" width="32px" height="32px"><path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7zm0 9.5c-1.38 0-2.5-1.12-2.5-2.5S10.62 6.5 12 6.5s2.5 1.12 2.5 2.5S13.38 11.5 12 11.5z"/></svg>`
);

const customIcon = new L.Icon({
  iconUrl: `data:image/svg+xml;charset=utf-8,${svgIcon}`,
  iconSize: [32, 32],
  iconAnchor: [16, 32],
  popupAnchor: [0, -30],
});

const MapUpdater = ({ coordinates }) => {
  const map = useMap();

  useEffect(() => {
    if (map) {
      map.setView(coordinates, 13);
    }
  }, [coordinates, map]);

  return null;
};

const MapComponent = ({ coordinates, routes }) => {
  const getRandomColor = () => {
    const letters = "0123456789ABCDEF";
    let color = "#";
    for (let i = 0; i < 6; i++) {
      color += letters[Math.floor(Math.random() * 16)];
    }
    return color;
  };

  const calculateMidPoint = (start, end) => {
    const midLat = (start.lat + end.lat) / 2;
    const midLon = (start.lon + end.lon) / 2;
    return { lat: midLat, lon: midLon };
  };

  return (
    <MapContainer center={coordinates} zoom={13} style={{ height: "500px", width: "100%" }}>
      <TileLayer
        attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
      />

      {/* التحقق من صحة الإحداثيات قبل الرسم */}
      {routes.map((route, index) => {
        const { start_point, end_point } = route;

        // التحقق من صحة الإحداثيات
        if (
          isNaN(start_point.lat) ||
          isNaN(start_point.lon) ||
          isNaN(end_point.lat) ||
          isNaN(end_point.lon)
        ) {
          console.error(`Invalid route coordinates at index ${index}:`, route);
          return null; // تخطي هذا المسار
        }

        const color = getRandomColor();
        const midPoint = calculateMidPoint(start_point, end_point);

        return (
          <React.Fragment key={index}>
            <Polyline
              positions={[
                [start_point.lat, start_point.lon],
                [end_point.lat, end_point.lon],
              ]}
              color={color}
            />
            <Marker
              position={[midPoint.lat, midPoint.lon]}
              icon={new L.DivIcon({
                html: `<div style="background-color: ${color}; color: white; border-radius: 50%; width: 30px; height: 30px; display: flex; justify-content: center; align-items: center;">${index + 1}</div>`,
                className: "",
              })}
            />
          </React.Fragment>
        );
      })}

      <Marker position={coordinates} icon={customIcon}>
        <Popup>الموقع الحالي</Popup>
      </Marker>
      <MapUpdater coordinates={coordinates} />
    </MapContainer>
  );
};

export default MapComponent;
