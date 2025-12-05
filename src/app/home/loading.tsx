// app/home/loading.tsx
import LoadingSpinner from '@/components/LoadingSpinner';

export default function HomeLoading() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-900">
      <LoadingSpinner message="Loading home page..." size="lg" />
    </div>
  );
}