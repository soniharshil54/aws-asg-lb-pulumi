import * as aws from "@pulumi/aws";
import { Vpc } from "@pulumi/aws/ec2";

export function createTargetGroup(name: string, vpc: Vpc) {
    return new aws.lb.TargetGroup(name, {
        port: 4010,
        protocol: "HTTP",
        targetType: "instance",
        vpcId: vpc.id,
        healthCheck: {
            path: "/v1/healthcheck",
            port: "4010",  // Ensure the health check uses port 4010
            protocol: "HTTP",
            interval: 30,
            timeout: 5,
            healthyThreshold: 2,
            unhealthyThreshold: 2,
        },
        tags: {
            Name: name,
        },
    });
}
