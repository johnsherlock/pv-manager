import * as path from 'path';
import * as amplify from '@aws-cdk/aws-amplify-alpha';
import * as cdk from 'aws-cdk-lib';
import * as apigateway from 'aws-cdk-lib/aws-apigateway';
import * as codebuild from 'aws-cdk-lib/aws-codebuild';
import * as lambda from 'aws-cdk-lib/aws-lambda';
import { NodejsFunction, SourceMapMode } from 'aws-cdk-lib/aws-lambda-nodejs';
import * as secretsmanager from 'aws-cdk-lib/aws-secretsmanager';
import { Construct } from 'constructs';

export class ApplicationStack extends cdk.Stack {

  readonly amplifyApp: amplify.App;
  readonly restApi: apigateway.RestApi;
  readonly pvProxyLambda: lambda.Function;

  constructor(scope: Construct, id: string, props?: cdk.StackProps) {
    super(scope, id, props);

    this.amplifyApp = this.createAmplifyApp();
    this.restApi = this.createRestApi();
    this.pvProxyLambda = this.createPvMinuteDataHandler();
  }

  private createPvMinuteDataHandler(): lambda.Function {

    const modulePath = path.resolve(process.cwd());
    const lambdaPath = path.join(modulePath, '../pv-proxy/src/myEnergiProxy.ts');

    const myEnergiProxyFunction = new NodejsFunction(this, 'MyEnergiProxy', {
      functionName: 'MyEnergiProxy',
      entry: lambdaPath,
      bundling: {
        externalModules: [],
        minify: false,
        sourceMap: true,
        sourceMapMode: SourceMapMode.INLINE,
        sourcesContent: true,
      },
    });

    const myEnergiSecret = secretsmanager.Secret.fromSecretNameV2(this, 'pvmSecret', 'pvm');

    myEnergiProxyFunction.addEnvironment('MYENERGI_USERNAME', `{{resolve:secretsmanager:${myEnergiSecret.secretArn}:SecretString:myenergi-username}}`);
    myEnergiProxyFunction.addEnvironment('MYENERGI_PASSWORD', `{{resolve:secretsmanager:${myEnergiSecret.secretArn}:SecretString:myenergi-password}}`);

    const pvMinuteDataResource = this.restApi.root.addResource('minute-data');
    pvMinuteDataResource.addMethod('GET', new apigateway.LambdaIntegration(myEnergiProxyFunction));

    return myEnergiProxyFunction;
  }

  private createRestApi(): apigateway.RestApi {

    const api = new apigateway.RestApi(this, 'PV Manager API');

    // Configure the default path to return a 404 response
    const defaultIntegration = new apigateway.MockIntegration({
      integrationResponses: [
        {
          statusCode: '200',
          responseTemplates: {
            'application/json': '{"message": "PV Manager API"}',
          },
        },
      ],
      passthroughBehavior: apigateway.PassthroughBehavior.NEVER,
      requestTemplates: {
        'application/json': '{"statusCode": 404}',
      },
    });

    api.root.addMethod('ANY', defaultIntegration);

    return api;
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
