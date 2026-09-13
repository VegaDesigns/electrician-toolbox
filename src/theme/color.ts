import type { ResolvedMode, ThemeId } from './preferences';
type Palette = { bg: string; surface: string; ink: string; muted: string; accent: string; on: string; soft: string; rule: string; key: string };
const palettes: Record<ThemeId, Record<ResolvedMode, Palette>> = {
  "forest": {
    "light": {
      "bg": "#F3F0E8",
      "surface": "#FAF8F3",
      "ink": "#253C36",
      "muted": "#58635B",
      "accent": "#295E4E",
      "on": "#FFFFFF",
      "soft": "#DFE6DC",
      "rule": "#D1D5C9",
      "key": "#E9EAE2"
    },
    "dark": {
      "bg": "#171E1B",
      "surface": "#202B25",
      "ink": "#EEEFE7",
      "muted": "#AFBDB2",
      "accent": "#A4C7AB",
      "on": "#16251C",
      "soft": "#2C4032",
      "rule": "#46584B",
      "key": "#252F29"
    }
  },
  "ocean": {
    "light": {
      "bg": "#EFF2F3",
      "surface": "#F8FAFA",
      "ink": "#203C4D",
      "muted": "#4C606D",
      "accent": "#2B627E",
      "on": "#FFFFFF",
      "soft": "#DCE6EB",
      "rule": "#CCD7DD",
      "key": "#E3E9EC"
    },
    "dark": {
      "bg": "#171F27",
      "surface": "#202D38",
      "ink": "#E7EEF3",
      "muted": "#ACBDC9",
      "accent": "#9BBED6",
      "on": "#172936",
      "soft": "#293E4D",
      "rule": "#435867",
      "key": "#25313C"
    }
  },
  "clay": {
    "light": {
      "bg": "#F5EEE7",
      "surface": "#FCF7F1",
      "ink": "#49342B",
      "muted": "#70584D",
      "accent": "#875137",
      "on": "#FFFFFF",
      "soft": "#EDDDD0",
      "rule": "#DCCBBC",
      "key": "#EDE2D7"
    },
    "dark": {
      "bg": "#241C18",
      "surface": "#312720",
      "ink": "#F4EAE0",
      "muted": "#C6B5A5",
      "accent": "#DCAF8E",
      "on": "#332116",
      "soft": "#483328",
      "rule": "#655044",
      "key": "#382B24"
    }
  },
  "iris": {
    "light": {
      "bg": "#F2EEF5",
      "surface": "#FAF7FC",
      "ink": "#41364E",
      "muted": "#685674",
      "accent": "#755487",
      "on": "#FFFFFF",
      "soft": "#E6DDEC",
      "rule": "#D5CADD",
      "key": "#EAE3EF"
    },
    "dark": {
      "bg": "#211C29",
      "surface": "#2D2537",
      "ink": "#F0E9F5",
      "muted": "#C1B1CD",
      "accent": "#C5ACD8",
      "on": "#2D2138",
      "soft": "#40314F",
      "rule": "#5C496D",
      "key": "#332A3E"
    }
  },
  "graphite": {
    "light": {
      "bg": "#F1F0ED",
      "surface": "#FAFAF7",
      "ink": "#30322F",
      "muted": "#5C6058",
      "accent": "#50564F",
      "on": "#FFFFFF",
      "soft": "#DFE1DA",
      "rule": "#CECEC6",
      "key": "#E6E6DF"
    },
    "dark": {
      "bg": "#1D1F1E",
      "surface": "#292C29",
      "ink": "#EEEEE7",
      "muted": "#B4B8AE",
      "accent": "#C4CABD",
      "on": "#22271F",
      "soft": "#3B4238",
      "rule": "#545D4F",
      "key": "#30352F"
    }
  }
};
export const themeNames: Record<ThemeId, string> = { forest: 'Forest', ocean: 'Ocean', clay: 'Clay', iris: 'Iris', graphite: 'Graphite' };
function colors(p: Palette, dark: boolean) {
  return {
    bg:p.bg, surface:p.surface, surface2:p.key, surface3:p.soft,
    border:p.rule, borderStrong:p.muted, text:p.ink, textMuted:p.muted, textSubtle:p.muted,
    primary:p.accent, primarySoft:p.soft, primaryMuted:p.accent,
    key:p.bg, keyOperator:p.soft, keyUtility:p.key, keyDanger:dark?'#4A2927':'#F4DDDA',
    error:dark?'#F5B1A8':'#91362C', errorSoft:dark?'#4A2927':'#F4DDDA',
    success:dark?'#A4D1B6':'#2C6648', successSoft:dark?'#203F30':'#E2EEE5',
    warning:dark?'#EAC38E':'#805116', warningSoft:dark?'#46351F':'#F5E8D1',
    inverseText:p.on, overlay:dark?'rgba(0,0,0,0.70)':'rgba(20,25,23,0.40)',
    transparent:'transparent', diagramBackground:p.surface, diagramGrid:p.rule,
  };
}
export type ThemeColors = ReturnType<typeof colors>;
export const themeCatalog = Object.fromEntries(Object.entries(palettes).map(([id,p])=>[id,{light:colors(p.light,false),dark:colors(p.dark,true)}])) as Record<ThemeId,Record<ResolvedMode,ThemeColors>>;

/** Physical wire and conduit artwork colors must not change with the user theme. */
export const ReferenceColors = {
  "color000": "#000",
  "color344653": "#344653",
  "color526A7B": "#526A7B",
  "color718A9B": "#718A9B",
  "color8DA3B3": "#8DA3B3",
  "colorAABDCB": "#AABDCB",
  "colorCBD8E0": "#CBD8E0",
  "colorE1E9EE": "#E1E9EE",
  "color0C131A": "#0C131A",
  "color6D8292": "#6D8292",
  "color0B1015": "#0B1015",
  "colorF1F4F5": "#F1F4F5",
  "color8799A7": "#8799A7",
  "color354552": "#354552",
  "color2B3944": "#2B3944",
  "color657A8C": "#657A8C",
  "colorA0AFBA": "#A0AFBA",
  "colorDCE3E7": "#DCE3E7",
  "colorB9C6CF": "#B9C6CF",
  "color8E9FAB": "#8E9FAB",
  "color758995": "#758995",
  "color5B707F": "#5B707F",
  "color425967": "#425967",
  "color293D4A": "#293D4A",
  "colorDEE5E9": "#DEE5E9",
  "color182F3E": "#182F3E",
  "color0B141B": "#0B141B",
  "color5B6F7D": "#5B6F7D",
  "color101820": "#101820",
  "color14171A": "#14171A",
  "colorD94A43": "#D94A43",
  "color3277D5": "#3277D5",
  "colorB66F38": "#B66F38",
  "colorE0A06B": "#E0A06B",
  "color9DA7AF": "#9DA7AF",
  "colorD7DEE3": "#D7DEE3"
} as const;
