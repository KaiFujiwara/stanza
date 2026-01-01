import { TouchableOpacity } from "react-native";
import { MaterialIcons } from "@expo/vector-icons";

interface FloatingActionButtonProps {
  onPress: () => void;
  icon?: keyof typeof MaterialIcons.glyphMap;
  disabled?: boolean;
}

export function FloatingActionButton({
  onPress,
  icon = "add",
  disabled = false,
}: FloatingActionButtonProps) {
  return (
    <TouchableOpacity
      className={`absolute bottom-6 right-6 w-[68px] h-[68px] rounded-full items-center justify-center ${
        disabled ? 'bg-gray-300' : 'bg-green-500'
      }`}
      onPress={disabled ? undefined : onPress}
      activeOpacity={1}
      disabled={disabled}
    >
      <MaterialIcons name={icon} size={32} color={disabled ? '#9CA3AF' : 'white'} />
    </TouchableOpacity>
  );
}
