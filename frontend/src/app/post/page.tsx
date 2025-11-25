"use client";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import PostInfo from "./data";
import { Input } from "@headlessui/react";
import { IoIosSearch } from "react-icons/io";
import Create from "./create"; // imported create component

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
        <div className="w-full flex-col space-y-4">
            <div className="relative p-2 w-64">
                <IoIosSearch className="absolute text-xl mt-1 ml-1 text-gray-500" />
                <Input className="pl-6 border rounded-sm hover:shadow-md" placeholder="Search..." />
            </div>
            <div className="grid grid-cols-5 gap-4">
                {/*map over the posts state to display each post */}
                {posts.map((post) => (
                    <div key={post.id} className="border p-4 rounded shadow">
                        <h3 className="font-bold">{post.title}</h3>
                        <p>{post.description}</p>
                    </div>
                ))}
            </div>
            <Create />
        </div>
        // updated layout with search bar and grid
    );
}

export default Gallery;
