'use client';

import { useRouter } from "next/navigation";
import { useEffect } from "react";
import Auth from "@/components/Auth";
import { useAuth } from "@/providers/auth-provider";
import { FullScreenSkeleton } from "@/components/ui/skeletons/full-screen-skeleton";

export default function Home() {
  const router = useRouter();
  const { user, isLoading } = useAuth();
  
  useEffect(() => {
    if (user) {
      router.push('/chat');
    }
  }, [user, router]);

  if (isLoading) {
    return <FullScreenSkeleton />;
  }
  
  return (
    <div className="flex flex-col items-center justify-center min-h-screen p-8">
      <Auth />
    </div>
  );
}
