import { FloatingActionButton } from "@/components/shared/FloatingActionButton";
import { HelpModal } from "@/components/shared/HelpModal";
import { ItemCountBadge } from "@/components/shared/ItemCountBadge";
import { ScreenHeader } from "@/components/shared/ScreenHeader";
import { useFolders, useReorderFolders } from "@/hooks/folder";
import { FolderWithCount } from '@/infra/query/folder';
import { MaterialIcons } from "@expo/vector-icons";
import { MAX_FOLDERS_PER_USER } from "@stanza/core";
import { useRouter } from "expo-router";
import { useState, useEffect } from "react";
import { RefreshControl, Text, TouchableOpacity, View } from "react-native";
import DraggableFlatList, {
  RenderItemParams,
} from 'react-native-draggable-flatlist';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { SafeAreaView } from "react-native-safe-area-context";

export default function FoldersEditScreen() {
  const router = useRouter();
  const [isReorderMode, setIsReorderMode] = useState(false);
  const [helpModalVisible, setHelpModalVisible] = useState(false);

  // React Queryでフォルダ一覧を取得
  const { data: folders = [], isLoading, refetch, isRefetching, canCreate, currentCount, maxCount } = useFolders();
  const reorderMutation = useReorderFolders();

  // フォルダが2未満になったら並び替えモードを自動的にオフ
  useEffect(() => {
    if (folders.length < 2 && isReorderMode) {
      setIsReorderMode(false);
    }
  }, [folders.length, isReorderMode]);

  // フォルダ並び替え
  const handleReorder = async (data: FolderWithCount[]) => {
    const folderIds = data.map(f => f.id);
    await reorderMutation.mutateAsync(folderIds);
  };

  // 統一したrenderItem（モードで表示を切り替え）
  const renderItem = ({ item, drag, isActive }: RenderItemParams<FolderWithCount>) => {
    return (
      <TouchableOpacity
        className={`bg-white border-b border-gray-200 px-4 py-3 flex-row items-center ${
          isActive ? 'opacity-70' : ''
        }`}
        onLongPress={isReorderMode ? drag : undefined}
        onPress={() => !isReorderMode && router.push(`/projects/folders/${item.id}`)}
        delayLongPress={150}
        activeOpacity={0.7}
        disabled={isActive}
      >
        {/* ドラッグハンドル - 並び替えモード時のみ表示 */}
        {isReorderMode && (
          <MaterialIcons name="drag-handle" size={24} color="#9CA3AF" className="mr-3" />
        )}

        {/* フォルダ名 */}
        <View className="flex-1">
          <Text
            className="text-base font-medium text-gray-900"
            style={{ fontSize: 16, lineHeight: 24 }}
          >
            {item.name}
          </Text>
          <Text className="text-sm text-gray-500 mt-0.5">
            {item.projectCount}件のプロジェクト
          </Text>
        </View>

        {/* 右矢印アイコン - 並び替えモード以外 */}
        {!isReorderMode && (
          <MaterialIcons name="chevron-right" size={24} color="#9CA3AF" />
        )}
      </TouchableOpacity>
    );
  };

  return (
    <SafeAreaView className="flex-1 bg-white" edges={['top']}>
      <ScreenHeader
        title="フォルダ管理"
        showBackButton
        onBackPress={() => router.back()}
        showHelpButton
        onHelpPress={() => setHelpModalVisible(true)}
        rightButton={
          <TouchableOpacity
            onPress={() => setIsReorderMode(!isReorderMode)}
            className={`ml-2 px-4 py-2 rounded-full flex-row items-center gap-1 ${
              isReorderMode ? 'bg-green-500' : folders.length >= 2 ? 'bg-gray-200' : 'bg-gray-100'
            }`}
            hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
            disabled={folders.length < 2}
          >
            <MaterialIcons
              name={isReorderMode ? 'check' : 'swap-vert'}
              size={16}
              color={isReorderMode ? '#FFFFFF' : folders.length >= 2 ? '#374151' : '#D1D5DB'}
            />
            <Text className={`text-sm font-semibold ${
              isReorderMode ? 'text-white' : folders.length >= 2 ? 'text-gray-700' : 'text-gray-300'
            }`}>
              {isReorderMode ? '完了' : '並び替え'}
            </Text>
          </TouchableOpacity>
        }
      />

      {/* フォルダ一覧 */}
      <GestureHandlerRootView style={{ flex: 1 }}>
        <DraggableFlatList
          data={folders}
          renderItem={renderItem}
          keyExtractor={(item: FolderWithCount) => item.id}
          onDragEnd={({ data }: { data: FolderWithCount[] }) => handleReorder(data)}
          activationDistance={isReorderMode ? 0 : 999999}
          containerStyle={{ flex: 1 }}
          contentContainerStyle={folders.length === 0 ? { flex: 1 } : undefined}
          removeClippedSubviews={false}
          windowSize={21}
          maxToRenderPerBatch={10}
          updateCellsBatchingPeriod={50}
          initialNumToRender={10}
          refreshControl={
            <RefreshControl
              refreshing={isRefetching}
              onRefresh={refetch}
              tintColor="#22C55E"
              colors={["#22C55E"]}
            />
          }
          ListEmptyComponent={
            !isLoading ? (
              <View className="flex-1 items-center justify-center p-8">
                <MaterialIcons name="folder-open" size={64} color="#D1D5DB" />
                <Text className="text-gray-500 text-base mt-4 text-center">
                  フォルダがありません
                </Text>
                <Text className="text-gray-400 text-sm mt-2 text-center">
                  右下の + ボタンから新しいフォルダを作成しましょう
                </Text>
              </View>
            ) : null
          }
        />
      </GestureHandlerRootView>

      {/* 右下のFAB - 並び替えモード時は非表示 */}
      {!isReorderMode && <FloatingActionButton onPress={() => router.push('/projects/folders/new')} disabled={!canCreate} />}

      <ItemCountBadge currentCount={currentCount} maxCount={maxCount} />

      <HelpModal
        visible={helpModalVisible}
        onClose={() => setHelpModalVisible(false)}
        title="フォルダについて"
        content={`フォルダは、プロジェクトを整理・分類するための機能です。アルバムやテーマごとにプロジェクトをまとめて管理できます。\n\nフォルダは最大${MAX_FOLDERS_PER_USER}個まで作成できます。並び替えボタンでフォルダの表示順序を変更できます。`}
      />
    </SafeAreaView>
  );
}
