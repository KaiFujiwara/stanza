import { Modal, Text, TextInput, TouchableOpacity, View } from 'react-native';

interface CreateProjectModalProps {
  visible: boolean;
  onClose: () => void;
  onSubmit: () => void;
  title: string;
  onTitleChange: (title: string) => void;
}

export function CreateProjectModal({
  visible,
  onClose,
  onSubmit,
  title,
  onTitleChange,
}: CreateProjectModalProps) {
  return (
    <Modal
      visible={visible}
      animationType="fade"
      transparent={true}
      onRequestClose={onClose}
    >
      <View className="flex-1 bg-black/50 justify-start items-center px-8 pt-24">
        <View className="w-full bg-white rounded-2xl p-6">
          <Text className="text-xl font-bold text-gray-900 mb-5">新規プロジェクト</Text>

          <TextInput
            className="border border-gray-200 bg-gray-50 rounded-lg p-3 text-base mb-5 text-gray-900"
            placeholder="プロジェクトタイトル"
            placeholderTextColor="#9CA3AF"
            value={title}
            onChangeText={onTitleChange}
            autoFocus
            maxLength={200}
          />

          <View className="flex-row gap-3">
            <TouchableOpacity
              className="flex-1 p-3.5 rounded-lg border border-gray-200 bg-white items-center"
              onPress={onClose}
            >
              <Text className="text-base text-gray-700 font-semibold">キャンセル</Text>
            </TouchableOpacity>
            <TouchableOpacity
              className="flex-1 p-3.5 rounded-lg bg-green-500 items-center"
              onPress={onSubmit}
            >
              <Text className="text-base text-white font-semibold">作成</Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </Modal>
  );
}
