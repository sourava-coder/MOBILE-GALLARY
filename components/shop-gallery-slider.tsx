"use client";

import { useEffect, useState } from "react";
import type { ShopPhoto } from "@/lib/types";

export default function ShopGallerySlider({
  photos,
  caption,
}: {
  photos: ShopPhoto[];
  caption: string;
}) {
  const [activeIndex, setActiveIndex] = useState(0);

  useEffect(() => {
    if (photos.length < 2) return;
    const timer = window.setTimeout(() => {
      setActiveIndex((current) => (current + 1) % photos.length);
    }, 5000);
    return () => window.clearTimeout(timer);
  }, [activeIndex, photos.length]);

  if (photos.length === 0) return null;

  return (
    <div className="shop-gallery-slider" aria-label="Shop photo gallery">
      <div className="shop-gallery-viewport">
        <div
          className="shop-gallery-track"
          style={{
            width: `${photos.length * 100}%`,
            transform: `translateX(-${activeIndex * (100 / photos.length)}%)`,
          }}
        >
          {photos.map((photo, index) => (
            <div
              className="shop-photo-wrap shop-slide"
              style={{ flex: `0 0 ${100 / photos.length}%` }}
              key={photo.id ?? photo.image_url}
              aria-hidden={index !== activeIndex}
            >
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={photo.image_url} alt={photo.alt_text} className="shop-photo" />
              <span className="photo-caption">{caption}</span>
            </div>
          ))}
        </div>
      </div>
      {photos.length > 1 && (
        <div className="shop-gallery-dots" aria-label="Choose shop photo">
          {photos.map((photo, index) => (
            <button
              type="button"
              className={index === activeIndex ? "active" : ""}
              aria-label={`Show shop photo ${index + 1}`}
              aria-pressed={index === activeIndex}
              key={photo.id ?? `${photo.image_url}-${index}`}
              onClick={() => setActiveIndex(index)}
            />
          ))}
        </div>
      )}
    </div>
  );
}
