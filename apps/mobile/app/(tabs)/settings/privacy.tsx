import { ScreenHeader } from "@/components/shared/ScreenHeader";
import { useRouter } from "expo-router";
import { ActivityIndicator, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { WebView } from "react-native-webview";

export default function PrivacyScreen() {
  const router = useRouter();

  // 本番環境ではGitHub Pagesなどの公開URLを使用
  // 開発環境では相対パスは使えないため、公開URL必須
  const privacyUrl = "https://kaifujiwara.github.io/stanza/privacy.html";

  return (
    <SafeAreaView className="flex-1 bg-white" edges={["top"]}>
      <ScreenHeader title="プライバシーポリシー" showBackButton onBackPress={() => router.back()} />

      <WebView
        source={{ uri: privacyUrl }}
        style={{ flex: 1 }}
        startInLoadingState
        renderLoading={() => (
          <View className="flex-1 items-center justify-center">
            <ActivityIndicator size="large" color="#22C55E" />
          </View>
        )}
      />
    </SafeAreaView>
  );
}
