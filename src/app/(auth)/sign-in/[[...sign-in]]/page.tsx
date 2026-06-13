import { redirect } from "next/navigation";
import { SignIn } from "@clerk/nextjs";
import { auth } from "@clerk/nextjs/server";

export default async function SignInPage() {
  const { userId } = await auth();
  if (userId) redirect("/app");
  return (
    <SignIn
      appearance={{
        elements: {
          cardBox: {
            boxShadow: "none",
            border: "none",
            borderRadius: "0",
          },
          card: {
            boxShadow: "none",
            border: "none",
            borderRadius: "0",
          },
          footer: {
            background: "white",
            border: "none",
            borderRadius: "0",
          },
        },
      }}
    />
  );
}
