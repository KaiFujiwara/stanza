import { HeaderActionButton } from '@/components/shared/HeaderActionButton';
import { TextInput } from '@/components/shared/TextInput';
import { TAG_COLOR_PRESETS } from '@/constants/tagColors';
import { useTagDetail } from '@/hooks/tag';
import { MaterialIcons } from '@expo/vector-icons';
import { MAX_TAG_NAME_LENGTH } from '@lyrics-notes/core';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { useEffect, useState } from 'react';
import { Alert, Keyboard, KeyboardAvoidingView, Platform, Text, TouchableOpacity, TouchableWithoutFeedback, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

export default function EditTagScreen() {
  const router = useRouter();
  const { id } = useLocalSearchParams<{ id: string }>();

  const { tag, isLoading, updateTag, deleteTag, isUpdating, isDeleting } = useTagDetail(id);

  const [tagName, setTagName] = useState('');
  const [selectedColor, setSelectedColor] = useState<string | null>(null);

  // タグデータが読み込まれたら初期値をセット
  useEffect(() => {
    if (tag) {
      setTagName(tag.name);
      setSelectedColor(tag.color);
    }
  }, [tag]);

  const hasChanges = tag && (tagName !== tag.name || selectedColor !== tag.color);

  const handleUpdateTag = async () => {
    if (!tagName.trim()) {
      Alert.alert('エラー', 'タグ名を入力してください');
      return;
    }

    await updateTag({
      name: tagName.trim(),
      color: selectedColor ?? undefined,
    });
    router.back();
  };

  const handleDeleteTag = () => {
    Alert.alert(
      'タグを削除',
      'このタグを削除してもよろしいですか？\nタグは削除されますが、フレーズは削除されません。',
      [
        { text: 'キャンセル', style: 'cancel' },
        {
          text: '削除',
          style: 'destructive',
          onPress: async () => {
            await deleteTag();
            router.back();
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

  if (!tag) {
    return (
      <SafeAreaView className="flex-1 bg-white" edges={['top']}>
        <View className="flex-1 items-center justify-center">
          <Text className="text-gray-500">タグが見つかりません</Text>
        </View>
      </SafeAreaView>
    );
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
              タグ詳細
            </Text>
            <HeaderActionButton
              onPress={handleUpdateTag}
              label="保存"
              loadingLabel="保存中..."
              icon="check"
              disabled={!hasChanges}
              isLoading={isUpdating}
            />
          </View>
        </View>

        <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
          <View className="flex-1 bg-white">
            {/* フォーム */}
            <View className="px-5 py-6">
              <Text className="text-sm font-medium text-gray-500 mb-2">タグ名</Text>
              <TextInput
                value={tagName}
                onChangeText={setTagName}
                placeholder="例: ラブソング"
                editable={!isUpdating && !isDeleting}
                maxLength={MAX_TAG_NAME_LENGTH}
                showCharCount
                helperText=""
              />
              <Text className="text-xs text-gray-500 mt-2 mb-6">
                フレーズを分類するためのタグ名を入力してください
              </Text>

              {/* カラー選択 */}
              <Text className="text-sm font-medium text-gray-500 mb-3">カラー（任意）</Text>
              <View className="flex-row flex-wrap gap-3 mb-4">
                {TAG_COLOR_PRESETS.map((color) => (
                  <TouchableOpacity
                    key={color}
                    onPress={() => setSelectedColor(color === selectedColor ? null : color)}
                    disabled={isUpdating || isDeleting}
                  >
                    <View
                      className="w-14 h-14 rounded-full"
                      style={{
                        backgroundColor: color,
                        borderWidth: 3,
                        borderColor: color === selectedColor ? '#1F2937' : 'transparent',
                      }}
                    />
                  </TouchableOpacity>
                ))}
              </View>
              <Text className="text-xs text-gray-500 mb-8">
                タグに色をつけると、視覚的に区別しやすくなります
              </Text>

              {/* 削除ボタン */}
              <TouchableOpacity
                className="bg-red-50 border border-red-200 rounded-lg px-4 py-3"
                onPress={handleDeleteTag}
                disabled={isDeleting || isUpdating}
                activeOpacity={0.7}
              >
                <Text className="text-base font-semibold text-red-600 text-center">
                  このタグを削除
                </Text>
              </TouchableOpacity>
              <Text className="text-xs text-gray-500 text-center mt-2">
                タグとフレーズの関連付けは削除されますが、フレーズ自体は削除されません
              </Text>
            </View>
          </View>
        </TouchableWithoutFeedback>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}
