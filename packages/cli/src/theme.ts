export type ThemeColor = {
  primary: string;
  planMode: string;
  selection: string;
  thinking: string;
  success: string;
  error: string;
  info: string;
  background: string;
  surface: string;
  dialogSurface: string;
  thinkingBorder: string;
  dimSeparator: string;
};

export type Theme = {
  name: string;
  colors: ThemeColor;
};

export const THEMES: Theme[] = [
  {
    // Deep navy + violet — classic dark terminal with a purple soul
    name: "Nightfox",
    colors: {
      primary: "#c099ff",
      planMode: "#7dcfff",
      selection: "#2d3f76",
      thinking: "#bb9af7",
      success: "#9ece6a",
      error: "#f7768e",
      info: "#7dcfff",
      background: "#1a1b2e",
      surface: "#1f2335",
      dialogSurface: "#24283b",
      thinkingBorder: "#7aa2f7",
      dimSeparator: "#292e42",
    },
  },
  {
    // Warm sand + amber — feels like a desert at golden hour
    name: "Sahara",
    colors: {
      primary: "#e6a817",
      planMode: "#d4845a",
      selection: "#4a3728",
      thinking: "#f0c060",
      success: "#7fb069",
      error: "#c94040",
      info: "#6fa8c8",
      background: "#1c1610",
      surface: "#241e15",
      dialogSurface: "#2e2619",
      thinkingBorder: "#b87d2a",
      dimSeparator: "#332b1e",
    },
  },
  {
    // Crisp white + forest green — clean, minimal, natural
    name: "Ivory Grove",
    colors: {
      primary: "#2d6a4f",
      planMode: "#52796f",
      selection: "#d8e8dc",
      thinking: "#40916c",
      success: "#1b7e5a",
      error: "#c1121f",
      info: "#457b9d",
      background: "#f8f7f2",
      surface: "#eeeee4",
      dialogSurface: "#e8e8da",
      thinkingBorder: "#74c69d",
      dimSeparator: "#d9d9cc",
    },
  },
  {
    // Hot pink + electric cyan — bold neon cyberpunk
    name: "Neon Pulse",
    colors: {
      primary: "#ff2d78",
      planMode: "#00f5d4",
      selection: "#3a003a",
      thinking: "#df00ff",
      success: "#00ff94",
      error: "#ff4040",
      info: "#00cfff",
      background: "#0a000f",
      surface: "#110018",
      dialogSurface: "#1a0024",
      thinkingBorder: "#ff00aa",
      dimSeparator: "#280033",
    },
  },
  {
    // Muted slate + dusty rose — soft, editorial, calm
    name: "Dusty Rose",
    colors: {
      primary: "#c97b84",
      planMode: "#9b8ea8",
      selection: "#f0e0e3",
      thinking: "#d4909a",
      success: "#7aab8a",
      error: "#b05060",
      info: "#7a9ab0",
      background: "#faf5f5",
      surface: "#f2eaea",
      dialogSurface: "#ede2e2",
      thinkingBorder: "#d4a0a8",
      dimSeparator: "#e0d4d4",
    },
  },
  {
    // True black + vivid amber — high-contrast terminal classic
    name: "Ember",
    colors: {
      primary: "#ffb347",
      planMode: "#ff8c42",
      selection: "#3b2800",
      thinking: "#ffca70",
      success: "#a8d672",
      error: "#ff4f4f",
      info: "#61bfff",
      background: "#0d0d0d",
      surface: "#141414",
      dialogSurface: "#1c1c1c",
      thinkingBorder: "#ff9900",
      dimSeparator: "#222222",
    },
  },
  {
    // Deep teal + aquamarine — oceanic, refreshing, modern
    name: "Abyssal",
    colors: {
      primary: "#00d4aa",
      planMode: "#0099cc",
      selection: "#003344",
      thinking: "#00bfaa",
      success: "#55d490",
      error: "#ff6b6b",
      info: "#00aaee",
      background: "#020d14",
      surface: "#051520",
      dialogSurface: "#081e2a",
      thinkingBorder: "#009980",
      dimSeparator: "#0d2535",
    },
  },
  {
    // Soft lavender + indigo — gentle, dreamy, ethereal
    name: "Aurora",
    colors: {
      primary: "#a78bfa",
      planMode: "#818cf8",
      selection: "#1e1b4b",
      thinking: "#c4b5fd",
      success: "#6ee7b7",
      error: "#fca5a5",
      info: "#93c5fd",
      background: "#0f0e17",
      surface: "#16152a",
      dialogSurface: "#1e1c38",
      thinkingBorder: "#7c3aed",
      dimSeparator: "#252340",
    },
  },
  {
    // Warm off-white + terracotta — earthy, artisan, café aesthetic
    name: "Terracotta",
    colors: {
      primary: "#c1440e",
      planMode: "#a0522d",
      selection: "#f5e0d0",
      thinking: "#d2691e",
      success: "#5a8a5a",
      error: "#a32020",
      info: "#5a7fa0",
      background: "#fdf6ee",
      surface: "#f5ece0",
      dialogSurface: "#ede0d0",
      thinkingBorder: "#cc6633",
      dimSeparator: "#e8d8c4",
    },
  },
  {
    // Pure dark + matrix green — retro hacker terminal
    name: "Matrix",
    colors: {
      primary: "#00ff41",
      planMode: "#00cc33",
      selection: "#003310",
      thinking: "#39ff14",
      success: "#00ff41",
      error: "#ff2244",
      info: "#00ddff",
      background: "#000000",
      surface: "#020a04",
      dialogSurface: "#041008",
      thinkingBorder: "#00aa22",
      dimSeparator: "#0a1a0a",
    },
  },
  {
    // Warm dark + gold — luxurious, Art Deco, sophisticated
    name: "Gilded",
    colors: {
      primary: "#d4af37",
      planMode: "#b8972a",
      selection: "#2c2200",
      thinking: "#f0d060",
      success: "#80b060",
      error: "#cc3333",
      info: "#7090c0",
      background: "#100e08",
      surface: "#1a1608",
      dialogSurface: "#221e0c",
      thinkingBorder: "#c0930a",
      dimSeparator: "#2a2410",
    },
  },
  {
    // Cool gray + ice blue — stark, minimal, Nordic
    name: "Nordic Ice",
    colors: {
      primary: "#88c0d0",
      planMode: "#81a1c1",
      selection: "#3b4252",
      thinking: "#8fbcbb",
      success: "#a3be8c",
      error: "#bf616a",
      info: "#5e81ac",
      background: "#1c1f26",
      surface: "#232730",
      dialogSurface: "#2e3440",
      thinkingBorder: "#4c566a",
      dimSeparator: "#373d49",
    },
  },
];

export const DEFAULT_THEME =
  THEMES.find((t) => t.name === "Nordic Ice") ?? THEMES[0]!;
