import type { StorybookConfig } from '@storybook/html-vite';
import { tempoUIPlugin } from '../src/components/theme/vite-plugin';

const config: StorybookConfig = {
  "stories": [
    "../stories/**/*.mdx",
    "../stories/**/*.stories.@(js|jsx|mjs|ts|tsx)"
  ],
  "addons": [
    {
      "name": "@storybook/addon-essentials",
      "options": {
        "docs": false
      }
    },
    "@storybook/addon-interactions"
  ],
  "framework": {
    "name": "@storybook/html-vite",
    "options": {}
  },
  async viteFinal(config) {
    // Add Tempo theme plugin for CSS generation
    config.plugins = config.plugins || [];
    config.plugins.push(tempoUIPlugin());
    return config;
  }
};
export default config;
