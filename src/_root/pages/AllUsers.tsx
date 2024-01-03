import { useToast } from "@/components/ui/use-toast";
import { Loader, UserCard } from "@/components/shared";
import { useGetUsers } from "@/lib/react-query/queriesAndMutations";
import { useUserContext } from "@/context/AuthContext";

const AllUsers = () => {
  const { toast } = useToast();
  const { user } = useUserContext();

  const { data: creators, isLoading, isError: isErrorCreators } = useGetUsers();

  if (isErrorCreators) {
    toast({ title: "Something went wrong." });
    return <></>;
  }

  return (
    <div className="common-container">
      <div className="user-container">
        <h2 className="h3-bold md:h2-bold text-left w-full">All Users</h2>
        {isLoading && !creators ? (
          <Loader />
        ) : (
          <ul className="user-grid">
            {creators?.map(
              (creator) =>
                user.id !== creator?.id && (
                  <li key={creator?.id}>
                    <UserCard user={creator}  />
                  </li>
                )
            )}
          </ul>
        )}
      </div>
    </div>
  );
};

export default AllUsers;
