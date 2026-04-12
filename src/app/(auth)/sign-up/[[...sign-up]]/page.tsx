import { redirect } from "next/navigation";
import { SignUp } from "@clerk/nextjs";
import { auth } from "@clerk/nextjs/server";

export default async function SignUpPage() {
  const { userId } = await auth();
  if (userId) redirect("/app");
  return <SignUp />;
}
