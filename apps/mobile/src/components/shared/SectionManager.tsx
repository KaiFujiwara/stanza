import { useState, useRef, useMemo, useEffect } from 'react';
import { View, Text, TextInput, TouchableOpacity, Alert } from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import DragList, { DragListRenderItemInfo } from 'react-native-draglist';
import { MAX_TEMPLATE_SECTION_NAME_LENGTH } from '@lyrics-notes/core';

export interface SectionItem {
  id?: string;
  name: string;
}

interface SectionItemInternal extends SectionItem {
  _internalKey: string;
}

export interface SectionManagerProps {
  sections: SectionItem[];
  onChange: (sections: SectionItem[]) => void;
  disabled?: boolean;
  maxSections: number;
  helperText?: string;
  onDragActiveChange?: (isActive: boolean) => void;
  onValidationChange?: (hasErrors: boolean) => void;
}

let keyCounter = 0;

export function SectionManager({
  sections,
  onChange,
  disabled = false,
  maxSections,
  helperText = 'このセクション構成を設定できます',
  onDragActiveChange,
  onValidationChange
}: SectionManagerProps) {
  const [newSectionName, setNewSectionName] = useState('');
  const [inputKey, setInputKey] = useState(0);
  // セクション→内部キーのマップ（WeakMapでオブジェクト参照で管理）
  const keyMapRef = useRef<WeakMap<SectionItem, string>>(new WeakMap());

  // 各セクションに安定した一意のキーを付与
  const sectionsWithKeys = useMemo<SectionItemInternal[]>(() => {
    return sections.map((section, index) => {
      // 既存のオブジェクトの場合、WeakMapから取得
      let internalKey = keyMapRef.current.get(section);

      if (!internalKey) {
        // 新しいセクションの場合、一意のキーを生成
        internalKey = `key-${keyCounter++}-${Date.now()}-${index}`;
        keyMapRef.current.set(section, internalKey);
      }

      return {
        ...section,
        _internalKey: internalKey,
      };
    });
  }, [sections]);

  // バリデーションエラーをチェック
  const hasValidationErrors = useMemo(() => {
    return sections.some(section => !section.name.trim());
  }, [sections]);

  // バリデーションエラーを親に通知
  useEffect(() => {
    onValidationChange?.(hasValidationErrors);
  }, [hasValidationErrors, onValidationChange]);

  const canAddMore = sections.length < maxSections;

  // セクション追加
  const handleAdd = () => {
    if (!newSectionName.trim()) {
      Alert.alert('入力エラー', 'セクション名を入力してください');
      return;
    }
    if (!canAddMore) {
      Alert.alert('上限到達', `セクションは最大${maxSections}個まで登録できます`);
      return;
    }
    const newItems = [...sections, { name: newSectionName.trim() }];
    onChange(newItems);
    setNewSectionName('');
    setInputKey(prev => prev + 1);
  };

  // セクション名変更
  const handleChangeName = (index: number, name: string) => {
    const newItems = [...sections];
    newItems[index] = { ...newItems[index], name };
    onChange(newItems);
  };

  // セクション削除
  const handleDelete = (index: number, name: string) => {
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
            const newItems = sections.filter((_, i) => i !== index);
            onChange(newItems);
          },
        },
      ]
    );
  };

  // 並び替え
  const handleReordered = async (fromIndex: number, toIndex: number) => {
    const copy = [...sections];
    const removed = copy.splice(fromIndex, 1);
    copy.splice(toIndex, 0, removed[0]);
    onChange(copy);
  };

  const renderItem = (info: DragListRenderItemInfo<SectionItemInternal>) => {
    const { item, onDragStart, onDragEnd, isActive } = info;
    const isEmptyName = !item.name.trim();

    const handlePressIn = () => {
      onDragStart();
      onDragActiveChange?.(true);
    };

    const handlePressOut = () => {
      onDragEnd();
      onDragActiveChange?.(false);
    };

    return (
      <View
        className={`flex-row items-center gap-2 px-4 py-3 bg-white border-b border-gray-200`}
        style={{ backgroundColor: isActive ? '#f3f4f6' : 'white' }}
      >
        {/* ドラッグハンドル */}
        <TouchableOpacity
          onPressIn={handlePressIn}
          onPressOut={handlePressOut}
          disabled={disabled}
          hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
          activeOpacity={0.7}
        >
          <MaterialIcons name="drag-handle" size={24} color={isActive ? '#4B5563' : '#9CA3AF'} />
        </TouchableOpacity>

          {/* セクション名入力 */}
          <View style={{ flex: 1 }}>
            <TextInput
              className={`flex-1 bg-gray-50 rounded-lg px-3 py-2 text-base border ${isEmptyName ? 'border-red-500' : 'border-gray-200'}`}
              placeholder="セクション名"
              value={item.name}
              onChangeText={(text) => {
                // 元の配列から現在のアイテムのインデックスを見つける
                const currentIndex = sectionsWithKeys.findIndex(s => s._internalKey === item._internalKey);
                if (currentIndex !== -1) {
                  handleChangeName(currentIndex, text);
                }
              }}
              maxLength={MAX_TEMPLATE_SECTION_NAME_LENGTH}
              editable={!disabled}
              multiline
              textAlignVertical="top"
              scrollEnabled={false}
            />
            {isEmptyName && (
              <Text className="text-xs text-red-500 mt-1">
                セクション名を入力してください
              </Text>
            )}
          </View>

          {/* 削除ボタン */}
          <TouchableOpacity
            onPress={() => {
              // 元の配列から現在のアイテムのインデックスを見つける
              const currentIndex = sectionsWithKeys.findIndex(s => s._internalKey === item._internalKey);
              if (currentIndex !== -1) {
                handleDelete(currentIndex, item.name);
              }
            }}
            disabled={disabled}
            hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
          >
            <MaterialIcons name="close" size={20} color="#EF4444" />
          </TouchableOpacity>
        </View>
    );
  };

  return (
    <View>
      {/* ヘッダー */}
      <View className="flex-row items-center justify-between mb-3">
        <Text className="text-sm font-medium text-gray-500">
          セクション構成（任意）
        </Text>
        <Text className="text-xs text-gray-400">
          {sections.length}/{maxSections}
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
      {sections.length === 0 ? (
        <View className="bg-gray-50 rounded-lg border border-gray-200 p-6 mb-2">
          <Text className="text-sm text-gray-400 text-center">
            セクションを追加してください
          </Text>
        </View>
      ) : (
        <View className="mb-2 bg-gray-50 rounded-lg border border-gray-200">
          <DragList
            data={sectionsWithKeys}
            renderItem={renderItem}
            keyExtractor={(item) => item._internalKey}
            onReordered={handleReordered}
            scrollEnabled={false}
          />
        </View>
      )}

      {/* ヘルパーテキスト */}
      <Text className="text-xs text-gray-500">
        {helperText}
      </Text>
    </View>
  );
}
