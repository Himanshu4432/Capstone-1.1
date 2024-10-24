"use client";
import { Button } from "@/components/ui/button";
import { db } from "@/utils/db";
import { MockInterview } from "@/utils/schema";
import { eq } from "drizzle-orm";
import { Lightbulb, WebcamIcon } from "lucide-react";
import Link from "next/link";
import React, { useEffect, useState } from "react";
import Webcam from "react-webcam";

function Interview({ params }) {
  const [interviewData, setInterviewData] = useState();
  const [webCamEnabled, setWebCamEnabled] = useState(false);

  useEffect(() => {
    console.log(params);
    getInterviewDetails();
  }, []);
  /**
   * Used to get Interview Details by MockID
   */
  const getInterviewDetails = async () => {
    const result = await db
      .select()
      .from(MockInterview)
      .where(eq(MockInterview.mockId, params.interviewId));

    console.log(result);
    setInterviewData(result[0]);
  };

  return (
    <div className="my-6 flex flex-col items-center">
      <h2 className="font-bold text-2xl">Let's Get Started</h2>
      <div className="flex gap-10 mt-5">
        {/* Webcam and Enable Button */}
        <div className="flex flex-col items-start">
          {webCamEnabled ? (
            <div
              className="flex justify-center items-center"
              style={{ height: 300, width: 300 }}
            >
              <Webcam
                onUserMedia={() => setWebCamEnabled(true)}
                onUserMediaError={() => setWebCamEnabled(false)}
                mirrored={true}
                style={{
                  height: "100%",
                  width: "100%",
                  objectFit: "cover", // Ensures the webcam feed covers the entire area
                }}
              />
            </div>
          ) : (
            <>
              <WebcamIcon className="h-72 w-auto my-7 p-20 bg-secondary rounded-lg border" />
              <Button onClick={() => setWebCamEnabled(true)}>
                Enable Webcam and Microphone
              </Button>
            </>
          )}
        </div>

        {/* Information Divs */}
        <div className="flex flex-col gap-5">
          <div className="flex flex-col my-5 gap-5 p-5 border rounded-lg">
            <h2 className="text-lg">
              <strong>Job Role:</strong> {interviewData?.jobPosition}
            </h2>
            <h2 className="text-lg">
              <strong>Tech Stack:</strong> {interviewData?.jobDescription}
            </h2>
          </div>
          <div>
            <Lightbulb />
            <h2 className="flex gap-2 items-center">
              <strong>Information</strong>
            </h2>
            <h2 className="p-5 border rounded-lg border-yellow-300 bg-yellow-100 text-yellow-500">
              {process.env.NEXT_PUBLIC_INTERVIEW_INFO}
            </h2>
          </div>
        </div>
      </div>

      {/* Start Button */}
      <div className="flex justify-center mt-10">
        <Link href={`/dashboard/interview/${params.interviewId}/start`}>
          <Button className="items-center">Start</Button>
        </Link>
      </div>
    </div>
  );
}

export default Interview;
