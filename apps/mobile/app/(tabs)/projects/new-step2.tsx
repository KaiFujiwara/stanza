import { useState, useEffect } from 'react';
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
import { HeaderActionButton } from '@/components/shared/HeaderActionButton';
import { SectionManager, SectionItem } from '@/components/projects/SectionManager';

export default function NewProjectStep2Screen() {
  const router = useRouter();
  const { title, genreId, folderId } = useLocalSearchParams<{ title: string; genreId: string; folderId: string }>();
  const { createProject, isCreating } = useCreateProject();
  const { genres } = useGenres();

  const [sections, setSections] = useState<SectionItem[]>([]);

  // 初期化時にジャンルのテンプレートを反映
  useEffect(() => {
    if (genreId && genres && genres.length > 0) {
      const selectedGenre = genres.find((g) => (g.id as string) === genreId);
      if (selectedGenre && selectedGenre.sectionNames && selectedGenre.sectionNames.length > 0) {
        const templateSections = selectedGenre.sectionNames.map((name) => ({
          name,
        }));
        setSections(templateSections);
      }
    }
  }, [genreId, genres]);

  const handleCreate = async () => {
    // 空のセクション名を除外
    const filteredSections = sections.filter((s) => s.name.trim());

    const result = await createProject({
      title: title,
      folderId: folderId || undefined,
      genreId: genreId || undefined,
      sections: filteredSections,
    });

    // プロジェクト詳細画面に遷移
    router.replace(`/projects/${result.project.id}`);
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
              disabled={isCreating}
              isLoading={isCreating}
            />
          </View>
        </View>

        {/* セクション編集 */}
        <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
          <ScrollView
            className="flex-1 bg-white"
            contentContainerStyle={{ padding: 20, flexGrow: 1 }}
            keyboardShouldPersistTaps="handled"
          >
            <SectionManager
              sections={sections}
              onChange={setSections}
              disabled={isCreating}
            />
          </ScrollView>
        </TouchableWithoutFeedback>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}
