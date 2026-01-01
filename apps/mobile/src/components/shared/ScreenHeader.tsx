import { Text, View, TouchableOpacity } from "react-native";
import { MaterialIcons } from "@expo/vector-icons";

interface ScreenHeaderProps {
  title: string;
  onHelpPress?: () => void;
  showHelpButton?: boolean;
  showBackButton?: boolean;
  onBackPress?: () => void;
  rightButton?: React.ReactNode;
}

export function ScreenHeader({
  title,
  onHelpPress,
  showHelpButton = false,
  showBackButton = false,
  onBackPress,
  rightButton
}: ScreenHeaderProps) {
  return (
    <View className="px-5 py-4">
      <View className="flex-row items-center">
        {showBackButton && onBackPress && (
          <TouchableOpacity
            className="mr-3"
            onPress={onBackPress}
            hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
          >
            <MaterialIcons name="chevron-left" size={28} color="#111827" />
          </TouchableOpacity>
        )}
        <Text className="text-2xl font-bold text-gray-900">{title}</Text>
        {showHelpButton && onHelpPress && (
          <TouchableOpacity
            className="ml-2"
            style={{ width: 32, height: 32, alignItems: 'center', justifyContent: 'center' }}
            onPress={onHelpPress}
          >
            <MaterialIcons name="help-outline" size={24} color="#8E8E93" />
          </TouchableOpacity>
        )}
        <View className="flex-1" />
        {rightButton}
      </View>
    </View>
  );
}
