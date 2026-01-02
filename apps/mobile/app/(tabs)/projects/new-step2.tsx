import { useState } from 'react';
import {
  Keyboard,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  Text,
  TouchableOpacity,
  TouchableWithoutFeedback,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { MaterialIcons } from '@expo/vector-icons';
import { useCreateProject } from '@/hooks/project/useCreateProject';
import { useGenres } from '@/hooks/genre';
import { useInitializedState } from '@/hooks/shared/useInitializedState';
import { HeaderActionButton } from '@/components/shared/HeaderActionButton';
import { SectionManager, SectionItem } from '@/components/shared/SectionManager';
import { MAX_SECTIONS_PER_PROJECT } from '@stanza/core';

export default function NewProjectStep2Screen() {
  const router = useRouter();
  const { title, genreId, folderId } = useLocalSearchParams<{ title: string; genreId: string; folderId: string }>();
  const { createProject, isCreating } = useCreateProject();
  const { genres } = useGenres();

  const [sections, setSections] = useState<SectionItem[]>([]);
  const [isDragActive, setIsDragActive] = useState(false);
  const [hasSectionErrors, setHasSectionErrors] = useState(false);

  // 初期化時にジャンルのテンプレートを反映
  useInitializedState(genres, (data) => {
    if (genreId) {
      const selectedGenre = data.find((g) => (g.id as string) === genreId);
      if (selectedGenre?.sectionNames?.length) {
        setSections(selectedGenre.sectionNames.map((name) => ({ name })));
      }
    }
  });

  const handleCreate = async () => {
    // 空のセクション名を除外
    const filteredSections = sections.filter((s) => s.name.trim());

    const result = await createProject({
      title: title,
      folderId: folderId || undefined,
      genreId: genreId || undefined,
      sections: filteredSections,
    });

    // プロジェクト一覧に戻ってからプロジェクト詳細を開く
    router.dismissAll();
    router.push(`/projects/${result.project.id}`);
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
          <TouchableOpacity
            onPress={() => router.back()}
            className="mr-3"
            hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
          >
            <MaterialIcons name="chevron-left" size={28} color="#111827" />
          </TouchableOpacity>
          <Text className="text-2xl font-bold text-gray-900 flex-1" numberOfLines={1}>
            新しいプロジェクト (2/2)
          </Text>
          <HeaderActionButton
            onPress={handleCreate}
            label="作成"
            loadingLabel="作成中..."
            icon="add"
            disabled={isCreating || hasSectionErrors}
            isLoading={isCreating}
          />
        </View>
      </View>

      {/* セクション編集 */}
      <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
        <View style={{ flex: 1 }}>
          <ScrollView
            className="flex-1 bg-white"
            contentContainerStyle={{ padding: 20, flexGrow: 1 }}
            keyboardShouldPersistTaps="handled"
            scrollEnabled={!isDragActive}
          >
            <SectionManager
              sections={sections}
              onChange={setSections}
              disabled={isCreating}
              maxSections={MAX_SECTIONS_PER_PROJECT}
              helperText="このプロジェクトで使用するセクション構成を設定できます"
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
