import { ProjectListItem } from '@/infra/query/project';
import { MaterialIcons } from '@expo/vector-icons';
import { Text, TouchableOpacity, View } from 'react-native';

interface ProjectCardProps {
  item: ProjectListItem;
  onPress?: () => void;
}

export function ProjectCard({ item, onPress }: ProjectCardProps) {
  return (
    <TouchableOpacity
      className="bg-white rounded-xl p-4 mb-3 shadow-sm border border-gray-100"
      onPress={onPress}
    >
      <View className="flex-row justify-between items-center mb-2">
        <View className="flex-1">
          <Text className="text-lg font-semibold text-gray-900 mb-1">
            {item.title}
          </Text>
          <View className="flex-row items-center gap-2">
            {item.genreName && (
              <View className="bg-green-50 px-2 py-0.5 rounded">
                <Text className="text-xs text-green-700 font-medium">
                  {item.genreName}
                </Text>
              </View>
            )}
            {item.folderName && (
              <View className="bg-gray-50 px-2 py-0.5 rounded">
                <Text className="text-xs text-gray-600">
                  {item.folderName}
                </Text>
              </View>
            )}
          </View>
        </View>
        <MaterialIcons name="chevron-right" size={20} color="#9CA3AF" />
      </View>
      <Text className="text-sm text-gray-500">
        {new Date(item.updatedAt).toLocaleDateString('ja-JP')}
      </Text>
    </TouchableOpacity>
  );
}
