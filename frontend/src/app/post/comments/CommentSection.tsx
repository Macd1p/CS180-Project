"use client";
import LikeButton from "./LikeComment";
import { useState, useEffect } from "react";
import CommentInformation from "./info";
import { useRouter } from "next/navigation";
interface PostCommentSection {
  postID: string;
  updates?: number;
}

{
  /*Need to see if the comment gets stored in the backend*/
}

const CommentSection = ({ postID, updates }: PostCommentSection) => {
  const [commentSection, setCommentSection] = useState<CommentInformation[]>([]);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    async function fetchCommentSection() {
      try {
        const token = localStorage.getItem("fms_token");
        console.log("Current Token:", token); //log token for debugging
        if (!token) {
          setError("You must be logged in to like this post.");
          return;
        }

        const response = await fetch(`/api/comments/${postID}`, {
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        });

        if (!response.ok) {
          setError("An error regarding fetching has occurred");
          setSuccess(false);
          return;
        }

        const data = await response.json();
        setCommentSection(data.comments || []);

        setSuccess(true);
      } catch (error: unknown) {
        if (error instanceof Error) {
          setError("Error: " + error.message);
          setSuccess(false);
        } else {
          setError("An error has occurred.");
          setSuccess(false);
        }
      }
    }
    fetchCommentSection();
  }, [postID, updates]);

  setTimeout(() => {
    setSuccess(false);
  }, 2000);

  return (
    <div className="w-full">
      <div className="font-medium border-b-2 mb-2">Comment Section</div>
      <div className="space-y-2">
        {commentSection.map((comment) => (
          <div key={comment.id} className="border-b border-gray-200">
            <div className="flex flex-col justify-between items-start min-w-0">
              <div className="flex flex-row text-sm">
                <div className="font-semibold text-gray-900 mr-1">{comment.author}</div>
                <div className="text-gray-500 flex-shrink-0 whitespace-nowrap">
                  |{" "}
                  {new Date(comment.created_at).toLocaleString("en-US", {
                    timeZone: "America/Los_Angeles",
                    hour: "2-digit",
                    minute: "2-digit",
                    hour12: true,
                    month: "numeric",
                    day: "numeric",
                    year: "numeric",
                  })}
                </div>
              </div>
              <div className="text-gray-700 whitespace-normal break-all text-md min-w-0">{comment.text}</div>
            </div>
            <LikeButton postID={postID} idComment={comment.id} is_liked={comment.is_liked} like_count={comment.like_count} />
          </div>
        ))}
      </div>
    </div>
  );
};

export default CommentSection;
