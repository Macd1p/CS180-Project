"use client";
import { Dialog, DialogTitle, DialogPanel, Description, Textarea, Label, Input, Field } from "@headlessui/react";
import { IoMdCheckmarkCircleOutline } from "react-icons/io";
import { MdErrorOutline } from "react-icons/md";
import { useState } from "react";
import { useRouter } from "next/navigation";

interface DeleteModal {
  open: boolean;
  setOpen: (value: boolean) => void;
  postID: string;
}

const Delete = ({ open, setOpen, postID }: DeleteModal) => {
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState("");
  const router = useRouter();

  const handleDelete = async (postID: string) => {
    try {
      const response = await fetch(`/api/parking/spots/${postID}`, {
        method: "DELETE",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${localStorage.getItem("fms_token")}`,
        },
      });

      if (!response.ok) {
        setError("An error regarding fetching has occurred");
        return;
      }

      // Successfully deleted the post
      setSuccess(true);
      setOpen(false);
      // Redirect back to /parking/spots page
      setTimeout(() => {
        router.push("/post");
      }, 2000);
    } catch (error) {
      if (error instanceof Error) {
        setError("Error: " + error.message);
        setSuccess(false);
      } else {
        setError("An error has occurred.");
        setSuccess(false);
      }
    }
  };

  return (
    <Dialog open={open} onClose={() => setOpen(false)}>
      <div className="fixed inset-0 flex items-center justify-center backdrop-blur-sm">
        <DialogPanel className="border bg-white p-5 space-y-2">
          <DialogTitle className="font-medium">Are you sure that you want to delete your post?</DialogTitle>
          <div className="flex gap-4 cursor-pointer">
            <button type="button" onClick={() => setOpen(false)} className="cursor-pointer hover:text-gray-500">
              Cancel
            </button>
            <button onClick={() => handleDelete(postID)} className="bg-red-600 text-white cursor-pointer hover:bg-red-500 pl-1 pr-1 rounded-md">
              Delete
            </button>
            {/*Message for the user to know if the post was submitted*/}
            {success ? (
              <div className="flex items-center text-green-600 font-medium">
                {" "}
                <IoMdCheckmarkCircleOutline /> Successful Posting!
              </div>
            ) : (
              error && (
                <div className="flex items-center text-red-600">
                  {" "}
                  <MdErrorOutline /> Error: {error}
                </div>
              )
            )}
          </div>
        </DialogPanel>
      </div>
    </Dialog>
  );
};

export default Delete;
