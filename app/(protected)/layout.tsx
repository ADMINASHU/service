import { auth } from "@/lib/auth";
import { redirect } from "next/navigation";
import Link from "next/link";
import { LogOut, Home, Users, Package, Calendar, BookOpen, Menu, Settings } from "lucide-react";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";

export default async function ProtectedLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await auth();

  if (!session?.user) {
    redirect("/login");
  }

  return (
    <div className="min-h-screen flex flex-col bg-gray-50">
      {/* Navbar */}
      <header className="bg-white border-b sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16 w-full">
            <div className="flex items-center">
              <div className="shrink-0 text-xl font-bold flex flex-col items-start leading-none mr-8">
                AMC Tracker
                <span className="text-[10px] text-gray-500 font-normal mt-1">
                  {session.user.role === 'admin' ? 'Administration' : `${session.user.region} / ${session.user.branch}`}
                </span>
              </div>
              <nav className="hidden md:flex space-x-1">
                <Link href="/dashboard" className="flex items-center gap-2 px-3 py-2 text-sm font-medium text-gray-700 rounded-md hover:bg-gray-100">
                  <Home className="w-4 h-4" /> Dashboard
                </Link>
                <Link href="/customers" className="flex items-center gap-2 px-3 py-2 text-sm font-medium text-gray-700 rounded-md hover:bg-gray-100">
                  <Users className="w-4 h-4" /> Customers
                </Link>
                <Link href="/products" className="flex items-center gap-2 px-3 py-2 text-sm font-medium text-gray-700 rounded-md hover:bg-gray-100">
                  <Package className="w-4 h-4" /> Products
                </Link>
                <Link href="/amc-tracker" className="flex items-center gap-2 px-3 py-2 text-sm font-medium text-gray-700 rounded-md hover:bg-gray-100">
                  <Calendar className="w-4 h-4" /> AMC Tracker
                </Link>
                <Link href="/logbook" className="flex items-center gap-2 px-3 py-2 text-sm font-medium text-gray-700 rounded-md hover:bg-gray-100">
                  <BookOpen className="w-4 h-4" /> Logbook
                </Link>
                {session.user.role === 'admin' && (
                  <>
                    <Link href="/users" className="flex items-center gap-2 px-3 py-2 text-sm font-medium text-gray-700 rounded-md hover:bg-gray-100">
                      <Users className="w-4 h-4" /> Users
                    </Link>
                    <Link href="/settings" className="flex items-center gap-2 px-3 py-2 text-sm font-medium text-gray-700 rounded-md hover:bg-gray-100">
                      <Settings className="w-4 h-4" /> Settings
                    </Link>
                  </>
                )}
              </nav>
            </div>
            
            <div className="flex items-center">
              <Link href="/api/auth/signout" className="hidden md:flex items-center gap-2 px-3 py-2 text-sm font-medium text-red-600 rounded-md hover:bg-red-50 mr-2">
                <LogOut className="w-4 h-4" /> <span>Sign Out</span>
              </Link>
              
              {/* Mobile Hamburger Menu */}
              <div className="md:hidden flex items-center">
                <Sheet>
                  <SheetTrigger className="md:hidden p-2 text-gray-700 hover:bg-gray-100 rounded-md">
                    <Menu className="h-6 w-6" />
                    <span className="sr-only">Toggle navigation menu</span>
                  </SheetTrigger>
                  <SheetContent side="left" className="w-[250px] sm:w-[300px]">
                    <div className="flex flex-col h-full py-6">
                      <div className="text-xl font-bold mb-8 px-2">AMC Tracker</div>
                      <nav className="flex flex-col space-y-2 grow text-lg">
                        <Link href="/dashboard" className="flex items-center gap-3 px-3 py-3 text-gray-700 rounded-md hover:bg-gray-100">
                          <Home className="w-5 h-5" /> Dashboard
                        </Link>
                        <Link href="/customers" className="flex items-center gap-3 px-3 py-3 text-gray-700 rounded-md hover:bg-gray-100">
                          <Users className="w-5 h-5" /> Customers
                        </Link>
                        <Link href="/products" className="flex items-center gap-3 px-3 py-3 text-gray-700 rounded-md hover:bg-gray-100">
                          <Package className="w-5 h-5" /> Products
                        </Link>
                        <Link href="/amc-tracker" className="flex items-center gap-3 px-3 py-3 text-gray-700 rounded-md hover:bg-gray-100">
                          <Calendar className="w-5 h-5" /> AMC Tracker
                        </Link>
                        <Link href="/logbook" className="flex items-center gap-3 px-3 py-3 text-gray-700 rounded-md hover:bg-gray-100">
                          <BookOpen className="w-5 h-5" /> Logbook
                        </Link>
                        {session.user.role === 'admin' && (
                          <>
                            <Link href="/users" className="flex items-center gap-3 px-3 py-3 text-gray-700 rounded-md hover:bg-gray-100">
                              <Users className="w-5 h-5" /> Users
                            </Link>
                            <Link href="/settings" className="flex items-center gap-3 px-3 py-3 text-gray-700 rounded-md hover:bg-gray-100">
                              <Settings className="w-5 h-5" /> Settings
                            </Link>
                          </>
                        )}
                      </nav>
                      <div className="mt-auto border-t pt-4">
                        <Link href="/api/auth/signout" className="flex items-center gap-3 px-3 py-3 font-medium text-red-600 rounded-md hover:bg-red-50">
                          <LogOut className="w-5 h-5" /> Sign Out
                        </Link>
                      </div>
                    </div>
                  </SheetContent>
                </Sheet>
              </div>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-1 w-full max-w-7xl mx-auto p-4 md:p-6 lg:p-8">
        {children}
      </main>
    </div>
  );
}
