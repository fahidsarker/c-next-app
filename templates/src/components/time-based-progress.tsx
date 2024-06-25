"use client";
import React, { useEffect } from "react";
import { Progress } from "./ui/progress";

const TimeBasedProgress = ({
  maxProg = 95,
  minProg = 0,
  totalTime = 1000,
}: {
  maxProg?: number;
  minProg?: number;
  totalTime?: number;
}) => {
  const [prog, setProg] = React.useState(minProg);

  const intervals = maxProg - minProg;
  useEffect(() => {
    const interval = setInterval(() => {
      setProg((p) => {
        if (p < maxProg) {
          return p + 1;
        }
        return p;
      });
    }, totalTime / intervals);
    return () => clearInterval(interval);
  }, []);

  return <Progress value={prog} className="w-[60%] max-w-[400px] h-2" />;
};

export default TimeBasedProgress;
