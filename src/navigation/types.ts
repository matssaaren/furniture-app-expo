export type AuthStackParamList = {
  Splash: undefined;
  SignIn: undefined;
  SignUp: undefined;
};

export type HomeStackParamList = {
  Home: undefined;
  Product: { productId: string };
};

export type FavoritesStackParamList = {
  Favorites: undefined;
  Product: { productId: string };
};

export type ProfileStackParamList = {
  Profile: undefined;
  Settings: undefined;
  MyListings: undefined;
  CreateListing: undefined;
  Product: { productId: string };
};

export type MainTabParamList = {
  HomeTab: undefined;
  FavoritesTab: undefined;
  ProfileTab: undefined;
};
