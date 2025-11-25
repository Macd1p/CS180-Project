interface PostInfo {
  id?: string,
  title?: string,
  owner?: string,
  url_for_images?: string,
  address?: string,
  description?: string,
  tags: string[],
  time_created: string, // is time a string or a Date object in the backend
};

export default PostInfo
