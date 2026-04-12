import { defineConfig, globalIgnores } from "eslint/config";
import nextVitals from "eslint-config-next/core-web-vitals";
import nextTs from "eslint-config-next/typescript";
import prettierConfig from "eslint-config-prettier";
import simpleImportSort from "eslint-plugin-simple-import-sort";

const eslintConfig = defineConfig([
  // ── Ignores ────────────────────────────────────────────────────────────────
  globalIgnores([
    ".next/**",
    "out/**",
    "build/**",
    "node_modules/**",
    "next-env.d.ts",
    "src/components/ui/**", // shadcn generated files — do not lint
  ]),

  // ── Next.js recommended (core web vitals + TypeScript) ────────────────────
  ...nextVitals,
  ...nextTs,

  // ── Import sorting ─────────────────────────────────────────────────────────
  {
    plugins: {
      "simple-import-sort": simpleImportSort,
    },
    rules: {
      "simple-import-sort/imports": [
        "error",
        {
          groups: [
            // 1. Side-effect imports (e.g. CSS, polyfills)
            ["^\\u0000"],
            // 2. Node built-ins
            ["^node:"],
            // 3. External packages
            ["^react", "^next", "^@?\\w"],
            // 4. Internal aliases (@/...)
            ["^@/"],
            // 5. Relative imports
            ["^\\."],
          ],
        },
      ],
      "simple-import-sort/exports": "error",
    },
  },

  // ── TypeScript rules ───────────────────────────────────────────────────────
  {
    files: ["**/*.ts", "**/*.tsx"],
    rules: {
      // Warn on unused vars; underscore-prefix exempts intentional skips
      "@typescript-eslint/no-unused-vars": [
        "warn",
        {
          args: "all",
          argsIgnorePattern: "^_",
          varsIgnorePattern: "^_",
          caughtErrorsIgnorePattern: "^_",
        },
      ],

      // Discourage `any` — use `unknown` instead when type is uncertain
      "@typescript-eslint/no-explicit-any": "warn",

      // Enforce `import type` for type-only imports (tree-shaking friendly)
      "@typescript-eslint/consistent-type-imports": [
        "warn",
        { prefer: "type-imports", fixStyle: "inline-type-imports" },
      ],

      // Avoid non-null assertions where possible
      "@typescript-eslint/no-non-null-assertion": "warn",
    },
  },

  // ── React rules ────────────────────────────────────────────────────────────
  {
    files: ["**/*.tsx", "**/*.jsx"],
    rules: {
      // Enforce hook dependency arrays are complete
      "react-hooks/exhaustive-deps": "warn",

      // Self-close components with no children: <Foo /> not <Foo></Foo>
      "react/self-closing-comp": ["warn", { component: true, html: false }],

      // No array index as key (can cause subtle bugs on reorder)
      "react/no-array-index-key": "warn",
    },
  },

  // ── General rules ──────────────────────────────────────────────────────────
  {
    rules: {
      // Disallow console.log in committed code; warn/error are fine
      "no-console": ["warn", { allow: ["warn", "error"] }],

      // Prefer const; flag let that is never reassigned
      "prefer-const": "error",

      // No legacy var declarations
      "no-var": "error",

      // No duplicate imports from the same module
      "no-duplicate-imports": "error",
    },
  },

  // ── Prettier (must be last — overrides conflicting formatting rules) ────────
  prettierConfig,
]);

export default eslintConfig;
