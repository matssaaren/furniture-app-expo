import AsyncStorage from '@react-native-async-storage/async-storage';
import {
  createContext,
  PropsWithChildren,
  useContext,
  useEffect,
  useState,
} from 'react';
import { Image } from 'react-native';

import { request } from '../api/client';
import {
  AuthResponse,
  BootstrapData,
  CreateListingPayload,
  Profile,
  SessionUser,
} from '../types';

const SESSION_STORAGE_KEY = 'furniture-store-session-token';
const AUTH_BOOTSTRAP_RETRY_COUNT = 3;
const AUTH_BOOTSTRAP_TIMEOUT_MS = 12000;

type AppContextValue = {
  bootstrap: BootstrapData | null;
  sessionUser: SessionUser | null;
  isReady: boolean;
  isAuthenticated: boolean;
  isAuthenticating: boolean;
  isMutating: boolean;
  signIn: (email: string, password: string) => Promise<void>;
  signUp: (name: string, email: string, password: string) => Promise<void>;
  signInWithDemo: () => Promise<void>;
  signOut: () => Promise<void>;
  refreshBootstrap: () => Promise<void>;
  toggleFavorite: (productId: string) => Promise<void>;
  updateProfile: (profile: Pick<Profile, 'name' | 'email'>) => Promise<void>;
  deleteListing: (listingId: string) => Promise<void>;
  createListing: (payload: CreateListingPayload) => Promise<void>;
};

const AppContext = createContext<AppContextValue | undefined>(undefined);

function normalizeEmail(email: string) {
  return email.trim().toLowerCase();
}

function createSessionUser(bootstrapData: BootstrapData): SessionUser {
  return {
    id: bootstrapData.profile.id,
    name: bootstrapData.profile.name,
    email: bootstrapData.profile.email,
  };
}

function isExistingAccountError(error: unknown) {
  return error instanceof Error && /already exists/i.test(error.message);
}

function wait(delayMs: number) {
  return new Promise((resolve) => setTimeout(resolve, delayMs));
}

export function AppProvider({ children }: PropsWithChildren) {
  const [token, setToken] = useState<string | null>(null);
  const [bootstrap, setBootstrap] = useState<BootstrapData | null>(null);
  const [sessionUser, setSessionUser] = useState<SessionUser | null>(null);
  const [isReady, setIsReady] = useState(false);
  const [isAuthenticating, setIsAuthenticating] = useState(false);
  const [isMutating, setIsMutating] = useState(false);

  useEffect(() => {
    void restoreSession();
  }, []);

  useEffect(() => {
    if (!bootstrap) {
      return;
    }

    const imageUrls = [...new Set(bootstrap.products.map((product) => product.imageUrl))];

    imageUrls.forEach((imageUrl) => {
      void Image.prefetch(imageUrl);
    });
  }, [bootstrap]);

  async function restoreSession() {
    try {
      const storedToken = await AsyncStorage.getItem(SESSION_STORAGE_KEY);

      if (!storedToken) {
        setIsReady(true);
        return;
      }

      const nextBootstrap = await loadBootstrap(storedToken);
      setToken(storedToken);
      setBootstrap(nextBootstrap);
      setSessionUser(createSessionUser(nextBootstrap));
    } catch {
      await AsyncStorage.removeItem(SESSION_STORAGE_KEY);
      setToken(null);
      setBootstrap(null);
      setSessionUser(null);
    } finally {
      setIsReady(true);
    }
  }

  async function loadBootstrap(authToken: string) {
    let lastError: unknown;

    for (let attempt = 0; attempt < AUTH_BOOTSTRAP_RETRY_COUNT; attempt += 1) {
      try {
        return await request<BootstrapData>(
          '/bootstrap',
          { timeoutMs: AUTH_BOOTSTRAP_TIMEOUT_MS },
          authToken
        );
      } catch (error) {
        lastError = error;

        if (attempt < AUTH_BOOTSTRAP_RETRY_COUNT - 1) {
          await wait(400 * (attempt + 1));
        }
      }
    }

    throw lastError instanceof Error ? lastError : new Error('Could not load your account.');
  }

  async function finishAuthentication(response: AuthResponse, failureMessage?: string) {
    await AsyncStorage.setItem(SESSION_STORAGE_KEY, response.token);
    setToken(response.token);
    setSessionUser(response.user);

    try {
      const nextBootstrap = await loadBootstrap(response.token);
      setBootstrap(nextBootstrap);
      setSessionUser(createSessionUser(nextBootstrap));
    } catch (error) {
      await AsyncStorage.removeItem(SESSION_STORAGE_KEY);
      setToken(null);
      setBootstrap(null);
      setSessionUser(null);

      if (failureMessage) {
        throw new Error(failureMessage);
      }

      throw error;
    }
  }

  async function signIn(email: string, password: string) {
    setIsAuthenticating(true);

    try {
      const normalizedEmail = normalizeEmail(email);
      const response = await request<AuthResponse>('/auth/sign-in', {
        method: 'POST',
        body: JSON.stringify({ email: normalizedEmail, password }),
      });

      await finishAuthentication(response);
    } finally {
      setIsAuthenticating(false);
    }
  }

  async function signUp(name: string, email: string, password: string) {
    setIsAuthenticating(true);

    try {
      const trimmedName = name.trim();
      const normalizedEmail = normalizeEmail(email);

      try {
        const response = await request<AuthResponse>('/auth/sign-up', {
          method: 'POST',
          body: JSON.stringify({ name: trimmedName, email: normalizedEmail, password }),
        });

        await finishAuthentication(
          response,
          'Your account was created, but the app could not load it yet. Sign in once with the same details.'
        );
      } catch (error) {
        if (!isExistingAccountError(error)) {
          throw error;
        }

        const response = await request<AuthResponse>('/auth/sign-in', {
          method: 'POST',
          body: JSON.stringify({ email: normalizedEmail, password }),
        });

        await finishAuthentication(response);
      }
    } finally {
      setIsAuthenticating(false);
    }
  }

  async function signInWithDemo() {
    setIsAuthenticating(true);

    try {
      const response = await request<AuthResponse>('/auth/demo', {
        method: 'POST',
      });

      await finishAuthentication(response);
    } finally {
      setIsAuthenticating(false);
    }
  }

  async function signOut() {
    await AsyncStorage.removeItem(SESSION_STORAGE_KEY);
    setToken(null);
    setBootstrap(null);
    setSessionUser(null);
  }

  async function refreshBootstrap() {
    if (!token) {
      return;
    }

    setIsMutating(true);

    try {
      const nextBootstrap = await loadBootstrap(token);
      setBootstrap(nextBootstrap);
      setSessionUser(createSessionUser(nextBootstrap));
    } finally {
      setIsMutating(false);
    }
  }

  async function toggleFavorite(productId: string) {
    if (!token) {
      return;
    }

    setIsMutating(true);

    try {
      const nextBootstrap = await request<BootstrapData>(
        `/favorites/${productId}/toggle`,
        { method: 'POST' },
        token
      );

      setBootstrap(nextBootstrap);
      setSessionUser(createSessionUser(nextBootstrap));
    } finally {
      setIsMutating(false);
    }
  }

  async function updateProfile(profile: Pick<Profile, 'name' | 'email'>) {
    if (!token || !bootstrap) {
      return;
    }

    setIsMutating(true);

    try {
      const nextProfile = await request<Profile>(
        '/profile',
        {
          method: 'PUT',
          body: JSON.stringify(profile),
        },
        token
      );

      setBootstrap({
        ...bootstrap,
        profile: nextProfile,
      });
      setSessionUser({
        id: nextProfile.id,
        name: nextProfile.name,
        email: nextProfile.email,
      });
    } finally {
      setIsMutating(false);
    }
  }

  async function deleteListing(listingId: string) {
    if (!token) {
      return;
    }

    setIsMutating(true);

    try {
      await request<void>(`/listings/${listingId}`, { method: 'DELETE' }, token);
      const nextBootstrap = await request<BootstrapData>('/bootstrap', {}, token);
      setBootstrap(nextBootstrap);
    } finally {
      setIsMutating(false);
    }
  }

  async function createListing(payload: CreateListingPayload) {
    if (!token) {
      return;
    }

    setIsMutating(true);

    try {
      const body = new FormData();
      body.append('title', payload.title);
      body.append('category', payload.category);
      body.append('price', payload.price);
      body.append('description', payload.description);
      body.append(
        'image',
        {
          uri: payload.imageUri,
          name: payload.imageName,
          type: payload.imageType,
        } as never
      );

      await request('/listings', { method: 'POST', body }, token);
      const nextBootstrap = await request<BootstrapData>('/bootstrap', {}, token);
      setBootstrap(nextBootstrap);
    } finally {
      setIsMutating(false);
    }
  }

  return (
    <AppContext.Provider
      value={{
        bootstrap,
        sessionUser,
        isReady,
        isAuthenticated: Boolean(token && bootstrap),
        isAuthenticating,
        isMutating,
        signIn,
        signUp,
        signInWithDemo,
        signOut,
        refreshBootstrap,
        toggleFavorite,
        updateProfile,
        deleteListing,
        createListing,
      }}
    >
      {children}
    </AppContext.Provider>
  );
}

export function useAppContext() {
  const context = useContext(AppContext);

  if (!context) {
    throw new Error('useAppContext must be used inside AppProvider.');
  }

  return context;
}
