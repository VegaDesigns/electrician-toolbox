import type { ResolvedMode, ThemeId } from './preferences';
type Palette = { bg: string; surface: string; ink: string; muted: string; accent: string; action?: string; on: string; soft: string; rule: string; key: string };
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
  },
  "tool-red": {
    "light": {
      "bg": "#F3F2F2",
      "surface": "#FFFFFF",
      "ink": "#242024",
      "muted": "#62515A",
      "accent": "#A71928",
      "action": "#D7192D",
      "on": "#FFFFFF",
      "soft": "#F6DDDF",
      "rule": "#D8C7CB",
      "key": "#EBE5E7"
    },
    "dark": {
      "bg": "#151517",
      "surface": "#222124",
      "ink": "#FFF2F3",
      "muted": "#D2B8BD",
      "accent": "#FF858C",
      "action": "#D7192D",
      "on": "#FFFFFF",
      "soft": "#422126",
      "rule": "#624047",
      "key": "#2B272B"
    }
  },
  "jobsite-yellow": {
    "light": {
      "bg": "#F3F2E9",
      "surface": "#FFFEF8",
      "ink": "#242318",
      "muted": "#605C40",
      "accent": "#705100",
      "action": "#FFD400",
      "on": "#1C1C16",
      "soft": "#F4E9B6",
      "rule": "#D5CBA6",
      "key": "#EAE6D4"
    },
    "dark": {
      "bg": "#161714",
      "surface": "#24251F",
      "ink": "#FFF9DF",
      "muted": "#CEC8AD",
      "accent": "#FFDA24",
      "action": "#FFD400",
      "on": "#1C1C16",
      "soft": "#443B16",
      "rule": "#62572F",
      "key": "#2D2E25"
    }
  },
  "electric-blue": {
    "light": {
      "bg": "#EFF3F8",
      "surface": "#FBFDFF",
      "ink": "#152D47",
      "muted": "#465D76",
      "accent": "#154FAC",
      "action": "#1761DE",
      "on": "#FFFFFF",
      "soft": "#DCE8FA",
      "rule": "#C3D2E7",
      "key": "#E1E8F2"
    },
    "dark": {
      "bg": "#111B2A",
      "surface": "#192A40",
      "ink": "#F0F7FF",
      "muted": "#B6C9E4",
      "accent": "#91BEFF",
      "action": "#1761DE",
      "on": "#FFFFFF",
      "soft": "#223E65",
      "rule": "#3C577B",
      "key": "#203149"
    }
  },
  "hi-vis-green": {
    "light": {
      "bg": "#F1F4E9",
      "surface": "#FCFFF5",
      "ink": "#223117",
      "muted": "#4C5E3D",
      "accent": "#3B6100",
      "action": "#AAE600",
      "on": "#1D2B07",
      "soft": "#E4F0C8",
      "rule": "#C9D7AE",
      "key": "#E6EBD9"
    },
    "dark": {
      "bg": "#151C12",
      "surface": "#212D1B",
      "ink": "#F3FFE6",
      "muted": "#BDD0AB",
      "accent": "#B6F033",
      "action": "#AAE600",
      "on": "#1D2B07",
      "soft": "#344723",
      "rule": "#536A3E",
      "key": "#293723"
    }
  },
  "caution-orange": {
    "light": {
      "bg": "#F5F0E9",
      "surface": "#FFFCF7",
      "ink": "#382815",
      "muted": "#6D553C",
      "accent": "#874100",
      "action": "#FF8C00",
      "on": "#2A1905",
      "soft": "#F8E2C5",
      "rule": "#DDC9AD",
      "key": "#EEE3D5"
    },
    "dark": {
      "bg": "#1B1915",
      "surface": "#2C261F",
      "ink": "#FFF3DE",
      "muted": "#D8BFA0",
      "accent": "#FFAF51",
      "action": "#FF8C00",
      "on": "#2A1905",
      "soft": "#49331D",
      "rule": "#705134",
      "key": "#352D23"
    }
  },
  "steel": {
    "light": {
      "bg": "#EAF0F3",
      "surface": "#F9FCFE",
      "ink": "#233440",
      "muted": "#4E6472",
      "accent": "#354F64",
      "action": "#425F75",
      "on": "#FFFFFF",
      "soft": "#D7E4EC",
      "rule": "#BBCDD9",
      "key": "#DEE7ED"
    },
    "dark": {
      "bg": "#141D24",
      "surface": "#222F39",
      "ink": "#EDF7FF",
      "muted": "#B7CBD9",
      "accent": "#C4DBEC",
      "action": "#B5CDDF",
      "on": "#14242F",
      "soft": "#304653",
      "rule": "#506B7C",
      "key": "#2A3944"
    }
  }
};
export const themeNames: Record<ThemeId, string> = {
  "forest": "Forest",
  "ocean": "Ocean",
  "clay": "Clay",
  "iris": "Iris",
  "graphite": "Graphite",
  "tool-red": "Tool Red",
  "jobsite-yellow": "Jobsite Yellow",
  "electric-blue": "Electric Blue",
  "hi-vis-green": "Hi-Vis Green",
  "caution-orange": "Caution Orange",
  "steel": "Steel"
};
export const themeDescriptions: Record<ThemeId, string> = {
  "forest": "Warm paper · evergreen",
  "ocean": "Cool gray · soft blue",
  "clay": "Warm neutrals · terracotta",
  "iris": "Soft violet · lavender",
  "graphite": "Quiet gray · olive undertones",
  "tool-red": "Power red · graphite · white",
  "jobsite-yellow": "Bold yellow · carbon black",
  "electric-blue": "Cobalt · midnight navy",
  "hi-vis-green": "Lime green · deep charcoal",
  "caution-orange": "Safety orange · dark carbon",
  "steel": "Brushed silver · slate blue"
};
function colors(p: Palette, dark: boolean) {
  return {
    bg:p.bg, surface:p.surface, surface2:p.key, surface3:p.soft,
    border:p.rule, borderStrong:p.muted, text:p.ink, textMuted:p.muted, textSubtle:p.muted,
    primary:p.accent, action:p.action ?? p.accent, primarySoft:p.soft, primaryMuted:p.accent,
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
