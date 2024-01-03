import {
  Route,
  Routes,
  Link,
  Outlet,
  useParams,
  useLocation,
} from "react-router-dom";

import { Button } from "@/components/ui/button";
import { LikedPosts } from "@/_root/pages";
import { useUserContext } from "@/context/AuthContext";
import {
  useGetUserById,
  useGetUserPosts,
} from "@/lib/react-query/queriesAndMutations";
import { GridPostList, Loader } from "@/components/shared";
import { getRandomInt } from "@/lib/utils";
import { useEffect, useState } from "react";
import { IUser } from "@/types";

interface StabBlockProps {
  value: string | number;
  label: string;
}

const StatBlock = ({ value, label }: StabBlockProps) => (
  <div className="flex-center gap-2">
    <p className="small-semibold lg:body-bold text-primary-500">{value}</p>
    <p className="small-medium lg:base-medium text-light-2">{label}</p>
  </div>
);

const Profile = () => {
  const { id } = useParams();
  const { user } = useUserContext();
  const { pathname } = useLocation();
  const [selectedUser, setSelectedUser] = useState<IUser | null>(null);

  const { data: userData } = useGetUserById(id || "");
  useEffect(() => {
    setSelectedUser(userData ?? null);
  }, [userData]);

  const {
    data: posts,
    isLoading: isUserLoading,
    isError: isErrorCreators,
  } = useGetUserPosts(selectedUser?.id || '');

  if (!selectedUser)
    return (
      <div className="flex-center w-full h-full">
        <Loader />
      </div>
    );




  return (
    <div className="profile-container">
      <div className="profile-inner_container">
        <div className="flex lg:flex-row flex-col max-xl:items-center flex-1 gap-7">
          <img
            src={selectedUser.image || "/assets/icons/profile-placeholder.svg"}
            alt="profile"
            className="w-28 h-28 lg:h-36 lg:w-36 rounded-full"
          />
          <div className="flex flex-col flex-1 justify-between md:mt-2">
            <div className="flex flex-col w-full">
              <h1 className="text-center xl:text-left h3-bold md:h1-semibold w-full">
                {selectedUser.name}
              </h1>
              <div className="flex items-center justify-center lg:justify-start">
                <img
                  src={"/assets/icons/email.svg"}
                  alt="edit"
                  width={20}
                  height={20}
                  className="mr-2" // Adjust margin as needed
                />
                <p className="text-center small-regular md:body-medium text-light-3  xl:text-left">
                  {selectedUser.email}
                </p>
              </div>
            </div>

            <div className="flex gap-8 mt-10 items-center justify-center xl:justify-start flex-wrap z-20">
              <StatBlock value={posts?.length || 0} label="Posts" />
              <StatBlock value={getRandomInt()} label="Followers" />
              <StatBlock value={getRandomInt()} label="Following" />
            </div>

            <p className="small-medium md:base-medium text-center xl:text-left mt-7 max-w-screen-sm">
              {selectedUser.bio}
            </p>
          </div>

          <div className="flex justify-center gap-4">
            <div className={`${user.id !== selectedUser.id && "hidden"}`}>
              <Link
                to={`/update-profile/${selectedUser.id}`}
                className={`h-12 bg-dark-4 px-5 text-light-1 flex-center gap-2 rounded-lg ${
                  user.id !== selectedUser.id && "hidden"
                }`}
              >
                <img
                  src={"/assets/icons/edit.svg"}
                  alt="edit"
                  width={20}
                  height={20}
                />
                <p className="flex whitespace-nowrap small-medium">
                  Edit Profile
                </p>
              </Link>
            </div>
            <div className={`${user.id === id && "hidden"}`}>
              <Button type="button" className="shad-button_primary px-8">
                Follow
              </Button>
            </div>
          </div>
        </div>
      </div>

      {selectedUser.id === user.id && (
        <div className="flex max-w-5xl w-full">
          <Link
            to={`/profile/${id}`}
            className={`profile-tab rounded-l-lg ${
              pathname === `/profile/${id}` && "!bg-dark-3"
            }`}
          >
            <img
              src={"/assets/icons/posts.svg"}
              alt="posts"
              width={20}
              height={20}
            />
            Posts
          </Link>
          <Link
            to={`/profile/${id}/liked-posts`}
            className={`profile-tab rounded-r-lg ${
              pathname === `/profile/${id}/liked-posts` && "!bg-dark-3"
            }`}
          >
            <img
              src={"/assets/icons/like.svg"}
              alt="like"
              width={20}
              height={20}
            />
            Liked Posts
          </Link>
        </div>
      )}

      <Routes>
        <Route
          index
          element={<GridPostList posts={posts || []} showUser={false} />}
        />
        {selectedUser.id === user.id && (
          <Route path="/liked-posts" element={<LikedPosts />} />
        )}
      </Routes>
      <Outlet />
    </div>
  );
};

export default Profile;
