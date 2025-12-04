"use client";
import { useState, useEffect } from "react";
import { useAuth } from "../providers/AuthProvider";
import { useRouter } from "next/navigation";
import Header from "@/components/inbox/header";
import NewMessage from "@/components/inbox/NewMessage";
import Message from "@/components/inbox/Message";
import InboxMessage from "@/components/inbox/data";

const Inbox = () => {
  const [messages, setMessages] = useState<InboxMessage[]>([]);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);
  const [loading, setLoading] = useState(false);
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
          setLoading(false);
          return;
        }

        const response = await fetch ("/api/message/inbox", {
          method: "GET",
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        });

        if (!response.ok) {
          const dataError = await response.json()
          setError(dataError || "Failed to fetch the user's messages");
          setLoading(false);
          return;
        }

        const data = await response.json();
        setMessages(data.inbox || []);
        setLoading(false);
        setSuccess(true);

      } catch (error) {
        if (error instanceof Error) {
          setError("Error: " + error.message);
          setSuccess(false);
        } else {
          setError("An error has occurred.");
          setSuccess(false);
        }
      }
    }
    fetchMessages();
  }, [isAuthenticated]);

  if (loading) {
    return (
      <div className="w-full text-gray-600 text-center mb-3 pt-20 px-4">
        Getting Messages
      </div>
    );
  }

  return (
    <div className="w-full pt-20 px-4 mb-2 space-y-4">
      <Header header = "Inbox"/>
      <NewMessage/>
      {/*The user did not receive or send messages*/}
      {success && messages.length == 0 && (
        <div className="text-gray-500">
          You currently have no messages.
        </div>
      )}

      {/*The user have at least 1 messages*/}
      {success && messages.length >= 1 && (
        <div>
          {messages.map((chat) => (
            <Message key = {chat.user_id} message={chat}/>
          ))}
        </div>
      )}
      
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