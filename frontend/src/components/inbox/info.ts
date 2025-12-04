// data file for a user's message in the chat
interface MessageInfo {
  id: string;
  sender_id: string;
  message?: string;
  timestamp: string;
}

export default MessageInfo;