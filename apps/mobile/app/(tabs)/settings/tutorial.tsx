import { ScreenHeader } from "@/components/ScreenHeader";
import { MaterialIcons } from "@expo/vector-icons";
import Constants from "expo-constants";
import { useRouter } from "expo-router";
import { ScrollView, Text, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

type TutorialSection = {
  icon: keyof typeof MaterialIcons.glyphMap;
  title: string;
  description: string;
};

export default function TutorialScreen() {
  const router = useRouter();
  const appName = Constants.expoConfig?.extra?.appName || "Stanza";

  const sections: TutorialSection[] = [
    {
      icon: "library-music",
      title: "歌詞プロジェクト",
      description:
        "楽曲ごとに歌詞を管理します。プロジェクトを作成し、セクション（イントロ、Aメロなど）を追加して歌詞を書いていきましょう。",
    },
    {
      icon: "format-quote",
      title: "フレーズストック",
      description:
        "思いついたフレーズを保存しておく機能です。タグで整理して、必要な時にすぐ見つけられます。気に入ったフレーズをストックしておき、後で歌詞制作に活用できます。",
    },
    {
      icon: "folder",
      title: "フォルダ管理",
      description:
        "プロジェクトをフォルダで整理できます。アルバムやジャンル、制作時期などで分類すると便利です。フォルダ管理画面から追加・編集が可能です。",
    },
    {
      icon: "label",
      title: "タグ管理",
      description:
        "フレーズにタグを付けて整理できます。テーマや雰囲気、使いたいシーンなどで分類すると、必要な時にすぐに見つけられます。タグ管理画面から追加・編集が可能です。",
    },
  ];

  const renderSection = (section: TutorialSection, index: number) => (
    <View key={index} className="mb-6">
      <View className="flex-row items-center mb-3">
        <View className="w-10 h-10 bg-green-100 rounded-full items-center justify-center mr-3">
          <MaterialIcons name={section.icon} size={24} color="#22C55E" />
        </View>
        <Text className="text-lg font-bold text-gray-900">{section.title}</Text>
      </View>
      <Text className="text-base text-gray-700 leading-6 pl-13">
        {section.description}
      </Text>
    </View>
  );

  return (
    <SafeAreaView className="flex-1 bg-white" edges={["top"]}>
      <ScreenHeader title="使い方" showBackButton onBackPress={() => router.back()} />

      <ScrollView className="flex-1" showsVerticalScrollIndicator={false}>
        <View className="px-4 py-6">
          {/* イントロ */}
          <View className="mb-8">
            <Text className="text-2xl font-bold text-gray-900 mb-3">
              {appName}へようこそ
            </Text>
            <Text className="text-base text-gray-600 leading-6">
              歌詞制作をサポートするアプリです。思いついたフレーズをストックしたり、楽曲ごとに歌詞を管理したりできます。
            </Text>
          </View>

          {/* 機能セクション */}
          <View className="mb-8">
            <Text className="text-xl font-bold text-gray-900 mb-4">主な機能</Text>
            {sections.map((section, index) => renderSection(section, index))}
          </View>

          {/* 使い方のヒント */}
          <View className="bg-green-50 rounded-lg p-4 mb-6">
            <View className="flex-row items-center mb-2">
              <MaterialIcons name="lightbulb-outline" size={20} color="#22C55E" />
              <Text className="text-base font-bold text-gray-900 ml-2">ヒント</Text>
            </View>
            <Text className="text-sm text-gray-700 leading-5">
              右下の + ボタンから新しいプロジェクトやフレーズを作成できます。各画面のヘッダーにある
              ? アイコンをタップすると、詳細な説明が表示されます。
            </Text>
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}
