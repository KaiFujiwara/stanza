import { useState } from 'react';
import { View, Text, TouchableOpacity, Alert, KeyboardAvoidingView, Platform, TouchableWithoutFeedback, Keyboard } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { MaterialIcons } from '@expo/vector-icons';
import { TextInput } from '@/components/shared/TextInput';
import { HeaderActionButton } from '@/components/shared/HeaderActionButton';
import { useCreateTag, useTags } from '@/hooks/tag';
import { TAG_COLOR_PRESETS } from '@/constants/tagColors';
import { MAX_TAG_NAME_LENGTH } from '@stanza/core';

export default function NewTagScreen() {
  const router = useRouter();
  const { createTag, isCreating } = useCreateTag();

  const [tagName, setTagName] = useState('');
  const [selectedColor, setSelectedColor] = useState<string | null>(null);

  const handleCreateTag = async () => {
    if (!tagName.trim()) {
      Alert.alert('入力エラー', 'タグ名を入力してください');
      return;
    }

    await createTag({
      name: tagName.trim(),
      color: selectedColor ?? undefined,
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
              新しいタグ
            </Text>
            <HeaderActionButton
              onPress={handleCreateTag}
              label="作成"
              loadingLabel="作成中..."
              icon="add"
              disabled={!tagName.trim()}
              isLoading={isCreating}
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
                autoFocus
                onSubmitEditing={handleCreateTag}
                editable={!isCreating}
                maxLength={MAX_TAG_NAME_LENGTH}
                showCharCount
                helperText="フレーズを分類するためのタグ名を入力してください"
              />
              <View className="mb-6" />

              {/* カラー選択 */}
              <Text className="text-sm font-medium text-gray-500 mb-3">カラー（任意）</Text>
              <View className="flex-row flex-wrap gap-3 mb-4">
                {TAG_COLOR_PRESETS.map((color) => (
                  <TouchableOpacity
                    key={color}
                    onPress={() => setSelectedColor(color === selectedColor ? null : color)}
                    disabled={isCreating}
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
              <Text className="text-xs text-gray-500">
                タグに色をつけると、視覚的に区別しやすくなります
              </Text>
            </View>
          </View>
        </TouchableWithoutFeedback>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}
