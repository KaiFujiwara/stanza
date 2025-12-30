import { TouchableOpacity } from "react-native";
import { MaterialIcons } from "@expo/vector-icons";

interface FloatingActionButtonProps {
  onPress: () => void;
  icon?: keyof typeof MaterialIcons.glyphMap;
}

export function FloatingActionButton({
  onPress,
  icon = "add",
}: FloatingActionButtonProps) {
  return (
    <TouchableOpacity
      className="absolute bottom-8 right-8 w-16 h-16 bg-green-500 rounded-full items-center justify-center shadow-lg"
      onPress={onPress}
      activeOpacity={0.8}
    >
      <MaterialIcons name={icon} size={28} color="white" />
    </TouchableOpacity>
  );
}
