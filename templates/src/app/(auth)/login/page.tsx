import { LoginPage } from "@/components/login-page";
import { getCurrentUser } from "@/repo/user";
import { redirect } from "next/navigation";
import React from "react";

const page = async () => {
  const user = await getCurrentUser();
  if (user) {
    redirect(`/${user.slug}`);
  }
  return <LoginPage />;
};

export default page;
