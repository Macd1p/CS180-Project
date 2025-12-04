// data file for Inbox
interface InboxMessage {
  user_id: string;
  username: string; // the receiver's username
  profile_image?: string;
  last_message: string;
  timestamp: string;
}

export default InboxMessage;