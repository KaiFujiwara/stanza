import { useState, useEffect } from "react";
import { View, Text, TouchableOpacity, Alert, KeyboardAvoidingView, Platform, TouchableWithoutFeedback, Keyboard } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useRouter, useLocalSearchParams } from "expo-router";
import { MaterialIcons } from "@expo/vector-icons";
import { TextInput } from "@/components/shared/TextInput";
import { HeaderActionButton } from "@/components/shared/HeaderActionButton";
import { useFolders, useUpdateFolderName, useDeleteFolder } from "@/hooks/folder";

export default function FolderDetailScreen() {
  const router = useRouter();
  const { id } = useLocalSearchParams<{ id: string }>();
  const [editText, setEditText] = useState("");

  const { data: folders = [], isLoading } = useFolders();
  const updateMutation = useUpdateFolderName();
  const deleteMutation = useDeleteFolder();

  const folder = folders.find(f => f.id === id);

  // フォルダが見つからない場合
  useEffect(() => {
    if (!isLoading && !folder) {
      Alert.alert('エラー', 'フォルダが見つかりませんでした');
      router.back();
    }
  }, [isLoading, folder, router]);

  // フォルダ情報をeditTextに反映
  useEffect(() => {
    if (folder) {
      setEditText(folder.name);
    }
  }, [folder]);

  // フォルダ名が変更されたかチェック
  const hasChanges = folder && editText.trim() !== folder.name && editText.trim() !== "";

  // フォルダ名を更新
  const handleUpdateFolderName = async () => {
    if (!editText.trim() || !hasChanges) {
      return;
    }

    try {
      await updateMutation.mutateAsync({
        id,
        name: editText.trim(),
      });
    } catch (error) {
      console.error('[FolderDetail] フォルダ名変更エラー:', error);
      Alert.alert('エラー', 'フォルダ名の変更に失敗しました');
    }
  };

  // フォルダ削除
  const handleDeleteFolder = () => {
    if (!folder) return;

    Alert.alert(
      'フォルダを削除',
      `「${folder.name}」を削除しますか？\nフォルダ内のプロジェクトは未分類に移動されます。`,
      [
        { text: 'キャンセル', style: 'cancel' },
        {
          text: '削除',
          style: 'destructive',
          onPress: async () => {
            try {
              await deleteMutation.mutateAsync(id);
              router.back();
            } catch (error) {
              console.error('[FolderDetail] フォルダ削除エラー:', error);
              Alert.alert('エラー', 'フォルダの削除に失敗しました');
            }
          },
        },
      ]
    );
  };

  if (isLoading) {
    return (
      <SafeAreaView className="flex-1 bg-white" edges={['top']}>
        <View className="flex-1 items-center justify-center">
          <Text className="text-gray-500">読み込み中...</Text>
        </View>
      </SafeAreaView>
    );
  }

  if (!folder) {
    return null; // フォルダが見つからない場合はuseEffectでrouter.back()される
  }

  return (
    <SafeAreaView className="flex-1 bg-white" edges={['top']}>
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={{ flex: 1 }}
        keyboardVerticalOffset={0}
      >
        {/* ヘッダー */}
        <View className="px-5 py-4 border-b border-gray-200">
          <View className="flex-row items-center">
            <TouchableOpacity onPress={() => router.back()} className="mr-3" hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}>
              <MaterialIcons name="chevron-left" size={28} color="#111827" />
            </TouchableOpacity>
            <Text className="text-2xl font-bold text-gray-900 flex-1" numberOfLines={1}>
              フォルダ詳細
            </Text>
            <HeaderActionButton
              onPress={handleUpdateFolderName}
              label="保存"
              loadingLabel="保存中..."
              icon="check"
              disabled={!hasChanges}
              isLoading={updateMutation.isPending}
            />
          </View>
        </View>

        <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
          <View className="flex-1">
            {/* フォルダ情報 */}
            <View className="bg-white px-5 py-6">
              <Text className="text-sm font-medium text-gray-500 mb-2">フォルダ名</Text>
              <TextInput
                value={editText}
                onChangeText={setEditText}
                placeholder="フォルダ名を入力"
                autoFocus={false}
                editable={!updateMutation.isPending}
                isEditing={!!hasChanges}
              />

              <View className="mt-6 flex-row items-center">
                <MaterialIcons name="folder" size={20} color="#9CA3AF" />
                <Text className="text-sm text-gray-600 ml-2">
                  {folder.projectCount}件のプロジェクト
                </Text>
              </View>
            </View>

          {/* 削除ボタン */}
          <View className="px-5 py-6">
            <TouchableOpacity
              onPress={handleDeleteFolder}
              className="bg-red-50 rounded-lg px-4 py-3 border border-red-200"
              activeOpacity={0.7}
            >
              <Text className="text-base font-semibold text-red-600 text-center">
                このフォルダを削除
              </Text>
            </TouchableOpacity>
            <Text className="text-xs text-gray-500 text-center mt-2">
              フォルダ内のプロジェクトは未分類に移動されます
            </Text>
            </View>
          </View>
        </TouchableWithoutFeedback>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}
