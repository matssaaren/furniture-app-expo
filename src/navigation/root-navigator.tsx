import {
  DefaultTheme,
  NavigationContainer,
  getFocusedRouteNameFromRoute,
} from '@react-navigation/native';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';

import { LoadingScreen } from '../components/ui';
import { useAppContext } from '../context/app-context';
import { SplashScreen } from '../screens/auth/splash-screen';
import { SignInScreen } from '../screens/auth/sign-in-screen';
import { SignUpScreen } from '../screens/auth/sign-up-screen';
import { FavoritesScreen } from '../screens/favorites/favorites-screen';
import { HomeScreen } from '../screens/home/home-screen';
import { ProductScreen } from '../screens/home/product-screen';
import { CreateListingScreen } from '../screens/profile/create-listing-screen';
import { MyListingsScreen } from '../screens/profile/my-listings-screen';
import { ProfileScreen } from '../screens/profile/profile-screen';
import { SettingsScreen } from '../screens/profile/settings-screen';
import {
  AuthStackParamList,
  FavoritesStackParamList,
  HomeStackParamList,
  MainTabParamList,
  ProfileStackParamList,
} from './types';
import { colors, shadows } from '../theme';

const AuthStack = createNativeStackNavigator<AuthStackParamList>();
const HomeStack = createNativeStackNavigator<HomeStackParamList>();
const FavoritesStack = createNativeStackNavigator<FavoritesStackParamList>();
const ProfileStack = createNativeStackNavigator<ProfileStackParamList>();
const Tabs = createBottomTabNavigator<MainTabParamList>();

function HomeStackNavigator() {
  return (
    <HomeStack.Navigator screenOptions={{ headerShown: false }}>
      <HomeStack.Screen component={HomeScreen} name="Home" />
      <HomeStack.Screen component={ProductScreen} name="Product" />
    </HomeStack.Navigator>
  );
}

function FavoritesStackNavigator() {
  return (
    <FavoritesStack.Navigator screenOptions={{ headerShown: false }}>
      <FavoritesStack.Screen component={FavoritesScreen} name="Favorites" />
      <FavoritesStack.Screen component={ProductScreen} name="Product" />
    </FavoritesStack.Navigator>
  );
}

function ProfileStackNavigator() {
  return (
    <ProfileStack.Navigator screenOptions={{ headerShown: false }}>
      <ProfileStack.Screen component={ProfileScreen} name="Profile" />
      <ProfileStack.Screen component={SettingsScreen} name="Settings" />
      <ProfileStack.Screen component={MyListingsScreen} name="MyListings" />
      <ProfileStack.Screen component={CreateListingScreen} name="CreateListing" />
      <ProfileStack.Screen component={ProductScreen} name="Product" />
    </ProfileStack.Navigator>
  );
}

function resolveTabBarStyle(routeName: string | undefined) {
  if (routeName === 'Product' || routeName === 'CreateListing') {
    return { display: 'none' as const };
  }

  return null;
}

function MainTabsNavigator() {
  return (
    <Tabs.Navigator
      screenOptions={({ route }) => {
        const focusedRoute = getFocusedRouteNameFromRoute(route);

        return {
          headerShown: false,
          sceneStyle: { backgroundColor: colors.background },
          tabBarShowLabel: false,
          tabBarStyle: [
            {
              backgroundColor: colors.background,
              borderTopWidth: 0,
              height: 75,
              paddingTop: 12,
              paddingBottom: 18,
              ...shadows.tabBar,
            },
            resolveTabBarStyle(focusedRoute),
          ],
          tabBarIcon: ({ focused }) => {
            if (route.name === 'HomeTab') {
              return (
                <Ionicons
                  color={focused ? colors.primary : colors.iconIdle}
                  name={focused ? 'home' : 'home-outline'}
                  size={24}
                />
              );
            }

            if (route.name === 'FavoritesTab') {
              return (
                <MaterialCommunityIcons
                  color={focused ? colors.primary : colors.iconIdle}
                  name={focused ? 'bookmark' : 'bookmark-outline'}
                  size={24}
                />
              );
            }

            return (
              <Ionicons
                color={focused ? colors.primary : colors.iconIdle}
                name={focused ? 'person' : 'person-outline'}
                size={24}
              />
            );
          },
        };
      }}
    >
      <Tabs.Screen component={HomeStackNavigator} name="HomeTab" />
      <Tabs.Screen component={FavoritesStackNavigator} name="FavoritesTab" />
      <Tabs.Screen component={ProfileStackNavigator} name="ProfileTab" />
    </Tabs.Navigator>
  );
}

function AuthNavigator() {
  return (
    <AuthStack.Navigator initialRouteName="Splash" screenOptions={{ headerShown: false }}>
      <AuthStack.Screen component={SplashScreen} name="Splash" />
      <AuthStack.Screen component={SignInScreen} name="SignIn" />
      <AuthStack.Screen component={SignUpScreen} name="SignUp" />
    </AuthStack.Navigator>
  );
}

export function RootNavigator() {
  const { isAuthenticated, isReady } = useAppContext();

  if (!isReady) {
    return <LoadingScreen />;
  }

  return (
    <NavigationContainer
      theme={{
        ...DefaultTheme,
        colors: {
          ...DefaultTheme.colors,
          background: colors.background,
          border: 'transparent',
          card: colors.background,
          notification: colors.primary,
          primary: colors.primary,
          text: colors.text,
        },
      }}
    >
      {isAuthenticated ? <MainTabsNavigator /> : <AuthNavigator />}
    </NavigationContainer>
  );
}
