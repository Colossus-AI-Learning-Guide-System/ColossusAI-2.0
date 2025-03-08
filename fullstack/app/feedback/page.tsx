"use client";

import { useState } from "react";
import { PageLayout } from "../components/layout/page-layout";

interface FeedbackData {
  name: string;
  email: string;
  isFirstTime: boolean;
  isUserFriendly: boolean;
  message: string;
}

const Feedback = () => {
  const [feedbackData, setFeedbackData] = useState<FeedbackData>({
    name: "",
    email: "",
    isFirstTime: false,
    isUserFriendly: false,
    message: ""
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    console.log(feedbackData); // Replace with your submission logic
    // Reset form
    setFeedbackData({
      name: "",
      email: "",
      isFirstTime: false,
      isUserFriendly: false,
      message: ""
    });
  };

  return (
    <PageLayout>
      <div className="container mx-auto px-4 py-12">
        <div className="max-w-2xl mx-auto">
          <form 
            onSubmit={handleSubmit}
            className="bg-black/30 backdrop-blur-lg rounded-xl p-8 border-2 border-white/20"
          >
            <h1 className="text-3xl font-bold mb-8 text-white">Leave us your feedback...</h1>

            {/* Name Input */}
            <div className="mb-6">
              <label className="block text-white text-lg mb-2">Name</label>
              <input
                type="text"
                value={feedbackData.name}
                onChange={(e) => setFeedbackData({ ...feedbackData, name: e.target.value })}
                className="w-full px-4 py-3 rounded-lg bg-black/30 border-2 border-white/20 text-white"
                required
              />
            </div>

            {/* Email Input */}
            <div className="mb-6">
              <label className="block text-white text-lg mb-2">E-mail</label>
              <input
                type="email"
                value={feedbackData.email}
                onChange={(e) => setFeedbackData({ ...feedbackData, email: e.target.value })}
                className="w-full px-4 py-3 rounded-lg bg-black/30 border-2 border-white/20 text-white"
                required
              />
            </div>

            {/* First Time Visit Radio */}
            <div className="mb-6">
              <label className="block text-white text-lg mb-2">Was this your first time visiting?</label>
              <div className="flex gap-6">
                <label className="inline-flex items-center">
                  <input
                    type="radio"
                    checked={feedbackData.isFirstTime}
                    onChange={() => setFeedbackData({ ...feedbackData, isFirstTime: true })}
                    className="form-radio text-[#FF4A8D] h-5 w-5"
                  />
                  <span className="ml-2 text-white">Yes</span>
                </label>
                <label className="inline-flex items-center">
                  <input
                    type="radio"
                    checked={!feedbackData.isFirstTime}
                    onChange={() => setFeedbackData({ ...feedbackData, isFirstTime: false })}
                    className="form-radio text-[#FF4A8D] h-5 w-5"
                  />
                  <span className="ml-2 text-white">No</span>
                </label>
              </div>
            </div>

            {/* User Friendly Radio */}
            <div className="mb-6">
              <label className="block text-white text-lg mb-2">Was the website innovative and user-friendly?</label>
              <div className="flex gap-6">
                <label className="inline-flex items-center">
                  <input
                    type="radio"
                    checked={feedbackData.isUserFriendly}
                    onChange={() => setFeedbackData({ ...feedbackData, isUserFriendly: true })}
                    className="form-radio text-[#FF4A8D] h-5 w-5"
                  />
                  <span className="ml-2 text-white">Yes</span>
                </label>
                <label className="inline-flex items-center">
                  <input
                    type="radio"
                    checked={!feedbackData.isUserFriendly}
                    onChange={() => setFeedbackData({ ...feedbackData, isUserFriendly: false })}
                    className="form-radio text-[#FF4A8D] h-5 w-5"
                  />
                  <span className="ml-2 text-white">No</span>
                </label>
              </div>
            </div>

            {/* Message Textarea */}
            <div className="mb-6">
              <textarea
                value={feedbackData.message}
                onChange={(e) => setFeedbackData({ ...feedbackData, message: e.target.value })}
                className="w-full px-4 py-3 rounded-lg bg-black/30 border-2 border-white/20 text-white h-32"
                placeholder="Tell us more about your experience..."
              />
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              className="w-full bg-gradient-to-r from-[#FF9F4A] via-[#FF4A8D] to-[#8B4AFF] text-white py-3 rounded-lg font-semibold transition-all duration-300 hover:scale-[1.02]"
            >
              Submit
            </button>
          </form>
        </div>
      </div>
    </PageLayout>
  );
};

export default Feedback;