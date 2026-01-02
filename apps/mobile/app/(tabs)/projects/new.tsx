import { useState } from 'react';
import {
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
import { useLocalSearchParams, useRouter } from 'expo-router';
import { MaterialIcons } from '@expo/vector-icons';
import { Picker } from '@react-native-picker/picker';
import { useGenres } from '@/hooks/genre';
import { MAX_PROJECT_TITLE_LENGTH } from '@stanza/core';

export default function NewProjectScreen() {
  const router = useRouter();
  const { folderId } = useLocalSearchParams<{ folderId: string }>();
  const { genres } = useGenres();

  const [title, setTitle] = useState('');
  const [genreId, setGenreId] = useState<string | undefined>(undefined);
  const [showGenrePicker, setShowGenrePicker] = useState(false);

  const handleNext = () => {
    // 2ページ目に遷移（タイトルとジャンルIDをパラメータで渡す）
    router.push({
      pathname: '/projects/new-step2',
      params: {
        title: title.trim(),
        genreId: genreId || '',
        folderId: folderId || '',
      },
    });
  };

  // 選択されたジャンルのセクションテンプレートを表示
  const selectedGenre = genreId && genres
    ? genres.find((g) => (g.id as string) === genreId)
    : null;

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
              新しいプロジェクト (1/2)
            </Text>
          </View>
        </View>

        {/* フォーム */}
        <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
          <ScrollView
            className="flex-1 bg-white"
            contentContainerStyle={{ padding: 20, paddingBottom: 100 }}
            keyboardShouldPersistTaps="handled"
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
              autoFocus
              multiline
              textAlignVertical="top"
              scrollEnabled={false}
            />
            <View className="flex-row justify-end items-center mt-1 px-1 mb-6">
              <Text className="text-xs text-gray-400">
                {title.length}/{MAX_PROJECT_TITLE_LENGTH}文字
              </Text>
            </View>

            {/* ジャンル選択 */}
            <Text className="text-sm font-medium text-gray-500 mb-2">
              ジャンル（任意）
            </Text>
            <TouchableOpacity
              onPress={() => setShowGenrePicker(true)}
              className="bg-gray-50 rounded-lg px-4 py-3 border border-gray-200 mb-2"
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
              ジャンルを選択すると、次のページでセクションテンプレートが自動で設定されます
            </Text>

            {/* テンプレートプレビュー */}
            {selectedGenre && (
              <View className="bg-blue-50 rounded-lg border border-blue-200 p-4 mb-6">
                <Text className="text-sm font-medium text-blue-900 mb-2">
                  このジャンルのセクションテンプレート
                </Text>
                {selectedGenre.sectionNames && selectedGenre.sectionNames.length > 0 ? (
                  <View className="gap-2">
                    {selectedGenre.sectionNames.map((name, index) => (
                      <View key={index} className="bg-white px-3 py-2 rounded-lg border border-blue-200">
                        <Text className="text-sm text-blue-700">{name}</Text>
                      </View>
                    ))}
                  </View>
                ) : (
                  <Text className="text-sm text-blue-700">
                    このジャンルにはセクションテンプレートが設定されていません
                  </Text>
                )}
              </View>
            )}
          </ScrollView>
        </TouchableWithoutFeedback>

        {/* 次へボタン */}
        <View className="absolute bottom-0 left-0 right-0 p-5 bg-white border-t border-gray-200">
          <TouchableOpacity
            onPress={handleNext}
            disabled={!title.trim()}
            className={`rounded-lg px-6 py-4 ${
              !title.trim() ? 'bg-gray-300' : 'bg-green-500'
            }`}
          >
            <Text className="text-white text-center font-semibold text-base">
              次へ
            </Text>
          </TouchableOpacity>
        </View>
      </KeyboardAvoidingView>

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
