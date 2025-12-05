"use client";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "../providers/AuthProvider";
import { IoMdCheckmarkCircleOutline } from "react-icons/io";
import { MdErrorOutline } from "react-icons/md";

export default function AccountPage() {
    //intializes components state and hooks
    const router = useRouter();
    const { isAuthenticated, isLoading } = useAuth();
    const [firstname, setFirstname] = useState("");
    const [lastname, setLastname] = useState("");
    const [username, setUsername] = useState("");
    const [email, setEmail] = useState("");
    const [profileImage, setProfileImage] = useState("");
    const [imageFile, setImageFile] = useState<File | null>(null);
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [error, setError] = useState("");
    const [success, setSuccess] = useState(false);

    //redirect if not authenticated
    useEffect(() => {
        if (!isLoading && !isAuthenticated) {
            router.push("/sign-in");
        }
    }, [isAuthenticated, isLoading, router]);

    //fetch the users data
    useEffect(() => {
        if (!isAuthenticated) return;

        const fetchProfile = async () => {
            try {
                const token = localStorage.getItem("fms_token");
                const res = await fetch("http://localhost:5001/auth/profile", {
                    headers: {
                        Authorization: `Bearer ${token}`,
                    },
                });
                if (!res.ok) throw new Error("failed to get profile");

                const data = await res.json();
                setFirstname(data.firstname || "");
                setLastname(data.lastname || "");
                setUsername(data.username || "");
                setEmail(data.email || "");
                setProfileImage(data.profile_image || "");
            } 
            
            catch (err) {
                console.error(err);
                setError("could not load the profile.");
            } 
            
            finally {
                setLoading(false);
            }
        };

        fetchProfile();
    }, [isAuthenticated]);

    //handle input changes
    const receiveFirstname = (e: React.ChangeEvent<HTMLInputElement>) => {
        setFirstname(e.target.value);
    };
    const receiveLastname = (e: React.ChangeEvent<HTMLInputElement>) => {
        setLastname(e.target.value);
    }; 
    const receiveUsername = (e: React.ChangeEvent<HTMLInputElement>) => {
        setUsername(e.target.value);
    };

    const receiveImage = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files && e.target.files[0]) {
            setImageFile(e.target.files[0]);
        }
    };
    //handle form submission
    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError("");
        setSuccess(false);
        setSaving(true);
        const token = localStorage.getItem("fms_token");
        if (!token) {
            setError("you are not logged in.");
            setSaving(false);
            return;
        }
        let imageUrl = profileImage;

        //upload image if they want to change it
        if (imageFile) {
            try {
                //get image signature from backend
                const signRes = await fetch("/api/parking/generate-signature", {
                    method: "POST",
                    headers: { Authorization: `Bearer ${token}` },
                });

                if (!signRes.ok) throw new Error("failed to get upload permission");

                const { timestamp, signature, cloud_name, api_key } = await signRes.json();

                //upload new image to cloudinary
                const uploadData = new FormData();
                uploadData.append("file", imageFile);
                uploadData.append("timestamp", timestamp);
                uploadData.append("signature", signature);
                uploadData.append("api_key", api_key);

                const uploadRes = await fetch(
                    `https://api.cloudinary.com/v1_1/${cloud_name}/image/upload`,
                    { method: "POST", body: uploadData }
                );

                if (!uploadRes.ok) throw new Error("image upload failed");

                const uploadJson = await uploadRes.json();
                imageUrl = uploadJson.secure_url;
            } 
            catch (err: any) {
                setError(err.message || "image upload failed");
                setSaving(false);
                return;
            }
        }
        try { //update profile
            const res = await fetch("http://localhost:5001/auth/update-profile", {
                method: "PUT",
                headers: {
                    "Content-Type": "application/json",
                    Authorization: `Bearer ${token}`,
                },
                body: JSON.stringify({
                    firstname: firstname,
                    lastname: lastname,
                    username: username,
                    profile_image: imageUrl,
                }),
            });

            if (!res.ok) {
                const errData = await res.json();
                throw new Error(errData.error || "failed to update profile");
            }
            //update local storage profile image if changed
            if (imageUrl) {
                localStorage.setItem("fms_avatar", imageUrl);
                //dispatch event to update header
                window.dispatchEvent(new StorageEvent("storage", { key: "fms_avatar", newValue: imageUrl }));
            }

            setSuccess(true);
            setProfileImage(imageUrl);
            setImageFile(null);
        } catch (err: any) {
            setError(err.message);
        } finally {
            setSaving(false);
        }
    };

    if (loading) return <div className="pt-24 text-center">Loading...</div>;
    return (
        <main className="mx-auto max-w-2xl px-4 pt-24 pb-12">
            <h1 className="mb-8 text-3xl font-bold">Edit Account</h1>
            <form onSubmit={handleSubmit} className="space-y-6 rounded-2xl border bg-white p-6 shadow-sm">
                {/* profile image */}
                <div className="flex items-center gap-6">
                    <div className="relative h-24 w-24 overflow-hidden rounded-full border bg-gray-100">
                        {imageFile ? (
                            <img
                                src={URL.createObjectURL(imageFile)}
                                alt="Preview"
                                className="h-full w-full object-cover"
                            />
                        ) : profileImage ? (
                            <img
                                src={profileImage}
                                alt="Profile"
                                className="h-full w-full object-cover"
                            />
                        ) : (
                            <div className="grid h-full w-full place-items-center text-gray-400">
                                No Img
                            </div>
                        )}
                    </div>
                    <div>
                        <label className="mb-1 block text-sm font-medium text-gray-700">
                            Profile Photo
                        </label>
                        <input
                            type="file"
                            accept="image/*"
                            onChange={receiveImage}
                            className="text-sm text-gray-500 file:mr-4 file:rounded-full file:border-0 file:bg-violet-50 file:px-4 file:py-2 file:text-sm file:font-semibold file:text-violet-700 hover:file:bg-violet-100"
                        />
                    </div>
                </div>
                <div className="grid gap-6 md:grid-cols-2">
                    <div>
                        <label className="mb-1 block text-sm font-medium text-gray-700">
                            First Name
                        </label>
                        <input
                            type="text"
                            value={firstname}
                            onChange={receiveFirstname}
                            className="w-full rounded-lg border px-3 py-2 outline-none focus:ring-2 focus:ring-violet-500"
                        />
                    </div>
                    <div>
                        <label className="mb-1 block text-sm font-medium text-gray-700">
                            Last Name
                        </label>
                        <input
                            type="text"
                            value={lastname}
                            onChange={receiveLastname}
                            className="w-full rounded-lg border px-3 py-2 outline-none focus:ring-2 focus:ring-violet-500"
                        />
                    </div>
                </div>
                <div>
                    <label className="mb-1 block text-sm font-medium text-gray-700">
                        Username
                    </label>
                    <input
                        type="text"
                        value={username}
                        onChange={receiveUsername}
                        className="w-full rounded-lg border px-3 py-2 outline-none focus:ring-2 focus:ring-violet-500"
                    />
                </div>
                <div className="pt-4">
                    <button
                        type="submit"
                        disabled={saving}
                        className="flex w-full items-center justify-center rounded-lg bg-violet-600 px-4 py-2.5 font-semibold text-white hover:bg-violet-500 disabled:opacity-50"
                    >
                        {saving ? "Saving..." : "Save Changes"}
                    </button>
                </div>

                {success && (
                    <div className="flex items-center gap-2 rounded-lg bg-green-50 p-3 text-green-700">
                        <IoMdCheckmarkCircleOutline className="text-xl" />
                        <span>Profile updated successfully!</span>
                    </div>
                )}

                {error && (
                    <div className="flex items-center gap-2 rounded-lg bg-red-50 p-3 text-red-700">
                        <MdErrorOutline className="text-xl" />
                        <span>{error}</span>
                    </div>
                )}
            </form>
        </main>
    );
}
