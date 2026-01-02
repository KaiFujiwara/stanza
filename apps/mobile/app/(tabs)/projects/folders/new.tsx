import { HeaderActionButton } from "@/components/shared/HeaderActionButton";
import { TextInput } from "@/components/shared/TextInput";
import { useCreateFolder } from "@/hooks/folder";
import { MaterialIcons } from "@expo/vector-icons";
import { MAX_FOLDER_NAME_LENGTH } from "@stanza/core";
import { useRouter } from "expo-router";
import { useState } from "react";
import { Alert, Keyboard, KeyboardAvoidingView, Platform, Text, TouchableOpacity, TouchableWithoutFeedback, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

export default function NewFolderScreen() {
  const router = useRouter();
  const [folderName, setFolderName] = useState("");

  const createMutation = useCreateFolder();

  // フォルダを作成
  const handleCreateFolder = async () => {
    if (!folderName.trim()) {
      Alert.alert('入力エラー', 'フォルダ名を入力してください');
      return;
    }

    await createMutation.mutateAsync({
      name: folderName.trim(),
    });
    router.back();
  };

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
              新しいフォルダ
            </Text>
            <HeaderActionButton
              onPress={handleCreateFolder}
              label="作成"
              loadingLabel="作成中..."
              icon="add"
              disabled={!folderName.trim()}
              isLoading={createMutation.isPending}
            />
          </View>
        </View>

        {/* フォーム */}
        <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
          <View className="flex-1 bg-white px-5 py-6">
            <Text className="text-sm font-medium text-gray-500 mb-2">フォルダ名</Text>
            <TextInput
              value={folderName}
              onChangeText={setFolderName}
              placeholder="例: お気に入り、ボツネタ など"
              autoFocus
              onSubmitEditing={handleCreateFolder}
              editable={!createMutation.isPending}
              maxLength={MAX_FOLDER_NAME_LENGTH}
              showCharCount
              helperText="フォルダを作成すると、プロジェクトを整理しやすくなります"
            />
          </View>
        </TouchableWithoutFeedback>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}
