import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { useEffect, useState } from 'react';
import {
  Alert,
  Pressable,
  SafeAreaView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';

import { ScreenHeader } from '../../components/ui';
import { useAppContext } from '../../context/app-context';
import { ProfileStackParamList } from '../../navigation/types';
import { colors, fonts, shadows, spacing } from '../../theme';

type Props = NativeStackScreenProps<ProfileStackParamList, 'Settings'>;

function InfoCard({
  title,
  value,
  editable,
  onChangeText,
}: {
  title: string;
  value: string;
  editable: boolean;
  onChangeText: (nextValue: string) => void;
}) {
  return (
    <View style={styles.infoCard}>
      <Text style={styles.infoCardLabel}>{title}</Text>
      <TextInput
        editable={editable}
        onChangeText={onChangeText}
        style={styles.infoCardValue}
        value={value}
      />
    </View>
  );
}

function HelpRow({
  title,
  onPress,
}: {
  title: string;
  onPress: () => void;
}) {
  return (
    <Pressable onPress={onPress} style={styles.helpRow}>
      <Text style={styles.helpRowTitle}>{title}</Text>
      <Text style={styles.helpRowChevron}>›</Text>
    </Pressable>
  );
}

export function SettingsScreen({ navigation }: Props) {
  const { bootstrap, isMutating, updateProfile } = useAppContext();
  const [editing, setEditing] = useState(false);
  const [name, setName] = useState(bootstrap?.profile.name ?? '');
  const [email, setEmail] = useState(bootstrap?.profile.email ?? '');

  useEffect(() => {
    setName(bootstrap?.profile.name ?? '');
    setEmail(bootstrap?.profile.email ?? '');
  }, [bootstrap?.profile.email, bootstrap?.profile.name]);

  async function handleHeaderAction() {
    if (!editing) {
      setEditing(true);
      return;
    }

    try {
      await updateProfile({ name, email });
      setEditing(false);
    } catch (error) {
      Alert.alert('Could not save profile', error instanceof Error ? error.message : 'Please try again.');
    }
  }

  function openHelp(title: string, body: string | undefined) {
    Alert.alert(title, body ?? 'No details available.');
  }

  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.container}>
        <ScreenHeader
          onBackPress={() => navigation.goBack()}
          onRightPress={() => void handleHeaderAction()}
          rightIcon={editing ? 'check' : 'edit-2'}
          title="Settings"
        />

        <Text style={styles.sectionTitle}>Personal Information</Text>
        <View style={styles.sectionStack}>
          <InfoCard editable={editing && !isMutating} onChangeText={setName} title="Name" value={name} />
          <InfoCard editable={editing && !isMutating} onChangeText={setEmail} title="Email" value={email} />
        </View>

        <Text style={styles.sectionTitle}>Help Center</Text>
        <View style={styles.helpStack}>
          <HelpRow onPress={() => openHelp('FAQ', bootstrap?.helpCenter.faq)} title="FAQ" />
          <HelpRow
            onPress={() => openHelp('Contact Us', bootstrap?.helpCenter.contactUs)}
            title="Contact Us"
          />
          <HelpRow
            onPress={() => openHelp('Privacy & Terms', bootstrap?.helpCenter.privacyTerms)}
            title="Privacy & Terms"
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
  sectionTitle: {
    color: colors.muted,
    fontFamily: fonts.nunitoSemiBold,
    fontSize: 16,
    marginTop: 22,
    marginBottom: 16,
  },
  sectionStack: {
    gap: 14,
  },
  infoCard: {
    backgroundColor: colors.background,
    borderRadius: 4,
    minHeight: 64,
    paddingHorizontal: 16,
    paddingVertical: 12,
    ...shadows.card,
  },
  infoCardLabel: {
    color: colors.tertiaryText,
    fontFamily: fonts.nunitoRegular,
    fontSize: 12,
    marginBottom: 6,
  },
  infoCardValue: {
    color: colors.primary,
    fontFamily: fonts.nunitoSemiBold,
    fontSize: 14,
    padding: 0,
  },
  helpStack: {
    gap: 10,
  },
  helpRow: {
    alignItems: 'center',
    backgroundColor: colors.background,
    borderRadius: 4,
    flexDirection: 'row',
    justifyContent: 'space-between',
    minHeight: 54,
    paddingHorizontal: 20,
    ...shadows.card,
  },
  helpRowTitle: {
    color: colors.primary,
    fontFamily: fonts.nunitoBold,
    fontSize: 16,
  },
  helpRowChevron: {
    color: colors.primary,
    fontFamily: fonts.montserratMedium,
    fontSize: 28,
  },
});
