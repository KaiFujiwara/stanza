import { HeaderActionButton } from '@/components/shared/HeaderActionButton';
import { SectionManager, SectionItem } from '@/components/shared/SectionManager';
import { useProjectDetail } from '@/hooks/project/useProjectDetail';
import { useUpdateProject } from '@/hooks/project/useUpdateProject';
import { useDeleteProject } from '@/hooks/project/useDeleteProject';
import { useGenres } from '@/hooks/genre';
import { useFolders } from '@/hooks/folder/useFolders';
import { MaterialIcons } from '@expo/vector-icons';
import { MAX_PROJECT_TITLE_LENGTH, MAX_SECTIONS_PER_PROJECT, MAX_SECTION_CONTENT_LENGTH } from '@stanza/core';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { useEffect, useRef, useState, useCallback, useMemo } from 'react';
import {
  Alert,
  Animated,
  Keyboard,
  KeyboardAvoidingView,
  Modal,
  Platform,
  ScrollView,
  Text,
  TextInput,
  TouchableOpacity,
  TouchableWithoutFeedback,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Picker } from '@react-native-picker/picker';



export default function ProjectDetailScreen() {
  const router = useRouter();
  const { id } = useLocalSearchParams<{ id: string }>();
  const { project, loading } = useProjectDetail(id);
  const { updateProject, isUpdating } = useUpdateProject();
  const { deleteProject, isDeleting } = useDeleteProject();
  const { genres } = useGenres();
  const { data: folders } = useFolders();

  const handleBack = (selectFolderId?: string | null) => {
    // フォルダIDが指定されている場合、パラメータ付きで遷移
    if (selectFolderId !== undefined) {
      // setTimeoutを使って、router.back()の完了を待ってからパラメータを設定
      if (router.canGoBack()) {
        router.back();
        // アニメーションの完了を待ってからパラメータを設定
        setTimeout(() => {
          router.setParams({ selectFolderId: selectFolderId || '' });
        }, 100);
      } else {
        router.replace({
          pathname: '/(tabs)/projects',
          params: { selectFolderId: selectFolderId || '' }
        });
      }
    } else {
      // フォルダIDが指定されていない場合は通常の戻る動作
      if (router.canGoBack()) {
        router.back();
      } else {
        router.replace('/(tabs)/projects');
      }
    }
  };

  const [title, setTitle] = useState('');
  const [folderId, setFolderId] = useState<string | undefined>(undefined);
  const [genreId, setGenreId] = useState<string | undefined>(undefined);
  const [sections, setSections] = useState<SectionItem[]>([]);
  const [sectionContents, setSectionContents] = useState<Record<string, string>>({});
  const [isDragActive, setIsDragActive] = useState(false);
  const [hasSectionErrors, setHasSectionErrors] = useState(false);
  const [activeTab, setActiveTab] = useState<'lyrics' | 'info'>('lyrics');
  const [showFolderPicker, setShowFolderPicker] = useState(false);
  const [showGenrePicker, setShowGenrePicker] = useState(false);
  const [titleFontSize, setTitleFontSize] = useState(24); // 初期値は最大サイズ

  // アニメーション用の値
  const slideAnim = useRef(new Animated.Value(0)).current;


  // プロジェクトデータ読み込み時に初期化
  useEffect(() => {
    if (project) {
      setTitle(project.title as string);
      setFolderId(project.folderId ? (project.folderId as string) : undefined);
      setGenreId(project.genreId ? (project.genreId as string) : undefined);
      setSections(
        project.sections.map((s) => ({
          id: s.id as string,
          name: s.name as string,
        }))
      );
      // セクションのコンテンツを初期化
      const contents: Record<string, string> = {};
      project.sections.forEach((s) => {
        contents[s.id as string] = (s.content as string) || '';
      });
      setSectionContents(contents);
    }
  }, [project]);

  // プロジェクトタイトルの文字数に応じてフォントサイズを計算
  // 2行表示に変更したので、1行あたり約15文字として計算
  const calculateTitleFontSize = useCallback((titleText: string) => {
    const length = titleText.length;
    if (length <= 15) {
      return 20;
    } else {
      return 18;
    }
  }, []);

  // プロジェクトタイトルが変わったらフォントサイズを再計算
  useEffect(() => {
    if (project?.title) {
      setTitleFontSize(calculateTitleFontSize(project.title as string));
    }
  }, [project?.title, calculateTitleFontSize]);

  // タブ切り替え時のアニメーション
  const handleTabChange = (tab: 'lyrics' | 'info') => {
    if (tab === activeTab) return;

    // 現在のタブから次のタブへの方向を決定
    const direction = tab === 'info' ? -1 : 1;
    const slideDistance = 300; // スライド距離

    // 反対側からスライドイン開始位置をセット
    slideAnim.setValue(-direction * slideDistance);

    // タブを切り替え
    setActiveTab(tab);

    // スライドイン
    Animated.timing(slideAnim, {
      toValue: 0,
      duration: 200,
      useNativeDriver: true,
    }).start();
  };

  // 変更があるかチェック
  const hasChanges = useMemo(() => {
    if (!project) return false;

    // タイトル、フォルダ、ジャンルの変更チェック
    const basicInfoChanged =
      title.trim() !== (project.title as string) ||
      folderId !== (project.folderId ? (project.folderId as string) : undefined) ||
      genreId !== (project.genreId ? (project.genreId as string) : undefined);

    // セクション構成の変更チェック
    const sectionsChanged =
      JSON.stringify(sections) !==
      JSON.stringify(
        project.sections.map((s) => ({
          id: s.id as string,
          name: s.name as string,
        }))
      );

    // セクションコンテンツの変更チェック
    const contentsChanged = project.sections.some((s) => {
      const currentContent = sectionContents[s.id as string] || '';
      const originalContent = (s.content as string) || '';
      return currentContent !== originalContent;
    });

    return basicInfoChanged || sectionsChanged || contentsChanged;
  }, [project, title, folderId, genreId, sections, sectionContents]);

  const handleSave = async () => {
    if (!title.trim()) {
      Alert.alert('入力エラー', 'プロジェクトタイトルを入力してください');
      return;
    }

    // 空のセクション名を除外し、コンテンツも含める
    const filteredSections = sections
      .filter((s) => s.name.trim())
      .map((s) => ({
        id: s.id,
        name: s.name,
        content: sectionContents[s.id!] || '',
      }));

    await updateProject({
      id: id!,
      title: title.trim(),
      folderId: folderId === undefined ? null : folderId,
      genreId: genreId === undefined ? null : genreId,
      sections: filteredSections,
    });
    // 保存後、更新したフォルダIDを渡して一覧画面に戻る
    // undefinedの場合はnullに変換（未分類タブを選択）
    handleBack(folderId === undefined ? null : folderId);
  };

  const handleDelete = () => {
    Alert.alert(
      '削除確認',
      'このプロジェクトを削除してもよろしいですか？',
      [
        { text: 'キャンセル', style: 'cancel' },
        {
          text: '削除',
          style: 'destructive',
          onPress: async () => {
            // 削除前の元のフォルダIDを保持
            const deletedProjectFolderId = project?.folderId as string | undefined;
            await deleteProject(id!);
            // 削除後、元のフォルダタブを表示
            handleBack(deletedProjectFolderId);
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
            <TouchableOpacity
              onPress={() => handleBack()}
              className="mr-3"
              hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
            >
              <MaterialIcons name="chevron-left" size={28} color="#111827" />
            </TouchableOpacity>
            <Text
              className="font-bold text-gray-900 flex-1"
              style={{ fontSize: 24, lineHeight: 28.8 }}
            >
              読み込み中...
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
              <TouchableOpacity
                onPress={() => handleBack()}
                className="mr-3"
                hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
              >
                <MaterialIcons name="chevron-left" size={28} color="#111827" />
              </TouchableOpacity>
              <Text
                className="font-bold text-gray-900 flex-1"
                numberOfLines={2}
                ellipsizeMode="tail"
                style={{ fontSize: titleFontSize, lineHeight: titleFontSize * 1.2 }}
              >
                {project?.title || 'プロジェクト詳細'}
              </Text>
              <HeaderActionButton
                onPress={handleSave}
                label="保存"
                loadingLabel="保存中..."
                icon="check"
                disabled={!title.trim() || !hasChanges || hasSectionErrors}
                isLoading={isUpdating}
              />
            </View>
          </View>

          {/* タブ */}
          <View className="flex-row border-b border-gray-200">
            <TouchableOpacity
              onPress={() => handleTabChange('lyrics')}
              className={`flex-1 py-3 ${activeTab === 'lyrics' ? 'border-b-2 border-green-500' : ''}`}
            >
              <Text className={`text-center font-semibold ${activeTab === 'lyrics' ? 'text-green-600' : 'text-gray-500'}`}>
                歌詞
              </Text>
            </TouchableOpacity>
            <TouchableOpacity
              onPress={() => handleTabChange('info')}
              className={`flex-1 py-3 ${activeTab === 'info' ? 'border-b-2 border-green-500' : ''}`}
            >
              <Text className={`text-center font-semibold ${activeTab === 'info' ? 'text-green-600' : 'text-gray-500'}`}>
                基本情報
              </Text>
            </TouchableOpacity>
          </View>

          {/* コンテンツ */}
          <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
            <Animated.View
              style={{
                flex: 1,
                transform: [{ translateX: slideAnim }],
              }}
            >
              {activeTab === 'lyrics' ? (
                // 歌詞タブ
                <ScrollView
                  className="flex-1 bg-white"
                  contentContainerStyle={{ padding: 20, flexGrow: 1 }}
                  keyboardShouldPersistTaps="handled"
                >
                  {sections.length === 0 ? (
                    <View className="flex-1 items-center justify-center">
                      <MaterialIcons name="info-outline" size={64} color="#D1D5DB" />
                      <Text className="text-gray-400 mt-4 text-center">
                        基本情報タブでセクションを追加してください
                      </Text>
                    </View>
                  ) : (
                    sections.map((section, index) => (
                      <View key={section.id || `section-${index}`} className="mb-6">
                        {/* セクション名 */}
                        <Text className="text-sm font-medium text-gray-500 mb-2">
                          {section.name || `セクション ${index + 1}`}
                        </Text>
                        {/* 歌詞入力 */}
                        <TextInput
                          className="bg-gray-50 rounded-lg px-4 py-3 text-base border border-gray-200"
                          placeholder={`${section.name}の歌詞を入力...`}
                          value={sectionContents[section.id!] || ''}
                          onChangeText={(text) => {
                            setSectionContents((prev) => ({
                              ...prev,
                              [section.id!]: text,
                            }));
                          }}
                          maxLength={MAX_SECTION_CONTENT_LENGTH}
                          editable={!isUpdating}
                          multiline
                          textAlignVertical="top"
                          style={{ minHeight: 120 }}
                        />
                        {/* 文字数カウント */}
                        <View className="flex-row justify-end items-center mt-1 px-1">
                          <Text className="text-xs text-gray-400">
                            {(sectionContents[section.id!] || '').length}/{MAX_SECTION_CONTENT_LENGTH}文字
                          </Text>
                        </View>
                      </View>
                    ))
                  )}
                </ScrollView>
              ) : (
                // 基本情報タブ
                <ScrollView
                  className="flex-1 bg-white"
                  contentContainerStyle={{ padding: 20, flexGrow: 1 }}
                  keyboardShouldPersistTaps="handled"
                  scrollEnabled={!isDragActive}
                >
                  {/* プロジェクトタイトル */}
                  <Text className="text-sm font-medium text-gray-500 mb-2">
                    プロジェクトタイトル
                  </Text>
                  <TextInput
                    className="bg-gray-50 rounded-lg px-4 py-3 text-base border border-gray-200"
                    placeholder="例: 新しい歌詞"
                    value={title}
                    onChangeText={setTitle}
                    maxLength={MAX_PROJECT_TITLE_LENGTH}
                    editable={!isUpdating}
                    multiline
                    textAlignVertical="top"
                    scrollEnabled={false}
                  />
                  <View className="flex-row justify-end items-center mt-1 px-1 mb-6">
                    <Text className="text-xs text-gray-400">
                      {title.length}/{MAX_PROJECT_TITLE_LENGTH}文字
                    </Text>
                  </View>

                  {/* フォルダ選択 */}
                  <Text className="text-sm font-medium text-gray-500 mb-2">
                    フォルダ（任意）
                  </Text>
                  <TouchableOpacity
                    onPress={() => setShowFolderPicker(true)}
                    className="bg-gray-50 rounded-lg px-4 py-3 border border-gray-200 mb-6"
                    disabled={isUpdating}
                  >
                    <View className="flex-row justify-between items-center">
                      <Text className="text-base text-gray-900">
                        {folderId && folders
                          ? folders.find((f) => (f.id as string) === folderId)?.name || 'フォルダを選択しない'
                          : 'フォルダを選択しない'}
                      </Text>
                      <MaterialIcons name="arrow-drop-down" size={24} color="#9CA3AF" />
                    </View>
                  </TouchableOpacity>

                  {/* ジャンル選択 */}
                  <Text className="text-sm font-medium text-gray-500 mb-2">
                    ジャンル（任意）
                  </Text>
                  <TouchableOpacity
                    onPress={() => setShowGenrePicker(true)}
                    className="bg-gray-50 rounded-lg px-4 py-3 border border-gray-200 mb-2"
                    disabled={isUpdating}
                  >
                    <View className="flex-row justify-between items-center">
                      <Text className="text-base text-gray-900">
                        {genreId && genres
                          ? genres.find((g) => (g.id as string) === genreId)?.name || 'ジャンルを選択しない'
                          : 'ジャンルを選択しない'}
                      </Text>
                      <MaterialIcons name="arrow-drop-down" size={24} color="#9CA3AF" />
                    </View>
                  </TouchableOpacity>
                  <Text className="text-xs text-gray-500 mb-6">
                    編集画面ではテンプレートは反映されません
                  </Text>

                  {/* セクション構成 */}
                  <SectionManager
                    sections={sections}
                    onChange={setSections}
                    disabled={isUpdating}
                    maxSections={MAX_SECTIONS_PER_PROJECT}
                    helperText="このプロジェクトで使用するセクション構成を設定できます"
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
                      {isDeleting ? '削除中...' : 'このプロジェクトを削除'}
                    </Text>
                  </TouchableOpacity>
                </ScrollView>
              )}
            </Animated.View>
          </TouchableWithoutFeedback>

      </KeyboardAvoidingView>

      {/* フォルダ選択モーダル */}
      <Modal
        visible={showFolderPicker}
        transparent={true}
        animationType="fade"
        onRequestClose={() => setShowFolderPicker(false)}
      >
        <TouchableWithoutFeedback onPress={() => setShowFolderPicker(false)}>
          <View className="flex-1 justify-end bg-black/50">
            <TouchableWithoutFeedback>
              <View className="bg-white rounded-t-3xl">
                <View className="flex-row items-center px-5 py-4 border-b border-gray-200">
                  <TouchableOpacity
                    onPress={() => setShowFolderPicker(false)}
                    className="py-1"
                    style={{ width: 80 }}
                    hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
                  >
                    <Text className="text-lg text-blue-500">キャンセル</Text>
                  </TouchableOpacity>
                  <View className="flex-1 items-center">
                    <Text className="text-lg font-semibold text-gray-900">フォルダ選択</Text>
                  </View>
                  <TouchableOpacity
                    onPress={() => setShowFolderPicker(false)}
                    className="py-1"
                    style={{ width: 80 }}
                    hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
                  >
                    <Text className="text-lg font-semibold text-blue-500 text-right">完了</Text>
                  </TouchableOpacity>
                </View>
                <View style={{ height: 250 }}>
                  <Picker
                    selectedValue={folderId}
                    onValueChange={(value) => setFolderId(value || undefined)}
                    itemStyle={{ fontSize: 17, color: '#111827' }}
                  >
                    <Picker.Item label="フォルダを選択しない" value={undefined} />
                    {folders && folders.map((folder) => (
                      <Picker.Item
                        key={folder.id as string}
                        label={folder.name}
                        value={folder.id as string}
                      />
                    ))}
                  </Picker>
                </View>
              </View>
            </TouchableWithoutFeedback>
          </View>
        </TouchableWithoutFeedback>
      </Modal>

      {/* ジャンル選択モーダル */}
      <Modal
        visible={showGenrePicker}
        transparent={true}
        animationType="fade"
        onRequestClose={() => setShowGenrePicker(false)}
      >
        <TouchableWithoutFeedback onPress={() => setShowGenrePicker(false)}>
          <View className="flex-1 justify-end bg-black/50">
            <TouchableWithoutFeedback>
              <View className="bg-white rounded-t-3xl">
                <View className="flex-row items-center px-5 py-4 border-b border-gray-200">
                  <TouchableOpacity
                    onPress={() => setShowGenrePicker(false)}
                    className="py-1"
                    style={{ width: 80 }}
                    hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
                  >
                    <Text className="text-lg text-blue-500">キャンセル</Text>
                  </TouchableOpacity>
                  <View className="flex-1 items-center">
                    <Text className="text-lg font-semibold text-gray-900">ジャンル選択</Text>
                  </View>
                  <TouchableOpacity
                    onPress={() => setShowGenrePicker(false)}
                    className="py-1"
                    style={{ width: 80 }}
                    hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
                  >
                    <Text className="text-lg font-semibold text-blue-500 text-right">完了</Text>
                  </TouchableOpacity>
                </View>
                <View style={{ height: 250 }}>
                  <Picker
                    selectedValue={genreId}
                    onValueChange={(value) => setGenreId(value || undefined)}
                    itemStyle={{ fontSize: 17, color: '#111827' }}
                  >
                    <Picker.Item label="ジャンルを選択しない" value={undefined} />
                    {genres && genres.map((genre) => (
                      <Picker.Item
                        key={genre.id as string}
                        label={genre.name}
                        value={genre.id as string}
                      />
                    ))}
                  </Picker>
                </View>
              </View>
            </TouchableWithoutFeedback>
          </View>
        </TouchableWithoutFeedback>
      </Modal>
    </SafeAreaView>
  );
}
