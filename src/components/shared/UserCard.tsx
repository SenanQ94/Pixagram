import { Models } from "appwrite";
import { Link } from "react-router-dom";

import { Button } from "../ui/button";
import { IUser } from "@/types";

type UserCardProps = {
  user: IUser;
  showInfo?: boolean;
};

const UserCard = ({ user, showInfo = true }: UserCardProps) => {
  return (
    <Link
      to={`/profile/${user.id}`}
      className={showInfo ? "user-card" : "user-card-topbar"}
    >
      <img
        src={user.image || "/assets/icons/profile-placeholder.svg"}
        alt="creator"
        className={`rounded-full  ${showInfo ? "w-14 h-14" : "w-8 h-8"}`}
      />

      <div className="flex-center flex-col gap-1">
        <p
          className={` text-light-1 text-center line-clamp-1 ${
            showInfo ? "base-medium" : "text-sm"
          }`}
        >
          {user.name}
        </p>
        {showInfo && (
          <p className="break-all small-regular lg:tiny-medium2 text-light-3 text-center line-clamp-1">
            {user.email}
          </p>
        )}
      </div>
      {showInfo && (
        <Button type="button" size="sm" className="shad-button_primary px-5">
          Follow
        </Button>
      )}
    </Link>
  );
};

export default UserCard;
