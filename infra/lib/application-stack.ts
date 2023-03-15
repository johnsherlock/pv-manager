import * as amplify from '@aws-cdk/aws-amplify-alpha';
import * as cdk from 'aws-cdk-lib';
import * as codebuild from 'aws-cdk-lib/aws-codebuild';
import { Construct } from 'constructs';

export class ApplicationStack extends cdk.Stack {
  constructor(scope: Construct, id: string, props?: cdk.StackProps) {
    super(scope, id, props);

    const amplifyApp = new amplify.App(this, 'pv-manager ', {
      sourceCodeProvider: new amplify.GitHubSourceCodeProvider({
        owner: 'johnsherlock',
        repository: 'pv-manager',
        oauthToken: cdk.SecretValue.secretsManager('pvm', {
          jsonField: 'github-token',
        }),
      }),
      buildSpec: codebuild.BuildSpec.fromObjectToYaml({
        version: '1.0',
        frontend: {
          phases: {
            preBuild: {
              commands: [
                'npm ci',
              ],
            },
            build: {
              commands: [
                'npm run build',
              ],
            },
          },
          artifacts: {
            baseDirectory: 'src',
            files:
              - '**/*',
          },
          cache: {
            paths:
              - 'node_modules/**/*',
          },
        },
      }),
    });
    const mainBranch = amplifyApp.addBranch('main');
  }
}
