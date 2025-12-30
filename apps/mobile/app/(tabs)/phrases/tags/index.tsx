import { FlatList } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useState } from "react";
import { ScreenHeader } from "@/components/ScreenHeader";
import { FloatingActionButton } from "@/components/FloatingActionButton";
import { HelpModal } from "@/components/HelpModal";
import { EmptyState } from "@/components/EmptyState";
import { TagCard } from "@/components/tags/TagCard";
import { useTags } from "@/hooks/tag";
import { Tag } from "@/infra/query/tag";
import { useRouter } from "expo-router";

export default function TagsScreen() {
  const router = useRouter();
  const { tags, loading, refetch } = useTags();

  const [helpModalVisible, setHelpModalVisible] = useState(false);

  const renderTag = ({ item }: { item: Tag }) => (
    <TagCard item={item} onPress={() => router.push(`/phrases/tags/${item.id}`)} />
  );

  const renderEmpty = () => (
    <EmptyState
      icon="label"
      title="タグがありません"
      subtitle="右下の + ボタンからタグを作成しましょう"
    />
  );

  return (
    <SafeAreaView className="flex-1 bg-white" edges={['top']}>
      <ScreenHeader
        title="タグ管理"
        showBackButton
        onBackPress={() => router.back()}
        showHelpButton={true}
        onHelpPress={() => setHelpModalVisible(true)}
      />

      {/* タグ一覧 */}
      <FlatList
        data={tags}
        renderItem={renderTag}
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
        title="タグについて"
        content="タグは、フレーズを分類・整理するためのラベルです。テーマや感情、言葉のカテゴリーなど、自由に設定できます。&#10;&#10;各タグには色をつけることができ、視覚的に区別しやすくなります。"
      />

      <FloatingActionButton onPress={() => router.push('/phrases/tags/new')} />
    </SafeAreaView>
  );
}
