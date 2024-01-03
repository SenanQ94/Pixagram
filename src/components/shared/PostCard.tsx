import { Link } from "react-router-dom";
import { formatDateString, multiFormatDateString } from "@/lib/utils";
import { useUserContext } from "@/context/AuthContext";
import PostStats from "@/components/shared/PostStats";
import { IPost } from "@/types";

type PostCardPorps = {
  post: IPost;
};

const PostCard = ({ post }: PostCardPorps) => {
  const { user } = useUserContext();

  if (!post.creator) return <></>;

  return (
    <div className="post-card">
      <div className="flex-between">
        <div className="flex items-center gap-3">
          <Link to={`/profile/${post.creator}`}>
            <img
              src={post.user.image || "/assets/icons/profile-placeholder.svg"}
              alt="creator"
              className="rounded-full w-12 lg:h-12"
            />
          </Link>
          <div className="flex flex-col">
            <p className="base-medium lg:body-bold text-light-1">
              {post.user.name}
            </p>
            <div className="flex-center gap-6 text-light-3">
              <p className="subtle-semibold lg:small-regular">
                {multiFormatDateString(post.updatedAt)}
              </p>
              <div className="flex-center gap-1 text-light-3">
                <img
                  src="/assets/icons/location.svg"
                  alt="edit"
                  width={15}
                  height={15}
                />
                <p className="subtle-semibold lg:small-regular">
                  {post.location}
                </p>
              </div>
            </div>
          </div>
        </div>
        <Link
          to={`/update-post/${post.postId}`}
          className={`${user.id !== post.creator && "hidden"}`}
        >
          <img src="/assets/icons/edit.svg" alt="edit" width={20} height={20} />
        </Link>
      </div>
      <Link to={`/posts/${post.postId}`}>
        <div className="small-medium lg:base-medium py-5">
          <p>{post.caption}</p>
          <ul className="flex flex-wrap gap-1 mt-2 justify-start">
            {post.tags?.map((tag: string) => (
              <li key={tag} className="text-light-3">
                #{tag}
              </li>
            ))}
          </ul>
        </div>
        <img
          src={post.imageUrl || "/assets/icons/profile-placeholder.svg"}
          className="post-card_img"
          alt="post image"
        />
      </Link>
      <PostStats post={post} userId={user.id} />
    </div>
  );
};

export default PostCard;
