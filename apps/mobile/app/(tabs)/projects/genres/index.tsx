import { FlatList } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useState } from "react";
import { ScreenHeader } from "@/components/ScreenHeader";
import { FloatingActionButton } from "@/components/FloatingActionButton";
import { HelpModal } from "@/components/HelpModal";
import { EmptyState } from "@/components/EmptyState";
import { ItemCountBadge } from "@/components/ItemCountBadge";
import { GenreCard } from "@/components/genres/GenreCard";
import { useGenres } from "@/hooks/genre";
import { GenreListItem } from "@/infra/query/genre";
import { useRouter } from "expo-router";
import { MAX_GENRES_PER_USER } from "@lyrics-notes/core";

export default function GenresScreen() {
  const router = useRouter();
  const { genres, loading, refetch, currentCount, maxCount, canCreate } = useGenres();

  const [helpModalVisible, setHelpModalVisible] = useState(false);

  const renderGenre = ({ item }: { item: GenreListItem }) => (
    <GenreCard item={item} onPress={() => router.push(`/projects/genres/${item.id}`)} />
  );

  const renderEmpty = () => (
    <EmptyState
      icon="category"
      title="ジャンルがありません"
      subtitle="右下の + ボタンからジャンルを作成しましょう"
    />
  );

  return (
    <SafeAreaView className="flex-1 bg-white" edges={['top']}>
      <ScreenHeader
        title="ジャンル管理"
        showBackButton
        onBackPress={() => router.back()}
        showHelpButton={true}
        onHelpPress={() => setHelpModalVisible(true)}
      />

      {/* ジャンル一覧 */}
      <FlatList
        data={genres}
        renderItem={renderGenre}
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
        title="ジャンルについて"
        content={`ジャンルは、楽曲のジャンル別にセクション構成のテンプレートを管理する機能です。\n\n例えば「J-POP」なら「イントロ、Aメロ、Bメロ、サビ」、「ラップ」なら「フック、ヴァース1、ヴァース2」など、ジャンルごとによく使うセクション構成を登録しておくことで、プロジェクト作成時に素早く歌詞制作を始められます。\n\n【セクションテンプレートの反映】\nジャンルのセクションテンプレートは、プロジェクト新規作成時のみ自動的に反映されます。編集画面では、ジャンルを変更してもテンプレートは反映されません。\n\nジャンルは最大${MAX_GENRES_PER_USER}個まで作成できます。`}
      />

      <FloatingActionButton onPress={() => router.push('/projects/genres/new')} disabled={!canCreate} />

      <ItemCountBadge currentCount={currentCount} maxCount={maxCount} />
    </SafeAreaView>
  );
}
