import { auth } from "@/auth"
import { redirect } from "next/navigation"

export default async function IndexPage() {
  const session = await auth();

  if (session) {
    redirect("/dashboard");
  } else {
    redirect("/login");
  }
}
