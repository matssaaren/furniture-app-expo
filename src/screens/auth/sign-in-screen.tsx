import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { useState } from 'react';
import {
  Alert,
  KeyboardAvoidingView,
  Platform,
  Pressable,
  SafeAreaView,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from 'react-native';

import {
  AuthTextInput,
  DividerLabel,
  GoogleButton,
  PrimaryButton,
  ScreenHeader,
} from '../../components/ui';
import { useAppContext } from '../../context/app-context';
import { AuthStackParamList } from '../../navigation/types';
import { colors, fonts } from '../../theme';

type Props = NativeStackScreenProps<AuthStackParamList, 'SignIn'>;

export function SignInScreen({ navigation }: Props) {
  const { isAuthenticating, signIn, signInWithDemo } = useAppContext();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [passwordVisible, setPasswordVisible] = useState(false);

  async function handleSignIn() {
    if (!email.trim() || !password.trim()) {
      Alert.alert('Missing details', 'Enter both your email and password to continue.');
      return;
    }

    try {
      await signIn(email, password);
    } catch (error) {
      Alert.alert('Could not sign in', error instanceof Error ? error.message : 'Please try again.');
    }
  }

  async function handleDemoSignIn() {
    try {
      await signInWithDemo();
    } catch (error) {
      Alert.alert('Could not sign in', error instanceof Error ? error.message : 'Please try again.');
    }
  }

  return (
    <SafeAreaView style={styles.safeArea}>
      <KeyboardAvoidingView
        behavior={Platform.select({ ios: 'padding', android: undefined })}
        style={styles.keyboard}
      >
        <ScrollView contentContainerStyle={styles.scrollContent} keyboardShouldPersistTaps="handled">
          <ScreenHeader
            onBackPress={() => navigation.canGoBack() ? navigation.goBack() : navigation.navigate('Splash')}
            title="Sign In"
          />

          <View style={styles.form}>
            <AuthTextInput
              autoCapitalize="none"
              keyboardType="email-address"
              label="E-mail"
              onChangeText={setEmail}
              placeholder="example@gmail.com"
              value={email}
            />

            <AuthTextInput
              label="Password"
              onChangeText={setPassword}
              onRightPress={() => setPasswordVisible((current) => !current)}
              placeholder="**********"
              rightIcon={passwordVisible ? 'eye' : 'eye-off'}
              secureTextEntry={!passwordVisible}
              value={password}
            />

            <PrimaryButton
              loading={isAuthenticating}
              onPress={handleSignIn}
              style={styles.primaryButton}
              title="Sign In"
            />

            <DividerLabel label="Or sign in with" />
            <GoogleButton onPress={handleDemoSignIn} />
          </View>

          <Pressable onPress={() => navigation.navigate('SignUp')} style={styles.footer}>
            <Text style={styles.footerText}>
              Don&apos;t have an account? <Text style={styles.footerTextBold}>Sign Up</Text>
            </Text>
          </Pressable>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    backgroundColor: colors.background,
    flex: 1,
  },
  keyboard: {
    flex: 1,
  },
  scrollContent: {
    flexGrow: 1,
    paddingHorizontal: 36,
    paddingTop: 8,
    paddingBottom: 28,
  },
  form: {
    gap: 24,
    marginTop: 54,
  },
  primaryButton: {
    marginTop: 18,
  },
  footer: {
    alignItems: 'center',
    marginTop: 'auto',
    paddingTop: 40,
  },
  footerText: {
    color: colors.primary,
    fontFamily: fonts.montserratMedium,
    fontSize: 14,
  },
  footerTextBold: {
    fontFamily: fonts.montserratSemiBold,
  },
});
