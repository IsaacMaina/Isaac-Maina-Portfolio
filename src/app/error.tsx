"use client";

import type { Metadata } from "next";
import { useEffect } from "react";

export const metadata: Metadata = {
  title: "Something Went Wrong",
  description: "An error occurred on Isaac Maina's portfolio website.",
  openGraph: {
    title: "Something Went Wrong | Isaac Maina Portfolio",
    description: "An error occurred on Isaac Maina's portfolio website.",
    type: "website",
  },
  twitter: {
    title: "Something Went Wrong | Isaac Maina Portfolio",
    description: "An error occurred on Isaac Maina's portfolio website.",
    card: "summary_large_image",
  },
};

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    // Log the error to an error reporting service
    console.error(error);
  }, [error]);

  return (
    <div className="min-h-screen bg-slate-900 text-white flex items-center justify-center">
      <div className="text-center">
        <h2 className="text-4xl font-bold mb-4">Something Went Wrong!</h2>
        <p className="text-xl text-slate-400 mb-8">An unexpected error has occurred.</p>
        <button
          onClick={() => reset()}
          className="btn btn-primary px-6 py-3 rounded-lg hover:scale-105 transition-transform duration-300"
        >
          Try Again
        </button>
      </div>
    </div>
  );
}