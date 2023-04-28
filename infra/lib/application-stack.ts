import * as path from 'path';
import * as amplify from '@aws-cdk/aws-amplify-alpha';
import * as cdk from 'aws-cdk-lib';
import * as apigateway from 'aws-cdk-lib/aws-apigateway';
import * as codebuild from 'aws-cdk-lib/aws-codebuild';
import * as dynamodb from 'aws-cdk-lib/aws-dynamodb';
import * as lambda from 'aws-cdk-lib/aws-lambda';
import { NodejsFunction, SourceMapMode } from 'aws-cdk-lib/aws-lambda-nodejs';
import * as s3 from 'aws-cdk-lib/aws-s3';
import * as secretsmanager from 'aws-cdk-lib/aws-secretsmanager';
import { Construct } from 'constructs';

export class ApplicationStack extends cdk.Stack {

  readonly amplifyApp: amplify.App;
  readonly restApi: apigateway.RestApi;
  readonly pvProxyLambda: lambda.Function;
  readonly myEnergiDailyBackupLambda: lambda.Function;
  readonly bootstrapHistoricalDataLambda: lambda.Function;
  readonly myEnergiDailyBackupTable: dynamodb.Table;
  readonly myEnergiDailyBackupBucket: s3.Bucket;

  constructor(scope: Construct, id: string, props?: cdk.StackProps) {
    super(scope, id, props);

    const myEnergiSecret: secretsmanager.ISecret = secretsmanager.Secret.fromSecretNameV2(this, 'pvmSecret', 'pvm');
    const eddiDataBackupTableName = 'eddi-data';
    const eddiDataBackupBucketName = 'historical-eddi-data';

    this.amplifyApp = this.createAmplifyApp();
    this.restApi = this.createRestApi();
    this.pvProxyLambda = this.createPvMinuteDataHandler(myEnergiSecret);
    this.myEnergiDailyBackupLambda = this.createMyEnergiDailyBackupHandler(myEnergiSecret, eddiDataBackupTableName, eddiDataBackupBucketName);
    this.bootstrapHistoricalDataLambda = this.createBootstrapHistoricalDataHandler();
    this.myEnergiDailyBackupTable = this.createDailyBackupDynamoDbTable(eddiDataBackupTableName);
    this.myEnergiDailyBackupBucket = this.createDailyBackupBucket(eddiDataBackupBucketName);

    this.myEnergiDailyBackupTable.grantReadWriteData(this.myEnergiDailyBackupLambda);
    this.myEnergiDailyBackupBucket.grantReadWrite(this.myEnergiDailyBackupLambda);
    this.myEnergiDailyBackupLambda.grantInvoke(this.bootstrapHistoricalDataLambda);
  }

  private createPvMinuteDataHandler(myEnergiSecret: secretsmanager.ISecret): lambda.Function {

    const modulePath = path.resolve(process.cwd());
    const lambdaPath = path.join(modulePath, '../pv-proxy/src/my-energi-proxy.ts');

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

    myEnergiProxyFunction.addEnvironment('MYENERGI_USERNAME', `{{resolve:secretsmanager:${myEnergiSecret.secretArn}:SecretString:myenergi-username}}`);
    myEnergiProxyFunction.addEnvironment('MYENERGI_PASSWORD', `{{resolve:secretsmanager:${myEnergiSecret.secretArn}:SecretString:myenergi-password}}`);

    const pvMinuteDataResource = this.restApi.root.addResource('minute-data');
    pvMinuteDataResource.addMethod('GET', new apigateway.LambdaIntegration(myEnergiProxyFunction));

    return myEnergiProxyFunction;
  }

  private createMyEnergiDailyBackupHandler(myEnergiSecret: secretsmanager.ISecret, tableName: string, bucketName: string): lambda.Function {

    const modulePath = path.resolve(process.cwd());
    const lambdaPath = path.join(modulePath, '../pv-proxy/src/my-energi-daily-backup.ts');

    const myEnergiDailyBackupFunction = new NodejsFunction(this, 'MyEnergiDailyBackup', {
      functionName: 'MyEnergiDailyBackup',
      entry: lambdaPath,
      bundling: {
        externalModules: [],
        minify: false,
        sourceMap: true,
        sourceMapMode: SourceMapMode.INLINE,
        sourcesContent: true,
      },
      timeout: cdk.Duration.seconds(30),
    });

    myEnergiDailyBackupFunction.addEnvironment('MYENERGI_USERNAME', `{{resolve:secretsmanager:${myEnergiSecret.secretArn}:SecretString:myenergi-username}}`);
    myEnergiDailyBackupFunction.addEnvironment('MYENERGI_PASSWORD', `{{resolve:secretsmanager:${myEnergiSecret.secretArn}:SecretString:myenergi-password}}`);
    myEnergiDailyBackupFunction.addEnvironment('EDDI_DATA_TABLE_NAME', tableName);
    myEnergiDailyBackupFunction.addEnvironment('EDDI_DATA_BUCKET_NAME', bucketName);

    const pvMinuteDataResource = this.restApi.root.addResource('backup-eddi-data');
    pvMinuteDataResource.addMethod('GET', new apigateway.LambdaIntegration(myEnergiDailyBackupFunction));

    return myEnergiDailyBackupFunction;
  }

  private createBootstrapHistoricalDataHandler(): lambda.Function {

    const modulePath = path.resolve(process.cwd());
    const lambdaPath = path.join(modulePath, '../pv-proxy/src/bootstrap-historical-data.ts');

    const bootstrapHistoricalDataFunction = new NodejsFunction(this, 'BootstrapHistoricalData', {
      functionName: 'BootstrapHistoricalData',
      entry: lambdaPath,
      bundling: {
        externalModules: [],
        minify: false,
        sourceMap: true,
        sourceMapMode: SourceMapMode.INLINE,
        sourcesContent: true,
      },
      timeout: cdk.Duration.seconds(30),
    });

    const pvMinuteDataResource = this.restApi.root.addResource('bootstrap-historical-data');
    pvMinuteDataResource.addMethod('GET', new apigateway.LambdaIntegration(bootstrapHistoricalDataFunction));

    return bootstrapHistoricalDataFunction;
  }

  private createDailyBackupDynamoDbTable(tableName: string): dynamodb.Table {
    const table = new dynamodb.Table(this, 'Eddi-Data', {
      tableName,
      partitionKey: { name: 'serialNumber', type: dynamodb.AttributeType.STRING },
      sortKey: { name: 'date', type: dynamodb.AttributeType.STRING },
      billingMode: dynamodb.BillingMode.PAY_PER_REQUEST,
    });
    return table;
  }

  private createDailyBackupBucket(bucketName: string): s3.Bucket {
    const bucket = new s3.Bucket(this, 'Eddi-Backup', {
      bucketName,
      removalPolicy: cdk.RemovalPolicy.DESTROY,
      autoDeleteObjects: true,
    });
    return bucket;
  }

  private createRestApi(): apigateway.RestApi {

    const domain = `https://${this.amplifyApp.defaultDomain}`;

    const api = new apigateway.RestApi(this, 'PV Manager API', {
      defaultCorsPreflightOptions: {
        allowOrigins: ['*'],
        allowMethods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
        allowHeaders: ['Content-Type', 'X-Amz-Date', 'Authorization', 'X-Api-Key'],
      },
    });

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
    const main = amplifyApp.addBranch('main');

    const domain = amplifyApp.addDomain('solar-stats.com', {
      enableAutoSubdomain: true, // in case subdomains should be auto registered for branches
      autoSubdomainCreationPatterns: ['*', 'pr*'], // regex for branches that should auto register subdomains
    });
    domain.mapRoot(main); // map main branch to domain root
    domain.mapSubDomain(main, 'www');

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
          files: [
            '**/*',
          ],
        },
        cache: {
          paths: [
            'node_modules/**/*',
          ],
        },
      },
    });
  }
}
