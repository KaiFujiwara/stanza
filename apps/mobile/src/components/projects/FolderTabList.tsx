import { ScrollView, View, Text, TouchableOpacity } from 'react-native';

interface FolderTabData {
  id: string | null;
  name: string;
  projectCount: number;
  orderIndex?: number;
}

interface FolderTabListProps {
  folders: FolderTabData[];
  selectedFolderId: string | null;
  onSelect: (id: string | null) => void;
}

export function FolderTabList({
  folders,
  selectedFolderId,
  onSelect,
}: FolderTabListProps) {
  return (
    <View className="bg-white border-b border-gray-200">
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={{ paddingHorizontal: 16, paddingVertical: 12 }}
      >
        {folders.map((tab) => {
          const isSelected = tab.id === selectedFolderId;
          const displayName = tab.name.length > 10 ? tab.name.substring(0, 10) + '...' : tab.name;

          return (
            <TouchableOpacity
              key={tab.id || 'uncategorized'}
              className={`px-3 py-2 rounded-full mr-2 flex-row items-center gap-2 ${
                isSelected ? 'bg-green-500' : 'bg-gray-100'
              }`}
              onPress={() => onSelect(tab.id)}
            >
              <Text
                className={`font-semibold ${
                  isSelected ? 'text-white' : 'text-gray-700'
                }`}
              >
                {displayName}
              </Text>
              <View
                className={`w-5 h-5 rounded-full items-center justify-center ${
                  isSelected ? 'bg-white/20' : 'bg-gray-300'
                }`}
              >
                <Text
                  className={`text-xs font-bold ${
                    isSelected ? 'text-white' : 'text-gray-700'
                  }`}
                >
                  {tab.projectCount}
                </Text>
              </View>
            </TouchableOpacity>
          );
        })}
      </ScrollView>
    </View>
  );
}
