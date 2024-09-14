// src/network/nlbListener.ts
import * as aws from "@pulumi/aws";
import { LoadBalancer } from "@pulumi/aws/lb";
import { TargetGroup } from "@pulumi/aws/lb";

export function createNlbListener(name: string, loadBalancer: LoadBalancer, targetGroup: TargetGroup) {
    return new aws.lb.Listener(name, {
        loadBalancerArn: loadBalancer.arn,
        port: 80,
        protocol: "TCP",
        defaultActions: [
            {
                type: "forward",
                targetGroupArn: targetGroup.arn,
            },
        ],
    });
}
