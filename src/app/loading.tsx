// app/loading.tsx
import LoadingSpinner from '@/components/LoadingSpinner';

export default function GlobalLoading() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-900">
      <LoadingSpinner message="Loading page..." size="lg" />
    </div>
  );
}