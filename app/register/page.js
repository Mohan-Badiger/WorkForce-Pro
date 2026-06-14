"use client";

import { useState } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Card, CardHeader, CardContent, CardTitle, CardDescription } from "@/components/ui/card"
import { useToast } from "@/components/ui/toast"
import { Building2, ArrowRight, User, Lock, Mail } from "lucide-react"

export default function RegisterPage() {
  const [companyName, setCompanyName] = useState("");
  const [adminName, setAdminName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const router = useRouter();
  const { toast } = useToast();

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!companyName || !adminName || !email || !password) {
      toast({
        title: "Validation Error",
        description: "Please fill in all fields",
        variant: "destructive"
      });
      return;
    }

    setLoading(true);
    try {
      const res = await fetch("/api/auth/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ companyName, adminName, email, password })
      });

      const data = await res.json();

      if (!res.ok) {
        toast({
          title: "Registration Failed",
          description: data.error || "Something went wrong",
          variant: "destructive"
        });
      } else {
        toast({
          title: "Onboarding Successful",
          description: "Tenant registered! Please sign in with your credentials.",
          variant: "success"
        });
        router.push("/login");
      }
    } catch (err) {
      toast({
        title: "Error",
        description: "Connection error. Please try again.",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center mesh-gradient relative px-4 overflow-hidden py-12 dark:bg-slate-950">
      {/* Decorative gradient backgrounds */}
      <div className="absolute top-10 left-10 w-72 h-72 bg-indigo-300/20 dark:bg-indigo-600/10 rounded-full filter blur-3xl pointer-events-none" />
      <div className="absolute bottom-10 right-10 w-80 h-80 bg-purple-300/20 dark:bg-purple-600/10 rounded-full filter blur-3xl pointer-events-none" />

      <Card className="w-full max-w-md shadow-2xl relative z-10 border border-slate-200/40 dark:border-slate-800/40 hover-lift">
        <CardHeader className="space-y-4 flex flex-col items-center text-center pb-4">
          <div className="h-12 w-12 rounded-2xl bg-indigo-600 flex items-center justify-center text-white shadow-lg shadow-indigo-600/20 hover:scale-105 transition-all duration-300">
            <Building2 className="h-6 w-6" />
          </div>
          <div>
            <CardTitle className="text-2xl font-bold tracking-tight text-slate-900 dark:text-slate-50">Onboard Your Company</CardTitle>
            <CardDescription className="text-xs mt-1">Setup your contractor tenant account on WorkForce Pro</CardDescription>
          </div>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            
            <div className="space-y-1.5">
              <label htmlFor="company" className="text-xs font-bold text-slate-400 dark:text-slate-500 uppercase tracking-widest">Company / Contractor Name</label>
              <div className="relative">
                <span className="absolute inset-y-0 left-0 pl-3.5 flex items-center text-slate-400 dark:text-slate-500">
                  <Building2 className="h-4.5 w-4.5" />
                </span>
                <Input
                  id="company"
                  type="text"
                  placeholder="e.g. Alpha Builders Ltd"
                  className="pl-11"
                  value={companyName}
                  onChange={(e) => setCompanyName(e.target.value)}
                />
              </div>
            </div>

            <div className="space-y-1.5">
              <label htmlFor="name" className="text-xs font-bold text-slate-400 dark:text-slate-500 uppercase tracking-widest">Owner / Administrator Name</label>
              <div className="relative">
                <span className="absolute inset-y-0 left-0 pl-3.5 flex items-center text-slate-400 dark:text-slate-500">
                  <User className="h-4.5 w-4.5" />
                </span>
                <Input
                  id="name"
                  type="text"
                  placeholder="e.g. Ramesh Kumar"
                  className="pl-11"
                  value={adminName}
                  onChange={(e) => setAdminName(e.target.value)}
                />
              </div>
            </div>

            <div className="space-y-1.5">
              <label htmlFor="email" className="text-xs font-bold text-slate-400 dark:text-slate-500 uppercase tracking-widest">Login Email Address</label>
              <div className="relative">
                <span className="absolute inset-y-0 left-0 pl-3.5 flex items-center text-slate-400 dark:text-slate-500">
                  <Mail className="h-4.5 w-4.5" />
                </span>
                <Input
                  id="email"
                  type="email"
                  placeholder="admin@alphabuilders.com"
                  className="pl-11"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                />
              </div>
            </div>

            <div className="space-y-1.5">
              <label htmlFor="password" className="text-xs font-bold text-slate-400 dark:text-slate-500 uppercase tracking-widest">Secure Password</label>
              <div className="relative">
                <span className="absolute inset-y-0 left-0 pl-3.5 flex items-center text-slate-400 dark:text-slate-500">
                  <Lock className="h-4.5 w-4.5" />
                </span>
                <Input
                  id="password"
                  type="password"
                  placeholder="Choose a strong password"
                  className="pl-11"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                />
              </div>
            </div>

            <Button
              type="submit"
              className="w-full flex items-center gap-2 justify-center font-bold mt-6 h-11 shadow-lg shadow-indigo-600/15"
              disabled={loading}
            >
              {loading ? "Registering Company..." : "Register & Onboard"}
              {!loading && <ArrowRight className="h-4 w-4" />}
            </Button>
          </form>

          <p className="text-xs text-slate-400 text-center mt-6">
            Already have an account?{" "}
            <Link href="/login" className="font-bold text-indigo-500 hover:underline">
              Sign In
            </Link>
          </p>
        </CardContent>
      </Card>
    </div>
  )
}
