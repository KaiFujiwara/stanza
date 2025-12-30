import { Modal, View, Text, TouchableOpacity, ScrollView } from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import { useTags } from '@/hooks/tag';

interface TagFilterModalProps {
  visible: boolean;
  onClose: () => void;
  selectedTagIds: string[];
  onTagToggle: (tagId: string) => void;
}

export function TagFilterModal({
  visible,
  onClose,
  selectedTagIds,
  onTagToggle,
}: TagFilterModalProps) {
  const { tags } = useTags();

  return (
    <Modal
      visible={visible}
      animationType="fade"
      transparent={true}
      onRequestClose={onClose}
    >
      <View className="flex-1 justify-center items-center bg-black/50 px-6">
        <View className="bg-white rounded-2xl w-full max-w-md max-h-[70%]">
          {/* ヘッダー */}
          <View className="flex-row items-center justify-between px-5 py-4 border-b border-gray-200">
            <Text className="text-lg font-semibold text-gray-900">タグで絞り込み</Text>
            <TouchableOpacity onPress={onClose} hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}>
              <MaterialIcons name="close" size={24} color="#6B7280" />
            </TouchableOpacity>
          </View>

          {/* タグ一覧 */}
          <ScrollView className="px-5 py-4">
            {tags.length === 0 ? (
              <View className="py-8 items-center">
                <Text className="text-gray-500 text-sm">タグがありません</Text>
              </View>
            ) : (
              <View className="flex-row flex-wrap gap-2">
                {tags.map((tag) => {
                  const isSelected = selectedTagIds.includes(tag.id);
                  return (
                    <TouchableOpacity
                      key={tag.id}
                      onPress={() => onTagToggle(tag.id)}
                      className={`px-4 py-2.5 rounded-full border ${
                        isSelected
                          ? 'bg-blue-50 border-blue-500'
                          : 'bg-white border-gray-300'
                      }`}
                    >
                      <Text
                        className={`text-sm font-medium ${
                          isSelected ? 'text-blue-600' : 'text-gray-700'
                        }`}
                      >
                        {tag.name}
                      </Text>
                    </TouchableOpacity>
                  );
                })}
              </View>
            )}
          </ScrollView>

          {/* フッター */}
          <View className="px-5 py-4 border-t border-gray-200">
            <TouchableOpacity
              onPress={() => {
                if (selectedTagIds.length > 0) {
                  selectedTagIds.forEach((id) => onTagToggle(id));
                }
              }}
              disabled={selectedTagIds.length === 0}
              className={`py-3 rounded-lg items-center ${
                selectedTagIds.length > 0 ? 'bg-gray-100' : 'bg-gray-50'
              }`}
            >
              <Text className={`font-medium ${
                selectedTagIds.length > 0 ? 'text-gray-700' : 'text-gray-400'
              }`}>
                選択を解除
              </Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </Modal>
  );
}
