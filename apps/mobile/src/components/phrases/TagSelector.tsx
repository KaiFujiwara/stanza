import { useTags } from '@/hooks/tag';
import { MaterialIcons } from '@expo/vector-icons';
import { Text, TouchableOpacity, View } from 'react-native';
import { DEFAULT_TAG_COLOR } from '@/constants/tagColors';

interface TagSelectorProps {
  selectedTagIds: string[];
  onTagToggle: (tagId: string) => void;
  onManageTags?: () => void;
}

export function TagSelector({ selectedTagIds, onTagToggle, onManageTags }: TagSelectorProps) {
  const { tags, loading } = useTags();

  if (loading) {
    return (
      <View className="py-3">
        <Text className="text-sm text-gray-500">タグを読み込み中...</Text>
      </View>
    );
  }

  if (tags.length === 0) {
    return (
      <View>
        {onManageTags && (
          <TouchableOpacity
            onPress={onManageTags}
            className="px-3 py-2 rounded-full border border-gray-300 bg-white flex-row items-center self-start"
          >
            <MaterialIcons name="add" size={14} color="#6B7280" style={{ marginRight: 4 }} />
            <Text className="text-sm text-gray-600">タグを作成</Text>
          </TouchableOpacity>
        )}
      </View>
    );
  }

  return (
    <View className="flex-row flex-wrap gap-2">
      {tags.map((tag) => {
        const isSelected = selectedTagIds.includes(tag.id);
        return (
          <TouchableOpacity
            key={tag.id}
            onPress={() => onTagToggle(tag.id)}
            className={`px-3 py-2 rounded-full flex-row items-center ${
              isSelected ? 'border-2' : 'border'
            }`}
            style={{
              backgroundColor: isSelected ? tag.color ?? DEFAULT_TAG_COLOR : '#FFFFFF',
              borderColor: tag.color ?? DEFAULT_TAG_COLOR,
            }}
          >
            {isSelected && (
              <MaterialIcons name="check" size={14} color="#374151" style={{ marginRight: 4 }} />
            )}
            <Text
              className={`text-sm font-medium ${
                isSelected ? 'text-gray-900' : 'text-gray-700'
              }`}
            >
              {tag.name}
            </Text>
          </TouchableOpacity>
        );
      })}
      {onManageTags && (
        <TouchableOpacity
          onPress={onManageTags}
          className="px-3 py-2 rounded-full border border-gray-300 bg-white flex-row items-center"
        >
          <MaterialIcons name="add" size={14} color="#6B7280" style={{ marginRight: 4 }} />
          <Text className="text-sm text-gray-600">新規作成</Text>
        </TouchableOpacity>
      )}
    </View>
  );
}
