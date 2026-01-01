import { useEffect, useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, Alert } from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import DraggableFlatList, { RenderItemParams } from 'react-native-draggable-flatlist';
import { MAX_TEMPLATE_SECTION_NAME_LENGTH, MAX_SECTIONS_PER_GENRE } from '@lyrics-notes/core';

interface SectionItem {
  id: string;
  name: string;
}

interface SectionManagerProps {
  sections: string[];
  onChange: (sections: string[]) => void;
  disabled?: boolean;
}

export function SectionManager({ sections, onChange, disabled = false }: SectionManagerProps) {
  const [items, setItems] = useState<SectionItem[]>(
    sections.map((name, index) => ({ id: `${index}`, name }))
  );
  const [newSectionName, setNewSectionName] = useState('');
  const [inputKey, setInputKey] = useState(0);

  // sectionsが変更されたらitemsを更新
  useEffect(() => {
    setItems(sections.map((name, index) => ({ id: `${index}`, name })));
  }, [sections]);

  const canAddMore = items.length < MAX_SECTIONS_PER_GENRE;

  // アイテムが変更されたら親に通知
  const notifyChange = (newItems: SectionItem[]) => {
    onChange(newItems.map(item => item.name));
  };

  // セクション追加
  const handleAdd = () => {
    if (!newSectionName.trim()) {
      Alert.alert('入力エラー', 'セクション名を入力してください');
      return;
    }
    if (!canAddMore) {
      Alert.alert('上限到達', `セクションは最大${MAX_SECTIONS_PER_GENRE}個まで登録できます`);
      return;
    }
    const newItems = [...items, { id: `${Date.now()}`, name: newSectionName.trim() }];
    setItems(newItems);
    notifyChange(newItems);
    setNewSectionName('');
    setInputKey(prev => prev + 1);
  };

  // セクション名変更
  const handleChangeName = (id: string, name: string) => {
    const newItems = items.map(item =>
      item.id === id ? { ...item, name } : item
    );
    setItems(newItems);
    notifyChange(newItems);
  };

  // セクション削除
  const handleDelete = (id: string, name: string) => {
    const message = name
      ? `「${name}」を削除してもよろしいですか？\n削除したセクションは復元できません。`
      : 'このセクションを削除してもよろしいですか？\n削除したセクションは復元できません。';

    Alert.alert(
      'セクションを削除',
      message,
      [
        { text: 'キャンセル', style: 'cancel' },
        {
          text: '削除',
          style: 'destructive',
          onPress: () => {
            const newItems = items.filter(item => item.id !== id);
            setItems(newItems);
            notifyChange(newItems);
          },
        },
      ]
    );
  };

  // 並び替え
  const handleDragEnd = ({ data }: { data: SectionItem[] }) => {
    setItems(data);
    notifyChange(data);
  };

  const renderItem = ({ item, drag, isActive }: RenderItemParams<SectionItem>) => (
    <View
      className={`flex-row items-center gap-2 px-4 py-3 bg-white border-b border-gray-200 ${
        isActive ? 'opacity-70' : ''
      }`}
    >
      {/* ドラッグハンドル */}
      <TouchableOpacity
        onLongPress={drag}
        delayLongPress={100}
        disabled={disabled || isActive}
        hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
      >
        <MaterialIcons name="drag-handle" size={24} color="#9CA3AF" />
      </TouchableOpacity>

      {/* セクション名入力 */}
      <TextInput
        className="flex-1 bg-gray-50 rounded-lg px-3 py-2 text-base border border-gray-200"
        placeholder="セクション名"
        value={item.name}
        onChangeText={(text) => handleChangeName(item.id, text)}
        maxLength={MAX_TEMPLATE_SECTION_NAME_LENGTH}
        editable={!disabled}
        multiline
        textAlignVertical="top"
        scrollEnabled={false}
      />

      {/* 削除ボタン */}
      <TouchableOpacity
        onPress={() => handleDelete(item.id, item.name)}
        disabled={disabled}
        hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
      >
        <MaterialIcons name="close" size={20} color="#EF4444" />
      </TouchableOpacity>
    </View>
  );

  return (
    <View>
      {/* ヘッダー */}
      <View className="flex-row items-center justify-between mb-3">
        <Text className="text-sm font-medium text-gray-500">
          セクション構成（任意）
        </Text>
        <Text className="text-xs text-gray-400">
          {items.length}/{MAX_SECTIONS_PER_GENRE}
        </Text>
      </View>

      {/* セクション追加フォーム */}
      <View className="mb-3">
        <View className="flex-row items-start gap-2">
          <View className="flex-1">
            <TextInput
              key={inputKey}
              className="bg-gray-50 rounded-lg px-4 py-3 text-base border border-gray-200"
              placeholder="セクション名を追加"
              value={newSectionName}
              onChangeText={setNewSectionName}
              maxLength={MAX_TEMPLATE_SECTION_NAME_LENGTH}
              onSubmitEditing={handleAdd}
              editable={!disabled}
              multiline
              textAlignVertical="top"
              scrollEnabled={false}
            />
            <View className="flex-row justify-between items-center mt-1 px-1">
              <Text className="text-xs text-gray-500">
                例: イントロ、Aメロ、Bメロ、サビ など
              </Text>
              <Text className="text-xs text-gray-400">
                {newSectionName.length}/{MAX_TEMPLATE_SECTION_NAME_LENGTH}文字
              </Text>
            </View>
          </View>
          <TouchableOpacity
            onPress={handleAdd}
            className={`rounded-lg p-3 ${!newSectionName.trim() || !canAddMore || disabled ? 'bg-gray-300' : 'bg-green-500'}`}
            disabled={!newSectionName.trim() || !canAddMore || disabled}
          >
            <MaterialIcons name="add" size={24} color="white" />
          </TouchableOpacity>
        </View>
      </View>

      {/* セクション一覧 */}
      {items.length === 0 ? (
        <View className="bg-gray-50 rounded-lg border border-gray-200 p-6 mb-2">
          <Text className="text-sm text-gray-400 text-center">
            セクションを追加してください
          </Text>
        </View>
      ) : (
        <GestureHandlerRootView className="mb-2">
          <View className="bg-gray-50 rounded-lg border border-gray-200">
            <DraggableFlatList
              data={items}
              renderItem={renderItem}
              keyExtractor={(item) => item.id}
              onDragEnd={handleDragEnd}
              scrollEnabled={false}
              activationDistance={20}
            />
          </View>
        </GestureHandlerRootView>
      )}

      {/* ヘルパーテキスト */}
      <Text className="text-xs text-gray-500">
        このジャンルでよく使うセクション構成を登録できます
      </Text>
    </View>
  );
}
