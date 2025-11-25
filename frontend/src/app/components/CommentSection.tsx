import Comment from "./Comment";
{/*Loads all the comments stored in the backend */}
const CommentSection = () => {
    return (
        <div className="w-1/4">
            <div className="font-medium">
                Comment Section
            </div>
            <div className="flex border-1"/>
           {/*} {comments.map((comment)=> (
                <div key = {comment.id} className="flex flex-col border-1">
                    {comment.author}
                    {comment.text}
                </div>
            ))}*/}

        </div>
    );
}

export default CommentSection;
