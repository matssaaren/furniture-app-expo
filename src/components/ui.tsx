import { MaterialCommunityIcons, Feather, Ionicons } from '@expo/vector-icons';
import {
  ActivityIndicator,
  Image,
  ImageStyle,
  Pressable,
  StyleProp,
  StyleSheet,
  Text,
  TextInput,
  TextInputProps,
  TextStyle,
  View,
  ViewStyle,
} from 'react-native';

import { Product } from '../types';
import { colors, fonts, shadows } from '../theme';
import { formatCardPrice } from '../utils/format';

type PrimaryButtonProps = {
  title: string;
  onPress: () => void;
  disabled?: boolean;
  loading?: boolean;
  style?: StyleProp<ViewStyle>;
  textStyle?: StyleProp<TextStyle>;
};

type AuthTextInputProps = TextInputProps & {
  label: string;
  rightIcon?: keyof typeof Feather.glyphMap;
  onRightPress?: () => void;
};

type ScreenHeaderProps = {
  title: string;
  onBackPress?: () => void;
  rightIcon?: keyof typeof Feather.glyphMap;
  onRightPress?: () => void;
  reserveRightSpace?: boolean;
};

type CategoryChipProps = {
  label: string;
  icon: string;
  active: boolean;
  onPress: () => void;
};

type ProductCardProps = {
  product: Product;
  width: number;
  onPress: () => void;
};

type ProductRowProps = {
  product: Product;
  onPress: () => void;
  onActionPress: () => void;
  actionIcon: keyof typeof Feather.glyphMap;
  accentAction?: boolean;
};

type EmptyStateProps = {
  title: string;
  body: string;
};

function getCategoryIcon(icon: string, active: boolean) {
  const color = active ? colors.background : colors.tertiaryText;

  switch (icon) {
    case 'star':
      return <MaterialCommunityIcons color={color} name="star" size={20} />;
    case 'chair-rolling':
      return <MaterialCommunityIcons color={color} name="chair-rolling" size={22} />;
    case 'table-furniture':
      return <MaterialCommunityIcons color={color} name="table-furniture" size={22} />;
    case 'sofa-single':
      return <MaterialCommunityIcons color={color} name="sofa-single" size={22} />;
    case 'bed-queen-outline':
      return <MaterialCommunityIcons color={color} name="bed-queen-outline" size={22} />;
    default:
      return <MaterialCommunityIcons color={color} name="floor-lamp" size={22} />;
  }
}

export function LoadingScreen() {
  return (
    <View style={styles.loadingScreen}>
      <ActivityIndicator color={colors.primary} size="large" />
    </View>
  );
}

export function PrimaryButton({
  title,
  onPress,
  disabled,
  loading,
  style,
  textStyle,
}: PrimaryButtonProps) {
  return (
    <Pressable
      disabled={disabled || loading}
      onPress={onPress}
      style={({ pressed }) => [
        styles.primaryButton,
        disabled && styles.primaryButtonDisabled,
        pressed && !disabled && styles.primaryButtonPressed,
        style,
      ]}
    >
      {loading ? (
        <ActivityIndicator color={colors.background} />
      ) : (
        <Text style={[styles.primaryButtonText, textStyle]}>{title}</Text>
      )}
    </Pressable>
  );
}

export function AuthTextInput({
  label,
  rightIcon,
  onRightPress,
  style,
  ...props
}: AuthTextInputProps) {
  return (
    <View style={styles.inputWrapper}>
      <Text style={styles.inputLabel}>{label}</Text>
      <View style={styles.inputShell}>
        <TextInput
          placeholderTextColor={colors.placeholder}
          style={[styles.textInput, style]}
          {...props}
        />
        {rightIcon ? (
          <Pressable hitSlop={10} onPress={onRightPress} style={styles.inputIcon}>
            <Feather color={colors.placeholder} name={rightIcon} size={22} />
          </Pressable>
        ) : null}
      </View>
    </View>
  );
}

export function DividerLabel({ label }: { label: string }) {
  return (
    <View style={styles.dividerRow}>
      <View style={styles.dividerLine} />
      <Text style={styles.dividerLabel}>{label}</Text>
      <View style={styles.dividerLine} />
    </View>
  );
}

export function GoogleButton({
  title = 'G',
  onPress,
}: {
  title?: string;
  onPress: () => void;
}) {
  return (
    <Pressable onPress={onPress} style={({ pressed }) => [styles.googleButton, pressed && { opacity: 0.9 }]}>
      <Text style={styles.googleButtonText}>{title}</Text>
    </Pressable>
  );
}

export function ScreenHeader({
  title,
  onBackPress,
  rightIcon,
  onRightPress,
  reserveRightSpace,
}: ScreenHeaderProps) {
  return (
    <View style={styles.header}>
      <View style={styles.headerSide}>
        {onBackPress ? (
          <Pressable hitSlop={10} onPress={onBackPress}>
            <Feather color={colors.primary} name="chevron-left" size={26} />
          </Pressable>
        ) : null}
      </View>
      <Text style={styles.headerTitle}>{title}</Text>
      <View style={styles.headerSideRight}>
        {rightIcon ? (
          <Pressable hitSlop={10} onPress={onRightPress}>
            <Feather color={colors.primary} name={rightIcon} size={22} />
          </Pressable>
        ) : reserveRightSpace ? (
          <View style={{ width: 22, height: 22 }} />
        ) : null}
      </View>
    </View>
  );
}

export function CategoryChip({ label, icon, active, onPress }: CategoryChipProps) {
  return (
    <Pressable onPress={onPress} style={styles.categoryChip}>
      <View style={[styles.categoryIconShell, active && styles.categoryIconShellActive]}>
        {getCategoryIcon(icon, active)}
      </View>
      <Text style={[styles.categoryLabel, active && styles.categoryLabelActive]}>{label}</Text>
    </Pressable>
  );
}

export function ProductCard({ product, width, onPress }: ProductCardProps) {
  return (
    <Pressable onPress={onPress} style={[styles.productCard, { width }]}>
      <Image
        source={{ uri: product.imageUrl, cache: 'force-cache' }}
        style={styles.productImage as StyleProp<ImageStyle>}
      />
      <Text numberOfLines={1} style={styles.productName}>
        {product.name}
      </Text>
      <Text style={styles.productPrice}>{formatCardPrice(product.cardPrice)}</Text>
    </Pressable>
  );
}

export function ProductRow({
  product,
  onPress,
  onActionPress,
  actionIcon,
  accentAction,
}: ProductRowProps) {
  return (
    <View style={styles.productRow}>
      <Pressable onPress={onPress} style={styles.productRowMain}>
        <Image
          source={{ uri: product.imageUrl, cache: 'force-cache' }}
          style={styles.productRowImage as StyleProp<ImageStyle>}
        />
        <View style={styles.productRowCopy}>
          <Text style={styles.productRowName}>{product.name}</Text>
          <Text style={styles.productRowPrice}>{formatCardPrice(product.cardPrice)}</Text>
        </View>
      </Pressable>
      <Pressable hitSlop={8} onPress={onActionPress} style={styles.productRowAction}>
        <Feather
          color={accentAction ? colors.primary : colors.black}
          name={actionIcon}
          size={22}
        />
      </Pressable>
    </View>
  );
}

export function SecondaryIconButton({
  active,
  onPress,
}: {
  active?: boolean;
  onPress: () => void;
}) {
  return (
    <Pressable onPress={onPress} style={styles.secondaryIconButton}>
      <Ionicons
        color={active ? colors.primary : colors.iconIdle}
        name={active ? 'bookmark' : 'bookmark-outline'}
        size={24}
      />
    </Pressable>
  );
}

export function EmptyState({ title, body }: EmptyStateProps) {
  return (
    <View style={styles.emptyState}>
      <Text style={styles.emptyStateTitle}>{title}</Text>
      <Text style={styles.emptyStateBody}>{body}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  loadingScreen: {
    alignItems: 'center',
    backgroundColor: colors.background,
    flex: 1,
    justifyContent: 'center',
  },
  primaryButton: {
    alignItems: 'center',
    backgroundColor: colors.primary,
    borderRadius: 8,
    height: 60,
    justifyContent: 'center',
    ...shadows.button,
  },
  primaryButtonDisabled: {
    opacity: 0.55,
  },
  primaryButtonPressed: {
    opacity: 0.92,
  },
  primaryButtonText: {
    color: colors.background,
    fontFamily: fonts.montserratBold,
    fontSize: 16,
  },
  inputWrapper: {
    gap: 10,
  },
  inputLabel: {
    color: colors.primary,
    fontFamily: fonts.montserratMedium,
    fontSize: 14,
  },
  inputShell: {
    alignItems: 'center',
    backgroundColor: colors.background,
    borderColor: colors.border,
    borderRadius: 14,
    borderWidth: 1,
    flexDirection: 'row',
    minHeight: 60,
    paddingHorizontal: 16,
  },
  textInput: {
    color: colors.text,
    flex: 1,
    fontFamily: fonts.montserratMedium,
    fontSize: 14,
    paddingVertical: 18,
  },
  inputIcon: {
    marginLeft: 12,
  },
  dividerRow: {
    alignItems: 'center',
    flexDirection: 'row',
    gap: 8,
  },
  dividerLine: {
    backgroundColor: '#DADADA',
    flex: 1,
    height: 1,
  },
  dividerLabel: {
    color: colors.primary,
    fontFamily: fonts.montserratSemiBold,
    fontSize: 14,
  },
  googleButton: {
    alignItems: 'center',
    alignSelf: 'center',
    backgroundColor: colors.googleButton,
    borderRadius: 14,
    height: 60,
    justifyContent: 'center',
    width: 142,
  },
  googleButtonText: {
    color: colors.background,
    fontFamily: fonts.montserratBold,
    fontSize: 26,
    lineHeight: 28,
  },
  header: {
    alignItems: 'center',
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 12,
  },
  headerSide: {
    alignItems: 'flex-start',
    justifyContent: 'center',
    width: 32,
  },
  headerSideRight: {
    alignItems: 'flex-end',
    justifyContent: 'center',
    width: 32,
  },
  headerTitle: {
    color: colors.text,
    flex: 1,
    fontFamily: fonts.montserratBold,
    fontSize: 16,
    textAlign: 'center',
  },
  categoryChip: {
    alignItems: 'center',
    gap: 8,
    marginRight: 25,
    width: 44,
  },
  categoryIconShell: {
    alignItems: 'center',
    backgroundColor: colors.soft,
    borderRadius: 12,
    height: 44,
    justifyContent: 'center',
    width: 44,
  },
  categoryIconShellActive: {
    backgroundColor: colors.text,
  },
  categoryLabel: {
    color: colors.iconIdle,
    fontFamily: fonts.nunitoRegular,
    fontSize: 14,
  },
  categoryLabelActive: {
    color: colors.primary,
    fontFamily: fonts.nunitoSemiBold,
  },
  productCard: {
    gap: 8,
  },
  productImage: {
    borderRadius: 14,
    height: 200,
    width: '100%',
  },
  productName: {
    color: colors.secondaryText,
    fontFamily: fonts.nunitoRegular,
    fontSize: 14,
  },
  productPrice: {
    color: colors.text,
    fontFamily: fonts.nunitoBold,
    fontSize: 14,
  },
  productRow: {
    alignItems: 'center',
    borderBottomColor: colors.divider,
    borderBottomWidth: 1,
    flexDirection: 'row',
    paddingVertical: 12,
  },
  productRowMain: {
    alignItems: 'center',
    flex: 1,
    flexDirection: 'row',
    gap: 20,
  },
  productRowImage: {
    borderRadius: 14,
    height: 100,
    width: 100,
  },
  productRowCopy: {
    gap: 8,
  },
  productRowName: {
    color: colors.secondaryText,
    fontFamily: fonts.nunitoSemiBold,
    fontSize: 14,
  },
  productRowPrice: {
    color: colors.text,
    fontFamily: fonts.nunitoBold,
    fontSize: 16,
  },
  productRowAction: {
    paddingHorizontal: 4,
  },
  secondaryIconButton: {
    alignItems: 'center',
    backgroundColor: colors.softButton,
    borderRadius: 8,
    height: 60,
    justifyContent: 'center',
    width: 60,
  },
  emptyState: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 24,
    paddingVertical: 40,
  },
  emptyStateTitle: {
    color: colors.text,
    fontFamily: fonts.montserratBold,
    fontSize: 18,
    marginBottom: 8,
    textAlign: 'center',
  },
  emptyStateBody: {
    color: colors.tertiaryText,
    fontFamily: fonts.nunitoRegular,
    fontSize: 15,
    lineHeight: 22,
    textAlign: 'center',
  },
});
