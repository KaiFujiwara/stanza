import { Tag } from '@/infra/query/tag';
import { MaterialIcons } from '@expo/vector-icons';
import { Text, TouchableOpacity, View } from 'react-native';
import { DEFAULT_TAG_COLOR } from '@/constants/tagColors';

interface TagCardProps {
  item: Tag;
  onPress?: () => void;
}

export function TagCard({ item, onPress }: TagCardProps) {
  return (
    <TouchableOpacity
      className="bg-white rounded-xl p-4 mb-3 shadow-sm border border-gray-100"
      onPress={onPress}
    >
      <View className="flex-row justify-between items-center">
        <View className="flex-row items-center flex-1">
          {/* カラーインジケーター */}
          <View
            className="w-4 h-4 rounded-full mr-3"
            style={{ backgroundColor: item.color ?? DEFAULT_TAG_COLOR }}
          />

          {/* タグ名 */}
          <Text className="text-base font-semibold text-gray-900">
            {item.name}
          </Text>
        </View>

        <MaterialIcons name="chevron-right" size={20} color="#9CA3AF" />
      </View>
    </TouchableOpacity>
  );
}
