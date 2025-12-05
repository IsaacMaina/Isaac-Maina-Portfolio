// src/app/documents/[category]/layout.tsx
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Document Category | Isaac Maina Portfolio",
  description: "Explore documents in this category from Isaac Maina's portfolio",
};

export default function DocumentCategoryLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}