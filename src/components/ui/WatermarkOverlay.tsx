"use client";

import React from "react";

export default function WatermarkOverlay() {
  // repeating SVG pattern overlay
  const backgroundSvg = "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='100' height='60' viewBox='0 0 100 60'%3E%3Ctext x='50' y='30' font-size='10' font-weight='800' font-family='sans-serif' fill='%23ffffff' fill-opacity='0.18' text-anchor='middle' dominant-baseline='middle' transform='rotate(-35 50 30)'%3EJEJAK PHOTO%3C/text%3E%3C/svg%3E";

  return (
    <div 
      className="absolute inset-0 pointer-events-none select-none z-10"
      style={{
        backgroundImage: `url("${backgroundSvg}")`,
        backgroundRepeat: "repeat",
      }}
    />
  );
}
