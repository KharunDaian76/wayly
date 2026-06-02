import waylyPreset from '@wayly/config-tailwind';
import type { Config } from 'tailwindcss';

const config: Config = {
  presets: [waylyPreset],
  content: [
    './src/**/*.{ts,tsx}',
    // Scan the shared design system so utility classes used inside @wayly/ui
    // components are generated into the app's CSS.
    '../../packages/ui/src/**/*.{ts,tsx}',
  ],
};

export default config;
