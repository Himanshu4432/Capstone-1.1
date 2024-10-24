"use client";
import React, { useState } from "react";
import { v4 as uuidv4 } from "uuid";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { chatSession } from "@/utils/GeminiAIModel";
import { LoaderCircle } from "lucide-react";
import { MockInterview } from "@/utils/schema";
import { db } from "@/utils/db";
import { useUser } from "@clerk/nextjs";
import moment from "moment/moment";
import { useRouter } from "next/navigation";

function AddNewInterview() {
  const [openDialog, setOpenDialog] = useState(false);
  const [jobPosition, setJobPosition] = useState();
  const [jobDesc, setJobDesc] = useState();
  const [jobExp, setJobExp] = useState();
  const [loading, setLoading] = useState(false);
  const [jsonResponse, setJsonResponse] = useState([]);

  const router = useRouter();

  const { user } = useUser();

  const onSubmit = async (e) => {
    setLoading(true);
    e.preventDefault();
    const InputPrompt = `Job Position: ${jobPosition}\nJob description: ${jobDesc}\nYears of Experience: ${jobExp}\nDepending on this information, give me ${process.env.NEXT_PUBLIC_INTERVIEW_QUESTION_COUNT} interview questions with answers in JSON format.\nGive question and answer as field in JSON\n example [{question:...,answer...:},{question:...,answer...:}]`;
    const result = await chatSession.sendMessage(InputPrompt);
    const mockJsonResponse = result.response
      .text()
      .replace("```json", "")
      .replace("```", "");
    setJsonResponse(mockJsonResponse);
    console.log(JSON.parse(mockJsonResponse));
    if (mockJsonResponse) {
      const resp = await db
        .insert(MockInterview)
        .values({
          mockId: uuidv4(),
          jobPosition: jobPosition,
          jobDescription: jobDesc,
          jobExperience: jobExp,
          createdBy: user?.primaryEmailAddress?.emailAddress,
          jsonMockResponse: mockJsonResponse,
          createdAt: moment().format("DD-MM-yyyy"),
        })
        .returning({ mockId: MockInterview.mockId });

      console.log("Inserted Id:", resp);
      if (resp) {
        setOpenDialog(false);
        router.push(`/dashboard/interview/${resp[0].mockId}`);
      }
    } else {
      console.log("Gemini Response Error");
    }
    setLoading(false);
  };

  return (
    <div>
      <div
        className="p-10 border rounded-lg bg-secondary hover:scale-105 hover:shadow-md cursor-pointer transition-all"
        onClick={() => setOpenDialog(true)}
      >
        <h2 className="font-bold text-lg text-center">+ Add new</h2>
      </div>
      <Dialog open={openDialog}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle className="font-bold text-xl">
              Describe the Job
            </DialogTitle>
            <DialogDescription>
              <form onSubmit={onSubmit}>
                <div>
                  <h2>Add Details about your job position/role</h2>

                  <div className="mt-7 my-2">
                    <label>Job Role</label>
                    <Input
                      placeholder="Ex:Full Stack Developer"
                      required
                      onChange={(event) => setJobPosition(event.target.value)}
                    />
                  </div>
                  <div className="my-3">
                    <label>Job Description / Tech Stack</label>
                    <Textarea
                      placeholder="Ex: React, Angular, NodeJS"
                      required
                      onChange={(event) => setJobDesc(event.target.value)}
                    />
                  </div>
                  <div className="my-3">
                    <label>Year of Experience</label>
                    <Input
                      placeholder="Ex: 3"
                      type="Number"
                      max="100"
                      required
                      onChange={(event) => setJobExp(event.target.value)}
                    />
                  </div>
                </div>
                <div className="flex gap-5 justify-end">
                  <Button
                    type="button"
                    variant="ghost"
                    onClick={() => setOpenDialog(false)}
                  >
                    Cancel
                  </Button>
                  <Button type="submit" disabled={loading}>
                    {loading ? (
                      <>
                        {" "}
                        <LoaderCircle className="animate-spin" />
                        {"Generating from AI"}
                      </>
                    ) : (
                      "Create Interview"
                    )}
                  </Button>
                </div>
              </form>
            </DialogDescription>
          </DialogHeader>
        </DialogContent>
      </Dialog>
    </div>
  );
}

export default AddNewInterview;
