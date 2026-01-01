import { useState, useEffect } from "react";
import { View, Text, TouchableOpacity, Alert, KeyboardAvoidingView, Platform, TouchableWithoutFeedback, Keyboard, ScrollView } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useRouter, useLocalSearchParams } from "expo-router";
import { MaterialIcons } from "@expo/vector-icons";
import { HeaderActionButton } from "@/components/shared/HeaderActionButton";
import { TextInput } from "@/components/shared/TextInput";
import { TagSelector } from "@/components/phrases/TagSelector";
import { usePhraseDetail } from "@/hooks/phrase";
import { MAX_PHRASE_TEXT_LENGTH, MAX_PHRASE_NOTE_LENGTH } from "@lyrics-notes/core";

export default function PhraseDetailScreen() {
  const router = useRouter();
  const { id } = useLocalSearchParams<{ id: string }>();
  const [editText, setEditText] = useState("");
  const [editNote, setEditNote] = useState("");
  const [selectedTagIds, setSelectedTagIds] = useState<string[]>([]);

  const { phrase, loading, updatePhrase, deletePhrase, isUpdating, isDeleting } = usePhraseDetail(id);

  // フレーズが見つからない場合
  useEffect(() => {
    if (!loading && !phrase) {
      Alert.alert('エラー', 'フレーズが見つかりませんでした');
      router.back();
    }
  }, [loading, phrase, router]);

  // フレーズ情報をstateに反映
  useEffect(() => {
    if (phrase) {
      setEditText(phrase.text);
      setEditNote(phrase.note ?? "");
      setSelectedTagIds(phrase.tags.map(tag => tag.id));
    }
  }, [phrase]);

  // フレーズが変更されたかチェック
  const hasChanges = phrase && (
    editText.trim() !== phrase.text ||
    editNote.trim() !== (phrase.note ?? "") ||
    JSON.stringify(selectedTagIds.sort()) !== JSON.stringify(phrase.tags.map(t => t.id).sort())
  );

  // フレーズを更新
  const handleUpdatePhrase = async () => {
    if (!editText.trim() || !hasChanges) {
      return;
    }

    await updatePhrase({
      text: editText.trim(),
      note: editNote.trim() || undefined,
      tagIds: selectedTagIds,
    });
    router.back();
  };

  // フレーズ削除
  const handleDeletePhrase = () => {
    if (!phrase) return;

    Alert.alert(
      'フレーズを削除',
      `このフレーズを削除しますか？`,
      [
        { text: 'キャンセル', style: 'cancel' },
        {
          text: '削除',
          style: 'destructive',
          onPress: async () => {
            await deletePhrase();
            router.back();
          },
        },
      ]
    );
  };

  const handleTagToggle = (tagId: string) => {
    setSelectedTagIds(prev =>
      prev.includes(tagId)
        ? prev.filter(id => id !== tagId)
        : [...prev, tagId]
    );
  };

  if (loading) {
    return (
      <SafeAreaView className="flex-1 bg-white" edges={['top']}>
        <View className="flex-1 items-center justify-center">
          <Text className="text-gray-500">読み込み中...</Text>
        </View>
      </SafeAreaView>
    );
  }

  if (!phrase) {
    return null; // フレーズが見つからない場合はuseEffectでrouter.back()される
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
              フレーズ詳細
            </Text>
            <HeaderActionButton
              onPress={handleUpdatePhrase}
              label="保存"
              loadingLabel="保存中..."
              icon="check"
              disabled={!hasChanges}
              isLoading={isUpdating}
            />
          </View>
        </View>

        <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
          <ScrollView className="flex-1">
            {/* フレーズ情報 */}
            <View className="bg-white px-5 py-6">
              {/* フレーズ本文 */}
              <View className="mb-6">
                <Text className="text-sm font-medium text-gray-500 mb-2">フレーズ本文</Text>
                <TextInput
                  value={editText}
                  onChangeText={setEditText}
                  placeholder="フレーズ本文を入力"
                  editable={!isUpdating}
                  maxLength={MAX_PHRASE_TEXT_LENGTH}
                  showCharCount
                />
              </View>

              {/* メモ */}
              <View className="mb-6">
                <Text className="text-sm font-medium text-gray-500 mb-2">メモ（任意）</Text>
                <TextInput
                  value={editNote}
                  onChangeText={setEditNote}
                  placeholder="メモを入力（任意）"
                  editable={!isUpdating}
                  maxLength={MAX_PHRASE_NOTE_LENGTH}
                  showCharCount
                />
              </View>

              {/* タグ編集 */}
              <View className="mb-6">
                <Text className="text-sm font-medium text-gray-500 mb-3">タグ</Text>
                <TagSelector
                  selectedTagIds={selectedTagIds}
                  onTagToggle={handleTagToggle}
                  onManageTags={() => router.push('/phrases/tags/new')}
                />
              </View>

              {/* 日時情報 */}
              <View className="flex-row items-center mb-2">
                <MaterialIcons name="schedule" size={16} color="#9CA3AF" />
                <Text className="text-sm text-gray-600 ml-2">
                  作成: {new Date(phrase.createdAt).toLocaleDateString('ja-JP', {
                    year: 'numeric',
                    month: '2-digit',
                    day: '2-digit',
                    hour: '2-digit',
                    minute: '2-digit',
                  })}
                </Text>
              </View>
              <View className="flex-row items-center">
                <MaterialIcons name="update" size={16} color="#9CA3AF" />
                <Text className="text-sm text-gray-600 ml-2">
                  更新: {new Date(phrase.updatedAt).toLocaleDateString('ja-JP', {
                    year: 'numeric',
                    month: '2-digit',
                    day: '2-digit',
                    hour: '2-digit',
                    minute: '2-digit',
                  })}
                </Text>
              </View>
            </View>

            {/* 削除ボタン */}
            <View className="px-5 py-6">
              <TouchableOpacity
                onPress={handleDeletePhrase}
                className="bg-red-50 rounded-lg px-4 py-3 border border-red-200"
                activeOpacity={0.7}
                disabled={isDeleting}
              >
                <Text className="text-base font-semibold text-red-600 text-center">
                  {isDeleting ? '削除中...' : 'このフレーズを削除'}
                </Text>
              </TouchableOpacity>
              <Text className="text-xs text-gray-500 text-center mt-2">
                削除したフレーズは復元できません
              </Text>
            </View>
          </ScrollView>
        </TouchableWithoutFeedback>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}
