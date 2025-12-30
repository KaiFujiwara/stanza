import { TouchableOpacity, Text } from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';

interface HeaderActionButtonProps {
  onPress: () => void;
  label: string;
  loadingLabel?: string;
  icon?: keyof typeof MaterialIcons.glyphMap;
  disabled?: boolean;
  isLoading?: boolean;
}

export function HeaderActionButton({
  onPress,
  label,
  loadingLabel,
  icon,
  disabled = false,
  isLoading = false,
}: HeaderActionButtonProps) {
  const isEnabled = !disabled && !isLoading;
  const displayLabel = isLoading && loadingLabel ? loadingLabel : label;

  return (
    <TouchableOpacity
      onPress={onPress}
      disabled={!isEnabled}
      className={`px-4 py-2 rounded-full flex-row items-center gap-1 ${
        isEnabled ? 'bg-green-500' : 'bg-gray-100'
      }`}
      hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
    >
      {icon && (
        <MaterialIcons
          name={icon}
          size={16}
          color={isEnabled ? '#FFFFFF' : '#D1D5DB'}
        />
      )}
      <Text
        className={`text-sm font-semibold ${
          isEnabled ? 'text-white' : 'text-gray-300'
        }`}
      >
        {displayLabel}
      </Text>
    </TouchableOpacity>
  );
}
