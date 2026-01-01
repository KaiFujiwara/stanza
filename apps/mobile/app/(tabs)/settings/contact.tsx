import { ScreenHeader } from "@/components/shared/ScreenHeader";
import { MaterialIcons } from "@expo/vector-icons";
import Constants from "expo-constants";
import * as Linking from "expo-linking";
import { useRouter } from "expo-router";
import { ScrollView, Text, TouchableOpacity, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

export default function ContactScreen() {
  const router = useRouter();
  const appVersion = Constants.expoConfig?.version || "1.0.0";
  const appName = Constants.expoConfig?.extra?.appName || "Stanza";
  const supportEmail = Constants.expoConfig?.extra?.supportEmail || "support@example.com";

  const handleEmail = () => {
    const subject = encodeURIComponent(`${appName} お問い合わせ`);
    const body = encodeURIComponent(
      `お問い合わせ内容：\n\n\n\n---\nアプリバージョン: ${appVersion}\n`
    );
    Linking.openURL(`mailto:${supportEmail}?subject=${subject}&body=${body}`);
  };

  return (
    <SafeAreaView className="flex-1 bg-white" edges={["top"]}>
      <ScreenHeader title="お問い合わせ" showBackButton onBackPress={() => router.back()} />

      <ScrollView className="flex-1" showsVerticalScrollIndicator={false}>
        <View className="px-4 py-6">
          {/* 説明 */}
          <View className="mb-6">
            <Text className="text-base text-gray-700 leading-6 mb-4">
              バグ報告、ご要望、その他お問い合わせは、以下のメールアドレスまでご連絡ください。
            </Text>
          </View>

          {/* メール */}
          <View className="mb-6">
            <TouchableOpacity
              onPress={handleEmail}
              className="bg-white rounded-lg border border-gray-200 p-4 flex-row items-center"
              activeOpacity={0.6}
            >
              <View className="w-12 h-12 bg-green-100 rounded-full items-center justify-center mr-3">
                <MaterialIcons name="email" size={24} color="#22C55E" />
              </View>
              <View className="flex-1">
                <Text className="text-sm font-medium text-gray-600 mb-1">メール</Text>
                <Text className="text-base font-bold text-gray-900">{supportEmail}</Text>
              </View>
              <MaterialIcons name="chevron-right" size={20} color="#D1D5DB" />
            </TouchableOpacity>
          </View>

          {/* お問い合わせの種類 */}
          <View className="mb-6">
            <Text className="text-base font-bold text-gray-900 mb-3">
              お問い合わせ例
            </Text>
            <View className="bg-gray-50 rounded-lg p-4">
              <View className="flex-row items-start mb-3">
                <MaterialIcons name="bug-report" size={18} color="#6B7280" />
                <Text className="text-sm text-gray-700 ml-2 flex-1">
                  バグ報告（アプリが落ちる、表示がおかしいなど）
                </Text>
              </View>
              <View className="flex-row items-start mb-3">
                <MaterialIcons name="lightbulb-outline" size={18} color="#6B7280" />
                <Text className="text-sm text-gray-700 ml-2 flex-1">
                  機能の要望（こんな機能が欲しいなど）
                </Text>
              </View>
              <View className="flex-row items-start mb-3">
                <MaterialIcons name="help-outline" size={18} color="#6B7280" />
                <Text className="text-sm text-gray-700 ml-2 flex-1">
                  使い方の質問
                </Text>
              </View>
              <View className="flex-row items-start">
                <MaterialIcons name="chat" size={18} color="#6B7280" />
                <Text className="text-sm text-gray-700 ml-2 flex-1">
                  その他のお問い合わせ
                </Text>
              </View>
            </View>
          </View>

          {/* 注意事項 */}
          <View>
            <Text className="text-base font-bold text-gray-900 mb-3">ご注意</Text>
            <View className="bg-yellow-50 rounded-lg p-4 border border-yellow-200">
              <Text className="text-sm text-gray-700 leading-6">
                お問い合わせへの返信には数日かかる場合がございます。あらかじめご了承ください。
              </Text>
            </View>
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}
