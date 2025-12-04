"use client";
import Post from "../../components/post";
import Comment from "../comments/Comment";
import CommentSection from "../comments/CommentSection";
import PostInfo from "../data";
import { useState, useEffect } from "react";
import { useParams } from "next/navigation";
import { useRouter } from "next/navigation";
import { IoIosArrowRoundBack } from "react-icons/io";
import { motion } from "motion/react";

const View = () => {
  const urlParams = useParams();
  const postID = urlParams.id as string;
  const [error, setError] = useState("");
  const [data, setData] = useState<PostInfo | null>(null);
  const [success, setSuccess] = useState(false);
  const [loading, setLoading] = useState(true);
  const [updates, setUpdates] = useState(0);
  const router = useRouter();

  useEffect(() => {
    async function fetchPost() {
      try {
        // Fetch token to make sure that the like button remains liked until the user unlike the post
        const token = localStorage.getItem("fms_token");
        console.log("Current Token:", token); //log token for debugging
        if (!token) {
          setError("You must be logged in to like this post.");
          return;
        }

        const response = await fetch(`http://localhost:5001/api/parking/spots/${postID}`, {
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        });

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
    fetchPost();
  }, [postID]);

  if (loading) {
    return (
      <div className="w-full flex flex-col items-center mb-3 pt-20 px-4">
        <div className="text-gray-600">Loading post...</div>
      </div>
    );
  }

  const handleNewComments = () => {
    setUpdates((prev) => prev + 1);
  };

  {
    /*Go to back to the main Post Page*/
  }
  const goBack = () => {
    router.push("/post");
  };

  return (
    <div className="w-full flex flex-col items-center mb-3 pt-20 px-4 pb-8">
      {/*Below needs to be tested*/}
      {success ? (
        <div className="w-full pt-2">
          <motion.button
            onClick={goBack}
            initial={{ scale: 1 }}
            whileTap={{ scale: 0.9 }}
            className="flex flex-row items-start bg-black text-white rounded-full pt-1.5 pr-1.5 pb-1.5 ml-5 hover:cursor-pointer"
          >
            <IoIosArrowRoundBack className="pt-0.5 text-2xl" />
            Back to Posts
          </motion.button>
          <div className="w-full max-w-5xl mx-auto flex flex-row gap-10 mt-8">
            <div className="flex-1 min-w-0 flex flex-col">
              <Post data={data} postID={postID || ""} />
              <Comment postID={postID || ""} commentSubmitted={handleNewComments} />
            </div>
            <div className="w-1/3 flex-shrink-0">
              <CommentSection postID={postID || ""} updates={updates} />
            </div>
          </div>
        </div>
      ) : (
        error && <div className="text-red-600"> {error}</div>
      )}
    </div>
  );
};
export default View;
