interface CommentInformation {
  id: string;
  text: string;
  author: string;
  created_at: string;
  like_count?: number;
  is_liked?: boolean;
}

export default CommentInformation;
