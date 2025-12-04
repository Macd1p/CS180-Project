"use client";
import { Textarea, Field, } from "@headlessui/react";
import { useState } from "react";
import { IoMdCheckmarkCircleOutline } from "react-icons/io";
import { MdErrorOutline } from "react-icons/md";

{/*Message box for the sender to send their message*/}
interface TypeMessage {
  receiver: string;
  sentMessage?: () => void;
}

const TypeText = ({receiver, sentMessage}:TypeMessage) => {
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);

  const inputMessage = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setMessage(e.target.value);
  };

  const handleSend = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!message.trim()) {
      setError("Empty message is not allowed");
      return;
    }

    const token = localStorage.getItem("fms_token");
    if (!token) {
      setError("You must be logged in to send a message");
      return;
    }

    const messageSubmission = { receiver_username: receiver.trim(), text: message.trim() };

    try {
      const response = await fetch(`/api/message/send`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`, //use token in header
        },
        body: JSON.stringify(messageSubmission),
      });

      if (!response.ok) {
        const dataError = await response.json();
        setError(dataError.error || "An error regarding fetching comments has occurred");
        return;
      }

      // Successful message submission
      const data = await response.json();
      console.log(data);
      setSuccess(true);
      
      if (sentMessage) {
        sentMessage();
      }

      // Clear message's state
      setMessage("");
      setTimeout(() => {
        setSuccess(false);
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
    <form onSubmit={handleSend} className="w-full mb-2">
      <Field className="flex flex-col">
        <Textarea value={message} onChange={inputMessage} className="border-1 mb-2 rounded-sm p-1" placeholder="Type your message here"></Textarea>
      </Field>
      <button type="submit" className="bg-blue-500 rounded-lg p-1 text-white hover:bg-blue-400 cursor-pointer">
        Send
      </button>
      {/*Message for the user to know if the user's message was sent*/}
      {success ? (
        <div className="flex items-center text-green-600 font-medium">
          <IoMdCheckmarkCircleOutline /> Sent!
        </div>
      ) : (error && (
          <div className="text-red-600">
            <MdErrorOutline /> {error}
          </div>
        )
      )}
    </form>
  )};

export default TypeText;