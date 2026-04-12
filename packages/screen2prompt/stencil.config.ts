import { Config } from '@stencil/core';

export const config: Config = {
  namespace: 'screen2prompt',
  outputTargets: [
    {
      type: 'dist',
      esmLoaderPath: '../loader',
    },
    {
      type: 'dist-custom-elements',
    },
  ],
  testing: {
    browserHeadless: 'new',
    testMatch: ['**/*.spec.ts', '**/*.spec.tsx'],
  },
  buildEs5: false,
  hashedFileNameLength: 8,
};
