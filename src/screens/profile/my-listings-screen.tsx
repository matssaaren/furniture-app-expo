import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { Alert, FlatList, SafeAreaView, StyleSheet, View } from 'react-native';

import { EmptyState, ProductRow, ScreenHeader } from '../../components/ui';
import { useAppContext } from '../../context/app-context';
import { ProfileStackParamList } from '../../navigation/types';
import { colors, spacing } from '../../theme';

type Props = NativeStackScreenProps<ProfileStackParamList, 'MyListings'>;

export function MyListingsScreen({ navigation }: Props) {
  const { bootstrap, deleteListing } = useAppContext();
  const listings = bootstrap?.listings ?? [];

  async function handleDelete(listingId: string) {
    try {
      await deleteListing(listingId);
    } catch (error) {
      Alert.alert('Could not delete listing', error instanceof Error ? error.message : 'Please try again.');
    }
  }

  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.container}>
        <ScreenHeader reserveRightSpace title="My Listings" />

        <FlatList
          ListEmptyComponent={
            <EmptyState
              body="Create your first furniture listing to see it here."
              title="No listings yet"
            />
          }
          contentContainerStyle={styles.content}
          data={listings}
          keyExtractor={(item) => item.id}
          renderItem={({ item }) => (
            <ProductRow
              actionIcon="trash-2"
              onActionPress={() => handleDelete(item.id)}
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
