import { View, Text, TouchableOpacity } from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';

export type SortOrder = 'desc' | 'asc';

interface PhraseSortSelectorProps {
  value: SortOrder;
  onChange: (order: SortOrder) => void;
}

export function PhraseSortSelector({ value, onChange }: PhraseSortSelectorProps) {
  return (
    <View className="flex-row items-center">
      <TouchableOpacity
        onPress={() => onChange('desc')}
        className={`flex-row items-center px-3 py-2 rounded-l-lg border ${
          value === 'desc' ? 'bg-blue-50 border-blue-500' : 'bg-white border-gray-300'
        }`}
        activeOpacity={0.7}
      >
        <MaterialIcons
          name="access-time"
          size={16}
          color={value === 'desc' ? '#3B82F6' : '#6B7280'}
        />
        <Text
          className={`ml-1 text-sm font-medium ${
            value === 'desc' ? 'text-blue-600' : 'text-gray-600'
          }`}
        >
          最新順
        </Text>
      </TouchableOpacity>
      <TouchableOpacity
        onPress={() => onChange('asc')}
        className={`flex-row items-center px-3 py-2 rounded-r-lg border border-l-0 ${
          value === 'asc' ? 'bg-blue-50 border-blue-500' : 'bg-white border-gray-300'
        }`}
        activeOpacity={0.7}
      >
        <MaterialIcons
          name="history"
          size={16}
          color={value === 'asc' ? '#3B82F6' : '#6B7280'}
        />
        <Text
          className={`ml-1 text-sm font-medium ${
            value === 'asc' ? 'text-blue-600' : 'text-gray-600'
          }`}
        >
          古い順
        </Text>
      </TouchableOpacity>
    </View>
  );
}
