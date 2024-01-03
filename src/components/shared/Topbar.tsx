import { useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";

import { Button } from "../ui/button";
import { useUserContext } from "@/context/AuthContext";
import {
  useGetUsers,
  useSignOutAccount,
} from "@/lib/react-query/queriesAndMutations";
import UserCard from "./UserCard";
import Loader from "./Loader";
import { Separator } from "../ui/separator";

const Topbar = () => {
  const navigate = useNavigate();
  const { user } = useUserContext();
  const { mutate: signOut, isSuccess } = useSignOutAccount();

  useEffect(() => {
    if (isSuccess) navigate(0);
  }, [isSuccess]);

  const {
    data: creators,
    isLoading: isUserLoading,
    isError: isErrorCreators,
  } = useGetUsers(10);

  return (
    <section className="topbar">
      <div className="flex-between py-4 px-5">
        <Link to="/" className="flex gap-3 items-center">
          <img
            src="/assets/images/logo.svg"
            alt="logo"
            width={200}
            height={325}
          />
        </Link>

        <div className="flex gap-4">
          <Button
            variant="ghost"
            className="shad-button_ghost"
            onClick={() => signOut()}
          >
            <img src="/assets/icons/logout.svg" alt="logout" />
          </Button>
          <Link to={`/profile/${user.id}`} className="flex-center gap-3">
            <img
              src={user.image || "/assets/icons/profile-placeholder.svg"}
              alt="profile"
              className="h-8 w-8 rounded-full"
            />
          </Link>
        </div>
      </div>
      <div className="flex-between py-4 px-5">
        <div className="justify-center justify-items-center flex h-8 items-center space-x-1 text-sm">
          <h4 className="h4-bold px-1 text-light-2">Top Creators</h4>
          <Separator orientation="vertical" />
        </div>

        {isUserLoading && !creators ? (
          <Loader />
        ) : (
          <ul className="flex gap-1 overflow-x-auto flex-nowrap custom-scrollbar">
            {creators?.map(
              (creator) =>
                user.id !== creator?.id && (
                  <li key={creator?.id}>
                    <UserCard user={creator} showInfo={false} />
                  </li>
                )
            )}
          </ul>
        )}
      </div>
    </section>
  );
};

export default Topbar;
