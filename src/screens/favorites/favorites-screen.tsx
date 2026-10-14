import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { Alert, FlatList, SafeAreaView, StyleSheet, View } from 'react-native';

import { EmptyState, ProductRow, ScreenHeader } from '../../components/ui';
import { useAppContext } from '../../context/app-context';
import { FavoritesStackParamList } from '../../navigation/types';
import { colors, spacing } from '../../theme';

type Props = NativeStackScreenProps<FavoritesStackParamList, 'Favorites'>;

export function FavoritesScreen({ navigation }: Props) {
  const { bootstrap, toggleFavorite } = useAppContext();
  const favorites = bootstrap?.favorites ?? [];

  async function handleRemove(productId: string) {
    try {
      await toggleFavorite(productId);
    } catch (error) {
      Alert.alert('Could not remove item', error instanceof Error ? error.message : 'Please try again.');
    }
  }

  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.container}>
        <ScreenHeader reserveRightSpace title="Favorites" />

        <FlatList
          ListEmptyComponent={
            <EmptyState
              body="Tap the bookmark button on any product to save it here."
              title="No favorites yet"
            />
          }
          contentContainerStyle={styles.content}
          data={favorites}
          keyExtractor={(item) => item.id}
          renderItem={({ item }) => (
            <ProductRow
              accentAction
              actionIcon="x-circle"
              onActionPress={() => handleRemove(item.id)}
              onPress={() => navigation.navigate('Product', { productId: item.id })}
              product={item}
            />
          )}
          showsVerticalScrollIndicator={false}
        />
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
  content: {
    paddingBottom: 120,
  },
});
