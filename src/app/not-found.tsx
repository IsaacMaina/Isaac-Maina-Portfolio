import type { Metadata } from "next";

export async function generateMetadata(): Promise<Metadata> {
  return {
    title: "Page Not Found",
    description: "The page you are looking for does not exist on Isaac Maina's portfolio website.",
    openGraph: {
      title: "Page Not Found | Isaac Maina Portfolio",
      description: "The page you are looking for does not exist on Isaac Maina's portfolio website.",
      type: "website",
    },
    twitter: {
      title: "Page Not Found | Isaac Maina Portfolio",
      description: "The page you are looking for does not exist on Isaac Maina's portfolio website.",
      card: "summary_large_image",
    },
  };
}

export default function NotFound() {
  return (
    <div className="min-h-screen bg-slate-900 text-white flex items-center justify-center">
      <div className="text-center">
        <h2 className="text-4xl font-bold mb-4">404 - Page Not Found</h2>
        <p className="text-xl text-slate-400 mb-8">The page you are looking for does not exist.</p>
        <a 
          href="/" 
          className="btn btn-primary px-6 py-3 rounded-lg hover:scale-105 transition-transform duration-300"
        >
          Go Back Home
        </a>
      </div>
    </div>
  );
}