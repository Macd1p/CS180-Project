"use client";
import Comment from "./Comment";
import { useState, useEffect } from "react";
import CommentInformation from "./info";
import { useRouter } from "next/navigation";
{/*Loads all the comments stored in the backend */}
interface PostCommentSection {
    postID: string,
    updates?: number;
}

const CommentSection = ({postID, updates}:PostCommentSection) => {
    const [commentSection, setCommentSection] = useState<CommentInformation[]>([]);
    const [success, setSuccess] = useState(true);
    const [error, setError] = useState("");

    useEffect(()=> {
        async function fetchCommentSection() {
            try {
                const response = await fetch(`/api/comments/${postID}`);
                
                if (!response.ok) {
                    setError("An error regarding fetching has occurred");
                    setSuccess(false);
                    return;
                }

                const data = await response.json();
                setCommentSection(data.comments || []);
                
                setSuccess(true);

            } catch (error:unknown) {
                if (error instanceof Error) {
                setError("Error: " + error.message);
                setSuccess(false);
            }
            else {
                setError("An error has occurred.");
                setSuccess(false);
            }
            }
        }
        fetchCommentSection();
    }, [postID, updates]);

    setTimeout(() => {setSuccess(false);}, 2000);

    return (
        <div className="w-full">
            <div className="font-medium border-b-2 mb-2">
                Comment Section
            </div>
            <div className="space-y-2">
                {commentSection.map((comment) => (
                    <div key={comment.id} className="border-b border-gray-200">
                        <div className="flex flex-row justify-between items-start mb-2">
                            <div className="flex-row">
                                <div className="font-semibold text-gray-900 text-sm">
                                    {comment.author}
                                </div>
                                <div className="text-gray-700 whitespace-pre-wrap text-md">
                                    {comment.text}
                                </div>
                            </div>
                            <div className="text-xs text-gray-500">
                                {new Date(comment.created_at).toLocaleString('en-US', {timeZone: 'America/Los_Angeles', hour: '2-digit', minute: '2-digit', hour12: true, month: 'numeric', day: 'numeric', year: 'numeric'})}
                            </div>
                        </div>
                    </div>
                ))}
            </div>

        </div>
    );
}

export default CommentSection;
