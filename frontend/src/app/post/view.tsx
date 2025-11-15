import Post from "../components/Comment"
import Comment from "../components/post";
import CommentSection from "../components/CommentSection";

const View = () => {
    return (
        <div className="w-full flex flex-col items-center mb-3">
            <Comment/>
            <Post/>
            <CommentSection/>
        </div>
    );
}
export default View