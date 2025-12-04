"use client";
import { useState, useEffect, useMemo } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import Link from "next/link";
import PostInfo from "./data";
import { Input } from "@headlessui/react";
import { IoIosSearch } from "react-icons/io";
import { motion } from "motion/react";

const Gallery = () => {
  const [posts, setPosts] = useState<PostInfo[]>([]); // our posts from the db
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);
  const [search, setSearch] = useState("");

  useEffect(() => {
    async function getPost() {
      try {
        const response = await fetch(`http://localhost:5001/api/parking/spots`);
        if (!response.ok) {
          setError("An error regarding fetching the posts has occurred");
        }

        const data = await response.json();
        if (!data) {
          setError("An error has occurred for getting the posts");
        }

        setPosts(data.spots || []);
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
    getPost();
  }, []);

  const handleSearch = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearch(e.target.value);
  };

  const searchFunction = useMemo(() => {
    // if no user input in search bar, then we can see all posts
    if (!search.trim()) {
      return posts;
    }

    // getting the user's query
    const searchQuery = search.trim().toLowerCase();

    return posts.filter((post) => {
      // search can only query these attributes of a post: title, address, or tags
      // return posts that fits those attributes
      // if the query is the title
      const foundTitle = post.title?.toLowerCase().includes(searchQuery);
      if (foundTitle) {
        return foundTitle;
      }

      // if the query is the address
      const foundAddress = post.address?.toLowerCase().includes(searchQuery);
      if (foundAddress) {
        return foundAddress;
      }

      // if the query is the tags
      let foundTags = false;
      if (post.tags) {
        for (let i = 0; i < post.tags.length; i++) {
          const tag = post.tags[i].toLowerCase();
          if (tag.includes(searchQuery)) {
            foundTags = true;
            return foundTags;
          }
        }
      }
    });
  }, [posts, search]);

  return (
    <div className="w-full flex-col space-y-4 pt-20 px-4">
      <div className="flex justify-center items-center">
        <h1 className="text-2xl font-semibold underline">Posts</h1>
      </div>
      <div className="relative p-2 w-full max-w-xs mx-auto">
        <IoIosSearch className="absolute text-xl mt-1 ml-1 text-gray-500" />
        <Input value={search} onChange={handleSearch} className="w-full pl-8 py-1 border rounded-sm hover:shadow-md" placeholder="Search..." />
      </div>
      {search && <div className="text-sm text-gray-500">Found the following post(s) below that matches {search}</div>}
      {success ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 mb-4">
          {/* if successful, map over the posts state to display each post */}
          {searchFunction.map((post, index) => (
            <motion.div
              key={post.id}
              initial={{ opacity: 0, y: 100 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 1.5, delay: index * 0.2 }}
              whileHover={{
                scale: 1.02,
                boxShadow: "0px 5px 15px rgba(0,0,0,0.2)",
                transition: { duration: 0.2 },
              }}
              whileTap={{ scale: 0.9 }}
            >
              <Link key={post.id} href={`/post/${post.id}`} className="rounded-md shadow-gray-400 cursor-pointer">
                <div className="relative w-full aspect-square rounded-t-md bg-gray-200">
                  <Image src={post.url_for_images || "/images/default-avatar.png"} alt={post.title || "Post image"} fill className="object-cover" />
                </div>
                <div key={post.id} className="p-4 rounded shadow">
                  <h3 className="font-bold text-lg">{post.title}</h3>
                  <p className="text-sm mb-1">{post.description}</p>
                  <div className="space-x-2">
                    {post.tags?.map((tag) => (
                      <span key={tag} className=" bg-blue-500 text-xs text-white rounded-xl px-2 py-1">
                        {tag}
                      </span>
                    ))}
                  </div>
                </div>
              </Link>
            </motion.div>
          ))}
        </div>
      ) : (
        error && <div className="flex items-center text-red-600"> {error}</div>
      )}
      {/*Else, return an error message*/}
    </div>
  );
};

export default Gallery;
