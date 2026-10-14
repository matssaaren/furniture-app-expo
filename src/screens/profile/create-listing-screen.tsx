import { Feather, Ionicons } from '@expo/vector-icons';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import * as ImagePicker from 'expo-image-picker';
import { useState } from 'react';
import {
  Alert,
  Image,
  KeyboardAvoidingView,
  Platform,
  Pressable,
  SafeAreaView,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';

import { PrimaryButton, ScreenHeader } from '../../components/ui';
import { useAppContext } from '../../context/app-context';
import { ProfileStackParamList } from '../../navigation/types';
import { colors, fonts, spacing } from '../../theme';

type Props = NativeStackScreenProps<ProfileStackParamList, 'CreateListing'>;

type SelectedImage = {
  uri: string;
  name: string;
  type: string;
};

export function CreateListingScreen({ navigation }: Props) {
  const { bootstrap, createListing, isMutating } = useAppContext();
  const [title, setTitle] = useState('');
  const [price, setPrice] = useState('');
  const [description, setDescription] = useState('');
  const [category, setCategory] = useState('');
  const [showCategories, setShowCategories] = useState(false);
  const [selectedImage, setSelectedImage] = useState<SelectedImage | null>(null);

  const categories = (bootstrap?.categories ?? []).filter((entry) => entry.id !== 'popular');
  const selectedCategoryLabel = categories.find((entry) => entry.id === category)?.label ?? '';

  async function handleImagePick() {
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      quality: 0.85,
    });

    if (result.canceled || !result.assets[0]) {
      return;
    }

    const asset = result.assets[0];
    setSelectedImage({
      uri: asset.uri,
      name: asset.fileName ?? `listing-${Date.now()}.jpg`,
      type: asset.mimeType ?? 'image/jpeg',
    });
  }

  async function handleSubmit() {
    if (!title.trim() || !category || !price.trim() || !description.trim() || !selectedImage) {
      Alert.alert('Incomplete listing', 'Add a title, category, price, description, and photo.');
      return;
    }

    try {
      await createListing({
        title,
        category,
        price,
        description,
        imageUri: selectedImage.uri,
        imageName: selectedImage.name,
        imageType: selectedImage.type,
      });

      navigation.navigate('MyListings');
    } catch (error) {
      Alert.alert('Could not create listing', error instanceof Error ? error.message : 'Please try again.');
    }
  }

  return (
    <SafeAreaView style={styles.safeArea}>
      <KeyboardAvoidingView
        behavior={Platform.select({ ios: 'padding', android: undefined })}
        style={styles.keyboard}
      >
        <ScrollView contentContainerStyle={styles.content} keyboardShouldPersistTaps="handled">
          <ScreenHeader onBackPress={() => navigation.goBack()} title="Create a new listing" />

          <Text style={styles.fieldLabel}>Upload photos</Text>
          <View style={styles.photoRow}>
            <Pressable onPress={() => void handleImagePick()} style={styles.addPhotoCard}>
              <View style={styles.addPhotoCircle}>
                <Ionicons color={colors.placeholder} name="add" size={28} />
              </View>
            </Pressable>

            {selectedImage ? (
              <View style={styles.previewWrap}>
                <Image source={{ uri: selectedImage.uri }} style={styles.previewImage} />
                <Pressable onPress={() => setSelectedImage(null)} style={styles.removePhoto}>
                  <Ionicons color={colors.primary} name="close-circle-outline" size={26} />
                </Pressable>
              </View>
            ) : null}
          </View>

          <View style={styles.form}>
            <View style={styles.fieldGroup}>
              <Text style={styles.fieldLabel}>Title</Text>
              <TextInput
                onChangeText={setTitle}
                placeholder="Listing Title"
                placeholderTextColor={colors.placeholder}
                style={styles.input}
                value={title}
              />
            </View>

            <View style={styles.fieldGroup}>
              <Text style={styles.fieldLabel}>Category</Text>
              <Pressable onPress={() => setShowCategories((current) => !current)} style={styles.input}>
                <Text style={[styles.inputText, !selectedCategoryLabel && styles.placeholderText]}>
                  {selectedCategoryLabel || 'Select the category'}
                </Text>
                <Feather color={colors.primary} name="chevron-down" size={22} />
              </Pressable>
              {showCategories ? (
                <View style={styles.dropdown}>
                  {categories.map((entry) => (
                    <Pressable
                      key={entry.id}
                      onPress={() => {
                        setCategory(entry.id);
                        setShowCategories(false);
                      }}
                      style={styles.dropdownItem}
                    >
                      <Text style={styles.dropdownText}>{entry.label}</Text>
                    </Pressable>
                  ))}
                </View>
              ) : null}
            </View>

            <View style={styles.fieldGroup}>
              <Text style={styles.fieldLabel}>Price</Text>
              <TextInput
                keyboardType="decimal-pad"
                onChangeText={setPrice}
                placeholder="Enter price in USD"
                placeholderTextColor={colors.placeholder}
                style={styles.input}
                value={price}
              />
            </View>

            <View style={styles.fieldGroup}>
              <Text style={styles.fieldLabel}>Description</Text>
              <TextInput
                multiline
                onChangeText={setDescription}
                placeholder="Tell us more..."
                placeholderTextColor={colors.placeholder}
                style={[styles.input, styles.multilineInput]}
                textAlignVertical="top"
                value={description}
              />
            </View>
          </View>

          <PrimaryButton
            loading={isMutating}
            onPress={handleSubmit}
            style={styles.submitButton}
            title="Submit"
          />
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
  content: {
    paddingHorizontal: spacing.formHorizontal,
    paddingBottom: 28,
  },
  photoRow: {
    flexDirection: 'row',
    gap: 10,
    marginTop: 10,
  },
  addPhotoCard: {
    alignItems: 'center',
    borderColor: colors.muted,
    borderRadius: 8,
    borderStyle: 'dashed',
    borderWidth: 1,
    height: 90,
    justifyContent: 'center',
    width: 90,
  },
  addPhotoCircle: {
    alignItems: 'center',
    backgroundColor: colors.divider,
    borderRadius: 20,
    height: 40,
    justifyContent: 'center',
    width: 40,
  },
  previewWrap: {
    position: 'relative',
  },
  previewImage: {
    borderRadius: 8,
    height: 90,
    width: 90,
  },
  removePhoto: {
    position: 'absolute',
    right: -10,
    top: -10,
  },
  form: {
    gap: 24,
    marginTop: 24,
  },
  fieldGroup: {
    gap: 10,
  },
  fieldLabel: {
    color: colors.primary,
    fontFamily: fonts.montserratMedium,
    fontSize: 14,
  },
  input: {
    alignItems: 'center',
    backgroundColor: colors.background,
    borderColor: colors.border,
    borderRadius: 14,
    borderWidth: 1,
    color: colors.text,
    flexDirection: 'row',
    fontFamily: fonts.montserratMedium,
    fontSize: 14,
    justifyContent: 'space-between',
    minHeight: 60,
    paddingHorizontal: 16,
    paddingVertical: 18,
  },
  inputText: {
    color: colors.text,
    fontFamily: fonts.montserratMedium,
    fontSize: 14,
  },
  placeholderText: {
    color: colors.placeholder,
  },
  multilineInput: {
    minHeight: 136,
  },
  dropdown: {
    borderColor: colors.border,
    borderRadius: 14,
    borderWidth: 1,
    marginTop: 8,
    overflow: 'hidden',
  },
  dropdownItem: {
    backgroundColor: colors.background,
    borderBottomColor: colors.divider,
    borderBottomWidth: 1,
    paddingHorizontal: 16,
    paddingVertical: 16,
  },
  dropdownText: {
    color: colors.text,
    fontFamily: fonts.montserratMedium,
    fontSize: 14,
  },
  submitButton: {
    marginTop: 24,
  },
});
