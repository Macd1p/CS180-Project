"use client";
import { useState, useEffect } from "react";
import Image from "next/image";
import { useAuth } from "../../app/providers/AuthProvider";
import IndividualMessage from "@/components/inbox/IndividualMessage";
import TypeText from "@/components/inbox/TypeText";
import MessageInfo from "@/components/inbox/info";
import ReceiverInfo from "./ReceiverData";
import { CgCloseR } from "react-icons/cg";
interface UserInfo {
  userID: string;
  onClose?: ()=>void;
}

const Chat = ({userID, onClose}: UserInfo) => {
  const [messages, setMessages] = useState<MessageInfo[]>([]);
  const [recipient, setRecipient] = useState<ReceiverInfo | null>(null);
  const [error, setError] = useState("");
  const { isAuthenticated, isLoading } = useAuth();

  useEffect(() => {
    if (!isLoading && isAuthenticated) {
      fetchChatHistory();
    }
  }, [userID, isAuthenticated, isLoading]);

  const fetchChatHistory = async () => {
    try {
      // makes sure the user is authenticated to see their chat with the recipient
      const token = localStorage.getItem("fms_token");
      if (!token) {
        setError("You must be logged in to view this chat");
        return;
      }
      
      // get the message between the user and recipient
      const response = await fetch(`/api/message/${userID}`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (!response.ok) {
        setError("Failed to fetch the chat");
        return;
      }

      // Successful fetching the messages between the user and recipient
      const data = await response.json();
      setMessages(data.messages || []);
      setRecipient(data.other_user);

    } catch (error) {
      setError("An error occurred");
      return;
    }
  };

  // Checks who is sending the message
  const whoSending = (message: MessageInfo) => {
    // if the messenger is the person the user is talking to otherwise the messenger is the user
    if (message.sender_id == recipient?.id) {
      const messenger = recipient?.username;
      return messenger;
    }
    return "Me";
  }

  return (
    <div className="flex flex-col border-2 border-gray-500">
      {/*Recipient Username*/}
      <div className="border-b p-2">
        {recipient && (
          <div className="relative flex flex-row gap-2">
            <div className="relative w-10 h-10 rounded-full overflow-hidden border-2 border-gray-500">
              <Image src={recipient.profile_image || "/images/default-avatar.png"} alt={recipient.username} fill className="object-cover"/>
            </div>
            <div className="font-bold text-lg pt-1">
              {recipient.username}
            </div>
            <button onClick = {onClose} className="absolute right-0 hover: cursor-pointer">
              <CgCloseR className="text-red-500 text-2xl"/>
            </button>
          </div>
        )}
      </div>

      {/*Loaded Messages*/}
      <div className="flex flex-col pt-2 ml-4 gap-2">
        {messages.length == 0 ? (
          <div className="text-center text-gray-400 mt-10">
            No messages yet. Click on New Message to talk to another user
          </div>
        ) : (messages.map((message) => (
          <IndividualMessage key={message.id} message={message} sender={whoSending(message)}/>
        )))}
      </div>

      {/*Message Submission*/}
      <div className="border-t p-4 mt-4">
        {recipient && (
          <TypeText receiver={recipient.username} sentMessage={()=>{fetchChatHistory()}}/>
        )}
      </div>
          
      {error && (
        <div className="flex items-center text-red-600">
          Error: {error}
        </div>)}
      </div>
  );
};

export default Chat;