import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { Ionicons } from '@expo/vector-icons';
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

type Props = NativeStackScreenProps<AuthStackParamList, 'SignUp'>;

export function SignUpScreen({ navigation }: Props) {
  const { isAuthenticating, signInWithDemo, signUp } = useAppContext();
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [passwordVisible, setPasswordVisible] = useState(false);
  const [termsAccepted, setTermsAccepted] = useState(true);

  async function handleSignUp() {
    if (!name.trim() || !email.trim() || !password.trim()) {
      Alert.alert('Missing details', 'Complete every field before creating your account.');
      return;
    }

    if (!termsAccepted) {
      Alert.alert('Terms required', 'Accept the terms and privacy policy to continue.');
      return;
    }

    try {
      await signUp(name, email, password);
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Please try again.';
      const title = /already exists/i.test(message) ? 'Account already exists' : 'Could not sign up';

      Alert.alert(title, message);
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
            title="Sign Up"
          />

          <View style={styles.form}>
            <AuthTextInput
              label="Name"
              onChangeText={setName}
              placeholder="John Doe"
              value={name}
            />

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

            <Pressable onPress={() => setTermsAccepted((current) => !current)} style={styles.checkboxRow}>
              <View style={[styles.checkbox, termsAccepted && styles.checkboxActive]}>
                {termsAccepted ? <Ionicons color={colors.background} name="checkmark" size={16} /> : null}
              </View>
              <Text style={styles.checkboxText}>
                I agree with <Text style={styles.checkboxTextBold}>Terms &amp; Privacy</Text>
              </Text>
            </Pressable>

            <PrimaryButton
              loading={isAuthenticating}
              onPress={handleSignUp}
              style={styles.primaryButton}
              title="Sign Up"
            />

            <DividerLabel label="Or sign up with" />
            <GoogleButton onPress={handleDemoSignIn} />
          </View>

          <Pressable onPress={() => navigation.navigate('SignIn')} style={styles.footer}>
            <Text style={styles.footerText}>
              Already have an account? <Text style={styles.footerTextBold}>Sign In</Text>
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
    paddingHorizontal: 35,
    paddingTop: 8,
    paddingBottom: 28,
  },
  form: {
    gap: 24,
    marginTop: 34,
  },
  checkboxRow: {
    alignItems: 'center',
    flexDirection: 'row',
    gap: 12,
  },
  checkbox: {
    alignItems: 'center',
    borderColor: colors.border,
    borderRadius: 6,
    borderWidth: 1,
    height: 22,
    justifyContent: 'center',
    width: 22,
  },
  checkboxActive: {
    backgroundColor: colors.border,
  },
  checkboxText: {
    color: colors.primary,
    fontFamily: fonts.montserratMedium,
    fontSize: 14,
  },
  checkboxTextBold: {
    fontFamily: fonts.montserratBold,
  },
  primaryButton: {
    marginTop: 4,
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
