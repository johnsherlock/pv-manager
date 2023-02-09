import projen from 'projen';

const pvCostMonitor = new projen.web.ReactTypeScriptProject({
  defaultReleaseBranch: 'main',
  name: 'pvCostMonitor',
  /* Runtime dependencies of this module. */
  deps: [
    '@types/react-datepicker@^4',
    'axios@^1',
    'bootstrap@^5',
    'bootswatch@^5',
    'chart.js@^4',
    'moment@^2',
    'next',
    'react@^18',
    'react-chartjs-2@^5',
    'react-datepicker@^4', // for css
  ],
  // description: undefined,  /* The description is just a string that helps people understand the purpose of the package. */
  /* Build dependencies for this module. */
  devDeps: [
    'identity-obj-proxy',
    'jsdom@21',
  ],
  // packageName: undefined,  /* The name in package.json. */

  tsconfigDev: {
    compilerOptions: {
      moduleResolution: 'node16',
    },
  },
  jest: true,
  jestOptions: {
    jestConfig: {
      transformIgnorePatterns: [
        'node_modules\/(?!axios)',
      ],
      moduleNameMapper: {
        '\\.(css|sass)$': 'identity-obj-proxy',
      },
      transform: {
        '^.+\\.tsx?$': 'ts-jest',
      },
    },
  },
});

pvCostMonitor.tsconfigDev.addInclude('pvProxy');
pvCostMonitor.tsconfigDev.addInclude('pvProxy/src/**/*.ts');

const packageJson = pvCostMonitor.tryFindObjectFile('package.json');
packageJson.addOverride('type', 'module');
packageJson.addDeletionOverride('jest.globals');

pvCostMonitor.synth();

const pvProxy = new projen.typescript.TypeScriptAppProject({
  defaultReleaseBranch: 'main',
  name: 'pvProxy',
  parent: pvCostMonitor,
  outdir: 'pvProxy',
  deps: [
    '@mhoc/axios-digest-auth@0.8.0',
    '@types/cors@2.8.13',
    '@types/express@4.17.16',
    'axios@^1',
    'cors@2.8.5',
    'express@4.18.2',
  ],
  // additional scripts for package.json
  scripts: {
    'start-server': 'node src/server.ts',
    'start': 'nodemon --watch src --exec \'ts-node\' src/server.ts',
  },
});
pvProxy.synth();