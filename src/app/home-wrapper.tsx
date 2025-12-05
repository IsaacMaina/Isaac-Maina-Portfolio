// app/home-wrapper.tsx
import { Suspense } from 'react';
import { getUserProfile } from '@/lib/db-service';
import HomeContent from '@/app/components/HomeContent';
import LoadingSpinner from '@/components/LoadingSpinner';

async function HomeWithData() {
  const profile = await getUserProfile();

  return <HomeContent profile={profile} />;
}

export default function HomeWrapper() {
  return (
    <Suspense fallback={<LoadingSpinner message="Loading home page..." />}>
      <HomeWithData />
    </Suspense>
  );
}