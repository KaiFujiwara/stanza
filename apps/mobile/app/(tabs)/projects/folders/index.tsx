import { useState } from "react";
import { View, Text, TouchableOpacity, Alert } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useRouter } from "expo-router";
import { MaterialIcons } from "@expo/vector-icons";
import DraggableFlatList, {
  RenderItemParams,
} from 'react-native-draggable-flatlist';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { FloatingActionButton } from "@/components/FloatingActionButton";
import { FolderWithCount } from '@/infra/query/folder';
import { useFolders, useReorderFolders } from "@/hooks/folder";

export default function FoldersEditScreen() {
  const router = useRouter();
  const [isReorderMode, setIsReorderMode] = useState(false);

  // React Queryでフォルダ一覧を取得
  const { data: folders = [], isLoading } = useFolders();
  const reorderMutation = useReorderFolders();

  // フォルダ並び替え
  const handleReorder = async (data: FolderWithCount[]) => {
    const folderIds = data.map(f => f.id);

    try {
      await reorderMutation.mutateAsync(folderIds);
    } catch (error) {
      console.error('[FoldersEdit] フォルダ並び替えエラー:', error);
      Alert.alert('エラー', 'フォルダの並び替えに失敗しました');
    }
  };

  const renderItem = ({ item, drag, isActive }: RenderItemParams<FolderWithCount>) => {
    return (
      <TouchableOpacity
        className={`bg-white border-b border-gray-200 px-4 py-3 flex-row items-center ${
          isActive ? 'opacity-70' : ''
        }`}
        onLongPress={isReorderMode ? drag : undefined}
        delayLongPress={150}
        onPress={() => !isReorderMode && router.push(`/projects/folders/${item.id}`)}
        activeOpacity={0.7}
        disabled={false}
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
    <GestureHandlerRootView style={{ flex: 1 }}>
      <SafeAreaView className="flex-1 bg-white" edges={['top']}>
          {/* ヘッダー */}
          <View className="px-5 py-4 border-b border-gray-200">
            <View className="flex-row items-center">
              <TouchableOpacity onPress={() => router.back()} className="mr-3" hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}>
                <MaterialIcons name="chevron-left" size={28} color="#111827" />
              </TouchableOpacity>
              <Text className="text-2xl font-bold text-gray-900 flex-1" numberOfLines={1}>
                フォルダ管理
              </Text>
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
            </View>
          </View>

        {/* フォルダ一覧 */}
        <DraggableFlatList
          data={folders}
          renderItem={renderItem}
          keyExtractor={(item) => item.id}
          onDragEnd={({ data }) => handleReorder(data)}
          containerStyle={{ flex: 1 }}
          contentContainerStyle={{ flexGrow: 1 }}
          ListHeaderComponent={null}
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

        {/* 右下のFAB - 並び替えモード時は非表示 */}
        {!isReorderMode && <FloatingActionButton onPress={() => router.push('/projects/folders/new')} />}
      </SafeAreaView>
    </GestureHandlerRootView>
  );
}
