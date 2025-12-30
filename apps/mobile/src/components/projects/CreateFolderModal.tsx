import { Modal, Text, TextInput, TouchableOpacity, View } from 'react-native';

interface CreateFolderModalProps {
  visible: boolean;
  onClose: () => void;
  onSubmit: () => void;
  name: string;
  onNameChange: (name: string) => void;
}

export function CreateFolderModal({
  visible,
  onClose,
  onSubmit,
  name,
  onNameChange,
}: CreateFolderModalProps) {
  return (
    <Modal
      visible={visible}
      animationType="fade"
      transparent={true}
      onRequestClose={onClose}
    >
      <View className="flex-1 bg-black/50 justify-start items-center px-8 pt-24">
        <View className="w-full bg-white rounded-2xl p-6">
          <Text className="text-xl font-bold text-gray-900 mb-5">新規フォルダ</Text>

          <TextInput
            className="border border-gray-200 bg-gray-50 rounded-lg p-3 text-base mb-5 text-gray-900"
            placeholder="フォルダ名"
            placeholderTextColor="#9CA3AF"
            value={name}
            onChangeText={onNameChange}
            autoFocus
            maxLength={50}
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
