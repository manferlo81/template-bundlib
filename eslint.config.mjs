import pluginJavascript from '@eslint/js'
import pluginStylistic from '@stylistic/eslint-plugin'
import globals from 'globals'
import { config, configs as typescriptConfigs } from 'typescript-eslint'

const javascriptPluginConfig = config(
  pluginJavascript.configs.recommended,
  normalizeRulesConfig({
    'no-useless-rename': 'error',
    'object-shorthand': 'error',
    'prefer-template': 'error',
    'no-useless-concat': 'error',
    eqeqeq: 'smart',
  }),
)

const stylisticPluginConfig = config(
  pluginStylistic.configs.customize({
    indent: 2,
    semi: false,
    arrowParens: true,
    quoteProps: 'as-needed',
    braceStyle: '1tbs',
  }),
  normalizeRulesConfig('@stylistic', {
    quotes: 'single',
    'linebreak-style': 'unix',
    'no-extra-parens': 'all',
    'no-extra-semi': 'error',
    'padded-blocks': 'off',
  }),
)

const typescriptPluginConfig = config(
  { files: ['**/*.ts'] },
  typescriptConfigs.strictTypeChecked,
  typescriptConfigs.stylisticTypeChecked,
  { languageOptions: { parserOptions: { projectService: true, tsconfigRootDir: import.meta.dirname } } },
  normalizeRulesConfig('@typescript-eslint', {
    'array-type': { default: 'array-simple', readonly: 'array-simple' },
    'restrict-template-expressions': {
      allowAny: false,
      allowBoolean: false,
      allowNever: false,
      allowNullish: false,
      allowRegExp: false,
    },
  }),
  {
    ...typescriptConfigs.disableTypeChecked,
    files: ['**/*.{js,mjs,cjs}'],
  },
)

export default config(
  { ignores: ['dist', 'coverage'] },
  { languageOptions: { globals: { ...globals.browser, ...globals.node } } },
  { files: ['**/*.{js,mjs,cjs,ts}'] },
  javascriptPluginConfig,
  stylisticPluginConfig,
  typescriptPluginConfig,
)

function normalizeRulesConfig(pluginName, rules) {
  if (!rules && pluginName) return normalizeRulesConfig(null, pluginName)
  const normalizeEntry = createEntryNormalizer(pluginName)
  const entries = Object.entries(rules).map(normalizeEntry)
  const rulesNormalized = Object.fromEntries(entries)
  return { rules: rulesNormalized }
}

function createEntryNormalizer(pluginName) {
  const normalizeRuleEntry = createRuleEntryNormalizer('error')
  if (!pluginName) return ([ruleName, ruleEntry]) => [ruleName, normalizeRuleEntry(ruleEntry)]
  const normalizeRuleName = createRuleNameNormalizer(pluginName)
  return ([ruleName, ruleEntry]) => [normalizeRuleName(ruleName), normalizeRuleEntry(ruleEntry)]
}

function createRuleEntryNormalizer(severity) {
  return (entry) => {
    if (Array.isArray(entry)) return entry
    if (['error', 'off', 'warn'].includes(entry)) return entry
    return [severity, entry]
  }
}

function createRuleNameNormalizer(pluginName) {
  const pluginPrefix = `${pluginName}/`
  const normalizeRuleName = (ruleName) => {
    if (ruleName.startsWith(pluginPrefix)) return ruleName
    return `${pluginPrefix}${ruleName}`
  }
  return normalizeRuleName
}
