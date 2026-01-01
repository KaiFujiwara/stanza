import { ScreenHeader } from "@/components/shared/ScreenHeader";
import { MaterialIcons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import { Alert, ScrollView, Text, TouchableOpacity, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

export default function AccountScreen() {
  const router = useRouter();

  const handleGoogleLink = () => {
    Alert.alert(
      "Googleアカウント連携",
      "この機能は今後実装予定です。連携することで、以下のメリットがあります：\n\n• データのクラウド同期\n• 複数デバイスでの利用\n• Web版との連携\n• データのバックアップ",
      [{ text: "OK" }]
    );
  };

  return (
    <SafeAreaView className="flex-1 bg-white" edges={["top"]}>
      <ScreenHeader
        title="アカウント連携"
        showBackButton
        onBackPress={() => router.back()}
      />

      <ScrollView className="flex-1" showsVerticalScrollIndicator={false}>
        <View className="px-4 py-6">
          {/* 現在のステータス */}
          <View className="mb-8">
            <View className="bg-gray-50 rounded-lg p-4">
              <View className="flex-row items-center mb-2">
                <MaterialIcons name="info-outline" size={20} color="#6B7280" />
                <Text className="text-sm font-bold text-gray-700 ml-2">現在の状態</Text>
              </View>
              <Text className="text-sm text-gray-600 leading-6">
                匿名アカウントでご利用中です。データはこのデバイスにのみ保存されます。
              </Text>
            </View>
          </View>

          {/* Googleアカウント連携 */}
          <View className="mb-6">
            <TouchableOpacity
              onPress={handleGoogleLink}
              className="bg-white rounded-lg border-2 border-gray-200 p-4 flex-row items-center"
              activeOpacity={0.6}
            >
              <View className="w-12 h-12 bg-white rounded-full items-center justify-center mr-3 border border-gray-200">
                <MaterialIcons name="account-circle" size={32} color="#4285F4" />
              </View>
              <View className="flex-1">
                <Text className="text-base font-bold text-gray-900 mb-1">
                  Googleアカウントと連携
                </Text>
                <Text className="text-sm text-gray-600">
                  データの同期とバックアップ
                </Text>
              </View>
              <View className="bg-gray-100 px-3 py-1 rounded-full">
                <Text className="text-xs font-medium text-gray-600">未連携</Text>
              </View>
            </TouchableOpacity>
          </View>

          {/* メリット */}
          <View className="mb-6">
            <Text className="text-base font-bold text-gray-900 mb-3">連携のメリット</Text>
            <View className="bg-green-50 rounded-lg p-4">
              <View className="flex-row items-start mb-3">
                <MaterialIcons name="cloud-sync" size={20} color="#22C55E" />
                <View className="flex-1 ml-3">
                  <Text className="text-sm font-medium text-gray-900 mb-1">
                    データの自動同期
                  </Text>
                  <Text className="text-xs text-gray-600">
                    複数のデバイスで同じデータを利用できます
                  </Text>
                </View>
              </View>

              <View className="flex-row items-start mb-3">
                <MaterialIcons name="backup" size={20} color="#22C55E" />
                <View className="flex-1 ml-3">
                  <Text className="text-sm font-medium text-gray-900 mb-1">
                    自動バックアップ
                  </Text>
                  <Text className="text-xs text-gray-600">
                    デバイスを紛失してもデータが失われません
                  </Text>
                </View>
              </View>

              <View className="flex-row items-start mb-3">
                <MaterialIcons name="devices" size={20} color="#22C55E" />
                <View className="flex-1 ml-3">
                  <Text className="text-sm font-medium text-gray-900 mb-1">
                    マルチデバイス対応
                  </Text>
                  <Text className="text-xs text-gray-600">
                    スマホ、タブレット、PCで利用可能
                  </Text>
                </View>
              </View>

              <View className="flex-row items-start">
                <MaterialIcons name="language" size={20} color="#22C55E" />
                <View className="flex-1 ml-3">
                  <Text className="text-sm font-medium text-gray-900 mb-1">
                    Web版との連携
                  </Text>
                  <Text className="text-xs text-gray-600">
                    ブラウザからもアクセス可能（準備中）
                  </Text>
                </View>
              </View>
            </View>
          </View>

          {/* 注意事項 */}
          <View>
            <Text className="text-base font-bold text-gray-900 mb-3">注意事項</Text>
            <View className="bg-yellow-50 rounded-lg p-4 border border-yellow-200">
              <View className="flex-row items-start">
                <MaterialIcons name="warning" size={20} color="#EAB308" />
                <Text className="text-sm text-gray-700 ml-2 flex-1 leading-6">
                  アカウント連携は今後実装予定の機能です。実装までしばらくお待ちください。現在のデータは、連携後も引き続きご利用いただけます。
                </Text>
              </View>
            </View>
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}
