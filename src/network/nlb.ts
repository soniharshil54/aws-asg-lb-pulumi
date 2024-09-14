// src/network/nlb.ts
import * as aws from "@pulumi/aws";
import { Subnet } from "@pulumi/aws/ec2";
import { SecurityGroup } from "@pulumi/aws/ec2";

export function createNetworkLoadBalancer(name: string, subnet1: Subnet, subnet2: Subnet, securityGroup: SecurityGroup) {
    return new aws.lb.LoadBalancer(name, {
        name: name,
        securityGroups: [securityGroup.id],
        internal: false, // Set to true if you want an internal NLB
        loadBalancerType: "network",
        subnets: [subnet1.id, subnet2.id],
        tags: {
            Name: name,
        },
    });
}
