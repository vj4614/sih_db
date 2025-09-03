"use client";

import React from 'react';

export default function WaveAnimation() {
  return (
    <div className="wave-animation-overlay">
      <div className="wave wave-back"></div>
      <div className="wave wave-mid"></div>
      <div className="wave wave-front"></div>
    </div>
  );
}