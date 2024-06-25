import { SignupPage } from "@/components/signup-page";
import React from "react";

const page = ({
  searchParams,
}: {
  searchParams: {
    error?: string;
  };
}) => {
  return <SignupPage />;
};

export default page;
