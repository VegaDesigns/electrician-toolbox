import Svg, { Path } from "react-native-svg";
import { useAppTheme } from "../theme";

const paths = {
  back: "M19 12H5m7-7-7 7 7 7",
  close: "m6 6 12 12M6 18 18 6",
  history: "M3 11a9 9 0 1 1 2.6 7.4M3 4v7h7m2-4v5l3 2",
  settings: "M4 7h16M4 17h16M8 4v6m8 4v6",
  menu: "M4 6h16M4 12h16M4 18h16",
  copy: "M9 9h11v11H9zM5 15H4V4h11v1",
} as const;
export type IconName = keyof typeof paths;
export function AppIcon({ name, size = 22 }: { name: IconName; size?: number }) {
  const { theme } = useAppTheme();
  return <Svg width={size} height={size} viewBox="0 0 24 24" accessible={false}>
    <Path d={paths[name]} fill="none" stroke={theme.colors.text} strokeWidth={1.8} strokeLinecap="round" strokeLinejoin="round" />
  </Svg>;
}
