import { Gelasio_500Medium } from '@expo-google-fonts/gelasio';
import {
  Montserrat_500Medium,
  Montserrat_600SemiBold,
  Montserrat_700Bold,
} from '@expo-google-fonts/montserrat';
import {
  NunitoSans_300Light,
  NunitoSans_400Regular,
  NunitoSans_600SemiBold,
  NunitoSans_700Bold,
} from '@expo-google-fonts/nunito-sans';
import { useFonts } from 'expo-font';
import { StatusBar } from 'expo-status-bar';
import { StyleSheet } from 'react-native';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { SafeAreaProvider } from 'react-native-safe-area-context';

import { LoadingScreen } from './src/components/ui';
import { AppProvider } from './src/context/app-context';
import { RootNavigator } from './src/navigation/root-navigator';

export default function App() {
  const [fontsLoaded] = useFonts({
    GelasioMedium: Gelasio_500Medium,
    MontserratBold: Montserrat_700Bold,
    MontserratMedium: Montserrat_500Medium,
    MontserratSemiBold: Montserrat_600SemiBold,
    NunitoBold: NunitoSans_700Bold,
    NunitoLight: NunitoSans_300Light,
    NunitoRegular: NunitoSans_400Regular,
    NunitoSemiBold: NunitoSans_600SemiBold,
  });

  if (!fontsLoaded) {
    return <LoadingScreen />;
  }

  return (
    <GestureHandlerRootView style={styles.root}>
      <SafeAreaProvider>
        <AppProvider>
          <StatusBar style="dark" />
          <RootNavigator />
        </AppProvider>
      </SafeAreaProvider>
    </GestureHandlerRootView>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
  },
});
