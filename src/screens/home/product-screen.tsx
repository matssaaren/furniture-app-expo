import { Feather } from '@expo/vector-icons';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { Linking } from 'react-native';
import {
  Alert,
  Image,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
  useWindowDimensions,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { LoadingScreen, PrimaryButton, SecondaryIconButton } from '../../components/ui';
import { useAppContext } from '../../context/app-context';
import {
  FavoritesStackParamList,
  HomeStackParamList,
  ProfileStackParamList,
} from '../../navigation/types';
import { colors, fonts, shadows } from '../../theme';
import { formatDetailPrice } from '../../utils/format';

type Props =
  | NativeStackScreenProps<HomeStackParamList, 'Product'>
  | NativeStackScreenProps<FavoritesStackParamList, 'Product'>
  | NativeStackScreenProps<ProfileStackParamList, 'Product'>;

export function ProductScreen({ navigation, route }: Props) {
  const { bootstrap, toggleFavorite } = useAppContext();
  const { height } = useWindowDimensions();
  const product = bootstrap?.products.find((entry) => entry.id === route.params.productId);

  if (!product) {
    return <LoadingScreen />;
  }

  const currentProduct = product;
  const heroHeight = Math.min(Math.max(height * 0.48, 320), 441);

  async function handleContactSeller() {
    try {
      await Linking.openURL(`mailto:${currentProduct.sellerEmail}?subject=Furniture%20Store%20Inquiry`);
    } catch {
      Alert.alert('Could not open mail', `Reach the seller at ${currentProduct.sellerEmail}.`);
    }
  }

  async function handleFavorite() {
    try {
      await toggleFavorite(currentProduct.id);
    } catch (error) {
      Alert.alert('Could not update favorite', error instanceof Error ? error.message : 'Please try again.');
    }
  }

  return (
    <SafeAreaView edges={['top', 'bottom']} style={styles.safeArea}>
      <ScrollView bounces={false} contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        <View style={[styles.hero, { height: heroHeight }]}>
          <Image source={{ uri: currentProduct.imageUrl, cache: 'force-cache' }} style={styles.heroImage} />

          <Pressable onPress={() => navigation.goBack()} style={styles.backButton}>
            <Feather color={colors.primary} name="chevron-left" size={22} />
          </Pressable>

          <View style={[styles.pager, { top: heroHeight - 62 }]}>
            <View style={styles.pagerActive} />
            <View style={styles.pagerIdle} />
            <View style={styles.pagerIdle} />
          </View>
        </View>

        <View style={styles.sheet}>
          <Text style={styles.title}>{currentProduct.name}</Text>
          <Text style={styles.price}>{formatDetailPrice(currentProduct.detailPrice)}</Text>
          <Text style={styles.meta}>
            {currentProduct.isOwnListing ? 'Your listing' : `Sold by ${currentProduct.sellerName}`}
          </Text>
          <Text style={styles.description}>{currentProduct.description}</Text>

          <View style={styles.actionRow}>
            <SecondaryIconButton
              active={currentProduct.isFavorite}
              onPress={handleFavorite}
            />
            <PrimaryButton
              onPress={handleContactSeller}
              style={styles.contactButton}
              title={currentProduct.isOwnListing ? 'Contact Yourself' : 'Contact Seller'}
            />
          </View>
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
  content: {
    flexGrow: 1,
    paddingBottom: 32,
  },
  hero: {
    position: 'relative',
  },
  heroImage: {
    height: '100%',
    width: '100%',
  },
  backButton: {
    alignItems: 'center',
    backgroundColor: colors.background,
    borderRadius: 6,
    height: 40,
    justifyContent: 'center',
    left: 32,
    position: 'absolute',
    top: 18,
    width: 40,
    ...shadows.card,
  },
  pager: {
    alignItems: 'center',
    flexDirection: 'row',
    gap: 10,
    left: '50%',
    marginLeft: -40,
    position: 'absolute',
  },
  pagerActive: {
    backgroundColor: colors.text,
    borderRadius: 4,
    height: 4,
    width: 30,
  },
  pagerIdle: {
    backgroundColor: colors.divider,
    borderRadius: 4,
    height: 4,
    width: 15,
  },
  sheet: {
    backgroundColor: colors.background,
    borderTopLeftRadius: 32,
    borderTopRightRadius: 32,
    marginTop: -19,
    minHeight: 320,
    paddingHorizontal: 25,
    paddingTop: 36,
    paddingBottom: 30,
  },
  title: {
    color: colors.text,
    fontFamily: fonts.gelasioMedium,
    fontSize: 24,
  },
  price: {
    color: colors.text,
    fontFamily: fonts.nunitoBold,
    fontSize: 30,
    marginTop: 10,
  },
  meta: {
    color: colors.tertiaryText,
    fontFamily: fonts.nunitoSemiBold,
    fontSize: 14,
    marginTop: 12,
  },
  description: {
    color: colors.secondaryText,
    fontFamily: fonts.nunitoLight,
    fontSize: 16,
    lineHeight: 28,
    marginTop: 20,
  },
  actionRow: {
    alignItems: 'center',
    flexDirection: 'row',
    gap: 15,
    marginTop: 32,
  },
  contactButton: {
    flex: 1,
  },
});
