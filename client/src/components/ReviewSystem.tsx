import React, { useState } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Star } from "lucide-react";

export default function ReviewSystem() {
  const [reviews, setReviews] = useState([
    {
      id: 1,
      reviewer: "Guest",
      criteria: { cleanliness: 5, communication: 4, accuracy: 5 },
      comment: "Great stay! The property was clean and the host was very responsive.",
      photos: [],
    },
  ]);
  const [newReview, setNewReview] = useState({
    cleanliness: 0,
    communication: 0,
    accuracy: 0,
    comment: "",
    photos: [],
  });

  const handleReviewSubmit = () => {
    if (newReview.comment.trim() === "") return;

    setReviews((prev) => [
      ...prev,
      {
        id: prev.length + 1,
        reviewer: "Guest",
        criteria: {
          cleanliness: newReview.cleanliness,
          communication: newReview.communication,
          accuracy: newReview.accuracy,
        },
        comment: newReview.comment,
        photos: newReview.photos,
      },
    ]);
    setNewReview({ cleanliness: 0, communication: 0, accuracy: 0, comment: "", photos: [] });
  };

  const handlePhotoUpload = (e) => {
    const files = Array.from(e.target.files);
    setNewReview((prev) => ({
      ...prev,
      photos: [...prev.photos, ...files.map((file) => URL.createObjectURL(file))],
    }));
  };

  return (
    <div className="p-4">
      <h1 className="text-2xl font-bold mb-4">Review System</h1>

      <div className="mb-6">
        {reviews.map((review) => (
          <div key={review.id} className="border rounded-lg p-4 mb-4">
            <h2 className="font-semibold">{review.reviewer}</h2>
            <div className="flex gap-4 mt-2">
              <div>Cleanliness: {"⭐".repeat(review.criteria.cleanliness)}</div>
              <div>Communication: {"⭐".repeat(review.criteria.communication)}</div>
              <div>Accuracy: {"⭐".repeat(review.criteria.accuracy)}</div>
            </div>
            <p className="mt-2">{review.comment}</p>
            {review.photos.length > 0 && (
              <div className="flex gap-2 mt-2">
                {review.photos.map((photo, index) => (
                  <img
                    key={index}
                    src={photo}
                    alt={`Review photo ${index + 1}`}
                    className="w-16 h-16 object-cover rounded"
                  />
                ))}
              </div>
            )}
          </div>
        ))}
      </div>

      <div className="border rounded-lg p-4">
        <h2 className="font-semibold mb-2">Leave a Review</h2>
        <div className="flex gap-4 mb-4">
          <div>
            <label className="block text-sm font-medium">Cleanliness</label>
            <Input
              type="number"
              min="0"
              max="5"
              value={newReview.cleanliness}
              onChange={(e) =>
                setNewReview((prev) => ({ ...prev, cleanliness: parseInt(e.target.value) || 0 }))
              }
            />
          </div>
          <div>
            <label className="block text-sm font-medium">Communication</label>
            <Input
              type="number"
              min="0"
              max="5"
              value={newReview.communication}
              onChange={(e) =>
                setNewReview((prev) => ({ ...prev, communication: parseInt(e.target.value) || 0 }))
              }
            />
          </div>
          <div>
            <label className="block text-sm font-medium">Accuracy</label>
            <Input
              type="number"
              min="0"
              max="5"
              value={newReview.accuracy}
              onChange={(e) =>
                setNewReview((prev) => ({ ...prev, accuracy: parseInt(e.target.value) || 0 }))
              }
            />
          </div>
        </div>
        <Textarea
          placeholder="Write your review..."
          value={newReview.comment}
          onChange={(e) => setNewReview((prev) => ({ ...prev, comment: e.target.value }))}
          className="mb-4"
        />
        <div className="mb-4">
          <label className="block text-sm font-medium mb-1">Upload Photos</label>
          <input type="file" multiple onChange={handlePhotoUpload} />
        </div>
        <Button onClick={handleReviewSubmit}>Submit Review</Button>
      </div>
    </div>
  );
}