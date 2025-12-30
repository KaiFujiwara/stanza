import { ScreenHeader } from "@/components/ScreenHeader";
import { MaterialIcons } from "@expo/vector-icons";
import { ScrollView, Text, TouchableOpacity, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import Constants from "expo-constants";
import { useRouter } from "expo-router";

type SettingItem = {
  icon: keyof typeof MaterialIcons.glyphMap;
  title: string;
  subtitle?: string;
  onPress: () => void;
  showChevron?: boolean;
  badge?: string;
};

type SettingSection = {
  title: string;
  items: SettingItem[];
};

export default function SettingsScreen() {
  const router = useRouter();
  const appVersion = Constants.expoConfig?.version || "1.0.0";

  const handleGoogleAccountLink = () => {
    router.push("/settings/account");
  };

  const handleTutorial = () => {
    router.push("/settings/tutorial");
  };

  const handleSupport = () => {
    router.push("/settings/support");
  };

  const handleContact = () => {
    router.push("/settings/contact");
  };

  const handleLicense = () => {
    router.push("/settings/license");
  };

  const handleVersion = () => {
    router.push("/settings/version");
  };

  const sections: SettingSection[] = [
    {
      title: "アカウント",
      items: [
        {
          icon: "account-circle",
          title: "Googleアカウント連携",
          subtitle: "データ同期・Web版連携",
          onPress: handleGoogleAccountLink,
          showChevron: true,
          badge: "未連携",
        },
      ],
    },
    {
      title: "情報・サポート",
      items: [
        {
          icon: "help-outline",
          title: "使い方",
          subtitle: "アプリの基本的な使い方",
          onPress: handleTutorial,
          showChevron: true,
        },
        {
          icon: "favorite-outline",
          title: "開発者応援",
          subtitle: "レビューで応援する",
          onPress: handleSupport,
          showChevron: true,
        },
        {
          icon: "email",
          title: "お問い合わせ",
          subtitle: "バグ報告・ご要望",
          onPress: handleContact,
          showChevron: true,
        },
      ],
    },
    {
      title: "アプリ情報",
      items: [
        {
          icon: "description",
          title: "ライセンス情報",
          onPress: handleLicense,
          showChevron: true,
        },
        {
          icon: "info-outline",
          title: "バージョン情報",
          subtitle: `Version ${appVersion}`,
          onPress: handleVersion,
          showChevron: true,
        },
      ],
    },
  ];

  const renderSettingItem = (item: SettingItem, index: number, isLast: boolean) => (
    <TouchableOpacity
      key={index}
      onPress={item.onPress}
      className={`bg-white px-4 py-3.5 flex-row items-center ${
        !isLast ? "border-b border-gray-200" : ""
      }`}
      activeOpacity={0.6}
    >
      <View className="w-8 h-8 items-center justify-center mr-3">
        <MaterialIcons name={item.icon} size={24} color="#6B7280" />
      </View>

      <View className="flex-1">
        <Text className="text-base font-medium text-gray-900">{item.title}</Text>
        {item.subtitle && (
          <Text className="text-sm text-gray-500 mt-0.5">{item.subtitle}</Text>
        )}
      </View>

      {item.badge && (
        <View className="bg-gray-100 px-2 py-1 rounded-full mr-2">
          <Text className="text-xs font-medium text-gray-600">{item.badge}</Text>
        </View>
      )}

      {item.showChevron && (
        <MaterialIcons name="chevron-right" size={20} color="#D1D5DB" />
      )}
    </TouchableOpacity>
  );

  const renderSection = (section: SettingSection, sectionIndex: number) => (
    <View key={sectionIndex} className="mb-6">
      <Text className="text-sm font-semibold text-gray-500 px-4 mb-2 uppercase">
        {section.title}
      </Text>
      <View className="bg-white rounded-lg overflow-hidden">
        {section.items.map((item, index) =>
          renderSettingItem(item, index, index === section.items.length - 1)
        )}
      </View>
    </View>
  );

  return (
    <SafeAreaView className="flex-1 bg-white" edges={["top"]}>
      <ScreenHeader title="設定" />

      <ScrollView className="flex-1 bg-gray-50" showsVerticalScrollIndicator={false}>
        <View className="py-4">
          {sections.map((section, index) => renderSection(section, index))}
        </View>
      </ScrollView>

    </SafeAreaView>
  );
}
