"use client";
import { db } from "@/utils/db";
import { MockInterview } from "@/utils/schema";
import { eq } from "drizzle-orm";
import React, { useEffect, useState } from "react";
import QuestionsSection from "./QuestionsSection";
import RecordAnswer from "./RecordAnswer";
import { Button } from "@/components/ui/button";
import Link from "next/link";

function StartInterview({ params }) {
  const [interviewData, setInterviewData] = useState();
  const [mockInterviewQuestion, setMockInterviewQuestion] = useState([]);
  const [activeQuestionIndex, setActiveQuestionIndex] = useState(0);

  useEffect(() => {
    getInterviewDetails();
  }, []);

  const getInterviewDetails = async () => {
    const result = await db
      .select()
      .from(MockInterview)
      .where(eq(MockInterview.mockId, params.interviewId));

    const jsonMockResponse = JSON.parse(result[0].jsonMockResponse);
    console.log(jsonMockResponse);

    setMockInterviewQuestion(jsonMockResponse);
    setInterviewData(result[0]);
  };

  return (
    <div>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
        {/* Questions */}
        <QuestionsSection
          mockInterviewQuestion={mockInterviewQuestion}
          activeQuestionIndex={activeQuestionIndex}
        />

        {/* Video/Audio */}
        <RecordAnswer
          mockInterviewQuestion={mockInterviewQuestion}
          activeQuestionIndex={activeQuestionIndex}
          interviewData={interviewData}
        />
      </div>

      <div className="flex justify-end gap-6">
        {activeQuestionIndex > 0 ? (
          <Button
            onClick={() => setActiveQuestionIndex(activeQuestionIndex - 1)}
          >
            Previous
          </Button>
        ) : null}
        {activeQuestionIndex !== mockInterviewQuestion?.length - 1 ? (
          <Button
            onClick={() => setActiveQuestionIndex(activeQuestionIndex + 1)}
          >
            Next
          </Button>
        ) : null}
        {activeQuestionIndex == mockInterviewQuestion?.length - 1 ? (
          <Link href={`/dashboard/interview/${interviewData?.mockId}/feedback`}>
            <Button>End Interview</Button>
          </Link>
        ) : null}
      </div>
    </div>
  );
}

export default StartInterview;
