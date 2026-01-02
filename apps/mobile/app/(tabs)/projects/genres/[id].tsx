import { HeaderActionButton } from '@/components/shared/HeaderActionButton';
import { SectionManager, SectionItem } from '@/components/shared/SectionManager';
import { useDeleteGenre, useGenreDetail, useUpdateGenre } from '@/hooks/genre';
import { useInitializedState } from '@/hooks/shared/useInitializedState';
import { MaterialIcons } from '@expo/vector-icons';
import { MAX_GENRE_DESCRIPTION_LENGTH, MAX_GENRE_NAME_LENGTH, MAX_SECTIONS_PER_GENRE } from '@stanza/core';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { useState, useMemo, useRef } from 'react';
import { Alert, Keyboard, KeyboardAvoidingView, Platform, ScrollView, Text, TextInput, TouchableOpacity, TouchableWithoutFeedback, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';



export default function GenreDetailScreen() {
  const router = useRouter();
  const { id } = useLocalSearchParams<{ id: string }>();
  const { genre, loading } = useGenreDetail(id);
  const { updateGenre, isUpdating } = useUpdateGenre();
  const { deleteGenre, isDeleting } = useDeleteGenre();

  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [sections, setSections] = useState<SectionItem[]>([]);
  const [isDragActive, setIsDragActive] = useState(false);
  const [hasSectionErrors, setHasSectionErrors] = useState(false);
  

  // ジャンルデータ読み込み時に初期化（初回のみ）
  useInitializedState(genre, (data) => {
    setName(data.name);
    setDescription(data.description || '');
    setSections(data.sectionNames.map(name => ({ name })));
  });

  // 変更があるかチェック
  const sectionNames = useMemo(() => sections.map(s => s.name), [sections]);
  const hasChanges = useMemo(() => genre && (
    name.trim() !== genre.name ||
    (description.trim() || '') !== (genre.description || '') ||
    JSON.stringify(sectionNames) !== JSON.stringify(genre.sectionNames)
  ), [genre, name, description, sectionNames]);

  const handleSave = async () => {
    if (!name.trim()) {
      Alert.alert('入力エラー', 'ジャンル名を入力してください');
      return;
    }

    // 空のセクション名を除外
    const filteredSections = sectionNames.filter(s => s.trim());

    await updateGenre({
      id: id!,
      name: name.trim(),
      description: description.trim() || null,
      sectionNames: filteredSections,
    });
    router.back();
  };

  const handleDelete = () => {
    Alert.alert(
      '削除確認',
      'このジャンルを削除してもよろしいですか？',
      [
        { text: 'キャンセル', style: 'cancel' },
        {
          text: '削除',
          style: 'destructive',
          onPress: async () => {
            await deleteGenre(id!);
            router.back();
          },
        },
      ]
    );
  };

  if (loading) {
    return (
      <SafeAreaView className="flex-1 bg-white" edges={['top']}>
        <View className="px-5 py-4 border-b border-gray-200">
          <View className="flex-row items-center">
            <TouchableOpacity onPress={() => router.back()} className="mr-3" hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}>
              <MaterialIcons name="chevron-left" size={28} color="#111827" />
            </TouchableOpacity>
            <Text className="text-2xl font-bold text-gray-900 flex-1" numberOfLines={1}>
              ジャンル詳細
            </Text>
          </View>
        </View>
        <View className="flex-1 items-center justify-center">
          <Text className="text-gray-500">読み込み中...</Text>
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
              ジャンル詳細
            </Text>
            <HeaderActionButton
              onPress={handleSave}
              label="保存"
              loadingLabel="保存中..."
              icon="check"
              disabled={!name.trim() || !hasChanges || hasSectionErrors}
              isLoading={isUpdating}
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
              editable={!isUpdating}
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
              editable={!isUpdating}
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
              disabled={isUpdating}
              maxSections={MAX_SECTIONS_PER_GENRE}
              helperText="このジャンルでよく使うセクション構成を登録できます"
              onDragActiveChange={setIsDragActive}
              onValidationChange={setHasSectionErrors}
              
            />

            {/* 削除ボタン */}
            <TouchableOpacity
              onPress={handleDelete}
              disabled={isDeleting}
              className="bg-red-50 border border-red-200 rounded-lg px-4 py-3 mt-6"
            >
              <Text className="text-red-600 font-semibold text-center">
                {isDeleting ? '削除中...' : 'このジャンルを削除'}
              </Text>
            </TouchableOpacity>
          </ScrollView>
          </View>
        </TouchableWithoutFeedback>
      </KeyboardAvoidingView>
    </SafeAreaView>
    
  );
}
