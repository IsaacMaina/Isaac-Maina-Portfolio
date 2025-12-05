import type { Metadata } from "next";
import { Inter, Poppins } from "next/font/google";
import "../../app/globals.css"; // Use the same globals.css as the main app
import AuthProvider from '@/components/providers/AuthProvider';

const inter = Inter({ subsets: ["latin"] });
const poppins = Poppins({
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
  variable: "--font-poppins"
});

export const metadata: Metadata = {
  title: "Admin Dashboard - Isaac Maina Portfolio",
  description: "Content management dashboard for Isaac Maina's portfolio",
};

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className={`${inter.className} ${poppins.variable} bg-slate-900 text-white min-h-screen`}>
      <AuthProvider>
        {children}
      </AuthProvider>
    </div>
  );
}