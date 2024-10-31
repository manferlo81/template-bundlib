import pluginJs from '@eslint/js';
import stylistic from '@stylistic/eslint-plugin';
import globals from 'globals';
import { config, configs as typescriptConfigs } from 'typescript-eslint';

const eslintRules = normalizeRules({
  'no-useless-rename': 'error',
  'object-shorthand': 'error',
  'no-useless-concat': 'error',
  'prefer-template': 'error',
});

const stylisticRules = normalizeRules('@stylistic', {
  indent: 2,
  'linebreak-style': 'unix',
  'no-extra-parens': 'all',
  'no-extra-semi': 'error',
  'padded-blocks': 'off',
});

const typescriptRules = normalizeRules('@typescript-eslint', {
  'array-type': {
    default: 'array-simple',
    readonly: 'array-simple',
  },
});

const stylisticConfig = stylistic.configs.customize({
  semi: true,
  arrowParens: true,
  quotes: 'single',
  quoteProps: 'as-needed',
  braceStyle: '1tbs',
});

const typescriptConfig = config(
  ...typescriptConfigs.strictTypeChecked,
  ...typescriptConfigs.stylisticTypeChecked,
  { languageOptions: { parserOptions: { projectService: true, tsconfigRootDir: process.cwd() } } },
  { files: ['**/*.{js,cjs,mjs}'], ...typescriptConfigs.disableTypeChecked },
);

export default config(
  { files: ['**/*.{js,cjs,mjs,ts}'] },
  { ignores: ['dist', 'coverage'] },
  { languageOptions: { globals: { ...globals.browser, ...globals.node } } },
  pluginJs.configs.recommended,
  stylisticConfig,
  ...typescriptConfig,
  { rules: { ...eslintRules, ...stylisticRules, ...typescriptRules } },
);

function normalizeRuleEntry(entry, ...rest) {
  if (Array.isArray(entry)) return entry;
  return ['error', 'off', 'warn'].find((severity) => severity === entry) || ['error', entry, ...rest];
}

function normalizeRuleEntries(rules, pluginName) {
  const entries = Object.entries(rules).map(
    ([ruleName, ruleEntry]) => [ruleName, normalizeRuleEntry(ruleEntry)],
  );
  if (!pluginName) return Object.fromEntries(entries);
  const pluginPrefix = `${pluginName}/`;
  const normalizeRuleName = (ruleName) => {
    if (ruleName.startsWith(pluginPrefix)) return ruleName;
    return `${pluginPrefix}${ruleName}`;
  };
  return Object.fromEntries(
    entries.map(([ruleName, normalizedRuleEntry]) => [normalizeRuleName(ruleName), normalizedRuleEntry]),
  );
}

function normalizeRules(pluginOrRules, rules) {
  if (!rules) return normalizeRuleEntries(pluginOrRules);
  return normalizeRuleEntries(rules, pluginOrRules);
}
