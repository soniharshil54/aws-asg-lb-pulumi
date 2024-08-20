import * as aws from "@pulumi/aws";
import { Subnet } from "@pulumi/aws/ec2";
import { SecurityGroup } from "@pulumi/aws/ec2";

export function createLoadBalancer(name: string, subnet1: Subnet, subnet2: Subnet, securityGroup: SecurityGroup) {
    return new aws.lb.LoadBalancer(name, {
        securityGroups: [securityGroup.id],
        subnets: [subnet1.id, subnet2.id],
        tags: {
            Name: name,
        },
    });
}
