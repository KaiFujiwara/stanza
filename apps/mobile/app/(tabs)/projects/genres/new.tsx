import { useState, useMemo, useRef } from 'react';
import { Alert, Keyboard, KeyboardAvoidingView, Platform, ScrollView, Text, TextInput, TouchableOpacity, TouchableWithoutFeedback, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { MaterialIcons } from '@expo/vector-icons';
import { useCreateGenre } from '@/hooks/genre';
import { HeaderActionButton } from '@/components/shared/HeaderActionButton';
import { SectionManager, SectionItem } from '@/components/shared/SectionManager';
import { MAX_GENRE_NAME_LENGTH, MAX_GENRE_DESCRIPTION_LENGTH, MAX_SECTIONS_PER_GENRE } from '@lyrics-notes/core';



export default function NewGenreScreen() {
  const router = useRouter();
  const { createGenre, isCreating } = useCreateGenre();

  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [sections, setSections] = useState<SectionItem[]>([]);
  const [isDragActive, setIsDragActive] = useState(false);
  const [hasSectionErrors, setHasSectionErrors] = useState(false);
  

  const handleSave = async () => {
    if (!name.trim()) {
      Alert.alert('入力エラー', 'ジャンル名を入力してください');
      return;
    }

    // 空のセクション名を除外
    const sectionNames = sections.map(s => s.name).filter(s => s.trim());

    await createGenre({
      name: name.trim(),
      description: description.trim() || undefined,
      sectionNames,
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
              disabled={!name.trim() || hasSectionErrors}
              isLoading={isCreating}
            />
          </View>
        </View>

        {/* フォーム */}
        <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
          <View style={{ flex: 1 }}>
            <ScrollView
              className="flex-1 bg-white"
              contentContainerStyle={{ padding: 20, flexGrow: 1 }}
              keyboardShouldPersistTaps="handled"
              scrollEnabled={!isDragActive}
              scrollEventThrottle={16}
              
            >
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
              sections={sections}
              onChange={setSections}
              disabled={isCreating}
              maxSections={MAX_SECTIONS_PER_GENRE}
              helperText="このジャンルでよく使うセクション構成を登録できます"
              onDragActiveChange={setIsDragActive}
              onValidationChange={setHasSectionErrors}
              
            />
          </ScrollView>
          </View>
        </TouchableWithoutFeedback>
      </KeyboardAvoidingView>
    </SafeAreaView>
    
  );
}
