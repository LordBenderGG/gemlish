import { Tabs } from "expo-router";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { HapticTab } from "@/components/haptic-tab";
import { IconSymbol } from "@/components/ui/icon-symbol";
import { Platform } from "react-native";
import { useThemeContext } from "@/lib/theme-provider";

export default function TabLayout() {
  const { colorScheme } = useThemeContext();
  const isDark = colorScheme === "dark";
  const insets = useSafeAreaInsets();
  const bottomPadding = Platform.OS === "web" ? 12 : Math.max(insets.bottom, 8);
  const tabBarHeight = 60 + bottomPadding;

  // Colores del tab bar según el tema
  const tabBg = isDark ? "#0F172A" : "#FFFFFF";
  const tabBorder = isDark ? "#1E293B" : "#E2E8F0";
  const tabActive = isDark ? "#818CF8" : "#4F46E5";
  const tabInactive = isDark ? "#64748B" : "#94A3B8";

  return (
    <Tabs
      screenOptions={{
        tabBarActiveTintColor: tabActive,
        tabBarInactiveTintColor: tabInactive,
        headerShown: false,
        tabBarButton: HapticTab,
        tabBarStyle: {
          paddingTop: 8,
          paddingBottom: bottomPadding,
          height: tabBarHeight,
          backgroundColor: tabBg,
          borderTopColor: tabBorder,
          borderTopWidth: 1,
        },
        tabBarLabelStyle: {
          fontSize: 11,
          fontWeight: "600",
          marginTop: 2,
        },
      }}
    >
      <Tabs.Screen
        name="index"
        options={{
          title: "Lecciones",
          tabBarIcon: ({ color }) => <IconSymbol size={26} name="book.fill" color={color} />,
        }}
      />
      <Tabs.Screen
        name="daily"
        options={{
          title: "Tarea Diaria",
          tabBarIcon: ({ color }) => <IconSymbol size={26} name="calendar.badge.checkmark" color={color} />,
        }}
      />
      <Tabs.Screen
        name="game"
        options={{
          title: "Juego",
          tabBarIcon: ({ color }) => <IconSymbol size={26} name="gamecontroller.fill" color={color} />,
        }}
      />
      <Tabs.Screen
        name="profile"
        options={{
          title: "Perfil",
          tabBarIcon: ({ color }) => <IconSymbol size={26} name="person.crop.circle.fill" color={color} />,
        }}
      />
    </Tabs>
  );
}
