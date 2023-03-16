import * as amplify from '@aws-cdk/aws-amplify-alpha';
import * as cdk from 'aws-cdk-lib';
import * as codebuild from 'aws-cdk-lib/aws-codebuild';
import * as lambda from 'aws-cdk-lib/aws-lambda';
import { NodejsFunction, SourceMapMode } from 'aws-cdk-lib/aws-lambda-nodejs';
import { Construct } from 'constructs';

export class ApplicationStack extends cdk.Stack {

  readonly amplifyApp: amplify.App;
  readonly pvProxyLambda: lambda.Function;

  constructor(scope: Construct, id: string, props?: cdk.StackProps) {
    super(scope, id, props);

    this.amplifyApp = this.createAmplifyApp();
    this.pvProxyLambda = this.createPvProxyLambda();

  }

  private createPvProxyLambda(): lambda.Function {
    return new NodejsFunction(this, 'MyEnergiProxy', {
      functionName: 'MyEnergiProxy',
      entry: __dirname + '../../pv-proxy/src/myEnergiProxy.ts',
      bundling: {
        externalModules: [],
        minify: false,
        sourceMap: true,
        sourceMapMode: SourceMapMode.INLINE,
        sourcesContent: true,
      },
      environment: {
        MYENERGI_USERNAME: cdk.SecretValue.secretsManager('pvm', {
          jsonField: 'myenergi-username',
        }).toString(),
        MYENERGI_PASSWORD: cdk.SecretValue.secretsManager('pvm', {
          jsonField: 'myenergi-password',
        }).toString(),
      },
    });
  }

  private createAmplifyApp(): amplify.App {

    const amplifyApp = new amplify.App(this, 'pv-manager ', {
      sourceCodeProvider: new amplify.GitHubSourceCodeProvider({
        owner: 'johnsherlock',
        repository: 'pv-manager',
        oauthToken: cdk.SecretValue.secretsManager('pvm', {
          jsonField: 'github-token',
        }),
      }),
      buildSpec: this.createBuildSpec(),
    });
    amplifyApp.addBranch('main');

    return amplifyApp;
  }

  private createBuildSpec(): codebuild.BuildSpec {
    return codebuild.BuildSpec.fromObjectToYaml({
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
          baseDirectory: 'build',
          files:
          - '**/*',
        },
        cache: {
          paths:
          - 'node_modules/**/*',
        },
      },
    });
  }
}
