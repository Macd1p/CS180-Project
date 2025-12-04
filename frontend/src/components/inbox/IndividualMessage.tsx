import MessageInfo from "./info";

interface SenderMessage {
  message: MessageInfo;
  sender: string
}

const IndividualMessage = ({message, sender}:SenderMessage) => {

  if (message.sender_id === sender) {
    const messageSender = sender;
  }

  return (
    <div className="flex flex-col items-start gap-3 ">
      <div className="flex flex-row pl-0.5 text-sm gap-1 mb-0.5">
        <div className="">
          Username
        </div>
        |
        <div className="text-gray-500">
          TimeStamp
        </div>
      </div>
      <div className="w-1/5 border rounded-lg pl-2 whitespace-normal break-all">
        Text Message
      </div>
    </div>
  )};

export default IndividualMessage;