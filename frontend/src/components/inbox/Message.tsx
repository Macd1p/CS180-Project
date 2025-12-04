import InboxMessage from "./data";
import Image from "next/image";
import Link from "next/link";
interface MessageInfo {
  message?: InboxMessage;
}

const Message = ({message}:MessageInfo) => {
  if (!message) {
    return (
      <div className="w-1/5 border pt-1 pb-1 p-2 text-gray-400">
        No message
      </div>
    );
  }

  return (
    <Link href = {`/inbox/${message?.user_id  || ""}`} className="flex flex-col w-1/5 border pt-1 pb-1">
      <div className="flex flex-row items-center pl-1 pt-1 pb-1">
        <div className="relative w-10 h-10 rounded-full border bg-gray-100">
          <Image src={message?.profile_image || "/images/default-avatar.png"} alt={message.username || "User"} fill className=" rounded-full border bg-gray-100 object-cover"/>
        </div>
        <div className="pl-1 pr-1">
          {message.username} |
        </div>
        <div className="pt-0.5 text-sm text-gray-400">
          {new Date(message.timestamp).toLocaleString("en-US", { timeZone: "America/Los_Angeles", hour: "2-digit", minute: "2-digit", hour12: true })}
        </div>
      </div>
      
      <div className="text-sm pl-1 text-gray-600">
      {message.last_message}
      </div>
    </Link>
  );
};

export default Message;