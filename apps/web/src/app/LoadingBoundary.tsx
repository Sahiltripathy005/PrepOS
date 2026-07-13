import * as React from "react";

export function LoadingSpinner() {
  return (
    <div className="flex h-full w-full min-h-[200px] items-center justify-center p-4">
      <div className="h-8 w-8 animate-spin rounded-full border-4 border-blue-600 border-t-transparent"></div>
    </div>
  );
}

export function LoadingBoundary({ children }: { children: React.ReactNode }) {
  return <React.Suspense fallback={<LoadingSpinner />}>{children}</React.Suspense>;
}
