"use client";
import { useState, useEffect } from "react";
import { useAuth } from "../providers/AuthProvider";
import { useRouter } from "next/navigation";
import Header from "@/components/inbox/header";
import NewMessage from "@/components/inbox/NewMessage";
import Message from "@/components/inbox/Message";
import InboxMessage from "@/components/inbox/data";
import Chat from "@/components/inbox/chat";
import { GiNightSleep } from "react-icons/gi";

const Inbox = () => {
  const [messages, setMessages] = useState<InboxMessage[]>([]);
  const [message, setMessage] = useState("");
  const [open, setOpen] = useState(true);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);
  const router = useRouter();
  const { isAuthenticated, isLoading } = useAuth(); //states if user is authenticated and if loading to prevent race condition

  // authentication check
  useEffect(() => {
    if (!isLoading && !isAuthenticated) {
      router.push("/sign-in");
    }
  }, [isAuthenticated, isLoading, router]);

  // as long as we are authenticated, we can send messages
  useEffect(() => {
    if (!isAuthenticated) return;

    const fetchMessages = async () => {
      try {
        // session token
        const token = localStorage.getItem("fms_token");
        if (!token) {
          setError("You must be logged in to view messages");
          return;
        }

        // fetching the user's inbox
        const response = await fetch ("/api/message/inbox", {
          method: "GET",
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        });

        if (!response.ok) {
          setError("Failed to fetch the user's messages");
          return;
        }
        
        //successfully fetched the user's messages
        const data = await response.json();
        setMessages(data.inbox || []);
        setSuccess(true);

      } catch (error) {
        setError("An error has occurred.");
        setSuccess(false);
      }
    }
    fetchMessages();
  }, [isAuthenticated]);

  // allow the user to click on their message in their inbox
  const clickMessage = (user_id: string) => {
    if (!open && (message != user_id)) {
      setMessage(user_id);
      setOpen(true);
    }
    else {
      setMessage("");
      setOpen(false);
    }
  }

  return (
    <div className="flex flex-row w-full gap-10 pt-20 px-4 mb-4">
      <div className="flex flex-col ml-10 gap-y-4 w-1/6">
        <Header header = "Inbox"/>
        <NewMessage/>
        
        {/*The user did not receive or send messages*/}
        {success && messages.length == 0 && (
          <div className="text-gray-500">
            Your inbox is empty
          </div>
        )}

        {/*The user have at least 1 messages*/}
        {success && messages.length >= 1 && (
          <div>
            {messages.map((chat) => (
              <Message key = {chat.user_id} message={chat} onClick = {() => clickMessage(chat.user_id)}/>
            ))}
          </div>
        )}
        </div>
        
        {/*Message between the user and their recipient*/}
        <div className="w-1/2">
            {open && message ? (
              <Chat userID = {message} onClose={()=>setOpen(false)}/>
            ) : (
              <div className="flex flex-col items-center justify-center text-gray-500 rounded-lg">
                <GiNightSleep className = "text-5xl"/>
                No opened message
              </div>
            )}
        </div>

        {/*Error has occurred*/}
        {error && (
          <div className="text-red-600">
            Error: {error}
          </div>
        )}
    </div>
  );
};

export default Inbox;