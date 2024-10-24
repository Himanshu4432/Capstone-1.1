"use client";
import { Button } from "@/components/ui/button";
import Image from "next/image";
import React, { useEffect, useState } from "react";
import Webcam from "react-webcam";
import useSpeechToText from "react-hook-speech-to-text";
import { Mic } from "lucide-react";
import { toast } from "sonner";
import { chatSession } from "@/utils/GeminiAIModel";
import { db } from "@/utils/db";
import { UserAnswer } from "@/utils/schema";
import { useUser } from "@clerk/nextjs";
import moment from "moment";

function RecordAnswer({
  mockInterviewQuestion,
  activeQuestionIndex,
  interviewData,
}) {
  const [userAnswer, setUserAnswer] = useState("");
  const { user } = useUser();
  const [loading, setLoading] = useState(false);

  const {
    error,
    interimResult,
    isRecording,
    results,
    setResults,
    startSpeechToText,
    stopSpeechToText,
  } = useSpeechToText({
    continuous: true,
    useLegacyResults: false,
  });

  useEffect(() => {
    results.map((result) => {
      setUserAnswer((prevAns) => prevAns + result?.transcript);
    });
  }, [results]);

  useEffect(() => {
    if (!isRecording && userAnswer.length > 10) {
      updateUserAnswerInDb();
    }
  }, [userAnswer]);

  const startStopRecording = () => {
    if (isRecording) {
      stopSpeechToText();
    } else {
      startSpeechToText();
    }
  };

  const updateUserAnswerInDb = async () => {
    setLoading(true);
    const feedbackPrompt = `Question: ${mockInterviewQuestion[activeQuestionIndex]?.question}\nAnswer: ${userAnswer}, Act like a senior interviewer and please give rating (out of 10) for the answer provided by the candidate for the question asked and provide feedback on area of improvement if any, Keep it around 3 to 5 lines only. Please provide the output as JSON, example: {rating: 8, feedback:...}`;
    const result = await chatSession.sendMessage(feedbackPrompt);

    const mockJsonResponse = result.response
      .text()
      .replace("```json", "")
      .replace("```", "");
    console.log(mockJsonResponse);
    const jsonFeedbackResp = JSON.parse(mockJsonResponse);

    const resp = await db.insert(UserAnswer).values({
      mockIdRef: interviewData?.mockId,
      question: mockInterviewQuestion[activeQuestionIndex]?.question,
      sampleAns: mockInterviewQuestion[activeQuestionIndex]?.answer,
      userAns: userAnswer,
      feedback: jsonFeedbackResp?.feedback,
      rating: jsonFeedbackResp?.rating,
      userEmail: user?.primaryEmailAddress?.emailAddress,
      createdAt: moment().format("DD-MM-yyyy"),
    });

    if (resp) {
      toast("User answer recorded successfully");
      setUserAnswer("");
      setResults([]);
    }
    setResults([]);
    setLoading(false);
  };

  return (
    <div className="flex flex-col justify-center items-center">
      <div className="flex flex-col mt-20 justify-center items-center bg-black rounded-lg p-5">
        <Image
          src={"/webcam.png"}
          width={200}
          height={200}
          className="absolute"
        />
        <Webcam
          mirrored={true}
          style={{
            height: 350,
            width: "100%",
            zIndex: 10,
          }}
        />
      </div>
      <Button
        disabled={loading}
        variant="outline"
        className="my-10"
        onClick={startStopRecording}
      >
        {isRecording ? (
          <h2 className="text-red-600 flex gap-2">
            {" "}
            <Mic /> Recording..{" "}
          </h2>
        ) : (
          "Record Answer"
        )}
      </Button>
      {/* <Button onClick={() => console.log(userAnswer)}>Show User Answer</Button> */}
    </div>
  );
}

export default RecordAnswer;
