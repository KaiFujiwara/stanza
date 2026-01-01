import { EmptyState } from "@/components/EmptyState";
import { FloatingActionButton } from "@/components/FloatingActionButton";
import { HelpModal } from "@/components/HelpModal";
import { FolderTabList } from "@/components/projects/FolderTabList";
import { ProjectCard } from "@/components/projects/ProjectCard";
import { ScreenHeader } from "@/components/ScreenHeader";
import { useProjects } from "@/hooks/project";
import { ProjectListItem } from '@/infra/query/project';
import { useState } from "react";
import { FlatList, TouchableOpacity, Text, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useRouter } from "expo-router";
import { MaterialIcons } from "@expo/vector-icons";

export default function ProjectsScreen() {
  const router = useRouter();
  const {
    loading,
    loadOverview,
    folderTabs,
    selectedFolderId,
    setSelectedFolderId,
    filteredProjects,
  } = useProjects();

  const [helpModalVisible, setHelpModalVisible] = useState(false);


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
        content="歌詞プロジェクトは、楽曲ごとに歌詞を管理する機能です。プロジェクトを作成すると、歌詞のバージョン管理や音数カウント、韻チェックなどの機能を利用できます。&#10;&#10;下部の + ボタンから新しいプロジェクトを作成できます。"
      />

      <FloatingActionButton
        onPress={() => router.push({
          pathname: '/projects/new',
          params: { folderId: selectedFolderId || '' }
        })}
      />
    </SafeAreaView>
  );
}
