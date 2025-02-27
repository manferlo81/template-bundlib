import pluginJavascript from '@eslint/js'
import pluginStylistic from '@stylistic/eslint-plugin'
import globals from 'globals'
import { config, configs as typescriptConfigs } from 'typescript-eslint'

const javascriptPluginConfig = config(
  { files: ['**/*.{js,mjs,cjs,ts}'] },
  pluginJavascript.configs.recommended,
  {
    rules: normalizeRules({
      'no-useless-rename': 'error',
      'object-shorthand': 'error',
      'prefer-template': 'error',
      'no-useless-concat': 'error',
    }),
  },
)

const stylisticPluginConfig = config(
  { files: ['**/*.{js,mjs,cjs,ts}'] },
  pluginStylistic.configs.customize({
    semi: false,
    arrowParens: true,
    quoteProps: 'as-needed',
    braceStyle: '1tbs',
  }),
  {
    rules: normalizeRules('@stylistic', {
      quotes: 'single',
      indent: 2,
      'linebreak-style': 'unix',
      'no-extra-parens': 'all',
      'no-extra-semi': 'error',
      'padded-blocks': 'off',
    }),
  },
)

const typescriptPluginConfig = config(
  { files: ['**/*.ts'] },
  typescriptConfigs.strictTypeChecked,
  typescriptConfigs.stylisticTypeChecked,
  {
    languageOptions: { parserOptions: { projectService: true, tsconfigRootDir: import.meta.dirname } },
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
    ...typescriptConfigs.disableTypeChecked,
    files: ['**/*.{js,mjs,cjs}'],
  },
)

export default config(
  { ignores: ['dist', 'coverage'] },
  { languageOptions: { globals: { ...globals.browser, ...globals.node } } },
  javascriptPluginConfig,
  stylisticPluginConfig,
  typescriptPluginConfig,
)

function normalizeRules(pluginName, rules) {
  if (!rules && pluginName) return normalizeRules(null, pluginName)
  const normalizeEntry = createEntryNormalizer(pluginName)
  return Object.fromEntries(Object.entries(rules).map(normalizeEntry))
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
