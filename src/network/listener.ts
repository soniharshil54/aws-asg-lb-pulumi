import * as aws from "@pulumi/aws";
import { LoadBalancer } from "@pulumi/aws/lb";
import { TargetGroup } from "@pulumi/aws/lb";

export function createListener(name: string, loadBalancer: LoadBalancer, targetGroup: TargetGroup) {
    return new aws.lb.Listener(name, {
        loadBalancerArn: loadBalancer.arn,
        port: 80,
        protocol: "HTTP",
        defaultActions: [
            {
                type: "forward",
                targetGroupArn: targetGroup.arn,
            },
        ],
    });
}
