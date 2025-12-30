import { PhraseListItem } from '@/infra/query/phrase';
import { MaterialIcons } from '@expo/vector-icons';
import { Text, TouchableOpacity, View } from 'react-native';
import { DEFAULT_TAG_COLOR } from '@/constants/tagColors';

interface PhraseCardProps {
  item: PhraseListItem;
  onPress?: () => void;
}

export function PhraseCard({ item, onPress }: PhraseCardProps) {
  // タグを最大10個まで表示
  const displayTags = item.tags.slice(0, 10);
  const hasMoreTags = item.tags.length > 10;

  return (
    <TouchableOpacity
      className="bg-white rounded-xl p-4 mb-3 shadow-sm border border-gray-100"
      onPress={onPress}
    >
      <View className="flex-row justify-between items-start mb-2">
        <View className="flex-1">
          <Text className="text-base text-gray-900 leading-6" numberOfLines={2}>
            {item.text}
          </Text>
        </View>
        <MaterialIcons name="chevron-right" size={20} color="#9CA3AF" />
      </View>

      {/* タグ */}
      {displayTags.length > 0 && (
        <View className="flex-row items-center gap-2 mb-2 flex-wrap">
          {displayTags.map((tag) => (
            <View
              key={tag.id}
              className="px-2 py-1 rounded-full"
              style={{ backgroundColor: tag.color ?? DEFAULT_TAG_COLOR }}
            >
              <Text className="text-xs font-medium text-gray-700">
                {tag.name}
              </Text>
            </View>
          ))}
          {hasMoreTags && (
            <Text className="text-xs text-gray-500">
              +{item.tags.length - 10}
            </Text>
          )}
        </View>
      )}

      {/* 更新日時 */}
      <View className="flex-row items-center">
        <MaterialIcons name="update" size={14} color="#9CA3AF" />
        <Text className="text-sm text-gray-500 ml-1">
          最終更新: {new Date(item.updatedAt).toLocaleDateString('ja-JP', {
            year: 'numeric',
            month: '2-digit',
            day: '2-digit',
            hour: '2-digit',
            minute: '2-digit',
          })}
        </Text>
      </View>
    </TouchableOpacity>
  );
}
