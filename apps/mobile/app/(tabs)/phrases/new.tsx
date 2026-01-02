import { TagSelector } from "@/components/phrases/TagSelector";
import { HeaderActionButton } from "@/components/shared/HeaderActionButton";
import { TextInput } from "@/components/shared/TextInput";
import { usePhrases } from "@/hooks/phrase";
import { MaterialIcons } from "@expo/vector-icons";
import { MAX_PHRASE_NOTE_LENGTH, MAX_PHRASE_TEXT_LENGTH } from "@stanza/core";
import { useRouter } from "expo-router";
import { useState } from "react";
import { Alert, Keyboard, KeyboardAvoidingView, Platform, ScrollView, Text, TouchableOpacity, TouchableWithoutFeedback, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

export default function NewPhraseScreen() {
  const router = useRouter();
  const [phraseText, setPhraseText] = useState("");
  const [phraseNote, setPhraseNote] = useState("");
  const [selectedTagIds, setSelectedTagIds] = useState<string[]>([]);

  const { createPhrase, isCreating } = usePhrases();

  // フレーズを作成
  const handleCreatePhrase = async () => {
    if (!phraseText.trim()) {
      Alert.alert('入力エラー', 'フレーズ本文を入力してください');
      return;
    }

    await createPhrase({
      text: phraseText.trim(),
      note: phraseNote.trim() || undefined,
      tagIds: selectedTagIds.length > 0 ? selectedTagIds : undefined,
    });
    router.back();
  };

  const handleTagToggle = (tagId: string) => {
    setSelectedTagIds(prev =>
      prev.includes(tagId)
        ? prev.filter(id => id !== tagId)
        : [...prev, tagId]
    );
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
              新しいフレーズ
            </Text>
            <HeaderActionButton
              onPress={handleCreatePhrase}
              label="作成"
              loadingLabel="作成中..."
              icon="add"
              disabled={!phraseText.trim()}
              isLoading={isCreating}
            />
          </View>
        </View>

        {/* フォーム */}
        <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
          <ScrollView className="flex-1 bg-white px-5 py-6">
            {/* フレーズ本文 */}
            <Text className="text-sm font-medium text-gray-500 mb-2">フレーズ本文</Text>
            <TextInput
              value={phraseText}
              onChangeText={setPhraseText}
              placeholder="例: 空に浮かぶ雲のように"
              autoFocus
              onSubmitEditing={handleCreatePhrase}
              editable={!isCreating}
              maxLength={MAX_PHRASE_TEXT_LENGTH}
              showCharCount
              helperText="思いついた歌詞のフレーズを入力してください"
            />
            <View className="mb-6" />

            {/* メモ */}
            <Text className="text-sm font-medium text-gray-500 mb-2">メモ（任意）</Text>
            <TextInput
              value={phraseNote}
              onChangeText={setPhraseNote}
              placeholder="例: Aメロで使えそう、韻を踏んでいる など"
              editable={!isCreating}
              maxLength={MAX_PHRASE_NOTE_LENGTH}
              showCharCount
              helperText="このフレーズについてのメモを残せます"
            />
            <View className="mb-6" />

            {/* タグ選択 */}
            <Text className="text-sm font-medium text-gray-500 mb-3">タグ（任意）</Text>
            <TagSelector
              selectedTagIds={selectedTagIds}
              onTagToggle={handleTagToggle}
              onManageTags={() => router.push('/phrases/tags/new')}
            />
            <Text className="text-xs text-gray-500 mt-2">
              フレーズを分類するためのタグを選択できます
            </Text>
          </ScrollView>
        </TouchableWithoutFeedback>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}
