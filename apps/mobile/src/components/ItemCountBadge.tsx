import { Text, View } from "react-native";

interface ItemCountBadgeProps {
  currentCount: number;
  maxCount: number;
}

/**
 * アイテム数表示用バッジコンポーネント
 * 画面左下に固定表示される可愛いデザイン
 */
export function ItemCountBadge({ currentCount, maxCount }: ItemCountBadgeProps) {
  // 上限に近づいたら色を変える
  const percentage = (currentCount / maxCount) * 100;
  const isNearLimit = percentage >= 80;
  const isAtLimit = currentCount >= maxCount;

  return (
    <View
      className={`absolute bottom-6 left-6 rounded-2xl px-4 py-2.5 ${
        isAtLimit ? 'bg-red-100' :
        isNearLimit ? 'bg-amber-100' :
        'bg-gray-100'
      }`}
      style={{
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
        elevation: 3,
      }}
    >
      <Text className={`text-sm font-bold ${
        isAtLimit ? 'text-red-600' :
        isNearLimit ? 'text-amber-600' :
        'text-gray-600'
      }`}>
        {currentCount} / {maxCount}件
      </Text>
    </View>
  );
}
