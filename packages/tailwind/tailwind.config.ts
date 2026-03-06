import type { Config } from "tailwindcss";

const config: Config = {
  //mode: "jit", // для ускорения
  content: [
    "../../apps/web/**/*.{ts,tsx,js,jsx}",
    "../../packages/ui/**/*.{ts,tsx,js,jsx}" // только нужные компоненты
  ],
  theme: {
    extend: {},
  },
  plugins: [],
};

export default config;