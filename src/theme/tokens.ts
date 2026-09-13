import { Platform } from "react-native";
export const Fonts = {
  heading: Platform.select({ ios: "Georgia", android: "serif", web: "Georgia, 'Times New Roman', serif", default: "serif" }),
  body: Platform.select({ ios: "System", android: "sans-serif", web: "system-ui, -apple-system, 'Segoe UI', sans-serif", default: "System" }),
};
export const FontSize = { caption: 12, label: 14, body: 16, subtitle: 18, section: 20, title: 24, heading: 28, screen: 32, display: 48, hero: 56 } as const;
export const Radius = { small: 8, control: 12, card: 16, large: 20, pill: 24, sheet: 24, round: 999 } as const;
export const Space = { xxs: 4, xs: 8, sm: 12, md: 16, lg: 24, xl: 32 } as const;
export const Layout = { contentWidth: 520, touchTarget: 48 } as const;
