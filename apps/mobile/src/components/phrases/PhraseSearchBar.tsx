import { View, TextInput, TouchableOpacity } from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';

interface PhraseSearchBarProps {
  value: string;
  onChangeText: (text: string) => void;
  placeholder?: string;
}

export function PhraseSearchBar({ value, onChangeText, placeholder = "フレーズを検索..." }: PhraseSearchBarProps) {
  return (
    <View className="flex-row bg-gray-100 rounded-lg px-3" style={{ height: 44, alignItems: 'center' }}>
      <MaterialIcons name="search" size={20} color="#9CA3AF" />
      <TextInput
        value={value}
        onChangeText={onChangeText}
        placeholder={placeholder}
        placeholderTextColor="#9CA3AF"
        style={{
          flex: 1,
          marginLeft: 8,
          fontSize: 16,
          color: '#111827',
          padding: 0,
          margin: 0,
        }}
        multiline={false}
        autoCorrect={false}
        spellCheck={false}
      />
      {value.length > 0 && (
        <TouchableOpacity onPress={() => onChangeText('')} hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}>
          <MaterialIcons name="close" size={20} color="#9CA3AF" />
        </TouchableOpacity>
      )}
    </View>
  );
}
