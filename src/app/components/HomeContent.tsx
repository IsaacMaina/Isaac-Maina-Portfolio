// src/app/components/HomeContent.tsx

import Link from "next/link";
import SupabaseImage from '@/components/SupabaseImage';
import ScrollAnimatedElement from '@/components/ScrollAnimatedElement';

interface ProfileData {
  name: string;
  title: string;
  about: string;
  image: string;
  skills: string[];
  location?: string;
  phone?: string;
  careerFocus?: string;
}

export default function HomeContent({ profile }: { profile: ProfileData }) {
  return (
    <div className="min-h-screen bg-slate-900 text-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12 md:py-16">
        <div className="flex flex-col items-center md:flex-row md:items-center md:justify-between gap-8 md:gap-0">
          <div className="w-full md:w-1/2 text-center md:text-left">
            <ScrollAnimatedElement variant="slideUp" className="mb-3 sm:mb-4">
              <div className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl xl:text-6xl font-bold leading-tight">
                Hi, I'm{" "}
                <span className="text-accent-cyan">
                  {profile.name || "Isaac Maina"}
                </span>
              </div>
            </ScrollAnimatedElement>

            <ScrollAnimatedElement variant="slideUp" delay={0.1} className="mb-4 sm:mb-6">
              <div className="text-base sm:text-lg md:text-xl lg:text-2xl text-slate-300">
                {profile.title ||
                  profile.careerFocus ||
                  profile.skills.join(" • ")}
              </div>
            </ScrollAnimatedElement>

            <ScrollAnimatedElement variant="slideUp" delay={0.2} className="mb-6 sm:mb-8 max-w-lg mx-auto md:mx-0">
              <div className="text-sm sm:text-base md:text-lg text-slate-400">
                {profile.about}
              </div>
            </ScrollAnimatedElement>

            <ScrollAnimatedElement variant="slideUp" delay={0.3}>
              <div className="flex flex-col sm:flex-row gap-3 sm:gap-4 justify-center md:justify-start">
                <Link
                  href="/api/cv/download"
                  className="btn btn-primary px-5 py-2.5 sm:px-6 sm:py-3 text-sm sm:text-base font-medium hover:scale-[1.03] transition-transform duration-300"
                >
                  View Career Documents
                </Link>
                <Link
                  href="/projects"
                  className="btn btn-secondary px-5 py-2.5 sm:px-6 sm:py-3 text-sm sm:text-base font-medium hover:scale-[1.03] transition-transform duration-300"
                >
                  View Projects
                </Link>
              </div>
            </ScrollAnimatedElement>
          </div>

          <ScrollAnimatedElement variant="zoomIn" delay={0.4} className="w-full md:w-1/2 flex justify-center">
            {/* Profile image */}
            <div className="relative">
              <div className="w-40 h-40 sm:w-48 sm:h-48 md:w-56 md:h-56 lg:w-64 lg:h-64 xl:w-80 xl:h-80 rounded-full bg-slate-700 border-2 sm:border-4 border-accent-cyan overflow-hidden mx-auto">
                <SupabaseImage
                  filePath={profile.image}
                  alt={`${profile.name || "Isaac Maina"}'s profile`}
                  className="w-full h-full object-cover"
                />
              </div>
              <div className="absolute -bottom-3 -right-3 sm:-bottom-4 sm:-right-4 bg-accent-cyan text-slate-900 px-3 py-1.5 sm:px-4 sm:py-2 rounded-full font-bold text-xs sm:text-sm md:text-base">
                Available for work
              </div>
            </div>
          </ScrollAnimatedElement>
        </div>

        {/* Add proper spacing between main content and skills section */}
        <div className="mt-16 sm:mt-20 md:mt-24 lg:mt-28 xl:mt-32"></div>

        {/* Skills preview section */}
        <ScrollAnimatedElement variant="slideUp" delay={0.6}>
          <div className="mt-16 sm:mt-20 md:mt-24 lg:mt-28 xl:mt-32">
            <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold mb-6 sm:mb-8 text-center">
              Specialized Skills
            </h2>
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3 sm:gap-4 md:gap-6">
              {profile.skills?.map((skill, index) => (
                <ScrollAnimatedElement
                  key={index}
                  variant="slideUp"
                  delay={0.2 + index * 0.05}
                  as="div"
                >
                  <div
                    className="bg-slate-800 rounded-lg sm:rounded-xl p-3 sm:p-4 md:p-6 text-center hover:scale-[1.03] transition-transform duration-300"
                  >
                    <h3 className="text-sm sm:text-base md:text-lg font-semibold">
                      {skill}
                    </h3>
                  </div>
                </ScrollAnimatedElement>
              ))}
            </div>
          </div>
        </ScrollAnimatedElement>
      </div>
    </div>
  );
}
