import MessageInfo from "./info";

interface SenderMessage {
  message: MessageInfo;
  sender: string;
}

const IndividualMessage = ({message, sender}:SenderMessage) => {

  return (
    <div className= "flex flex-col gap-1">
      <div className="flex flex-row pl-0.5 text-sm gap-1">
        <div className="font-semibold">
          {sender}
        </div>
        <div className="text-gray-500">
         | {new Date(message.timestamp).toLocaleString("en-US", { timeZone: "America/Los_Angeles", hour: "2-digit", minute: "2-digit", hour12: true })}
        </div>
      </div>
      <div className="w-1/5 border rounded-lg pl-2 whitespace-normal break-all">
        {message.message}
      </div>
    </div>
  )};

export default IndividualMessage;