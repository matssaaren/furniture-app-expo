import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { Image, Pressable, ScrollView, StyleSheet, Text, View, useWindowDimensions } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { splashIllustration } from '../../assets';
import { PrimaryButton } from '../../components/ui';
import { AuthStackParamList } from '../../navigation/types';
import { colors, fonts } from '../../theme';

type Props = NativeStackScreenProps<AuthStackParamList, 'Splash'>;

export function SplashScreen({ navigation }: Props) {
  const { height, width } = useWindowDimensions();
  const isCompactHeight = height < 760;
  const illustrationWidth = Math.min(width - 72, 357);

  return (
    <SafeAreaView edges={['top', 'bottom']} style={styles.safeArea}>
      <ScrollView
        bounces={false}
        contentContainerStyle={styles.container}
        showsVerticalScrollIndicator={false}
      >
        <View style={[styles.hero, isCompactHeight && styles.heroCompact]}>
          <Image
            resizeMode="contain"
            source={splashIllustration}
            style={[
              styles.illustration,
              {
                height: isCompactHeight ? 208 : 240,
                width: illustrationWidth,
              },
            ]}
          />

          <View style={styles.copyBlock}>
            <Text style={[styles.headline, isCompactHeight && styles.headlineCompact]}>
              You&apos;ll Find
            </Text>
            <Text style={[styles.highlight, isCompactHeight && styles.headlineCompact]}>
              All you need
            </Text>
            <Text style={[styles.headline, isCompactHeight && styles.headlineCompact]}>Here!</Text>
          </View>
        </View>

        <View style={[styles.actions, isCompactHeight && styles.actionsCompact]}>
          <PrimaryButton onPress={() => navigation.navigate('SignUp')} title="Sign Up" />
          <Pressable onPress={() => navigation.navigate('SignIn')} style={styles.secondaryAction}>
            <Text style={styles.secondaryActionText}>Sign In</Text>
          </Pressable>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    backgroundColor: colors.background,
    flex: 1,
  },
  container: {
    backgroundColor: colors.background,
    flexGrow: 1,
    justifyContent: 'space-between',
    paddingHorizontal: 36,
    paddingVertical: 24,
  },
  hero: {
    alignItems: 'center',
    gap: 36,
    paddingTop: 52,
  },
  heroCompact: {
    gap: 24,
    paddingTop: 16,
  },
  illustration: {
    alignSelf: 'center',
  },
  copyBlock: {
    alignItems: 'center',
  },
  headline: {
    color: colors.text,
    fontFamily: fonts.montserratBold,
    fontSize: 40,
    lineHeight: 50,
  },
  headlineCompact: {
    fontSize: 34,
    lineHeight: 42,
  },
  highlight: {
    color: colors.orange,
    fontFamily: fonts.montserratBold,
    fontSize: 40,
    lineHeight: 50,
    textDecorationLine: 'underline',
  },
  actions: {
    gap: 28,
    paddingBottom: 16,
    paddingTop: 32,
  },
  actionsCompact: {
    paddingTop: 24,
  },
  secondaryAction: {
    alignItems: 'center',
  },
  secondaryActionText: {
    color: colors.primary,
    fontFamily: fonts.montserratBold,
    fontSize: 16,
  },
});
