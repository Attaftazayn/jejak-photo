"use client";

import React from "react";

export default function WatermarkOverlay() {
  // repeating SVG pattern overlay
  const backgroundSvg = "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='80' height='48' viewBox='0 0 80 48'%3E%3Ctext x='40' y='24' font-size='8' font-weight='800' font-family='sans-serif' fill='%23000000' fill-opacity='0.20' text-anchor='middle' dominant-baseline='middle' transform='rotate(-45 40 24)'%3EJEJAK PHOTO%3C/text%3E%3C/svg%3E";

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
