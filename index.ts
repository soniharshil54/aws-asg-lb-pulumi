import * as pulumi from "@pulumi/pulumi";
import * as aws from "@pulumi/aws";
import { createVpc } from "./src/network/vpc";
import { createSubnets } from "./src/network/subnets";
import { createSecurityGroups } from "./src/network/securityGroups";
import { createIamResources } from "./src/compute/instanceProfile";
import { createAsg } from "./src/compute/asg";
import { createLoadBalancer } from "./src/network/loadBalancer";
import { createTargetGroup } from "./src/network/targetGroup";
import { createListener } from "./src/network/listener";
import { createS3Bucket } from "./src/storage/s3Bucket";
import { createCloudFrontDistribution } from "./src/network/cloudfront";

// Get project and stack names
const project = pulumi.getProject();
const stack = pulumi.getStack();

// Get the AWS region
const region = aws.config.region || 'eu-west-2'; // Default to eu-west-2 if not set
console.log(`Region: ${region}`);

// Resource name generator
const resourceName = (baseName: string) => `${project}-${stack}-${baseName}`;

// Map of region to availability zones
const regionAzMap: { [key: string]: string[] } = {
    "us-east-1": ["us-east-1a", "us-east-1b"],
    "us-west-2": ["us-west-2a", "us-west-2b"],
    "eu-west-1": ["eu-west-1a", "eu-west-1b"],
    "eu-west-2": ["eu-west-2a", "eu-west-2b"],
    // Add other regions as needed
};

const availabilityZones = regionAzMap[region];

// Create VPC
const vpc = createVpc(resourceName("vpc"));

// Create Subnets
const { publicSubnet1, publicSubnet2 } = createSubnets(resourceName, vpc, availabilityZones);

// Create Security Groups
const { albSecurityGroup, ec2SecurityGroup } = createSecurityGroups(resourceName, vpc);

// Create IAM resources
const instanceProfile = createIamResources(resourceName);

// Create S3 Bucket and Origin Access Identity
const { s3Bucket, originAccessIdentity } = createS3Bucket(resourceName("bucket"));

// Create Load Balancer
const loadBalancer = createLoadBalancer(resourceName("lb"), publicSubnet1, publicSubnet2, albSecurityGroup);

// Create Target Group
const targetGroup = createTargetGroup(resourceName("tg"), vpc);

// Create Auto Scaling Group
const asg = createAsg(resourceName, publicSubnet1, publicSubnet2, ec2SecurityGroup, targetGroup, instanceProfile);

// Create Listener for the Load Balancer
const listener = createListener(resourceName("listener"), loadBalancer, targetGroup);

// Create CloudFront Distribution
const cloudfrontDistribution = createCloudFrontDistribution(resourceName("cf"), s3Bucket, loadBalancer, originAccessIdentity);

// Export Outputs
export const albDnsName = loadBalancer.dnsName;
export const s3BucketName = s3Bucket.bucket;
export const cloudfrontUrl = cloudfrontDistribution.domainName;
