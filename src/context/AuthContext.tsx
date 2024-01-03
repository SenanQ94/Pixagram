import { getCurrentUser } from "@/lib/firebase/firebaseApi";
import { auth } from "@/lib/firebase/firebaseConfig";
import { IContextType, IUser } from "@/types";
import { getAuth, onAuthStateChanged } from "firebase/auth";
import { getDocs, query, where } from "firebase/firestore";
import { createContext, useContext, useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

export const INITIAL_USER = {
  id: "",
  name: "",
  username: "",
  email: "",
  image: "",
  bio: "",
  savedPosts:[]
};

const INITIAL_STATE = {
  user: INITIAL_USER,
  isLoading: false,
  isAuthenticated: false,
  setUser: () => {},
  setIsAuthenticated: () => {},
  checkAuthUser: async () => false as boolean,
};

export const AuthContext = createContext<IContextType>(INITIAL_STATE);

const AuthProvider = ({ children }: { children: React.ReactNode }) => {
  const [user, setUser] = useState<IUser>(INITIAL_USER);
  const [isLoading, setIsLoading] = useState(true);
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  const navigate = useNavigate();

  const checkAuthUser = async () => {
    setIsLoading(true);
    try {
      const currentAccount: IUser | null = await getCurrentUser();
      if (currentAccount) {
        setUser({
          id: currentAccount.id,
          name: currentAccount.name,
          email: currentAccount.email,
          image: currentAccount.image,
          bio: currentAccount.bio,
          savedPosts: currentAccount.savedPosts
        });
        setIsAuthenticated(true);

        return true;
      } else {
        setIsAuthenticated(false);
        return false;
      }
    } catch (error) {
      console.error(error);
      setIsAuthenticated(false);
      return false;
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    setIsLoading(true);
    const initializeAuth = async () => {
      await checkAuthUser();

      if (!isAuthenticated) {
        navigate("/sign-in");
      }
      setIsLoading(false);
    };

    initializeAuth();
  }, []);

  const value = {
    user,
    setUser,
    isLoading,
    isAuthenticated,
    setIsAuthenticated,
    checkAuthUser,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export default AuthProvider;

export const useUserContext = () => useContext(AuthContext);
