import { GenreListItem } from '@/infra/query/genre';
import { MaterialIcons } from '@expo/vector-icons';
import { Text, TouchableOpacity, View } from 'react-native';

interface GenreCardProps {
  item: GenreListItem;
  onPress?: () => void;
}

export function GenreCard({ item, onPress }: GenreCardProps) {
  return (
    <TouchableOpacity
      className="bg-white rounded-xl p-4 mb-3 shadow-sm border border-gray-100"
      onPress={onPress}
    >
      <View className="flex-row justify-between items-center">
        <View className="flex-1">
          <Text className="text-lg font-semibold text-gray-900 mb-1">
            {item.name}
          </Text>
          {/* セクション数 */}
          <View className="flex-row items-center">
            <MaterialIcons name="list" size={16} color="#9CA3AF" />
            <Text className="text-sm text-gray-500 ml-1">
              {item.sectionCount}個のセクション
            </Text>
          </View>
        </View>
        <MaterialIcons name="chevron-right" size={20} color="#9CA3AF" />
      </View>
    </TouchableOpacity>
  );
}
