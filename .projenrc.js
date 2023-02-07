const { web } = require('projen');
const { TypeScriptAppProject } = require('projen/lib/typescript');

const pvCostMonitor = new web.ReactTypeScriptProject({
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
    'react@^18',
    'react-chartjs-2@^5',
    'react-datepicker@^4', // for css
  ],
  // description: undefined,  /* The description is just a string that helps people understand the purpose of the package. */
  /* Build dependencies for this module. */
  devDeps: [
  ],
  // packageName: undefined,  /* The name in package.json. */
});

pvCostMonitor.tsconfigDev.addInclude('pvProxy');
pvCostMonitor.tsconfigDev.addInclude('pvProxy/src/**/*.ts');

pvCostMonitor.synth();

const pvProxy = new TypeScriptAppProject({
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