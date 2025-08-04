import pluginJavascript from '@eslint/js'
import pluginStylistic from '@stylistic/eslint-plugin'
import { flatConfigs as pluginImportConfigs } from 'eslint-plugin-import-x'
import globals from 'globals'
import { config, configs as pluginTypescriptConfigs } from 'typescript-eslint'

const javascriptPluginConfig = config(
  pluginJavascript.configs.recommended,
  {
    rules: normalizeRules({
      'no-useless-rename': 'error',
      'object-shorthand': 'error',
      'prefer-template': 'error',
      'no-useless-concat': 'error',
      eqeqeq: 'smart',
    }),
  },
)

const importPluginConfig = config(
  pluginImportConfigs.recommended,
  pluginImportConfigs.typescript,
  {
    rules: normalizeRules('import-x', {
      'consistent-type-specifier-style': 'error',
      'no-useless-path-segments': 'error',
      'no-absolute-path': 'error',
      'no-cycle': 'error',
    }),
  },
)

const stylisticPluginConfig = config(
  pluginStylistic.configs.customize({
    indent: 2,
    semi: false,
    arrowParens: true,
    quoteProps: 'as-needed',
    braceStyle: '1tbs',
  }),
  {
    rules: normalizeRules('@stylistic', {
      quotes: 'single',
      'linebreak-style': 'unix',
      'no-extra-parens': 'all',
      'no-extra-semi': 'error',
      'padded-blocks': 'off',
    }),
  },
)

const typescriptPluginConfig = config(
  { files: ['**/*.ts'] },
  { languageOptions: { parserOptions: { projectService: true, tsconfigRootDir: import.meta.dirname } } },
  pluginTypescriptConfigs.strictTypeChecked,
  pluginTypescriptConfigs.stylisticTypeChecked,
  {
    rules: normalizeRules('@typescript-eslint', {
      'array-type': { default: 'array-simple', readonly: 'array-simple' },
      'restrict-template-expressions': {
        allowAny: false,
        allowBoolean: false,
        allowNever: false,
        allowNullish: false,
        allowRegExp: false,
      },
    }),
  },
  {
    ...pluginTypescriptConfigs.disableTypeChecked,
    files: ['**/*.{js,mjs,cjs}'],
  },
)

export default config(
  { ignores: ['dist', 'coverage'] },
  { languageOptions: { globals: { ...globals.browser, ...globals.node } } },
  { files: ['**/*.{js,mjs,cjs,ts}'] },
  javascriptPluginConfig,
  importPluginConfig,
  stylisticPluginConfig,
  typescriptPluginConfig,
)

function normalizeRules(pluginName, rules) {
  if (!rules && pluginName) return normalizeRules(null, pluginName)
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

function normalizeRuleEntry(entry) {
  if (Array.isArray(entry)) return entry
  if (['error', 'off', 'warn'].includes(entry)) return entry
  return ['error', entry]
}
