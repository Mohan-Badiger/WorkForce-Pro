import "@/app/globals.css"
import { ToastProvider } from "@/components/ui/toast"

export const metadata = {
  title: "WorkForce Pro - Contractor SaaS ERP",
  description: "Manage workers, attendance, wages, advances, expenses, projects, and profits in one system.",
}

export default function RootLayout({ children }) {
  return (
    <html lang="en" className="light">
      <head>
        {/* Google Fonts - Inter & Outfit for premium SaaS visuals */}
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="true" />
        <link href="https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700;800&family=Outfit:wght@400;500;600;700;800&display=swap" rel="stylesheet" />
        <style>{`
          body {
            font-family: 'Inter', sans-serif;
          }
          h1, h2, h3, h4, h5, h6 {
            font-family: 'Outfit', sans-serif;
          }
        `}</style>
      </head>
      <body className="min-h-screen bg-slate-50/50 dark:bg-slate-950 dark:text-slate-100 flex flex-col">
        <ToastProvider>
          {children}
        </ToastProvider>
      </body>
    </html>
  )
}
