import React from "react";
import TimeBasedProgress from "./time-based-progress";

const LoadingPage = () => {
  return (
    <main className="min-h-screen flex items-center justify-center flex-col gap-8">
      <TimeBasedProgress totalTime={5000} minProg={15} maxProg={95} />
    </main>
  );
};

export default LoadingPage;
