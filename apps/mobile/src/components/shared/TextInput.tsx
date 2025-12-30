import { TextInput as RNTextInput, View, Text } from 'react-native';

const DEFAULT_MAX_LENGTH = 100;

interface TextInputProps {
  value: string;
  onChangeText: (text: string) => void;
  placeholder?: string;
  autoFocus?: boolean;
  onSubmitEditing?: () => void;
  onBlur?: () => void;
  editable?: boolean;
  isEditing?: boolean;
  maxLength?: number;
  showCharCount?: boolean;
  helperText?: string;
}

export function TextInput({
  value,
  onChangeText,
  placeholder = "入力してください",
  autoFocus = false,
  onSubmitEditing,
  onBlur,
  editable = true,
  isEditing = true,
  maxLength = DEFAULT_MAX_LENGTH,
  showCharCount = true,
  helperText,
}: TextInputProps) {
  const remainingChars = maxLength - value.length;
  const isOverLimit = remainingChars < 0;

  const handleChangeText = (text: string) => {
    // maxLengthを超えないように制限
    if (text.length <= maxLength) {
      onChangeText(text);
    }
  };

  return (
    <View>
      <RNTextInput
        value={value}
        onChangeText={handleChangeText}
        placeholder={placeholder}
        autoFocus={autoFocus}
        onSubmitEditing={onSubmitEditing}
        onBlur={onBlur}
        returnKeyType="done"
        className={`bg-gray-50 rounded-lg px-4 py-3 border text-base text-gray-900 ${
          isEditing ? 'border-green-500' : 'border-gray-200'
        }`}
        style={{ fontSize: 16, minHeight: 44 }}
        editable={editable}
        maxLength={maxLength}
        multiline
        textAlignVertical="top"
        scrollEnabled={false}
      />
      {(showCharCount || helperText) && (
        <View className="flex-row justify-between items-center mt-1 px-1">
          <Text className="text-xs text-gray-500">
            {helperText || `最大${maxLength}文字`}
          </Text>
          {showCharCount && (
            <Text className={`text-xs ${isOverLimit ? 'text-red-500' : 'text-gray-400'}`}>
              {value.length}/{maxLength}
            </Text>
          )}
        </View>
      )}
    </View>
  );
}
