import InboxMessage from "./data";
import Image from "next/image";
interface MessageInfo {
  message?: InboxMessage;
  onClick?: () => void;
}

const Message = ({message, onClick}:MessageInfo) => {
  {/*Got no message*/}
  if (!message) {
    return (
      <div className="w-1/5 border pt-1 pb-1 p-2 text-gray-400">
        No message
      </div>
    );
  }

  return (
    <div onClick={onClick} className="flex flex-col w-full border pl-1 pt-1 pb-1">
      <div className="flex flex-row items-center pl-1 pt-1 pb-1 gap-1">
        <div className="relative w-10 h-10">
          <Image src={message?.profile_image || "/images/default-avatar.png"} alt={message.username || "User"} fill className="rounded-full border bg-gray-200 object-cover"/>
        </div>
        <div className="pl-1 pr-1">
          {message.username}
        </div>
        <div className="pt-0.5 text-sm text-gray-400">
          | {new Date(message.timestamp).toLocaleString("en-US", {timeZone: "America/Los_Angeles", hour: "2-digit", minute: "2-digit", hour12: true})}
        </div>
      </div>
      
      <div className="text-sm pl-2 text-gray-600 mb-1">
        {message.last_message}
      </div>
    </div>
  );
};

export default Message;