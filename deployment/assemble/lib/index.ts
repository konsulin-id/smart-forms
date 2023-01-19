import {
  AwsLogDriver,
  Cluster,
  Compatibility,
  ContainerImage,
  FargateService,
  TaskDefinition
} from 'aws-cdk-lib/aws-ecs';
import { RetentionDays } from 'aws-cdk-lib/aws-logs';
import { Construct } from 'constructs';

export interface AssembleProps {
  cluster: Cluster;
}

export class Assemble extends Construct {
  containerName = 'assemble';
  containerPort = 3002;
  service: FargateService;

  constructor(scope: Construct, id: string, { cluster }: AssembleProps) {
    super(scope, id);

    // Create a task definition that contains both the application and cache containers.
    const taskDefinition = new TaskDefinition(this, 'SmartFormsAssembleTaskDefinition', {
      compatibility: Compatibility.FARGATE,
      cpu: '256',
      memoryMiB: '512'
    });

    // Create the cache container.
    taskDefinition.addContainer('SmartFormsAssembleContainer', {
      containerName: this.containerName,
      image: ContainerImage.fromRegistry('aehrc/smart-forms-assemble:latest'),
      portMappings: [{ containerPort: this.containerPort }],
      logging: AwsLogDriver.awsLogs({
        streamPrefix: 'smart-forms-assemble',
        logRetention: RetentionDays.ONE_MONTH
      })
    });

    this.service = new FargateService(this, 'SmartFormsAssembleService', {
      cluster,
      taskDefinition
    });
  }
}