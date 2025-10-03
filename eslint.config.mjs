import { defineConfig, globalIgnores } from 'eslint/config'
import globals from 'globals'

import pluginJavascript from '@eslint/js'
import pluginStylistic from '@stylistic/eslint-plugin'
import { flatConfigs as pluginImportConfigs } from 'eslint-plugin-import'
import { configs as pluginTypescriptConfigs } from 'typescript-eslint'

// Plugin Javascript

const rulesPluginJavascript = ruleNormalizer()({
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

// Plugin Import

const rulesPluginImport = ruleNormalizer({ plugin: 'import' })({
  'consistent-type-specifier-style': 'prefer-top-level',
  'no-useless-path-segments': 'on',
  'no-absolute-path': 'on',
  'no-cycle': 'on',
})

const configPluginImport = defineConfig(
  { settings: { 'import/resolver': { typescript: true } } },
  pluginImportConfigs.recommended,
  pluginImportConfigs.typescript,
  { rules: rulesPluginImport },
)

// Plugin Stylistic

const rulesPluginStylistic = ruleNormalizer({ plugin: '@stylistic' })({
  indent: ['on', 2],
  quotes: 'single',
  'linebreak-style': 'unix',
  'no-extra-parens': 'all',
  'no-extra-semi': 'on',
  'padded-blocks': 'off',
})

const customConfigPluginStylistic = pluginStylistic.configs.customize({
  arrowParens: true,
  quoteProps: 'as-needed',
  braceStyle: '1tbs',
  jsx: false,
})

const configPluginStylistic = defineConfig(
  customConfigPluginStylistic,
  { rules: rulesPluginStylistic },
)

// Plugin Typescript

const rulesPluginTypescript = ruleNormalizer({ plugin: '@typescript-eslint' })({
  'array-type': { default: 'array-simple', readonly: 'array-simple' },
  'restrict-template-expressions': {
    allowNumber: true,
    allowBoolean: false,
    allowNullish: false,
    allowRegExp: false,
    allowArray: false,
    allowAny: false,
    allowNever: false,
  },
  'consistent-type-imports': 'on',
  'no-confusing-void-expression': { ignoreVoidReturningFunctions: true },
})

const configPluginTypescript = defineConfig(
  { files: ['**/*.{ts,cts,mts}'] },
  { languageOptions: { parserOptions: { projectService: true, tsconfigRootDir: import.meta.dirname } } },
  pluginTypescriptConfigs.strictTypeChecked,
  pluginTypescriptConfigs.stylisticTypeChecked,
  { rules: rulesPluginTypescript },
)

const configDisableJavascriptTypeCheck = defineConfig({
  ...pluginTypescriptConfigs.disableTypeChecked,
  files: ['**/*.{js,mjs,cjs}'],
})

// Configuration

export default defineConfig(
  globalIgnores(['dist', 'coverage']),
  { languageOptions: { globals: { ...globals.browser, ...globals.node } } },
  { files: ['**/*.{js,mjs,cjs}', '**/*.{ts,cts,mts}'] },
  configPluginJavascript,
  configPluginStylistic,
  configPluginImport,
  configPluginTypescript,
  configDisableJavascriptTypeCheck,
)

// Helper Function

function ruleNormalizer({ severity: defaultSeverity = 'error', plugin: pluginName } = {}) {

  const isDefaultSeverity = (ruleEntry) => {
    return ruleEntry === 'error' || ruleEntry === 'warn' || ruleEntry === 1 || ruleEntry === 2
  }

  if (!isDefaultSeverity(defaultSeverity)) throw new TypeError('Default severity has to be "error", "warn", 1, or 2')

  const resolveSeverity = (ruleEntry) => {
    if (ruleEntry === 'on' || ruleEntry === true) return [defaultSeverity, true]
    if (ruleEntry === false) return ['off', true]
    if (ruleEntry === 'off' || ruleEntry === 0 || isDefaultSeverity(ruleEntry)) return [ruleEntry, true]
    return [ruleEntry, false]
  }

  const normalizeRuleEntry = (ruleEntry) => {
    const [severity, isValidSeverity] = resolveSeverity(ruleEntry)

    if (isValidSeverity) return severity

    if (Array.isArray(ruleEntry)) {
      const [first, ...rest] = ruleEntry
      const [severity, isValidSeverity] = resolveSeverity(first)
      if (isValidSeverity) return [severity, ...rest]
      return [defaultSeverity, ...ruleEntry]
    }

    return [defaultSeverity, ruleEntry]
  }

  const createRuleNormalizer = (normalizeObjectEntry) => {
    return (rules) => {
      const entries = Object.entries(rules)
      const entriesNormalized = entries.map(normalizeObjectEntry)
      return Object.fromEntries(entriesNormalized)
    }
  }

  if (!pluginName) {
    return createRuleNormalizer(
      ([ruleName, ruleEntry]) => [
        ruleName,
        normalizeRuleEntry(ruleEntry),
      ],
    )
  }

  const pluginPrefix = `${pluginName}/`

  const normalizeRuleName = (ruleName) => {
    if (ruleName.startsWith(pluginPrefix)) return ruleName
    return `${pluginPrefix}${ruleName}`
  }

  return createRuleNormalizer(
    ([ruleName, ruleEntry]) => [
      normalizeRuleName(ruleName),
      normalizeRuleEntry(ruleEntry),
    ],
  )

}
