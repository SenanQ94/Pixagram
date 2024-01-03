import {
  GoogleAuthProvider,
  ProviderId,
  createUserWithEmailAndPassword,
  getAuth,
  onAuthStateChanged,
  sendPasswordResetEmail,
  signInWithEmailAndPassword,
  signInWithPopup,
  signOut,
} from "firebase/auth";
import { auth, database, storage } from "./firebaseConfig";
import {
  IUpdatePost,
  INewPost,
  INewUser,
  IUpdateUser,
  IUser,
  IPost,
} from "@/types";
import {
  deleteObject,
  getDownloadURL,
  ref,
  uploadBytes,
} from "firebase/storage";
import {
  Timestamp,
  addDoc,
  arrayRemove,
  arrayUnion,
  collection,
  deleteDoc,
  doc,
  getDoc,
  getDocs,
  limit,
  orderBy,
  query,
  serverTimestamp,
  startAfter,
  updateDoc,
  where,
} from "firebase/firestore";
import { toast } from "@/components/ui";

const collectionUsersRef = collection(database, "users");
const collectionPostsRef = collection(database, "posts");
const collectionSavesRef = collection(database, "saves");
const provider = new GoogleAuthProvider();

// ============================================================
// AUTH
// ============================================================

// ============================== SIGN UP

export async function createUserAccount(user: INewUser) {
  try {
    // Create user using email and password
    const res = await createUserWithEmailAndPassword(
      auth,
      user.email,
      user.password
    );
    const newAccount = res.user;

    if (!newAccount) throw Error;

    // Upload image to Firebase Storage
    const storageRef = ref(
      storage,
      `profileImages/${newAccount.uid}` ///${image.name}`
    );
    await uploadBytes(storageRef, user.image);

    // Get the download URL of the uploaded image
    const imageURL = await getDownloadURL(storageRef);

    // Add user information to Firestore
    const createdUser = await addDoc(collectionUsersRef, {
      uid: newAccount.uid,
      name: user.name,
      ProviderId: "email/password",
      email: newAccount.email,
      image: imageURL,
      bio: "Hey there! I'm using Pixagram. 🌟 Join me on this creative journey!",
      savedPosts: [],
    });

    return createdUser;
  } catch (error) {
    toast({
      variant: "default",
      title: "Failed to register user. Please try again.",
      description: (error as Error).message,
    });
    throw new Error(`Failed to register user. Please try again.\n${error}`);
  }
}

// ============================== SIGN IN

//Using google
export async function signInWithGoogle() {
  try {
    const popup = await signInWithPopup(auth, provider);
    const newAccount = popup.user;
    if (!newAccount) throw Error;

    const q = query(collectionUsersRef, where("uid", "==", newAccount.uid));
    const docs = await getDocs(q);
    let createdUser;
    if (docs.docs.length === 0) {
      createdUser = await addDoc(collectionUsersRef, {
        uid: newAccount?.uid,
        name: newAccount?.displayName,
        email: newAccount?.email,
        image: newAccount?.photoURL,
        authProvider: popup?.providerId,
        bio: "Hey there! I'm using Pixagram. 🌟 Join me on this creative journey!",
        savedPosts: [],
      });
    } else {
      createdUser = docs.docs[0];
    }
    return createdUser;
  } catch (error) {
    toast({
      variant: "default",
      title: "Sign in faild. Please try again.",
      description: (error as Error).message,
    });
    throw new Error(
      `Failed to sign in using Google. Please try again.\n${error}`
    );
  }
}

//using email
export async function loginWithEmailAndPassword(user: {
  email: string;
  password: string;
}) {
  try {
    const session = await signInWithEmailAndPassword(
      auth,
      user.email,
      user.password
    );
    return session;
  } catch (error) {
    toast({
      variant: "default",
      title: "Sign up faild. Please try again.",
      description: (error as Error).message,
    });
    return false;
  }
}

// ============================== GET ACCOUNT

export async function getAccount() {
  const auth = getAuth();
  try {
    const currentAccount = auth.currentUser;

    if (!currentAccount) {
      throw new Error("No user is currently signed in.");
    }

    return currentAccount;
  } catch (error) {
    toast({
      variant: "default",
      title: "Error occurred while getting the user. Please try again.",
      description: (error as Error).message,
    });

    throw new Error(
      `Failed to get the user account.\n${(error as Error).message}`
    );
  }
}

// ============================== GET USER

export async function getCurrentUser(): Promise<IUser | null> {
  const auth = getAuth();

  return new Promise((resolve, reject) => {
    const unsubscribe = onAuthStateChanged(auth, async (currentAccount) => {
      try {
        if (currentAccount) {
          const usersCollectionRef = collection(database, "users");
          const userQuery = query(
            usersCollectionRef,
            where("uid", "==", currentAccount.uid)
          );
          const userDocs = await getDocs(userQuery);

          if (userDocs.empty) {
            throw new Error("No user document found for the current account.");
          }

          const userData = userDocs.docs[0].data();
          const authenticatedUser: IUser = {
            id: userData.uid,
            name: userData.name,
            email: userData.email,
            image: userData.image,
            bio: userData.bio,
            savedPosts: userData.savedPosts,
          };
          resolve(authenticatedUser);
        } else {
          // No user is currently signed in
          resolve(null);
        }
      } catch (error) {
        console.error("Error getting the user:", (error as Error).message);
        reject(error);
      } finally {
        unsubscribe(); // Unsubscribe to avoid memory leaks
      }
    });
  });
}

// ============================== RESET PASSWORD

export async function sendPasswordToUser(email: string) {
  try {
    await sendPasswordResetEmail(auth, email);
    toast({
      title: "New reset password link sent to your email.",
      description: "Please check your email.",
    });
    return true;
  } catch (error) {
    toast({
      variant: "default",
      title: "Can not reset password. Please try again.",
      description: (error as Error).message,
    });
    return false;
  }
}

// ============================== SIGN OUT

export async function signOutAccount() {
  try {
    await signOut(auth);
    return null;
  } catch (error) {
    toast({
      variant: "default",
      title: "Error occurred while signing out. Please try again.",
      description: (error as Error).message,
    });
    return null;
  }
}

// ============================================================
// USER
// ============================================================

// ============================== GET USERS
export async function getUsers(usersLimit?: number) {
  const queries: any[] = [orderBy("name", "desc")];

  if (usersLimit) {
    queries.push(limit(usersLimit));
  }

  try {
    const usersQuery = query(collectionUsersRef, ...queries);
    const usersSnapshot = await getDocs(usersQuery);

    if (!usersSnapshot) throw Error;
    const users = usersSnapshot.docs.map((doc) => {
      const userData = doc.data();
      return {
        id: userData.uid,
        name: userData.name,
        email: userData.email,
        image: userData.image,
        bio: userData.bio,
        savedPosts: userData.savedPosts,
      } as IUser;
    });
    return users;
  } catch (error) {
    console.error(error);
  }
}

// ============================== GET USER BY ID
export async function getUserById(userId: string) {
  try {
    const q = query(collectionUsersRef, where("uid", "==", userId));
    const snapshot = await getDocs(q);

    if (!snapshot) throw Error;

    const userData = snapshot.docs[0].data();
    if (!userData) throw Error;
    const user = {
      id: userData.uid,
      name: userData.name,
      email: userData.email,
      image: userData.image,
      bio: userData.bio,
      savedPosts: userData.savedPosts,
    } as IUser;

    return user;
  } catch (error) {
    console.log(error);
  }
}

// ============================== UPDATE USER
export async function updateUser(user: IUpdateUser) {
  const hasFileToUpdate = user.file.length > 0;
  let imageUrl = user.imageUrl;

  try {
    if (hasFileToUpdate) {
      // Upload new file to Firebase Storage
      const storageRef = ref(storage, `profileImages/${user.userId}`);
      await uploadBytes(storageRef, user.file[0]);

      // Get the download URL of the uploaded image
      const fileUrl = await getDownloadURL(storageRef);
      if (!fileUrl) throw new Error("Failed to get file URL");

      imageUrl = fileUrl;
    }

    // Find the document by uid
    const userQuery = query(
      collectionUsersRef,
      where("uid", "==", user.userId)
    );
    const userSnapshot = await getDocs(userQuery);

    if (userSnapshot.empty) {
      throw new Error("No document found for the provided UID.");
    }

    // Update the matching document
    const userDoc = userSnapshot.docs[0];
    await updateDoc(doc(collectionUsersRef, userDoc.id), {
      name: user.name,
      bio: user.bio,
      image: imageUrl,
    });

    return { ...user, imageUrl }; // Return updated user data
  } catch (error) {
    console.error(error);
    throw new Error("Failed to update user. Please try again.");
  }
}

// ============================================================
// POSTS
// ============================================================

// ============================== CREATE POST

export async function createPost(post: INewPost) {
  try {
    const user = auth.currentUser;

    if (!user) {
      throw new Error("User not authenticated");
    }

    // Convert tags into array
    const tags = post.tags?.replace(/ /g, "").split("#") || [];

    // Create post in Firestore
    const newPostRef = await addDoc(collectionPostsRef, {
      creator: user.uid,
      caption: post.caption,
      location: post.location,
      tags: tags,
      likes: [],
      updatedAt: serverTimestamp(),
    });
    // Get the document ID after adding the document
    const postId = newPostRef.id;
    // Upload file to Firebase Storage
    const storageRef = ref(storage, `posts/${postId}`);
    await uploadBytes(storageRef, post.file[0]);

    // Get the download URL of the uploaded file
    const fileUrl = await getDownloadURL(storageRef);

    // Update the post with the generated postId and imageUrl
    await updateDoc(doc(collectionPostsRef, newPostRef.id), {
      postId,
      imageUrl: fileUrl,
    });

    return newPostRef;
  } catch (error) {
    console.error(error);
    throw new Error("Failed to create post");
  }
}

// ============================== UPDATE POST
export async function updatePost(post: IUpdatePost) {
  const hasFileToUpdate = post.file.length > 0;
  console.log(post);

  try {
    let imageUrl = post.imageUrl;

    if (hasFileToUpdate) {
      // Upload new file to appwrite storage
      const storageRef = ref(storage, `posts/${post.postId}`);
      await uploadBytes(storageRef, post.file[0]);

      // Get the download URL of the uploaded image
      const fileUrl = await getDownloadURL(storageRef);
      if (!fileUrl) throw new Error("Failed to get file URL");

      imageUrl = fileUrl;
    }

    // Convert tags into array
    const tags = post.tags?.replace(/ /g, "").split(",") || [];

    //  Update post
    await updateDoc(doc(collectionPostsRef, post.postId), {
      caption: post.caption,
      imageUrl: imageUrl,
      location: post.location,
      tags: tags,
      updatedAt: serverTimestamp(),
    });

    const updatedPostDoc = await getDoc(doc(collectionPostsRef, post.postId));
    console.log(updatedPostDoc);

    return updatedPostDoc;
  } catch (error) {
    console.log(error);
  }
}

// ============================== GET FILE URL

export async function getFilePreview(fileId: string) {
  try {
    const user = auth.currentUser;

    if (!user) {
      throw new Error("User not authenticated");
    }

    const storageRef = ref(storage, `posts/${user.uid}/${fileId}`);
    const fileUrl = await getDownloadURL(storageRef);

    return fileUrl;
  } catch (error) {
    console.error(error);
    throw new Error("Failed to get file URL");
  }
}

// ============================== DELETE FILE

export async function deleteFile(fileId: string) {
  try {
    const user = auth.currentUser;

    if (!user) {
      throw new Error("User not authenticated");
    }

    const storageRef = ref(storage, `posts/${user.uid}/${fileId}`);
    await deleteObject(storageRef);

    return { status: "ok" };
  } catch (error) {
    console.error(error);
    throw new Error("Failed to delete file");
  }
}

// ============================== GET POPULAR POSTS (BY HIGHEST LIKE COUNT)
export async function getRecentPosts() {
  try {
    const postsQuery = query(collectionPostsRef, orderBy("updatedAt", "desc"));
    const postsSnapshot = await getDocs(postsQuery);
    const posts: IPost[] = [];

    for (const doc of postsSnapshot.docs) {
      const postData = doc.data() as IPost;
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
      const postWithUser = { ...postData, user: userData };
      posts.push(postWithUser);
    }
    return posts;
  } catch (error) {
    console.error(error);
  }
}

// ============================== GET USER'S POST
export async function getUserPosts(userId?: string) {
  if (!userId) return [];

  try {
    const postsQuery = query(
      collectionPostsRef,
      where("creator", "==", userId)
    );
    const postsSnapshot = await getDocs(postsQuery);

    const posts: IPost[] = [];

    for (const doc of postsSnapshot.docs) {
      const postData = doc.data() as IPost;
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
      const postWithUser = { ...postData, user: userData };
      posts.push(postWithUser);
    }
    return posts;
  } catch (error) {
    console.error(error);
    return [];
  }
}

// ============================== GET POSTS
export async function searchPosts(searchTerm: string) {
  console.log(searchTerm)
  try {
    const q = query(
      collectionPostsRef,
      where("caption", ">=", searchTerm ),
      where("caption", "<=", searchTerm + "\uf8ff")
    );
    const postsSnapshot = await getDocs(q);

    const posts: IPost[] = [];

    for (const doc of postsSnapshot.docs) {
      const postData = doc.data() as IPost;
      console.log(postData)
      const userQuery = query(
        collectionUsersRef,
        where("uid", "==", postData.creator)
      );
      const userSnapshot = await getDocs(userQuery);

      if (userSnapshot.empty) {
        throw new Error("User not found for post");
      }

      const userData = userSnapshot.docs[0].data() as IUser;
      console.log("userData", userData)

      // Combine post and user information
      const postWithUser = { ...postData, user: userData };
      posts.push(postWithUser);
    }
    console.log(posts)
    return posts;
  } catch (error) {
    console.error(error);
    return [];
  }
}

// export async function getInfinitePosts({ pageParam }: { pageParam: number }) {
//   try {
//     const q = query(
//       collectionPostsRef,
//       orderBy("updatedAt", "desc"),
//       limit(9),
//       startAfter(pageParam)
//     );
//     const posts = await getDocs(q);
//     const inifintePosts = posts.docs.map((doc) => doc.data())
//     console.log("infinit posts: \n ========= \n", inifintePosts)
//     if (!posts) throw Error;

//     return posts.docs.map((doc) => doc.data());
//   } catch (error) {
//     console.error(error);
//   }
// }

// export async function getInfinitePosts(pageParam) {
//   console.log("pageParam: \n ============== \n", pageParam);
//   try {
//     let postsQuery = query(
//       collectionPostsRef,
//       orderBy("updatedAt", "desc"),
//       limit(1)
//     );
//     // if (pageParam) {
//     //   postsQuery = query(
//     //     collectionPostsRef,
//     //     orderBy("updatedAt", "desc"),
//     //     startAfter(pageParam),
//     //     limit(1)
//     //   );
//     // }

//     const postsSnapshot = await getDocs(postsQuery);
//     const posts = [];

//     for (const doc of postsSnapshot.docs) {
//       const postData = doc.data();
//       const userQuery = query(
//         collectionUsersRef,
//         where("uid", "==", postData.creator)
//       );
//       const userSnapshot = await getDocs(userQuery);

//       if (userSnapshot.empty) {
//         throw new Error("User not found for post");
//       }

//       const userData = userSnapshot.docs[0].data();

//       // Combine post and user information
//       const postWithUser = { ...postData, user: userData };
//       posts.push(postWithUser);
//     }
//     console.log(posts);
//     return posts;
//   } catch (error) {
//     console.error(error);
//     throw error;
//   }
// }

// ============================== GET POST BY ID
export async function getPostById(postId?: string) {
  if (!postId) throw new Error("postId is required");

  try {
    const q = query(collectionPostsRef, where("postId", "==", postId));
    const postSnapshot = await getDocs(q);

    if (postSnapshot.empty) {
      throw new Error("Post not found");
    }

    // Assuming there is only one document for a given postId
    const postDoc = postSnapshot.docs[0];

    const postData = postDoc.data() as IPost;
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
    const postWithUser = { ...postData, user: userData };

    return postWithUser;
  } catch (error) {
    console.error(error);
    throw error;
  }
}

// ============================== DELETE POST
export async function deletePost(postId?: string) {
  if (!postId) return;

  try {
    await deleteDoc(doc(collectionPostsRef, postId));

    // Delete associated image from Firebase Storage
    const storageRef = ref(storage, `posts/${postId}`);
    await deleteObject(storageRef);

    return { status: "Ok" };
  } catch (error) {
    console.log(error);
  }
}

// ============================== LIKE / UNLIKE POST
export async function likePost(postId: string, likesArray: string[]) {
  try {
    await updateDoc(doc(collectionPostsRef, postId), {
      likes: likesArray,
    });

    const updatedPostDoc = await getDoc(doc(collectionPostsRef, postId));
    console.log(updatedPostDoc);

    if (!updatedPostDoc) throw Error;

    return updatedPostDoc;
  } catch (error) {
    console.log(error);
  }
}

// ============================== SAVE POST
export async function savePost(userId: string, postId: string) {
 try {
   const q = query(collectionUsersRef, where("uid", "==", userId));
   const querySnapshot = await getDocs(q);

   if (querySnapshot.empty) {
     throw new Error("User document not found");
   }

   const userDocRef = doc(collectionUsersRef, querySnapshot.docs[0].id);

   // Update the user document by adding the postId to the 'savedPosts' array
   await updateDoc(userDocRef, {
     savedPosts: arrayUnion(postId),
   });

   // Return any data if needed after the save operation
   return { success: true };
 } catch (error) {
   console.error("Error saving post:", error);
   // Return any error information
   throw new Error("Failed to save post");
 }
}

// ============================== DELETE SAVED POST
export async function deleteSavedPost(userId: string, postId: string) {
 try {
   const q = query(collectionUsersRef, where("uid", "==", userId));
   const querySnapshot = await getDocs(q);

   if (querySnapshot.empty) {
     throw new Error("User document not found");
   }

   const userDocRef = doc(collectionUsersRef, querySnapshot.docs[0].id);
   const userDocData = querySnapshot.docs[0].data();


   const isPostSaved = userDocData.savedPosts.includes(postId);

   if (!isPostSaved) {
     console.warn("Post is not in the saved list");
     return { success: false, message: "Post is not in the saved list" };
   }

   // Update the user document by removing the postId from the 'savedPosts' array
   await updateDoc(userDocRef, {
     savedPosts: arrayRemove(postId),
   });

   // Return any data if needed after the delete operation
   return { success: true };
 } catch (error) {
   console.error("Error toggling save post:", error);
   // Return any error information
   throw new Error("Failed to toggle save post");
 }
}

// ============================== GET USER'S POST
export async function getSavedPosts(userId?: string) {
 if (!userId) return [];

 try {
   const userQuery = query(
     collectionUsersRef,
     where("uid", "==", userId)
   );

   const userSnapshot = await getDocs(userQuery);

   if (userSnapshot.empty) {
     throw new Error("User not found");
   }

   const userData = userSnapshot.docs[0].data();

   if (!userData.savedPosts || userData.savedPosts.length === 0) {
     return [];
   }

   const savedPostsQuery = query(
     collectionPostsRef,
     where("postId", "in", userData.savedPosts)
   );

   const savedPostsSnapshot = await getDocs(savedPostsQuery);

   const posts: IPost[] = [];

   for (const doc of savedPostsSnapshot.docs) {
     const postData = doc.data() as IPost;

     const postWithUser = { ...postData, user: userData } as IPost;
     posts.push(postWithUser);
   }

   return posts;
 } catch (error) {
   console.error("Error getting saved posts:", error);
   return [];
 }
}
