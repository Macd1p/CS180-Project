"use client";
import { Dialog, DialogTitle, DialogPanel, Textarea, Label, Input, Field } from "@headlessui/react";
import { IoMdCheckmarkCircleOutline } from "react-icons/io";
import { MdErrorOutline } from "react-icons/md";
import { useState } from "react";
import { useRouter } from "next/navigation";

interface NewMessageModal {
  open: boolean;
  setOpen: (value: boolean) => void;
}

const SendNM = ({open, setOpen}:NewMessageModal) => {
  const [receiver, setReceiver] = useState("");
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);
  const router = useRouter();

  const getReceiver = (e: React.ChangeEvent<HTMLInputElement>) => {
    setReceiver(e.target.value);
  };

  const getText = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setMessage(e.target.value);
  };
  
  const handleSendNM = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setError("");

    if (!receiver.trim()) {
      setError("We need the person's username that you have tried to message");
      return;
    }

    if (!message.trim()) {
      setError("Message cannot be empty");
      return;
    }

    const token = localStorage.getItem("fms_token");
    if (!token) {
      setError("You must be logged in to send messages");
      return;
    }

    const chat = {
      receiver_username: receiver.trim(),
      message: message.trim(),
    };

    try {
      const response = await fetch("/api/message/send", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(chat),
      });

      if (!response.ok) {
        const dataError = await response.json();
        setError(dataError.error || "Failed to send message");
        return;
      }

      // Message submission
      const data = await response.json();
      console.log(data);

      // Successfully sent the message
      setSuccess(true);
      setOpen(false);
      
      // Redirect back to the inbox page
      setTimeout(() => {
        router.push("/inbox");
      }, 2000);

    } catch (error) {
        setError("An error has occurred.");
        setSuccess(false);
    }
  };

  return (
    <Dialog open={open} onClose={() => setOpen(false)}>
      <div className="fixed inset-0 flex items-center justify-center backdrop-brightness-50">
          <DialogPanel className="border bg-white p-5 space-y-1 w-100">
            <DialogTitle className="font-semibold text-xl underline">
              New Message
            </DialogTitle>
            <form onSubmit={handleSendNM} className="flex flex-col space-y-2">
              <Field className="flex flex-col gap-1">
                <Label className="text-sm font-semibold">
                  To:
                </Label>
                <Input type="text" value={receiver} onChange={getReceiver} className="border pl-1 mb-2 hover:shadow-md border-gray-500 rounded-md" placeholder="Enter username" required/>
              </Field>

              <Field className="flex flex-col gap-1">
                <Label className="text-sm font-semibold">
                  Message:
                </Label>
                <Textarea value={message} onChange={getText} className="border pl-1 mb-2 hover:shadow-md border-gray-500 rounded-md" placeholder="Type your message here" required/>
              </Field>

              <div className="flex gap-4 items-center cursor-pointer">
                <button type="button" onClick={() => setOpen(false)} className=" hover:text-gray-500">
                  Cancel
                </button>
                <button type="submit" className="bg-blue-600 text-white hover:bg-blue-500 pl-2 pr-2 rounded-lg">
                  Send
                </button>
              </div>
              
              {/*Message for the user to know if the post was submitted*/}
              {success ? (
                <div className="flex items-center text-green-600 font-medium">
                  <IoMdCheckmarkCircleOutline /> Successful Posting!
                </div>) : (error && (
                  <div className="flex items-center text-red-600">
                    <MdErrorOutline /> Error: {error}
                  </div>)
              )}
              </form>
          </DialogPanel>
        </div>
    </Dialog>
  );
};

export default SendNM;