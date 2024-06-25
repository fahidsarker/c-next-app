"use client";
import React, { useEffect } from "react";
import { handleAuthAction } from "../auth_action";
import { useRouter } from "next/navigation";
import { PATH } from "@/path";
import LoadingPage from "@/components/loading-page";

const Page = ({
  searchParams,
}: {
  searchParams: {
    redirect?: string;
  };
}) => {
  const router = useRouter();
  useEffect(() => {
    handleAuthAction("logout", new FormData()).then(() => {
      router.replace(searchParams.redirect || PATH.LOGIN);
    });
  }, []);
  return <LoadingPage />;
};

export default Page;
