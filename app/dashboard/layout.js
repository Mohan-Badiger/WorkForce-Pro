import { auth } from "@/auth"
import { redirect } from "next/navigation"
import Sidebar from "@/components/sidebar"
import Header from "@/components/header"

export default async function DashboardLayout({ children }) {
  const session = await auth();

  // Route protection double check
  if (!session) {
    redirect("/login");
  }

  const user = session.user;

  return (
    <div className="flex min-h-screen bg-slate-50/50 dark:bg-slate-950">
      {/* Navigation Drawer Sidebar */}
      <Sidebar userRole={user.role} />
      
      {/* Workspace Wrapper */}
      <div className="flex-1 flex flex-col md:pl-0 min-w-0">
        <Header user={user} />
        <main className="flex-1 p-6 md:p-8 overflow-y-auto">
          {children}
        </main>
      </div>
    </div>
  )
}
