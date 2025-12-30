import { Text, View } from "react-native";
import { MaterialIcons } from "@expo/vector-icons";
import { ReactNode } from "react";

interface EmptyStateProps {
  icon: keyof typeof MaterialIcons.glyphMap;
  title: string;
  subtitle?: string;
  children?: ReactNode;
}

export function EmptyState({ icon, title, subtitle, children }: EmptyStateProps) {
  return (
    <View className="flex-1 justify-center items-center py-20">
      <MaterialIcons name={icon} size={64} color="#D1D5DB" />
      <Text className="text-lg font-semibold text-gray-600 mt-4">{title}</Text>
      {subtitle && (
        <Text className="text-sm text-gray-500 mt-2 text-center px-8">{subtitle}</Text>
      )}
      {children}
    </View>
  );
}
