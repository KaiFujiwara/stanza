import { FolderTabList } from "@/components/projects/FolderTabList";
import { ProjectCard } from "@/components/projects/ProjectCard";
import { EmptyState } from "@/components/shared/EmptyState";
import { FloatingActionButton } from "@/components/shared/FloatingActionButton";
import { HelpModal } from "@/components/shared/HelpModal";
import { ItemCountBadge } from "@/components/shared/ItemCountBadge";
import { ScreenHeader } from "@/components/shared/ScreenHeader";
import { useProjects } from "@/hooks/project";
import { ProjectListItem } from '@/infra/query/project';
import { MaterialIcons } from "@expo/vector-icons";
import { MAX_PROJECTS_PER_USER } from "@lyrics-notes/core";
import { useRouter, useLocalSearchParams } from "expo-router";
import { useState, useEffect } from "react";
import { FlatList, Text, TouchableOpacity, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

export default function ProjectsScreen() {
  const router = useRouter();
  const params = useLocalSearchParams<{ selectFolderId?: string }>();
  const {
    loading,
    loadOverview,
    folderTabs,
    selectedFolderId,
    setSelectedFolderId,
    filteredProjects,
    canCreate,
    currentCount,
    maxCount,
  } = useProjects();

  const [helpModalVisible, setHelpModalVisible] = useState(false);

  // パラメータからフォルダIDが渡された場合、そのフォルダを選択
  useEffect(() => {
    if (params.selectFolderId !== undefined) {
      // 空文字列の場合は null (未分類)、それ以外はフォルダID
      setSelectedFolderId(params.selectFolderId === '' ? null : params.selectFolderId);
    }
  }, [params.selectFolderId, setSelectedFolderId]);


  const renderProject = ({ item }: { item: ProjectListItem }) => (
    <ProjectCard item={item} onPress={() => router.push(`/projects/${item.id}`)} />
  );

  const renderEmpty = () => (
    <EmptyState
      icon="library-music"
      title="プロジェクトがありません"
      subtitle="右下の + ボタンからプロジェクトを作成しましょう"
    />
  );

  return (
    <SafeAreaView className="flex-1 bg-white" edges={['top']}>
      <ScreenHeader
        title="歌詞"
        showHelpButton={true}
        onHelpPress={() => setHelpModalVisible(true)}
        rightButton={
          <View className="flex-row gap-2 ml-2">
            <TouchableOpacity
              onPress={() => router.push('/projects/folders')}
              className="px-3 py-2 bg-gray-100 rounded-full flex-row items-center"
              hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
            >
              <MaterialIcons name="folder" size={18} color="#6B7280" />
              <Text className="text-sm font-medium text-gray-700 ml-1.5">フォルダ管理</Text>
            </TouchableOpacity>

            <TouchableOpacity
              onPress={() => router.push('/projects/genres')}
              className="px-3 py-2 bg-gray-100 rounded-full flex-row items-center"
              hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
            >
              <MaterialIcons name="category" size={18} color="#6B7280" />
              <Text className="text-sm font-medium text-gray-700 ml-1.5">ジャンル管理</Text>
            </TouchableOpacity>
          </View>
        }
      />

      {/* フォルダタブ */}
      <FolderTabList
        folders={folderTabs}
        selectedFolderId={selectedFolderId}
        onSelect={setSelectedFolderId}
      />

      {/* プロジェクト一覧 */}
      <FlatList
        data={filteredProjects}
        renderItem={renderProject}
        keyExtractor={(item) => item.id}
        contentContainerStyle={{ padding: 16, flexGrow: 1 }}
        className="bg-gray-50"
        showsVerticalScrollIndicator={false}
        ListEmptyComponent={!loading ? renderEmpty : null}
        refreshing={loading}
        onRefresh={loadOverview}
      />

      <HelpModal
        visible={helpModalVisible}
        onClose={() => setHelpModalVisible(false)}
        title="歌詞について"
        content={`歌詞プロジェクトは、楽曲ごとに歌詞を管理する機能です。プロジェクトを作成すると、歌詞のバージョン管理や音数カウント、韻チェックなどの機能を利用できます。\n\nフォルダで整理して、ジャンルを設定することでテンプレートからセクションを作成できます。\n\nプロジェクトは最大${MAX_PROJECTS_PER_USER}個まで作成できます。`}
      />

      <FloatingActionButton
        onPress={() => router.push({
          pathname: '/projects/new',
          params: { folderId: selectedFolderId || '' }
        })}
        disabled={!canCreate}
      />

      <ItemCountBadge currentCount={currentCount} maxCount={maxCount} />
    </SafeAreaView>
  );
}
