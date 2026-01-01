import { ScreenHeader } from "@/components/shared/ScreenHeader";
import { MaterialIcons } from "@expo/vector-icons";
import Constants from "expo-constants";
import * as Linking from "expo-linking";
import { useRouter } from "expo-router";
import { Alert, ScrollView, Text, TouchableOpacity, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

export default function SupportScreen() {
  const router = useRouter();
  const appName = Constants.expoConfig?.extra?.appName || "Stanza";
  const supportEmail = Constants.expoConfig?.extra?.supportEmail || "support@example.com";

  const handleReview = () => {
    // TODO: App StoreのレビューURLを設定
    Alert.alert(
      "レビューを書く",
      "App Store公開後に実装されます。公開までもうしばらくお待ちください！",
      [{ text: "OK" }]
    );
  };

  const handleShare = () => {
    Alert.alert(
      "アプリをシェア",
      "App Store公開後に実装されます。友達にもぜひ紹介してください！",
      [{ text: "OK" }]
    );
  };

  const handleFeedback = () => {
    const subject = encodeURIComponent(`${appName} フィードバック`);
    const body = encodeURIComponent(
      "アプリに対するご要望や改善点をお聞かせください：\n\n"
    );
    Linking.openURL(`mailto:${supportEmail}?subject=${subject}&body=${body}`);
  };

  const handleDonate = () => {
    Alert.alert(
      "開発者を支援",
      "寄付機能は今後実装予定です。現時点では、レビューやシェアで応援いただけると嬉しいです！",
      [{ text: "OK" }]
    );
  };

  return (
    <SafeAreaView className="flex-1 bg-white" edges={["top"]}>
      <ScreenHeader title="開発者応援" showBackButton onBackPress={() => router.back()} />

      <ScrollView className="flex-1" showsVerticalScrollIndicator={false}>
        <View className="px-4 py-6">
          {/* メッセージ */}
          <View className="mb-8">
            <View className="bg-green-50 rounded-lg p-4 mb-4">
              <View className="flex-row items-center mb-2">
                <MaterialIcons name="favorite" size={24} color="#22C55E" />
                <Text className="text-lg font-bold text-gray-900 ml-2">
                  ご利用ありがとうございます！
                </Text>
              </View>
              <Text className="text-sm text-gray-700 leading-6">
                {appName}を使っていただき、ありがとうございます。皆さんの応援が開発の励みになります。
              </Text>
            </View>
          </View>

          {/* 応援方法 */}
          <View className="mb-6">
            <Text className="text-base font-bold text-gray-900 mb-3">応援方法</Text>
            <View className="bg-white rounded-lg border border-gray-200">
              <TouchableOpacity
                onPress={handleReview}
                className="flex-row items-center p-4 border-b border-gray-200"
                activeOpacity={0.6}
              >
                <View className="w-12 h-12 bg-yellow-100 rounded-full items-center justify-center mr-3">
                  <MaterialIcons name="star" size={24} color="#EAB308" />
                </View>
                <View className="flex-1">
                  <Text className="text-sm font-bold text-gray-900">レビューを書く</Text>
                  <Text className="text-xs text-gray-500 mt-0.5">
                    App Storeで評価をお願いします
                  </Text>
                </View>
                <MaterialIcons name="chevron-right" size={20} color="#D1D5DB" />
              </TouchableOpacity>

              <TouchableOpacity
                onPress={handleShare}
                className="flex-row items-center p-4 border-b border-gray-200"
                activeOpacity={0.6}
              >
                <View className="w-12 h-12 bg-blue-100 rounded-full items-center justify-center mr-3">
                  <MaterialIcons name="share" size={24} color="#3B82F6" />
                </View>
                <View className="flex-1">
                  <Text className="text-sm font-bold text-gray-900">アプリをシェア</Text>
                  <Text className="text-xs text-gray-500 mt-0.5">
                    友達に紹介してください
                  </Text>
                </View>
                <MaterialIcons name="chevron-right" size={20} color="#D1D5DB" />
              </TouchableOpacity>

              <TouchableOpacity
                onPress={handleFeedback}
                className="flex-row items-center p-4 border-b border-gray-200"
                activeOpacity={0.6}
              >
                <View className="w-12 h-12 bg-green-100 rounded-full items-center justify-center mr-3">
                  <MaterialIcons name="feedback" size={24} color="#22C55E" />
                </View>
                <View className="flex-1">
                  <Text className="text-sm font-bold text-gray-900">フィードバック</Text>
                  <Text className="text-xs text-gray-500 mt-0.5">
                    ご要望や改善点を教えてください
                  </Text>
                </View>
                <MaterialIcons name="chevron-right" size={20} color="#D1D5DB" />
              </TouchableOpacity>

              <TouchableOpacity
                onPress={handleDonate}
                className="flex-row items-center p-4"
                activeOpacity={0.6}
              >
                <View className="w-12 h-12 bg-purple-100 rounded-full items-center justify-center mr-3">
                  <MaterialIcons name="volunteer-activism" size={24} color="#A855F7" />
                </View>
                <View className="flex-1">
                  <Text className="text-sm font-bold text-gray-900">開発者を支援</Text>
                  <Text className="text-xs text-gray-500 mt-0.5">
                    寄付で開発をサポート（準備中）
                  </Text>
                </View>
                <MaterialIcons name="chevron-right" size={20} color="#D1D5DB" />
              </TouchableOpacity>
            </View>
          </View>

          {/* 今後の予定 */}
          <View className="mb-6">
            <Text className="text-base font-bold text-gray-900 mb-3">今後の予定</Text>
            <View className="bg-gray-50 rounded-lg p-4">
              <View className="flex-row items-start mb-3">
                <MaterialIcons name="check-circle" size={18} color="#22C55E" />
                <Text className="text-sm text-gray-700 ml-2 flex-1">
                  Web版との連携機能
                </Text>
              </View>
              <View className="flex-row items-start mb-3">
                <MaterialIcons name="check-circle" size={18} color="#22C55E" />
                <Text className="text-sm text-gray-700 ml-2 flex-1">
                  音数カウント・韻チェック機能の強化
                </Text>
              </View>
              <View className="flex-row items-start">
                <MaterialIcons name="check-circle" size={18} color="#22C55E" />
                <Text className="text-sm text-gray-700 ml-2 flex-1">
                  その他、皆さんからのフィードバックを元にした改善
                </Text>
              </View>
            </View>
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}
