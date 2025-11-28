"use client";
import Post from "../../components/post";
import Comment from "../comments/Comment";
import CommentSection from "../comments/CommentSection";
import PostInfo from "../data";
import { useState, useEffect } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";

const View = () => {
    const urlParams = useParams();
    const postID = urlParams.id as string;
    const [error, setError] = useState("");
    const [data, setData] = useState<PostInfo|null>(null);
    const [success, setSuccess] = useState(false);
    const [loading, setLoading] = useState(true);
    const [updates, setUpdates] = useState(0);

    useEffect(()=> {
        async function fetchPost() {
            try {
                const response = await fetch(`http://localhost:5001/api/parking/spots/${postID}`);
                if (!response.ok) {
                    setError("An error regarding fetching the post has occurred");
                    setLoading(false);
                    return;
                }

                const spotInfo = await response.json();
                const postData: PostInfo = spotInfo.spot;
                
                if (!postData) {
                    setError("Post does not exist");
                    setLoading(false);
                    return;
                }

                setError("");
                setSuccess(true);
                setData(postData);
                setLoading(false);

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
        fetchPost();
    },[postID]);

    if (loading) {
        return (
            <div className="w-full flex flex-col items-center mb-3 pt-20 px-4">
                <div className="text-gray-600">Loading post...</div>
            </div>
        );
    }

    const handleNewComments = () => {
        setUpdates(prev=>prev+1);
    }

    return (
        <div className="w-full flex flex-col items-center mb-3 pt-20 px-4 pb-8">
            {/*Below needs to be tested*/}
            {success ? ( 
                <div className="w-3/4 flex flex-row gap-10">
                    <div className="w-full flex-col">
                        <Post data = {data} postID = {postID || ""}/>
                        <Comment postID={postID || ""} commentSubmitted={handleNewComments}/>
                    </div>
                    <CommentSection postID={postID || ""} updates={updates}/>
                </div>) : 
                (error && <div className="text-red-600"> {error}</div>)
            }
        </div>
    );
}
export default View
