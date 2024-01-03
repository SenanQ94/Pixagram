import { useEffect, useState } from "react";
import { useGetCurrentUser, useGetPostById, useGetSavedPosts } from "@/lib/react-query/queriesAndMutations";
import { GridPostList, Loader } from "@/components/shared";

const Saved = () => {
  const { data: currentUser } = useGetCurrentUser();
  const [savedPosts, setSavedPosts] = useState([]);

  const {
    data: posts,
    isLoading: isUserLoading,
    isError: isErrorCreators,
  } = useGetSavedPosts(currentUser?.id || ''); 



  return (
    <div className="saved-container">
      <div className="flex gap-2 w-full max-w-5xl">
        <img
          src="/assets/icons/save.svg"
          width={36}
          height={36}
          alt="edit"
          className="invert-white"
        />
        <h2 className="h3-bold md:h2-bold text-left w-full">Saved Posts</h2>
      </div>

      {!currentUser ? (
        <Loader />
      ) : (
        <ul className="w-full flex justify-center max-w-5xl gap-9">
          {posts?.length === 0 ? (
            <p className="text-light-4">No saved posts</p>
          ) : (
            <GridPostList posts={posts||[]} showStats={false} />
          )}
        </ul>
      )}
    </div>
  );
};

export default Saved;
