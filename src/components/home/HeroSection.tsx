"use client";

import { useEffect, useState } from "react";
import { useHomeData } from "@/hooks/useAnime";
import Link from "next/link";

export default function HeroSection() {
  const { data, isLoading, isError } = useHomeData();
  const [currentIndex, setCurrentIndex] = useState(0);

  if (isLoading) {
    return (
      <div className="h-[70vh] flex items-center justify-center text-white">
        Loading...
      </div>
    );
  }

  if (isError || !data) {
    return (
      <div className="h-[70vh] flex items-center justify-center text-red-500">
        Failed to load content
      </div>
    );
  }

  // 🔥 Strong fallback logic
  const spotlight =
    data?.spotlightAnimes ||
    data?.spotlight ||
    data?.featuredAnimes?.topAiringAnimes ||
    data?.mostPopularAnimes ||
    data?.mostFavoriteAnimes ||
    data?.newAdded ||
    [];

  if (!Array.isArray(spotlight) || spotlight.length === 0) {
    return null;
  }

  const current = spotlight[currentIndex];

  // 🔥 Auto slide
  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentIndex((prev) =>
        prev === spotlight.length - 1 ? 0 : prev + 1
      );
    }, 5000);

    return () => clearInterval(interval);
  }, [spotlight.length]);

  return (
    <div className="relative h-[75vh] w-full overflow-hidden text-white">
      
      {/* Background Image */}
      <img
        src={current?.poster || current?.image}
        alt={current?.name || current?.title}
        className="absolute inset-0 w-full h-full object-cover"
      />

      {/* Overlay */}
      <div className="absolute inset-0 bg-gradient-to-r from-black via-black/70 to-transparent" />

      {/* Content */}
      <div className="relative z-10 h-full flex flex-col justify-center px-8 md:px-16 max-w-3xl">
        <h1 className="text-4xl md:text-6xl font-bold mb-4">
          {current?.name || current?.title}
        </h1>

        <p className="text-gray-300 mb-6 line-clamp-3">
          {current?.description || "No description available."}
        </p>

        <div className="flex gap-4">
          <Link
            href={`/watch/${current?.id}`}
            className="bg-red-600 px-6 py-3 rounded-md font-semibold hover:bg-red-700 transition"
          >
            ▶ Watch Now
          </Link>

          <Link
            href={`/anime/${current?.id}`}
            className="bg-white/20 px-6 py-3 rounded-md font-semibold hover:bg-white/30 transition"
          >
            Details
          </Link>
        </div>
      </div>

      {/* Dots */}
      <div className="absolute bottom-6 left-1/2 -translate-x-1/2 flex gap-2">
        {spotlight.map((_, index) => (
          <button
            key={index}
            onClick={() => setCurrentIndex(index)}
            className={`w-3 h-3 rounded-full ${
              currentIndex === index
                ? "bg-white"
                : "bg-white/40"
            }`}
          />
        ))}
      </div>
    </div>
  );
}
