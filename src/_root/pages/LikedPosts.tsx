import { GridPostList, Loader } from "@/components/shared";
import { database } from "@/lib/firebase/firebaseConfig";
import { useGetCurrentUser } from "@/lib/react-query/queriesAndMutations";
import { IPost, IUser } from "@/types";
import {
  collection,
  doc,
  getDoc,
  getDocs,
  orderBy,
  query,
  where,
} from "firebase/firestore";
import { useEffect, useState } from "react";

const collectionUsersRef = collection(database, "users");
const collectionPostsRef = collection(database, "posts");

const LikedPosts = () => {
  const { data: currentUser } = useGetCurrentUser();

  if (!currentUser)
    return (
      <div className="flex-center w-full h-full">
        <Loader />
      </div>
    );

  async function getUserLikedPosts(userId: string) {
    try {
      // Get the likedPosts array from the user document
      const postsQuery = query(
        collectionPostsRef,
        where("likes", "array-contains", userId)
      );
      const postsSnapshot = await getDocs(postsQuery);
      const posts: IPost[] = [];

      for (const postDoc of postsSnapshot.docs) {
        const postData = postDoc.data() as IPost;

        // Fetch user information for the post
        const userQuery = query(
          collectionUsersRef,
          where("uid", "==", postData.creator)
        );
        const userSnapshot = await getDocs(userQuery);

        if (userSnapshot.empty) {
          throw new Error("User not found for post");
        }

        const userData = userSnapshot.docs[0].data() as IUser;

        // Combine post and user information
        const postWithUser: IPost = { ...postData, user: userData };
        posts.push(postWithUser);
      }

      return posts;
    } catch (error) {
      console.error("Error fetching user liked posts:", error);
      throw error;
    }
  }

  // Example usage
  const [likePosts, setLikePosts] = useState<IPost[]>([]);

  useEffect(() => {
    // Use an asynchronous function inside useEffect to handle data fetching
    const fetchData = async () => {
      try {
        const posts = await getUserLikedPosts(currentUser.id);
        setLikePosts(posts);
      } catch (error) {
        console.error("Error:", error);
      }
    };

    // Call the fetchData function
    fetchData();
  }, [currentUser.id]);

  return (
    <>
      {likePosts.length === 0 ? <p className="text-light-4">No liked posts</p>:
      <GridPostList posts={likePosts} showStats={false} />}
    </>
  );
};

export default LikedPosts;
