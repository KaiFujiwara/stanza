import { useState } from 'react';
import { Alert, Keyboard, KeyboardAvoidingView, Platform, ScrollView, Text, TouchableOpacity, TouchableWithoutFeedback, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { MaterialIcons } from '@expo/vector-icons';
import { useCreateGenre } from '@/hooks/genre';
import { HeaderActionButton } from '@/components/shared/HeaderActionButton';
import { SectionManager } from '@/components/genres/SectionManager';
import { MAX_GENRE_NAME_LENGTH, MAX_GENRE_DESCRIPTION_LENGTH } from '@lyrics-notes/core';

export default function NewGenreScreen() {
  const router = useRouter();
  const { createGenre, isCreating } = useCreateGenre();

  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [sectionNames, setSectionNames] = useState<string[]>([]);

  const handleSave = async () => {
    if (!name.trim()) {
      Alert.alert('入力エラー', 'ジャンル名を入力してください');
      return;
    }

    // 空のセクション名を除外
    const filteredSections = sectionNames.filter(s => s.trim());

    await createGenre({
      name: name.trim(),
      description: description.trim() || undefined,
      sectionNames: filteredSections,
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
              新しいジャンル
            </Text>
            <HeaderActionButton
              onPress={handleSave}
              label="作成"
              loadingLabel="作成中..."
              icon="add"
              disabled={!name.trim()}
              isLoading={isCreating}
            />
          </View>
        </View>

        {/* フォーム */}
        <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
          <ScrollView className="flex-1 bg-white" contentContainerStyle={{ padding: 20, flexGrow: 1 }} keyboardShouldPersistTaps="handled">
            {/* ジャンル名 */}
            <Text className="text-sm font-medium text-gray-500 mb-2">ジャンル名</Text>
            <TextInput
              className="bg-gray-50 rounded-lg px-4 py-3 text-base border border-gray-200"
              placeholder="例: J-POP"
              value={name}
              onChangeText={setName}
              maxLength={MAX_GENRE_NAME_LENGTH}
              autoFocus
              editable={!isCreating}
              multiline
              textAlignVertical="top"
              scrollEnabled={false}
            />
            <View className="flex-row justify-end items-center mt-1 px-1 mb-6">
              <Text className="text-xs text-gray-400">
                {name.length}/{MAX_GENRE_NAME_LENGTH}文字
              </Text>
            </View>

            {/* 説明 */}
            <Text className="text-sm font-medium text-gray-500 mb-2">説明（任意）</Text>
            <TextInput
              className="bg-gray-50 rounded-lg px-4 py-3 text-base border border-gray-200"
              placeholder="このジャンルの説明"
              value={description}
              onChangeText={setDescription}
              maxLength={MAX_GENRE_DESCRIPTION_LENGTH}
              multiline
              numberOfLines={3}
              textAlignVertical="top"
              editable={!isCreating}
            />
            <View className="flex-row justify-end items-center mt-1 px-1 mb-6">
              <Text className="text-xs text-gray-400">
                {description.length}/{MAX_GENRE_DESCRIPTION_LENGTH}文字
              </Text>
            </View>

            {/* セクション構成 */}
            <SectionManager
              sections={sectionNames}
              onChange={setSectionNames}
              disabled={isCreating}
            />
          </ScrollView>
        </TouchableWithoutFeedback>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}
