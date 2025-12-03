"use client";
import { useState, useEffect } from "react";
import { FaHeart } from "react-icons/fa";
import { motion } from "motion/react";

interface LikePost {
  idPost: string;
  is_liked?: boolean;
  like_count?: number;
}

const LikeButton = ({ idPost, like_count = 0, is_liked = false }: LikePost) => {
  const [currLike, setCL] = useState(is_liked);
  const [likeCount, setLC] = useState(like_count);
  const [error, setError] = useState("");

  // Get the most recent likes and if the user currently liked the post or not
  useEffect(() => {
    setLC(like_count);
    setCL(is_liked);
  }, [is_liked, like_count]);

  const clickLike = async () => {
    const token = localStorage.getItem("fms_token");
    console.log("Current Token:", token); //log token for debugging
    if (!token) {
      setError("You must be logged in to like this post.");
      return;
    }

    //Attempt to post likes otherwise we get an error
    try {
      const response = await fetch(`http://localhost:5001/api/parking/spots/${idPost}`, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
      });

      if (!response.ok) {
        setError("An error regarding fetching the post has occurred");
        return;
      }

      const data = await response.json();

      // Get the post's like count and if the user has liked it or not
      setCL(data.is_liked);
      setLC(data.like_count);
    } catch (error: unknown) {
      if (error instanceof Error) {
        setError("Error: " + error.message);
      } else {
        setError("An error has occurred.");
      }
    }
  };

  return (
    <div className="flex flex-row space-x-1">
      {/*Like Button*/}
      <motion.button
        type="button"
        onClick={clickLike}
        initial={{ scale: 1 }}
        whileHover={{ scale: 1.1 }}
        whileTap={{ scale: 0.9 }}
        className={`${currLike ? "text-red-500" : "text-gray-500"} hover:cursor-pointer`}
      >
        <FaHeart />
      </motion.button>
      <div className="mb-0.5 text-red">({likeCount})</div>
      {error && <div className="cursor-not-allowed" />}
    </div>
  );
};

export default LikeButton;
