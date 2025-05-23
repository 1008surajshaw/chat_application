'use client';

import { type ReactNode, useEffect, useState } from "react"
import { redirect } from "next/navigation"
import { useAuth } from "@/providers/auth-provider"
import { 
  Home, 
  MessageSquare, 
  BarChart, 
  Settings, 
  HelpCircle, 
  Phone, 
  Users, 
  Star, 
  Archive, 
  AlertCircle ,
  RefreshCw,
  Mail,
  LogOut
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"
import { usePathname } from "next/navigation"
import { useTheme } from "next-themes";
import { Moon, Sun } from "lucide-react"
import { FullScreenSkeleton } from "@/components/ui/skeletons/full-screen-skeleton";
import { AlertDialog, AlertDialogTrigger, AlertDialogContent, AlertDialogHeader, AlertDialogFooter, AlertDialogTitle, AlertDialogDescription } from "@/components/ui/alert-dialog";

interface DashboardLayoutProps {
  children: ReactNode
}

export default function DashboardLayout({ children }: DashboardLayoutProps) {
  const { user, isLoading, signOut } = useAuth()
  
  const { theme, setTheme } = useTheme();
  const pathname = usePathname();
  const [mounted, setMounted] = useState(false);
  const [isDialogOpen, setIsDialogOpen] = useState(false);


  useEffect(() => {
    setMounted(true);
  }, []);
  
  if(isLoading) {
    return <FullScreenSkeleton />
  }

  if (!user && !isLoading) {
    redirect("/")
    
  }

  const toggleTheme = () => {
    setTheme(theme === 'dark' ? 'light' : 'dark');
  };


  const activeTab = (() => {
    if (pathname?.startsWith('/chat')) return 'chat'
    if (pathname?.startsWith('/analytics')) return 'analytics'
    if (pathname?.startsWith('/settings')) return 'settings'
    if (pathname?.startsWith('/users')) return 'users'
    if (pathname?.startsWith('/phone')) return 'phone'
    if (pathname?.startsWith('/star')) return 'star'
    if (pathname?.startsWith('/archive')) return 'archive'
    if (pathname?.startsWith('/alerts')) return 'alerts'
    return 'home'
  })()
  
  const handleTabClick = (tab: string, path: string = `/${tab}`) => {
    redirect(path)
  }

  return (
  
      <div className="flex  bg-gray-50 dark:bg-gray-900">
      
        <div className="w-16 bg-white dark:bg-gray-800 border-r border-gray-200 dark:border-gray-700 flex flex-col items-center py-4">
          {/* Company Logo */}
          <div className="mb-8">
            <div className="w-10 h-10 rounded-md bg-emerald-600 flex items-center justify-center text-white font-bold">
              P
            </div>
          </div>

          {/* Navigation Icons */}
          <nav className="flex flex-col items-center space-y-3 flex-1">
            <Button
              variant="ghost"
              size="icon"
              className={cn(
                "h-10 w-10 rounded-md",
                activeTab === "home"
                  ? "bg-emerald-50 dark:bg-emerald-900 text-emerald-600 dark:text-emerald-400"
                  : "text-gray-500 hover:bg-gray-100 dark:text-gray-400 dark:hover:bg-gray-700",
              )}
              onClick={() => handleTabClick("home", "/dashboard")}
            >
              <Home size={20} />
            </Button>
            <Button
              variant="ghost"
              size="icon"
              className={cn(
                "h-10 w-10 rounded-md",
                activeTab === "chat"
                  ? "bg-emerald-50 dark:bg-emerald-900 text-emerald-600 dark:text-emerald-400"
                  : "text-gray-500 hover:bg-gray-100 dark:text-gray-400 dark:hover:bg-gray-700",
              )}
              onClick={() => handleTabClick("chat", "/chat")}
            >
              <MessageSquare size={20} />
            </Button>
            <Button
              variant="ghost"
              size="icon"
              className={cn(
                "h-10 w-10 rounded-md",
                activeTab === "analytics"
                  ? "bg-emerald-50 dark:bg-emerald-900 text-emerald-600 dark:text-emerald-400"
                  : "text-gray-500 hover:bg-gray-100 dark:text-gray-400 dark:hover:bg-gray-700",
              )}
              onClick={() => handleTabClick("analytics", "/analytics")}
            >
              <BarChart size={20} />
            </Button>
            <Button
              variant="ghost"
              size="icon"
              className={cn(
                "h-10 w-10 rounded-md",
                activeTab === "users"
                  ? "bg-emerald-50 dark:bg-emerald-900 text-emerald-600 dark:text-emerald-400"
                  : "text-gray-500 hover:bg-gray-100 dark:text-gray-400 dark:hover:bg-gray-700",
              )}
              onClick={() => handleTabClick("users", "/users")}
            >
              <Users size={20} />
            </Button>
            <Button
              variant="ghost"
              size="icon"
              className={cn(
                "h-10 w-10 rounded-md",
                activeTab === "phone"
                  ? "bg-emerald-50 dark:bg-emerald-900 text-emerald-600 dark:text-emerald-400"
                  : "text-gray-500 hover:bg-gray-100 dark:text-gray-400 dark:hover:bg-gray-700",
              )}
              onClick={() => handleTabClick("phone", "/phone")}
            >
              <Phone size={20} />
            </Button>
            <Button
              variant="ghost"
              size="icon"
              className={cn(
                "h-10 w-10 rounded-md",
                activeTab === "star"
                  ? "bg-emerald-50 dark:bg-emerald-900 text-emerald-600 dark:text-emerald-400"
                  : "text-gray-500 hover:bg-gray-100 dark:text-gray-400 dark:hover:bg-gray-700",
              )}
              onClick={() => handleTabClick("star", "/star")}
            >
              <Star size={20} />
            </Button>
            <Button
              variant="ghost"
              size="icon"
              className={cn(
                "h-10 w-10 rounded-md",
                activeTab === "archive"
                  ? "bg-emerald-50 dark:bg-emerald-900 text-emerald-600 dark:text-emerald-400"
                  : "text-gray-500 hover:bg-gray-100 dark:text-gray-400 dark:hover:bg-gray-700",
              )}
              onClick={() => handleTabClick("archive", "/archive")}
            >
              <Archive size={20} />
            </Button>
            <Button
              variant="ghost"
              size="icon"
              className={cn(
                "h-10 w-10 rounded-md",
                activeTab === "alerts"
                  ? "bg-emerald-50 dark:bg-emerald-900 text-emerald-600 dark:text-emerald-400"
                  : "text-gray-500 hover:bg-gray-100 dark:text-gray-400 dark:hover:bg-gray-700",
              )}
              onClick={() => handleTabClick("alerts", "/alerts")}
            >
              <AlertCircle size={20} />
            </Button>
            <Button
              variant="ghost"
              size="icon"
              className={cn(
                "h-10 w-10 rounded-md",
                activeTab === "settings"
                  ? "bg-emerald-50 dark:bg-emerald-900 text-emerald-600 dark:text-emerald-400"
                  : "text-gray-500 hover:bg-gray-100 dark:text-gray-400 dark:hover:bg-gray-700",
              )}
              onClick={() => handleTabClick("settings", "/settings")}
            >
              <Settings size={20} />
            </Button>
          </nav>
        </div>

        <div className="flex-1 flex flex-col">
          <header className="h-12 bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 flex items-center justify-between px-4">
            <div className="flex items-center space-x-4">
                <div className="flex items-center space-x-2 font-medium text-gray-800 dark:text-white">
                <MessageSquare className="h-5 w-5" />
                <span>Chat</span>
                </div>
            </div>

            {/* Right side - Actions */}
            <div className="flex items-center space-x-2">
            <Button variant="ghost" size="sm">
            <RefreshCw className="h-4 w-4 mr-1" />
            Refresh
            </Button>

            <Button variant="ghost" size="sm">
              <HelpCircle className="h-4 w-4 mr-1" />
              Help
            </Button>
           

            <Button variant="ghost" size="sm" onClick={() => setIsDialogOpen(true)}>
              <LogOut className="h-4 w-4 mr-1" />
              Logout
            </Button>

            <AlertDialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
              <AlertDialogTrigger asChild>
                <div />
              </AlertDialogTrigger>
              <AlertDialogContent>
                <AlertDialogHeader>
                  <AlertDialogTitle>Are you sure?</AlertDialogTitle>
                  <AlertDialogDescription>
                    This action will log you out of your account.
                  </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                  <Button variant="ghost" onClick={() => setIsDialogOpen(false)}>
                    Cancel
                  </Button>
                  <Button variant="destructive" onClick={signOut}>
                    Logout
                  </Button>
                </AlertDialogFooter>
              </AlertDialogContent>
            </AlertDialog>
            <div className="flex items-center">
                {mounted && (
                  <button
                    className="border p-2.5 rounded-lg text-foreground/60 hover:dark:bg-[#191919] hover:bg-gray-100 md:mx-4 outline-none"
                    onClick={toggleTheme}
                    aria-label="theme"
                  >
                    {theme === 'dark' ? (
                      <Moon className="w-4 h-4" />
                    ) : (
                      <Sun className="w-4 h-4" />
                    )}
                  </button>
                )}
              </div>

            
            </div>
          </header>

          <main className="overflow-auto">{children}</main>
        </div>
      </div>

    
  )
}