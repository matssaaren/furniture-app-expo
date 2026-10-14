import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { Pressable, SafeAreaView, StyleSheet, Text, View } from 'react-native';

import { PrimaryButton, ScreenHeader } from '../../components/ui';
import { useAppContext } from '../../context/app-context';
import { ProfileStackParamList } from '../../navigation/types';
import { colors, fonts, shadows, spacing } from '../../theme';

type Props = NativeStackScreenProps<ProfileStackParamList, 'Profile'>;

function ActionCard({
  title,
  subtitle,
  onPress,
}: {
  title: string;
  subtitle: string;
  onPress: () => void;
}) {
  return (
    <Pressable onPress={onPress} style={styles.actionCard}>
      <View>
        <Text style={styles.actionCardTitle}>{title}</Text>
        <Text style={styles.actionCardSubtitle}>{subtitle}</Text>
      </View>
      <Text style={styles.chevron}>›</Text>
    </Pressable>
  );
}

export function ProfileScreen({ navigation }: Props) {
  const { bootstrap, signOut } = useAppContext();

  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.container}>
        <ScreenHeader onRightPress={() => void signOut()} rightIcon="log-out" title="Profile" />

        <Text style={styles.name}>{bootstrap?.profile.name}</Text>
        <Text style={styles.email}>{bootstrap?.profile.email}</Text>

        <View style={styles.cardStack}>
          <ActionCard
            onPress={() => navigation.navigate('MyListings')}
            subtitle={bootstrap?.profile.listingsSummary ?? 'Already have 0 listings'}
            title="My Listings"
          />
          <ActionCard
            onPress={() => navigation.navigate('Settings')}
            subtitle={bootstrap?.profile.settingsSummary ?? 'Account, FAQ, Contact'}
            title="Settings"
          />
        </View>

        <View style={styles.footer}>
          <PrimaryButton
            onPress={() => navigation.navigate('CreateListing')}
            title="Add a new listing"
          />
        </View>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    backgroundColor: colors.background,
    flex: 1,
  },
  container: {
    flex: 1,
    paddingHorizontal: spacing.screenHorizontal,
  },
  name: {
    color: colors.text,
    fontFamily: fonts.nunitoBold,
    fontSize: 20,
    marginTop: 12,
  },
  email: {
    color: colors.tertiaryText,
    fontFamily: fonts.nunitoRegular,
    fontSize: 14,
    marginTop: 8,
  },
  cardStack: {
    gap: 26,
    marginTop: 26,
  },
  actionCard: {
    alignItems: 'center',
    backgroundColor: colors.background,
    flexDirection: 'row',
    justifyContent: 'space-between',
    minHeight: 80,
    paddingHorizontal: 20,
    ...shadows.card,
  },
  actionCardTitle: {
    color: colors.primary,
    fontFamily: fonts.nunitoBold,
    fontSize: 18,
    marginBottom: 6,
  },
  actionCardSubtitle: {
    color: colors.tertiaryText,
    fontFamily: fonts.nunitoRegular,
    fontSize: 12,
  },
  chevron: {
    color: colors.primary,
    fontFamily: fonts.montserratMedium,
    fontSize: 28,
  },
  footer: {
    marginTop: 'auto',
    paddingBottom: 32,
  },
});
