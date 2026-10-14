import { Feather } from '@expo/vector-icons';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { useDeferredValue, useState } from 'react';
import {
  Dimensions,
  FlatList,
  Pressable,
  SafeAreaView,
  StyleSheet,
  TextInput,
  View,
} from 'react-native';

import { CategoryChip, EmptyState, ProductCard } from '../../components/ui';
import { useAppContext } from '../../context/app-context';
import { HomeStackParamList } from '../../navigation/types';
import { colors, fonts, spacing } from '../../theme';

const CARD_WIDTH = (Dimensions.get('window').width - spacing.screenHorizontal * 2 - 21) / 2;

type Props = NativeStackScreenProps<HomeStackParamList, 'Home'>;

export function HomeScreen({ navigation }: Props) {
  const { bootstrap } = useAppContext();
  const [selectedCategory, setSelectedCategory] = useState('popular');
  const [searchVisible, setSearchVisible] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const deferredSearch = useDeferredValue(searchQuery.trim().toLowerCase());

  const products =
    bootstrap?.homeProducts.filter((product) => {
      const matchesCategory =
        selectedCategory === 'popular' ? true : product.category === selectedCategory;
      const matchesSearch = deferredSearch
        ? product.name.toLowerCase().includes(deferredSearch)
        : true;

      return matchesCategory && matchesSearch;
    }) ?? [];

  return (
    <SafeAreaView style={styles.safeArea}>
      <FlatList
        ListEmptyComponent={
          <EmptyState
            body="Try another category or clear the current search."
            title="No furniture found"
          />
        }
        ListHeaderComponent={
          <View style={styles.headerBlock}>
            <Pressable onPress={() => setSearchVisible((current) => !current)} style={styles.searchIcon}>
              <Feather color={colors.primary} name="search" size={24} />
            </Pressable>

            {searchVisible ? (
              <View style={styles.searchInputShell}>
                <Feather color={colors.placeholder} name="search" size={18} />
                <TextInput
                  onChangeText={setSearchQuery}
                  placeholder="Search furniture"
                  placeholderTextColor={colors.placeholder}
                  style={styles.searchInput}
                  value={searchQuery}
                />
              </View>
            ) : null}

            <FlatList
              contentContainerStyle={styles.categories}
              data={bootstrap?.categories ?? []}
              horizontal
              keyExtractor={(item) => item.id}
              renderItem={({ item }) => (
                <CategoryChip
                  active={selectedCategory === item.id}
                  icon={item.icon}
                  label={item.label}
                  onPress={() => setSelectedCategory(item.id)}
                />
              )}
              showsHorizontalScrollIndicator={false}
            />
          </View>
        }
        columnWrapperStyle={styles.gridRow}
        contentContainerStyle={styles.content}
        data={products}
        keyExtractor={(item) => item.id}
        numColumns={2}
        renderItem={({ item }) => (
          <ProductCard
            onPress={() => navigation.navigate('Product', { productId: item.id })}
            product={item}
            width={CARD_WIDTH}
          />
        )}
        showsVerticalScrollIndicator={false}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    backgroundColor: colors.background,
    flex: 1,
  },
  content: {
    paddingHorizontal: spacing.screenHorizontal,
    paddingBottom: 120,
  },
  headerBlock: {
    paddingTop: 18,
    paddingBottom: 18,
  },
  searchIcon: {
    alignSelf: 'flex-start',
    marginBottom: 18,
  },
  searchInputShell: {
    alignItems: 'center',
    borderColor: colors.border,
    borderRadius: 14,
    borderWidth: 1,
    flexDirection: 'row',
    gap: 10,
    marginBottom: 18,
    paddingHorizontal: 16,
  },
  searchInput: {
    color: colors.text,
    flex: 1,
    fontFamily: fonts.montserratMedium,
    fontSize: 14,
    paddingVertical: 18,
  },
  categories: {
    paddingRight: 12,
  },
  gridRow: {
    justifyContent: 'space-between',
    marginBottom: 14,
  },
});
