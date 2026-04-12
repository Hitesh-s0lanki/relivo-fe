import { redirect } from "next/navigation";
import { SignIn } from "@clerk/nextjs";
import { auth } from "@clerk/nextjs/server";

export default async function SignInPage() {
  const { userId } = await auth();
  if (userId) redirect("/app");
  return <SignIn />;
}
