import * as aws from "@pulumi/aws";
import { Vpc } from "@pulumi/aws/ec2";

export function createSecurityGroups(resourceName: (baseName: string) => string, vpc: Vpc) {
    const albSecurityGroup = new aws.ec2.SecurityGroup(resourceName("alb-sg"), {
        vpcId: vpc.id,
        description: "Allow HTTP and HTTPS access to ALB",
        ingress: [
            {
                protocol: "tcp",
                fromPort: 80,
                toPort: 80,
                cidrBlocks: ["0.0.0.0/0"],
            },
            {
                protocol: "tcp",
                fromPort: 443,
                toPort: 443,
                cidrBlocks: ["0.0.0.0/0"],
            },
        ],
        egress: [
            {
                protocol: "-1",
                fromPort: 0,
                toPort: 0,
                cidrBlocks: ["0.0.0.0/0"],
            },
        ],
        tags: {
            Name: resourceName("alb-sg"),
        },
    });

    const ec2SecurityGroup = new aws.ec2.SecurityGroup(resourceName("ec2-sg"), {
        vpcId: vpc.id,
        description: "Allow HTTP access from ALB",
        ingress: [
            {
                protocol: "tcp",
                fromPort: 80,
                toPort: 80,
                securityGroups: [albSecurityGroup.id],
            },
            {
                protocol: "tcp",
                fromPort: 4010,
                toPort: 4010,
                securityGroups: [albSecurityGroup.id],
            },
            {
                protocol: "tcp",
                fromPort: 22,
                toPort: 22,
                cidrBlocks: [
                    "0.0.0.0/0"
                ],
            }
        ],
        egress: [
            {
                protocol: "-1",
                fromPort: 0,
                toPort: 0,
                cidrBlocks: ["0.0.0.0/0"],
            },
        ],
        tags: {
            Name: resourceName("ec2-sg"),
        },
    });

    return { albSecurityGroup, ec2SecurityGroup };
}
