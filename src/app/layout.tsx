import type { Metadata, Viewport } from "next";
import { Inter, Poppins } from "next/font/google";
import "./globals.css";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import AuthProvider from "@/components/providers/AuthProvider";
import { Toaster } from "react-hot-toast";
import ClientProviders from "@/components/ClientProviders";

const inter = Inter({ subsets: ["latin"] });
const poppins = Poppins({
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
  variable: "--font-poppins"
});

export const metadata: Metadata = {
  title: {
    default: "Isaac Maina - IT Specialist, Web Developer & Data Analyst",
    template: "%s | Isaac Maina Portfolio"
  },
  description: "Official portfolio of Isaac Maina, showcasing expertise in web development, IT support, and data analysis.",
  keywords: ["Isaac Maina", "Portfolio", "Web Developer", "IT Support", "Data Analyst", "Next.js", "React", "Kenya"],
  authors: [{ name: "Isaac Maina" }],
  creator: "Isaac Maina",
  publisher: "Isaac Maina",
  openGraph: {
    type: "website",
    title: "Isaac Maina - IT Specialist, Web Developer & Data Analyst",
    description: "Official portfolio of Isaac Maina, showcasing expertise in web development, IT support, and data analysis.",
    siteName: "Isaac Maina Portfolio",
    images: [
      {
        url: "/og-image.jpg", // Placeholder - you can create an actual og image
        width: 1200,
        height: 630,
        alt: "Isaac Maina Portfolio"
      }
    ]
  },
  twitter: {
    card: "summary_large_image",
    title: "Isaac Maina - IT Specialist, Web Developer & Data Analyst",
    description: "Official portfolio of Isaac Maina, showcasing expertise in web development, IT support, and data analysis.",
  },
  icons: {
    icon: '/favicon.ico',
    shortcut: '/favicon-16x16.png',
    apple: '/apple-touch-icon.png',
  },
  manifest: '/site.webmanifest',
};

export const viewport: Viewport = {
  themeColor: "#0f172a",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className={`${inter.className} ${poppins.variable} bg-slate-900 text-white min-h-screen flex flex-col`}>
        <AuthProvider>
          <ClientProviders>
            <Header />
            <main className="flex-grow">
              {children}
            </main>
            <Footer />
            <Toaster position="bottom-right" toastOptions={{ duration: 3000 }} />
          </ClientProviders>
        </AuthProvider>
      </body>
    </html>
  );
}