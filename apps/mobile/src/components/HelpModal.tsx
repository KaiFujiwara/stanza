import { Modal, View, Text, TouchableOpacity, ScrollView } from "react-native";
import { MaterialIcons } from "@expo/vector-icons";

interface HelpModalProps {
  visible: boolean;
  onClose: () => void;
  title: string;
  content: string;
}

export function HelpModal({ visible, onClose, title, content }: HelpModalProps) {
  return (
    <Modal
      visible={visible}
      animationType="fade"
      transparent={true}
      onRequestClose={onClose}
    >
      <View className="flex-1 bg-black/50 justify-center items-center px-8">
        <View className="w-full bg-white rounded-2xl p-6">
          <Text className="text-xl font-bold text-gray-900 mb-4">{title}</Text>

          <ScrollView
            className="max-h-96"
            showsVerticalScrollIndicator={false}
          >
            <Text className="text-base text-gray-700 leading-6">
              {content}
            </Text>
          </ScrollView>

          <TouchableOpacity
            className="mt-6 p-3.5 rounded-lg bg-green-500 items-center"
            onPress={onClose}
          >
            <Text className="text-base text-white font-semibold">閉じる</Text>
          </TouchableOpacity>
        </View>
      </View>
    </Modal>
  );
}
