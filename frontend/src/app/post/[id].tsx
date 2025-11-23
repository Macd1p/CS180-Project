"use client";
import Post from "../components/post";
import Comment from "../components/Comment";
import CommentSection from "../components/CommentSection";
import PostInfo from "./data";
import { useState, useEffect } from "react";
import { useParams } from "next/navigation";

const View = () => {
    const urlParams = useParams();
    const postID = urlParams.id as string;
    const [error, setError] = useState("");
    const [data, setData] = useState<PostInfo|null>(null);
    const [success, setSuccess] = useState(false);
    useEffect(()=> {
        async function fetchPost() {
            try {
                const response = await fetch(`http://localhost:5001/api/parking/spots/${postID}`);
                if (!response.ok) {
                    setError("An error regarding fetching the post has occurred");
                }

                const spotInfo = await response.json();
                const postData: PostInfo = spotInfo.spots?.[0];
                
                if (!postData) {
                    setError("Post does not exist");
                }

                setSuccess(true);
                setData(postData);

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
    },[postID])

    return (
        <div className="w-full flex flex-col items-center mb-3">
            {/*Below needs to be tested*/}
            {success ? ( 
                <div>
                    <Post data = {data} postID = {postID || ""}/>
                    <Comment/>
                    <CommentSection/>
                </div>) : 
                (error && <div className="text-red-600"> {error}</div>)
            }
        </div>
    );
}
export default View