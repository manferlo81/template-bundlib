import { defineConfig, globalIgnores } from 'eslint/config'
import globals from 'globals'

import pluginJavascript from '@eslint/js'
import pluginStylistic from '@stylistic/eslint-plugin'
import { createTypeScriptImportResolver } from 'eslint-import-resolver-typescript'
import { createNodeResolver, flatConfigs as pluginImportConfigs } from 'eslint-plugin-import-x'
import { configs as pluginTypescriptConfigs } from 'typescript-eslint'

// Javascript Plugin

const rulesPluginJavascript = normalizeRules(null, {
  'no-useless-rename': 'on',
  'object-shorthand': 'on',
  'prefer-template': 'on',
  'no-useless-concat': 'on',
  eqeqeq: 'smart',
})

const configPluginJavascript = defineConfig(
  pluginJavascript.configs.recommended,
  { rules: rulesPluginJavascript },
)

// Import Plugin

const rulesPluginImport = normalizeRules('import-x', {
  'consistent-type-specifier-style': 'on',
  'no-useless-path-segments': 'on',
  'no-absolute-path': 'on',
  'no-cycle': 'on',
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
  'no-extra-semi': 'on',
  'padded-blocks': 'off',
})

const configPluginStylistic = defineConfig(
  pluginStylistic.configs.customize({
    quotes: 'single',
    indent: 2,
    semi: false,
    arrowParens: true,
    quoteProps: 'as-needed',
    braceStyle: '1tbs',
    commaDangle: 'always-multiline',
    jsx: false,
  }),
  { rules: rulesPluginStylistic },
)

// Typescript Plugin

const rulesPluginTypescript = normalizeRules('@typescript-eslint', {
  'array-type': Object.fromEntries(['default', 'readonly'].map((key) => [key, 'array-simple'])),
  'restrict-template-expressions': {
    allowNumber: true,
    allowBoolean: false,
    allowNullish: false,
    allowRegExp: false,
    allowArray: false,
    allowAny: false,
    allowNever: false,
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
  const normalizeObjectEntry = createObjectEntryNormalizer(pluginName)
  const entries = Object.entries(rules)
  const entriesNormalized = entries.map(normalizeObjectEntry)
  return Object.fromEntries(entriesNormalized)
}

function createObjectEntryNormalizer(pluginName) {
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

function normalizeRuleEntry(entry) {
  if (entry === 'on' || entry === true) return 'error'
  if (entry === false) return 'off'

  if (Array.isArray(entry)) {
    const [first] = entry
    if (isRuleSeverityString(first)) return entry
    return ['error', ...entry]
  }

  if (isRuleSeverityString(entry)) return entry

  return ['error', entry]
}

function isRuleSeverityString(entry) {
  return ['error', 'off', 'warn'].includes(entry)
}
