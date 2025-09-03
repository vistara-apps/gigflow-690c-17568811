    import type { Config } from "tailwindcss";

    const config: Config = {
      content: [
        "./pages/**/*.{js,ts,jsx,tsx,mdx}",
        "./components/**/*.{js,ts,jsx,tsx,mdx}",
        "./app/**/*.{js,ts,jsx,tsx,mdx}",
      ],
      theme: {
        extend: {
          colors: {
            bg: "hsl(210 40% 96.1%)",
            accent: "hsl(208 92.3% 53%)",
            primary: "hsl(240 9.8% 46.1%)",
            surface: "hsl(0 0% 100%)",
          },
          borderRadius: {
            lg: "16px",
            md: "10px",
            sm: "6px",
          },
          boxShadow: {
            card: "0 4px 12px hsla(0, 0%, 0%, 0.08)",
          },
          spacing: {
            lg: "20px",
            md: "12px",
            sm: "8px",
          },
          fontSize: {
            body: ["16px", { lineHeight: "1.5" }],
            display: ["20px", { fontWeight: "600" }],
          },
          transitionTimingFunction: {
            ease: "cubic-bezier(0.22,1,0.36,1)",
          },
          transitionDuration: {
            base: "250ms",
            fast: "150ms",
          },
        },
      },
      plugins: [],
    };
    export default config;
  