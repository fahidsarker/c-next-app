"use server";
import { signIn, signOut } from "@/auth";
import { PATH, Paths } from "@/path";
import { formDataToObject } from "@/utils/formdata-to-object";
import { AuthError } from "next-auth";
import { redirect } from "next/navigation";

export type AuthAction = "logout" | "google" | "credential";

export const handleAuthAction = async (action: AuthAction, data: FormData) => {
  let nError: string | undefined;
  if (action === "logout") {
    await signOut();
    return;
  }
  try {
    switch (action) {
      case "google":
        await signIn("google", {
          redirect: false,
        });
        break;
      case "credential":
        await signIn("credentials", {
          ...formDataToObject(data),
          redirect: false,
        });
    }
  } catch (error) {
    if (error instanceof AuthError) {
      nError = error.message.split("Read more at https://errors.authjs.dev")[0];
    } else {
      throw error;
    }
  }

  if (!nError) {
    // dummy wait for 2 sec
    await new Promise((resolve) => setTimeout(resolve, 2000));
  }
  return nError;
  // redirect(redirectUrl);
};
