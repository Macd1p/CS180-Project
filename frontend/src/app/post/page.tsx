"use client";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import Link from "next/link";
import PostInfo from "./data";
import { Input } from "@headlessui/react";
import { IoIosSearch } from "react-icons/io";

const Gallery = () => {
    const [posts, setPosts] = useState<PostInfo[]>([]); // our posts from the db
    const [error, setError] = useState("");
    const [success, setSuccess] = useState(false);

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
                }
                else {
                    setError("An error has occurred.");
                    setSuccess(false);
                }
            }
        }
        getPost();
    }, []);

    return (
        <div className="w-full flex-col space-y-4 pt-20 px-4">
            <h1 className="text-2xl font-bold underline">Posts</h1>
            <div className="relative p-2 w-64">
                <IoIosSearch className="absolute text-xl mt-1 ml-1 text-gray-500" />
                <Input className="pl-6 border rounded-sm hover:shadow-md" placeholder="Search..." />
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mb-4">
                {/*map over the posts state to display each post */}
                {posts.map((post) => (
                    <Link key={post.id} href={`/post/${post.id}`} className="rounded-md shadow-gray-400 hover:shadow-lg cursor-pointer">
                        <div className="relative w-full aspect-square rounded-t-md bg-gray-200">
                            <Image src={post.url_for_images || "/images/default-avatar.png"} alt={post.title || "Post image"} fill className="object-cover"/>
                        </div>
                        <div key={post.id} className="p-4 rounded shadow">
                        <h3 className="font-bold">{post.title}</h3>
                        <p>{post.description}</p>
                    </div>
                    </Link>
                ))}
            </div>
        </div>
    );
}

export default Gallery;
