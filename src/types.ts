export type Category = {
  id: string;
  label: string;
  icon: string;
};

export type Product = {
  id: string;
  name: string;
  category: string;
  cardPrice: number;
  detailPrice: number;
  description: string;
  imageUrl: string;
  sellerName: string;
  sellerEmail: string;
  isFavorite: boolean;
  isOwnListing: boolean;
};

export type Profile = {
  id: string;
  name: string;
  email: string;
  listingsSummary: string;
  settingsSummary: string;
};

export type HelpCenter = {
  faq: string;
  contactUs: string;
  privacyTerms: string;
};

export type BootstrapData = {
  categories: Category[];
  homeProducts: Product[];
  favorites: Product[];
  listings: Product[];
  products: Product[];
  profile: Profile;
  helpCenter: HelpCenter;
};

export type SessionUser = {
  id: string;
  name: string;
  email: string;
};

export type AuthResponse = {
  token: string;
  user: SessionUser;
};

export type CreateListingPayload = {
  title: string;
  category: string;
  price: string;
  description: string;
  imageUri: string;
  imageName: string;
  imageType: string;
};
