export type IContextType = {
  user: IUser;
  isLoading: boolean;
  setUser: React.Dispatch<React.SetStateAction<IUser>>;
  isAuthenticated: boolean;
  setIsAuthenticated: React.Dispatch<React.SetStateAction<boolean>>;
  checkAuthUser: () => Promise<boolean>;
};

export type INavLink = {
  imgURL: string;
  route: string;
  label: string;
};

export type IUpdateUser = {
  userId: string;
  name: string;
  bio: string;
  imageUrl: URL | string;
  file: File[];
};

export type INewPost = {
  userId: string;
  caption: string;
  file: File[];
  location?: string;
  tags?: string;
};

export type IPost = {
  postId: string;
  creator: string;
  caption: string;
  imageUrl: string;
  location?: string;
  tags?: string[];
  updatedAt: string;
  likes:  string[];
  user: IUser;
};

export type IUpdatePost = {
  postId: string;
  caption: string;
  imageUrl: string;
  file: File[];
  location?: string;
 tags?: string;
  updatedAt?: string;
  creator?: string;
  // tags?: string[];
  likes?:  string[];
  user?: IUser;
};

export type IUser = {
  id: string;
  name: string;
  email: string;
  image: string;
  bio: string;
  savedPosts: string[];
};

export type INewUser = {
  name: string;
  email: string;
  password: string;
  image: File;
};

export type ILocation = {
  place_id: number;
  licence: string;
  osm_type: string;
  osm_id: number;
  lat: string;
  lon: string;
  class: string;
  type: string;
  place_rank: number;
  importance: number;
  addresstype: string;
  name: string;
  display_name: string;
  address: {
    house_number?: string;
    road?: string;
    suburb?: string;
    city?: string;
    county?: string;
    state?: string;
    ISO3166_2_lvl4?: string;
    postcode?: string;
    country?: string;
    country_code?: string;
  };
  boundingbox: string[];
};
