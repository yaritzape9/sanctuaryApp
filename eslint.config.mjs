import { FlatCompat } from "@eslint/eslintrc";

// eslint-config-next 15 only ships legacy (eslintrc) configs, so FlatCompat
// loads them into flat config. On Next 16 this becomes direct imports of
// eslint-config-next/core-web-vitals and eslint-config-next/typescript.
const compat = new FlatCompat({ baseDirectory: import.meta.dirname });

const eslintConfig = [
  ...compat.extends("next/core-web-vitals", "next/typescript"),
  {
    ignores: [".next/**", "out/**", "build/**", "next-env.d.ts"],
  },
];

export default eslintConfig;
