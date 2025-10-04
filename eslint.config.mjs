import { defineConfig, globalIgnores } from 'eslint/config'
import globals from 'globals'

import pluginJavascript from '@eslint/js'
import pluginStylistic from '@stylistic/eslint-plugin'
import { flatConfigs as pluginImportConfigs } from 'eslint-plugin-import'
import { configs as pluginTypescriptConfigs } from 'typescript-eslint'

// Constants

const JS_PATTERN = '**/*.{js,mjs,cjs,jsx}'
const TS_PATTERN = '**/*.{ts,mts,cts,tsx}'

const TS_FILES = [TS_PATTERN]
const ALL_FILES = [JS_PATTERN, TS_PATTERN]

// Plugin Javascript

const rulesPluginJavascript = ruleNormalizer()({
  'no-useless-rename': 'on',
  'object-shorthand': 'on',
  'prefer-template': 'on',
  'no-useless-concat': 'on',
  eqeqeq: 'smart',
  'no-inner-declarations': ['functions', { blockScopedFunctions: 'disallow' }],
  'no-unassigned-vars': 'on',
  'no-unmodified-loop-condition': 'on',
  'no-unreachable-loop': 'on',
  'no-useless-assignment': 'on',
  curly: ['on', 'multi-line'],
  'no-array-constructor': 'on',
  'no-else-return': { allowElseIf: false },
  'no-eval': 'on',
  'no-implied-eval': 'on',
  'no-new-func': 'on',
  'no-object-constructor': 'on',
  'no-useless-computed-key': 'on',
  'no-var': 'on',
  'prefer-const': 'on',
  'prefer-exponentiation-operator': 'on',
  'prefer-object-has-own': 'on',
  'prefer-regex-literals': 'on',
  'require-await': 'on',
  'no-unused-expressions': 'on',
  'no-useless-constructor': 'on',
  'no-throw-literal': 'on',
  'prefer-rest-params': 'on',
  'prefer-spread': 'on',
})

const configPluginJavascript = defineConfig({
  files: ALL_FILES,
  extends: [
    pluginJavascript.configs.recommended,
  ],
  rules: rulesPluginJavascript,
})

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
  'consistent-type-exports': {
    fixMixedExportsWithInlineTypeSpecifier: false,
  },
  'no-confusing-void-expression': { ignoreVoidReturningFunctions: true },
})

const configPluginTypescript = defineConfig({
  files: TS_FILES,
  languageOptions: { parserOptions: { projectService: true, tsconfigRootDir: import.meta.dirname } },
  extends: [
    pluginTypescriptConfigs.strictTypeChecked,
    pluginTypescriptConfigs.stylisticTypeChecked,
  ],
  rules: rulesPluginTypescript,
})

// Plugin Import

const rulesPluginImport = ruleNormalizer({ plugin: 'import' })({
  'consistent-type-specifier-style': 'prefer-top-level',
  'no-useless-path-segments': 'on',
  'no-absolute-path': 'on',
  'no-cycle': 'on',
})

const configPluginImport = defineConfig({
  files: ALL_FILES,
  languageOptions: { sourceType: 'module', ecmaVersion: 'latest' },
  settings: { 'import/resolver': { node: true, typescript: true } },
  extends: [
    pluginImportConfigs.recommended,
    pluginImportConfigs.typescript,
  ],
  rules: rulesPluginImport,
})

// Plugin Stylistic

const rulesPluginStylistic = ruleNormalizer({ plugin: '@stylistic' })({
  indent: ['on', 2],
  quotes: 'single',
  'linebreak-style': 'unix',
  'no-extra-parens': 'all',
  'no-extra-semi': 'on',
  'padded-blocks': 'off',
})

const configPluginStylistic = defineConfig({
  files: ALL_FILES,
  extends: [
    pluginStylistic.configs.customize({
      arrowParens: true,
      quoteProps: 'as-needed',
      braceStyle: '1tbs',
    }),
  ],
  rules: rulesPluginStylistic,
})

// Configuration

export default defineConfig(
  globalIgnores(['dist', 'coverage']),
  { languageOptions: { globals: { ...globals.browser, ...globals.node } } },
  configPluginJavascript,
  configPluginTypescript,
  configPluginImport,
  configPluginStylistic,
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
