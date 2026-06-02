import { defineConfig, globalIgnores } from "eslint/config";
import nextVitals from "eslint-config-next/core-web-vitals";
import nextTs from "eslint-config-next/typescript";

const eslintConfig = defineConfig([
  ...nextVitals,
  ...nextTs,
  // Override default ignores of eslint-config-next.
  globalIgnores([
    // Default ignores of eslint-config-next:
    ".next/**",
    "out/**",
    "build/**",
    "next-env.d.ts",
  ]),
  // R3F components mutate Three.js objects (posAttr.needsUpdate, mat.opacity, refs)
  // this is the standard Three.js API; immutability rules are false positives here.
  {
    files: ["src/features/planet/**/*.{ts,tsx}"],
    rules: {
      "react-hooks/immutability": "off",
    },
  },
]);

export default eslintConfig;
