/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  darkMode: "class",
  theme: {
    extend: {
      "colors": { "on-primary-fixed": "#00201d", "surface-container": "#e5eeff", "on-secondary-fixed": "#131b2e", "inverse-surface": "#213145", "on-primary-fixed-variant": "#005049", "background": "#f8f9ff", "inverse-on-surface": "#eaf1ff", "surface-container-lowest": "#ffffff", "error-container": "#ffdad6", "surface-bright": "#f8f9ff", "error": "#ba1a1a", "secondary": "#565e74", "primary": "#00685f", "tertiary": "#006194", "surface-container-high": "#dce9ff", "on-secondary": "#ffffff", "tertiary-fixed-dim": "#93ccff", "on-surface": "#0b1c30", "on-secondary-container": "#5c647a", "on-primary": "#ffffff", "tertiary-fixed": "#cce5ff", "on-tertiary-fixed-variant": "#004b73", "surface-container-low": "#eff4ff", "surface": "#f8f9ff", "primary-container": "#008378", "outline-variant": "#bcc9c6", "on-tertiary-fixed": "#001d31", "on-error-container": "#93000a", "secondary-fixed-dim": "#bec6e0", "on-secondary-fixed-variant": "#3f465c", "on-background": "#0b1c30", "inverse-primary": "#6bd8cb", "surface-container-highest": "#d3e4fe", "primary-fixed-dim": "#6bd8cb", "secondary-fixed": "#dae2fd", "on-primary-container": "#f4fffc", "tertiary-container": "#007bb9", "surface-dim": "#cbdbf5", "on-error": "#ffffff", "outline": "#6d7a77", "surface-variant": "#d3e4fe", "on-tertiary": "#ffffff", "on-tertiary-container": "#fdfcff", "surface-tint": "#006a61", "secondary-container": "#dae2fd", "primary-fixed": "#89f5e7", "on-surface-variant": "#3d4947" },
      "borderRadius": { "DEFAULT": "0.125rem", "lg": "0.25rem", "xl": "0.5rem", "full": "0.75rem" },
      "spacing": { "space-md": "0.75rem", "margin": "1rem", "space-lg": "1rem", "gutter": "0.75rem", "margin-lg": "1.5rem", "space-sm": "0.5rem", "space-xs": "0.25rem", "gutter-lg": "1.25rem", "space-xl": "1.5rem" },
      "fontFamily": {
        "headline-lg": ["Inter", "sans-serif"],
        "label-md": ["Inter", "sans-serif"],
        "headline-sm": ["Inter", "sans-serif"],
        "body-lg": ["Inter", "sans-serif"],
        "body-md": ["Inter", "sans-serif"],
        "body-sm": ["Inter", "sans-serif"],
        "label-sm": ["Inter", "sans-serif"],
        "display-lg": ["Inter", "sans-serif"],
        "headline-md": ["Inter", "sans-serif"],
        "data-mono": ["JetBrains Mono", "monospace"]
      },
      "fontSize": {
        "headline-lg": ["24px", { "lineHeight": "32px", "letterSpacing": "-0.015em", "fontWeight": "600" }],
        "label-md": ["12px", { "lineHeight": "16px", "letterSpacing": "0.01em", "fontWeight": "600" }],
        "headline-sm": ["16px", { "lineHeight": "24px", "letterSpacing": "-0.005em", "fontWeight": "600" }],
        "body-lg": ["15px", { "lineHeight": "22px", "fontWeight": "400" }],
        "body-md": ["13px", { "lineHeight": "18px", "fontWeight": "400" }],
        "body-sm": ["12px", { "lineHeight": "16px", "fontWeight": "400" }],
        "label-sm": ["11px", { "lineHeight": "14px", "letterSpacing": "0.02em", "fontWeight": "500" }],
        "display-lg": ["30px", { "lineHeight": "38px", "letterSpacing": "-0.02em", "fontWeight": "600" }],
        "headline-md": ["20px", { "lineHeight": "28px", "letterSpacing": "-0.01em", "fontWeight": "600" }],
        "data-mono": ["12px", { "lineHeight": "16px", "letterSpacing": "0.00em", "fontWeight": "500" }]
      }
    },
  },
  plugins: [],
}
