// Pilha CDK (v2) com bucket privado, distribuição CloudFront com OAC e registro alias no Route 53.
// Uso: npx cdk synth DocsStaging && npx cdk diff DocsStaging
import * as cdk from 'aws-cdk-lib';
import { Construct } from 'constructs';
import * as s3 from 'aws-cdk-lib/aws-s3';
import * as cloudfront from 'aws-cdk-lib/aws-cloudfront';
import * as origins from 'aws-cdk-lib/aws-cloudfront-origins';
import * as acm from 'aws-cdk-lib/aws-certificatemanager';
import * as route53 from 'aws-cdk-lib/aws-route53';
import * as targets from 'aws-cdk-lib/aws-route53-targets';

export interface DocsStackProps extends cdk.StackProps {
  /** Domínio público da documentação, por exemplo design.sua-org.com.br */
  dominio: string;
  /** ARN do certificado ACM. Para CloudFront, ele precisa estar em us-east-1. */
  certificadoArn: string;
  /** Id e nome da zona hospedada no Route 53 que contém o domínio */
  zonaId: string;
  zonaNome: string;
}

export class DocsStack extends cdk.Stack {
  constructor(scope: Construct, id: string, props: DocsStackProps) {
    super(scope, id, props);

    const bucket = new s3.Bucket(this, 'DocsBucket', {
      blockPublicAccess: s3.BlockPublicAccess.BLOCK_ALL,
      encryption: s3.BucketEncryption.S3_MANAGED,
      enforceSSL: true,
      removalPolicy: cdk.RemovalPolicy.RETAIN,
    });

    const distribuicao = new cloudfront.Distribution(this, 'DocsDistribution', {
      defaultBehavior: {
        origin: origins.S3BucketOrigin.withOriginAccessControl(bucket),
        viewerProtocolPolicy: cloudfront.ViewerProtocolPolicy.REDIRECT_TO_HTTPS,
        cachePolicy: cloudfront.CachePolicy.CACHING_OPTIMIZED,
      },
      defaultRootObject: 'index.html',
      domainNames: [props.dominio],
      certificate: acm.Certificate.fromCertificateArn(this, 'Certificado', props.certificadoArn),
    });

    new route53.ARecord(this, 'AliasDocs', {
      zone: route53.HostedZone.fromHostedZoneAttributes(this, 'Zona', {
        hostedZoneId: props.zonaId,
        zoneName: props.zonaNome,
      }),
      recordName: props.dominio,
      target: route53.RecordTarget.fromAlias(new targets.CloudFrontTarget(distribuicao)),
    });

    new cdk.CfnOutput(this, 'DistribuicaoId', { value: distribuicao.distributionId });
  }
}

// bin/app.ts (ponto de entrada): uma stack por ambiente, com parâmetros diferentes
// const app = new cdk.App();
// new DocsStack(app, 'DocsStaging', {
//   env: { account: '123456789012', region: 'sa-east-1' },
//   dominio: 'staging.design.sua-org.com.br',
//   certificadoArn: 'arn:aws:acm:us-east-1:123456789012:certificate/EXEMPLO',
//   zonaId: 'Z0EXEMPLO',
//   zonaNome: 'sua-org.com.br',
// });
