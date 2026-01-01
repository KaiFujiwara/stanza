import { PhraseCard } from "@/components/phrases/PhraseCard";
import { PhraseSearchBar } from "@/components/phrases/PhraseSearchBar";
import { PhraseSortSelector, SortOrder } from "@/components/phrases/PhraseSortSelector";
import { TagFilterModal } from "@/components/phrases/TagFilterModal";
import { EmptyState } from "@/components/shared/EmptyState";
import { FloatingActionButton } from "@/components/shared/FloatingActionButton";
import { HelpModal } from "@/components/shared/HelpModal";
import { ItemCountBadge } from "@/components/shared/ItemCountBadge";
import { ScreenHeader } from "@/components/shared/ScreenHeader";
import { usePhrases } from "@/hooks/phrase";
import { PhraseListItem } from "@/infra/query/phrase";
import { MaterialIcons } from "@expo/vector-icons";
import { MAX_PHRASES_PER_USER } from "@lyrics-notes/core";
import { useRouter } from "expo-router";
import { useMemo, useState } from "react";
import { FlatList, Text, TouchableOpacity, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

export default function PhrasesScreen() {
  const router = useRouter();
  const {
    phrases,
    loading,
    refetch,
    searchText,
    setSearchText,
    selectedTagIds,
    setSelectedTagIds,
    canCreate,
    currentCount,
    maxCount,
  } = usePhrases();

  const [helpModalVisible, setHelpModalVisible] = useState(false);
  const [tagFilterModalVisible, setTagFilterModalVisible] = useState(false);
  const [sortOrder, setSortOrder] = useState<SortOrder>('desc');

  // 並び替え後のフレーズ一覧
  const sortedPhrases = useMemo(() => {
    return [...phrases].sort((a, b) => {
      const aTime = new Date(a.updatedAt).getTime();
      const bTime = new Date(b.updatedAt).getTime();
      return sortOrder === 'desc' ? bTime - aTime : aTime - bTime;
    });
  }, [phrases, sortOrder]);

  const renderPhrase = ({ item }: { item: PhraseListItem }) => (
    <PhraseCard item={item} onPress={() => router.push(`/phrases/${item.id}`)} />
  );

  const renderEmpty = () => (
    <EmptyState
      icon="format-quote"
      title="フレーズがありません"
      subtitle="右下の + ボタンからフレーズを作成しましょう"
    />
  );

  const handleTagToggle = (tagId: string) => {
    setSelectedTagIds(prev =>
      prev.includes(tagId)
        ? prev.filter(id => id !== tagId)
        : [...prev, tagId]
    );
  };

  return (
    <SafeAreaView className="flex-1 bg-white" edges={['top']}>
      <ScreenHeader
        title="フレーズストック"
        showHelpButton={true}
        onHelpPress={() => setHelpModalVisible(true)}
        rightButton={
          <TouchableOpacity
            onPress={() => router.push('/phrases/tags')}
            className="ml-2 px-3 py-2 bg-gray-100 rounded-full flex-row items-center"
            hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
          >
            <MaterialIcons name="label" size={18} color="#6B7280" />
            <Text className="text-sm font-medium text-gray-700 ml-1.5">タグ管理</Text>
          </TouchableOpacity>
        }
      />

      {/* 検索・フィルタエリア */}
      <View className="px-4 py-3 bg-white border-b border-gray-200">
        {/* 検索バー */}
        <PhraseSearchBar
          value={searchText}
          onChangeText={setSearchText}
        />

        {/* タグフィルタと並び替え */}
        <View className="mt-3 flex-row items-center justify-between">
          {/* タグ絞り込みボタン */}
          <TouchableOpacity
            onPress={() => setTagFilterModalVisible(true)}
            className={`flex-row items-center px-3 py-2 rounded-lg ${
              selectedTagIds.length > 0 ? 'bg-green-500' : 'bg-gray-100'
            }`}
          >
            <MaterialIcons
              name="filter-list"
              size={18}
              color={selectedTagIds.length > 0 ? '#FFFFFF' : '#6B7280'}
            />
            <Text className={`text-sm font-medium ml-1.5 ${
              selectedTagIds.length > 0 ? 'text-white' : 'text-gray-700'
            }`}>
              タグで絞り込み
              {selectedTagIds.length > 0 && ` (${selectedTagIds.length})`}
            </Text>
          </TouchableOpacity>

          {/* 並び替え */}
          <PhraseSortSelector value={sortOrder} onChange={setSortOrder} />
        </View>
      </View>

      {/* フレーズ一覧 */}
      <FlatList
        data={sortedPhrases}
        renderItem={renderPhrase}
        keyExtractor={(item) => item.id}
        contentContainerStyle={{ padding: 16, flexGrow: 1 }}
        className="bg-gray-50"
        showsVerticalScrollIndicator={false}
        ListEmptyComponent={!loading ? renderEmpty : null}
        refreshing={loading}
        onRefresh={refetch}
      />

      <HelpModal
        visible={helpModalVisible}
        onClose={() => setHelpModalVisible(false)}
        title="フレーズについて"
        content={`フレーズストックは、思いついた歌詞のフレーズを保存しておく機能です。気に入ったフレーズをストックしておき、後で歌詞制作に活用できます。\n\nタグ整理することで、必要な時にすぐに見つけられます。\n\nフレーズは最大${MAX_PHRASES_PER_USER}個まで作成できます。`}
      />

      <TagFilterModal
        visible={tagFilterModalVisible}
        onClose={() => setTagFilterModalVisible(false)}
        selectedTagIds={selectedTagIds}
        onTagToggle={handleTagToggle}
      />

      <FloatingActionButton onPress={() => router.push('/phrases/new')} disabled={!canCreate} />

      <ItemCountBadge currentCount={currentCount} maxCount={maxCount} />
    </SafeAreaView>
  );
}
