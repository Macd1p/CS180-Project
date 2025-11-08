{/*Post component template:*/}
{/*Functions: CRUD*/}
{/*Design: Instagram + reddit style*/}

const Post = () => {
  return (
    <div className = "bg-gray-300 shadow-md w-1/3 h-3/4 rounded-2xl p-4 mb-4">
      <div className = "text-4xl p-5">
        Post Title
      </div>
      <div className="flex flex-col items-center">
        <div className="bg-white w-3/4 h-11/12">
          Image goes here
        </div>
        <div className="bg-white mt-5 mb-2">
          Description
        </div>
        <div className="bg-white text-sm rounded-2xl">
          Tags
        </div>
        <div className = "text-xs">
          Posted by Poster_username at XX:XX
        </div>
      </div>
      <div className ="ml-15">
        Comments:
      </div>
    </div>
  );
};
export default Post;
