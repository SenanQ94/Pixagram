import { useUserContext } from "@/context/AuthContext";
import { Link } from "react-router-dom";
import PostStats from "./PostStats";
import { IPost } from "@/types";

type GridPostListProps = {
  posts: IPost[];
  showUser?: boolean;
  showStats?: boolean;
};

const GridPostList = ({
  posts,
  showUser = true,
  showStats = true,
}: GridPostListProps) => {
  const { user } = useUserContext();

  return posts.length === 0 ? (
    <h1> No Posts </h1>
  ) : (
    <ul className="grid-container">
      {posts?.map((post) => (
        <li key={post.postId} className="relative min-w-80 h-80">
          <Link to={`/posts/${post.postId}`} className="grid-post_link">
            <img
              src={post.imageUrl}
              alt="post"
              className="h-full w-full object-cover"
            />
          </Link>
          <div className="grid-post_user">
            {showUser && (
              <div className="flex items-center justify-start gap-2 flex-1">
                <img
                  src={post.user.image}
                  className="h-8 w-8 rounded-full"
                  alt="creator"
                />
                <p className="line-clamp-1">{post.user.name}</p>
              </div>
            )}
            {showStats && <PostStats post={post} userId={user.id} />}
          </div>
        </li>
      ))}
    </ul>
  );
};

export default GridPostList;
