"use client";

import Link from "next/link";
import { useState } from "react";
import { PageLayout } from "../components/layout/page-layout";
import { socialLinks } from "./social-data";
import { Particles } from "../components/ui/particles";

const ContactUs = () => {
  const [feedbackData, setFeedbackData] = useState({
    name: "",
    email: "",
    subject: "",
    message: "",
  });

  const [errors, setErrors] = useState({
    name: "",
    email: "",
    subject: "",
    message: "",
  });

  const [submitStatus, setSubmitStatus] = useState({
    success: false,
    message: "",
  });

  const validateEmail = (email: string) => {
    const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return re.test(email);
  };

  const validateForm = () => {
    let isValid = true;
    const newErrors = {
      name: "",
      email: "",
      subject: "",
      message: "",
    };

    if (!feedbackData.name.trim()) {
      newErrors.name = "Name is required";
      isValid = false;
    }

    if (!feedbackData.email.trim()) {
      newErrors.email = "Email is required";
      isValid = false;
    } else if (!validateEmail(feedbackData.email)) {
      newErrors.email = "Please enter a valid email address";
      isValid = false;
    }

    if (!feedbackData.subject.trim()) {
      newErrors.subject = "Subject is required";
      isValid = false;
    }

    if (!feedbackData.message.trim()) {
      newErrors.message = "Message is required";
      isValid = false;
    }

    setErrors(newErrors);
    return isValid;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitStatus({ success: false, message: "" });

    if (!validateForm()) {
      return;
    }

    try {
      const response = await fetch("/api/sendFeedback", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(feedbackData),
      });

      const result = await response.json();

      if (result.success) {
        setSubmitStatus({
          success: true,
          message: "Message sent successfully!",
        });
        setFeedbackData({
          name: "",
          email: "",
          subject: "",
          message: "",
        });
      } else {
        setSubmitStatus({
          success: false,
          message: "Failed to send message. Please try again.",
        });
      }
    } catch (error) {
      console.error("Error sending message:", error);
      setSubmitStatus({
        success: false,
        message: "An error occurred. Please try again later.",
      });
    }
  };

  return (
    <div className="bg-black min-h-screen w-full relative overflow-hidden">
      <Particles
        className="absolute inset-0 pointer-events-none z-10"
        quantity={300}
        staticity={20}
        ease={70}
        color="#FF4A8D"
        refresh={false}
        size={1.5}
        vx={0.2}
        vy={0.2}
      />
      <PageLayout>
        <div className="container mx-auto px-4 py-12">
          <div className="max-w-7xl mx-auto">
            <h1 className="text-4xl font-bold text-center mb-12 text-white">
              Connect With Us
            </h1>

            {/* Social Media Cards Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-12">
              {socialLinks.map((social) => (
                <Link
                  href={social.url}
                  key={social.name}
                  target="_blank"
                  rel="noopener noreferrer"
                  className={`${
                    social.bgColor === "instagram"
                      ? "bg-gradient-to-r from-pink-500 to-orange-500"
                      : "bg-gray-700"
                  } backdrop-blur-lg rounded-lg p-6 text-white transition-all duration-300 transform hover:scale-110 hover:shadow-xl hover:animate-pulse flex flex-col items-center justify-center space-y-4 border-2 border-white/20`}
                >
                  {social.icon}
                  <span className="text-lg font-semibold">{social.name}</span>
                </Link>
              ))}
            </div>

            <div className="max-w-2xl mx-auto">
              <form
                onSubmit={handleSubmit}
                id="contact-form"
                className="bg-black/30 backdrop-blur-lg rounded-xl p-8 border-2 border-white/20"
              >
                <h1 className="text-3xl font-bold mb-4 text-white">
                  Get In Touch!
                </h1>
                <p className="mb-6 text-white/80">
                  Have any questions? We&apos;d love to hear from you.
                </p>

                {submitStatus.message && (
                  <div
                    className={`mb-4 p-3 rounded-lg ${
                      submitStatus.success
                        ? "bg-green-500/20 text-green-200"
                        : "bg-red-500/20 text-red-200"
                    }`}
                  >
                    {submitStatus.message}
                  </div>
                )}

                {/* Name Input */}
                <div className="mb-6">
                  <label className="block text-white text-lg mb-2">Name</label>
                  <input
                    type="text"
                    value={feedbackData.name}
                    onChange={(e) => {
                      setFeedbackData({
                        ...feedbackData,
                        name: e.target.value,
                      });
                      if (errors.name) setErrors({ ...errors, name: "" });
                    }}
                    className={`w-full px-4 py-3 rounded-lg bg-black/30 border-2 ${
                      errors.name ? "border-red-500" : "border-white/20"
                    } text-white focus:outline-none focus:border-blue-500 transition-colors`}
                  />
                  {errors.name && (
                    <p className="mt-1 text-red-400 text-sm">{errors.name}</p>
                  )}
                </div>

                {/* Email Input */}
                <div className="mb-6">
                  <label className="block text-white text-lg mb-2">
                    E-mail
                  </label>
                  <input
                    type="email"
                    value={feedbackData.email}
                    onChange={(e) => {
                      setFeedbackData({
                        ...feedbackData,
                        email: e.target.value,
                      });
                      if (errors.email) setErrors({ ...errors, email: "" });
                    }}
                    className={`w-full px-4 py-3 rounded-lg bg-black/30 border-2 ${
                      errors.email ? "border-red-500" : "border-white/20"
                    } text-white focus:outline-none focus:border-blue-500 transition-colors`}
                  />
                  {errors.email && (
                    <p className="mt-1 text-red-400 text-sm">{errors.email}</p>
                  )}
                </div>

                {/* Subject Input */}
                <div className="mb-6">
                  <label className="block text-white text-lg mb-2">
                    Subject
                  </label>
                  <input
                    type="text"
                    value={feedbackData.subject}
                    onChange={(e) => {
                      setFeedbackData({
                        ...feedbackData,
                        subject: e.target.value,
                      });
                      if (errors.subject) setErrors({ ...errors, subject: "" });
                    }}
                    className={`w-full px-4 py-3 rounded-lg bg-black/30 border-2 ${
                      errors.subject ? "border-red-500" : "border-white/20"
                    } text-white focus:outline-none focus:border-blue-500 transition-colors`}
                  />
                  {errors.subject && (
                    <p className="mt-1 text-red-400 text-sm">
                      {errors.subject}
                    </p>
                  )}
                </div>

                {/* Message Textarea */}
                <div className="mb-6">
                  <label className="block text-white text-lg mb-2">
                    Your Message
                  </label>
                  <textarea
                    value={feedbackData.message}
                    onChange={(e) => {
                      setFeedbackData({
                        ...feedbackData,
                        message: e.target.value,
                      });
                      if (errors.message) setErrors({ ...errors, message: "" });
                    }}
                    className={`w-full px-4 py-3 rounded-lg bg-black/30 border-2 ${
                      errors.message ? "border-red-500" : "border-white/20"
                    } text-white focus:outline-none focus:border-blue-500 transition-colors h-32`}
                    placeholder="Tell us more about your experience..."
                  />
                  {errors.message && (
                    <p className="mt-1 text-red-400 text-sm">
                      {errors.message}
                    </p>
                  )}
                </div>

                {/* Submit Button */}
                <button
                  type="submit"
                  className="w-full bg-gradient-to-r from-[#FF9F4A] via-[#FF4A8D] to-[#8B4AFF] text-white py-3 rounded-lg font-semibold transition-all duration-300 hover:scale-[1.02]"
                >
                  Send Message
                </button>
              </form>
            </div>
          </div>
        </div>
      </PageLayout>
    </div>
  );
};

export default ContactUs;
