"use client";

import { useState } from "react"
import { signIn } from "next-auth/react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Card, CardHeader, CardContent, CardTitle, CardDescription } from "@/components/ui/card"
import { useToast } from "@/components/ui/toast"
import { Briefcase, ArrowRight, Lock, Mail } from "lucide-react"

export default function LoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const router = useRouter();
  const { toast } = useToast();

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!email || !password) {
      toast({
        title: "Validation Error",
        description: "Please fill in all fields",
        variant: "destructive"
      });
      return;
    }

    setLoading(true);
    try {
      const res = await signIn("credentials", {
        redirect: false,
        email,
        password
      });

      if (res?.error) {
        toast({
          title: "Login Failed",
          description: res.error,
          variant: "destructive"
        });
      } else {
        toast({
          title: "Welcome Back",
          description: "Sign-in successful. Loading dashboard...",
          variant: "success"
        });
        router.push("/dashboard");
      }
    } catch (err) {
      toast({
        title: "Error",
        description: "Something went wrong. Please try again.",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center mesh-gradient relative px-4 overflow-hidden dark:bg-slate-950">
      {/* Decorative gradient backgrounds */}
      <div className="absolute top-10 left-10 w-72 h-72 bg-indigo-300/20 dark:bg-indigo-600/10 rounded-full filter blur-3xl pointer-events-none" />
      <div className="absolute bottom-10 right-10 w-80 h-80 bg-purple-300/20 dark:bg-purple-600/10 rounded-full filter blur-3xl pointer-events-none" />

      <Card className="w-full max-w-md shadow-2xl relative z-10 border border-slate-200/40 dark:border-slate-800/40 hover-lift">
        <CardHeader className="space-y-4 flex flex-col items-center text-center pb-4">
          <div className="h-12 w-12 rounded-2xl bg-indigo-600 flex items-center justify-center text-white shadow-lg shadow-indigo-600/20 hover:scale-105 transition-all duration-300">
            <Briefcase className="h-6 w-6" />
          </div>
          <div>
            <CardTitle className="text-2xl font-bold tracking-tight text-slate-900 dark:text-slate-50">Sign In to WorkForce Pro</CardTitle>
            <CardDescription className="text-xs mt-1">Manage your workforce, attendance, and project payroll</CardDescription>
          </div>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-1.5">
              <label htmlFor="email" className="text-xs font-bold text-slate-400 dark:text-slate-500 uppercase tracking-widest">Email Address</label>
              <div className="relative">
                <span className="absolute inset-y-0 left-0 pl-3.5 flex items-center text-slate-400 dark:text-slate-500">
                  <Mail className="h-4.5 w-4.5" />
                </span>
                <Input
                  id="email"
                  type="email"
                  placeholder="name@company.com"
                  className="pl-11"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                />
              </div>
            </div>

            <div className="space-y-1.5">
              <div className="flex items-center justify-between">
                <label htmlFor="password" className="text-xs font-bold text-slate-400 dark:text-slate-500 uppercase tracking-widest">Password</label>
                <a href="#" className="text-xs text-indigo-500 font-semibold hover:underline">Forgot?</a>
              </div>
              <div className="relative">
                <span className="absolute inset-y-0 left-0 pl-3.5 flex items-center text-slate-400 dark:text-slate-500">
                  <Lock className="h-4.5 w-4.5" />
                </span>
                <Input
                  id="password"
                  type="password"
                  placeholder="••••••••"
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
              {loading ? "Authenticating..." : "Sign In"}
              {!loading && <ArrowRight className="h-4 w-4" />}
            </Button>
          </form>

          <p className="text-xs text-slate-400 text-center mt-6">
            Don't have an account?{" "}
            <Link href="/register" className="font-bold text-indigo-500 hover:underline">
              Create a free tenant
            </Link>
          </p>
        </CardContent>
      </Card>
    </div>
  )
}
