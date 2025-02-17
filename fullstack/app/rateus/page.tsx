"use client";

import { useState } from "react";
import { PageLayout } from "../components/layout/page-layout";
import { Star } from "lucide-react";

interface Rating {
  name: string;
  stars: number;
  feedback: string;
  date: string;
}

const RateUs = () => {
  const [rating, setRating] = useState(0);
  const [hoveredRating, setHoveredRating] = useState(0);
  const [name, setName] = useState("");
  const [feedback, setFeedback] = useState("");
  const [savedRatings, setSavedRatings] = useState<Rating[]>([]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (rating === 0 || !name.trim()) return;

    const newRating = {
      name: name.trim(),
      stars: rating,
      feedback,
      date: new Date().toLocaleDateString()
    };

    setSavedRatings([newRating, ...savedRatings]);
    setRating(0);
    setName("");
    setFeedback("");
  };

  return (
    <PageLayout>
      <div className="container mx-auto px-4 py-12">
        <div className="max-w-2xl mx-auto">
          <h1 className="text-4xl font-bold text-center mb-8 text-white">Rate Our Work</h1>
          
          {/* Rating Form */}
          <form onSubmit={handleSubmit} className="bg-black/30 backdrop-blur-lg rounded-xl p-8 mb-12 border-2 border-white/20">
            <div className="mb-6">
              <label className="block text-lg mb-4 text-white">Your Name</label>
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="w-full px-4 py-3 rounded-lg bg-black/30 border-2 border-white/20 text-white"
                placeholder="Enter your name"
                required
              />
            </div>

            <div className="mb-6">
              <label className="block text-lg mb-4 text-white">Your Rating</label>
              <div className="flex gap-2">
                {[1, 2, 3, 4, 5].map((star) => (
                  <button
                    key={star}
                    type="button"
                    onClick={() => setRating(star)}
                    onMouseEnter={() => setHoveredRating(star)}
                    onMouseLeave={() => setHoveredRating(0)}
                    className="transition-transform hover:scale-110"
                  >
                    <Star
                      className={`w-8 h-8 ${
                        star <= (hoveredRating || rating)
                          ? "fill-yellow-400 text-yellow-400"
                          : "text-gray-400"
                      }`}
                    />
                  </button>
                ))}
              </div>
            </div>

            <div className="mb-6">
              <label className="block text-lg mb-4 text-white">Your Feedback</label>
              <textarea
                value={feedback}
                onChange={(e) => setFeedback(e.target.value)}
                className="w-full px-4 py-3 rounded-lg bg-black/30 border-2 border-white/20 text-white"
                rows={4}
                placeholder="Tell us about your experience..."
              />
            </div>

            <button
              type="submit"
              disabled={rating === 0 || !name.trim()}
              className="w-full bg-gradient-to-r from-[#FF9F4A] via-[#FF4A8D] to-[#8B4AFF] text-white py-3 rounded-lg font-semibold disabled:opacity-50 transition-all duration-300 hover:scale-[1.02]"
            >
              Submit Rating
            </button>
          </form>

          {/* Saved Ratings */}
          <div>
            <h2 className="text-2xl font-bold mb-6 text-white">Saved Ratings</h2>
            {savedRatings.length === 0 ? (
              <p className="text-gray-400 text-center">No ratings yet. Be the first to rate!</p>
            ) : (
              <div className="space-y-4">
                {savedRatings.map((savedRating, index) => (
                  <div
                    key={index}
                    className="bg-black/30 backdrop-blur-lg rounded-xl p-6 border-2 border-white/20"
                  >
                    <div className="flex items-center gap-2 mb-3">
                      <span className="text-white font-semibold">{savedRating.name}</span>
                      <span className="text-gray-400 mx-2">•</span>
                      {[...Array(5)].map((_, i) => (
                        <Star
                          key={i}
                          className={`w-5 h-5 ${
                            i < savedRating.stars
                              ? "fill-yellow-400 text-yellow-400"
                              : "text-gray-400"
                          }`}
                        />
                      ))}
                      <span className="text-gray-400 ml-2">{savedRating.date}</span>
                    </div>
                    <p className="text-white">{savedRating.feedback}</p>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </PageLayout>
  );
};

export default RateUs;