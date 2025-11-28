"use client";
import { Textarea, Field, Label } from "@headlessui/react";
import { useState } from "react";
import { IoMdCheckmarkCircleOutline } from "react-icons/io";
import { MdErrorOutline } from "react-icons/md";
{/*Function need to be added: onSubmit for the user to submit their comment to the backend*/}

interface CommentInfo {
    postID: string,
    commentSubmitted?: () => void;
}

const Comment = ({postID, commentSubmitted}:CommentInfo) => {

    const [comment, setComment] = useState("");
    const [error, setError] = useState("");
    const [success, setSuccess] = useState(false);

    const receiveComment = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
        setComment(e.target.value);
    };

    const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        if (!comment.trim()) {
            setError("Empty comment is not allowed");
            return;
        }

        const token = localStorage.getItem('fms_token');
        if (!token) {
            setError("You must be logged in to comment");
            return;
        }

        const commentSubmission = {text:comment.trim()}

        try {
            const response = await fetch(`/api/comments/${postID}`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}` //use token in header
                },
                body: JSON.stringify(commentSubmission)
            });

            if (!response.ok) {
                const errorData = await response.json();
                setError(errorData.error || "An error regarding fetching comments has occurred");
                return;
            }

             // Successful comment submission
            const data = await response.json();
            console.log(data);
            setSuccess(true);

            if (commentSubmitted) {
                commentSubmitted();
            }

            // Clear comment's state
            setComment("");
            setTimeout(() => {setSuccess(false);}, 2000);

        } catch (error: unknown) {
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

    return (
    <form onSubmit={handleSubmit} className="w-full mb-2">
        <Field className="flex flex-col">
            <Label className="font-medium">
                Comment
            </Label>
            <Textarea value = {comment} onChange={receiveComment} className="border-1 mb-2 rounded-sm p-1" placeholder="Type your comment here"></Textarea>
        </Field>
        <button type="submit" className="bg-blue-500 rounded-lg p-1 text-white hover:bg-blue-400">
            Comment
        </button>
        {/*Message for the user to know if the comment was submitted*/}
        {success ? (<div className="flex items-center text-green-600 font-medium"> <IoMdCheckmarkCircleOutline /> Successful Posting!</div>) : (error && <div className="text-red-600"> <MdErrorOutline /> {error}</div>)}
    </form>
);
}

export default Comment
