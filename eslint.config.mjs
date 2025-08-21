import { defineConfig, globalIgnores } from '@eslint/config-helpers'
import globals from 'globals'

import pluginJavascript from '@eslint/js'
import pluginStylistic from '@stylistic/eslint-plugin'
import { createTypeScriptImportResolver } from 'eslint-import-resolver-typescript'
import { createNodeResolver, flatConfigs as pluginImportConfigs } from 'eslint-plugin-import-x'
import { configs as pluginTypescriptConfigs } from 'typescript-eslint'

// Javascript Plugin

const rulesPluginJavascript = normalizeRules({
  'no-useless-rename': 'error',
  'object-shorthand': 'error',
  'prefer-template': 'error',
  'no-useless-concat': 'error',
  eqeqeq: 'smart',
})

const configPluginJavascript = defineConfig(
  pluginJavascript.configs.recommended,
  { rules: rulesPluginJavascript },
)

// Import Plugin

const rulesPluginImport = normalizeRules('import-x', {
  'consistent-type-specifier-style': 'error',
  'no-useless-path-segments': 'error',
  'no-absolute-path': 'error',
  'no-cycle': 'error',
})

const resolversPluginImport = [
  createTypeScriptImportResolver(),
  createNodeResolver(),
]

const configPluginImport = defineConfig(
  { settings: { 'import-x/resolver-next': resolversPluginImport } },
  pluginImportConfigs.recommended,
  pluginImportConfigs.typescript,
  { rules: rulesPluginImport },
)

// Stylistic Plugin

const rulesPluginStylistic = normalizeRules('@stylistic', {
  quotes: 'single',
  'linebreak-style': 'unix',
  'no-extra-parens': 'all',
  'no-extra-semi': 'error',
  'padded-blocks': 'off',
})

const configPluginStylistic = defineConfig(
  pluginStylistic.configs.customize({
    indent: 2,
    semi: false,
    arrowParens: true,
    quoteProps: 'as-needed',
    braceStyle: '1tbs',
  }),
  { rules: rulesPluginStylistic },
)

// Typescript Plugin

const rulesPluginTypescript = normalizeRules('@typescript-eslint', {
  'array-type': Object.fromEntries(['default', 'readonly'].map((key) => [key, 'array-simple'])),
  'restrict-template-expressions': {
    allowAny: false,
    allowBoolean: false,
    allowNever: false,
    allowNullish: false,
    allowRegExp: false,
  },
})

const configPluginTypescript = defineConfig(
  { files: ['**/*.ts'] },
  { languageOptions: { parserOptions: { projectService: true, tsconfigRootDir: import.meta.dirname } } },
  pluginTypescriptConfigs.strictTypeChecked,
  pluginTypescriptConfigs.stylisticTypeChecked,
  { rules: rulesPluginTypescript },
)

const configDisableJavascriptTypeCheck = defineConfig(
  { ...pluginTypescriptConfigs.disableTypeChecked, files: ['**/*.{js,mjs,cjs}'] },
)

// Configuration

export default defineConfig(
  globalIgnores(['dist', 'coverage']),
  { languageOptions: { globals: { ...globals.browser, ...globals.node } } },
  { files: ['**/*.{js,mjs,cjs,ts}'] },
  configPluginJavascript,
  configPluginStylistic,
  configPluginImport,
  configPluginTypescript,
  configDisableJavascriptTypeCheck,
)

// Helper Functions

function normalizeRules(pluginName, rules) {
  if (!rules && pluginName) {
    const actualRules = pluginName
    return normalizeRules(null, actualRules)
  }
  const normalizeEntry = createEntryNormalizer(pluginName)
  const entriesNormalized = Object.entries(rules).map(normalizeEntry)
  return Object.fromEntries(entriesNormalized)
}

function createEntryNormalizer(pluginName) {
  if (!pluginName) return ([ruleName, ruleEntry]) => [ruleName, normalizeRuleEntry(ruleEntry)]
  const normalizeRuleName = createPluginKeyNormalizer(pluginName)
  return ([ruleName, ruleEntry]) => [normalizeRuleName(ruleName), normalizeRuleEntry(ruleEntry)]
}

function createPluginKeyNormalizer(pluginName) {
  const pluginPrefix = `${pluginName}/`
  return (key) => {
    if (key.startsWith(pluginPrefix)) return key
    return `${pluginPrefix}${key}`
  }
}

function normalizeRuleEntry(entry, ...more) {
  if (Array.isArray(entry)) return entry
  if (['error', 'off', 'warn'].includes(entry)) return entry
  return ['error', entry, ...more]
}
