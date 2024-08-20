import * as aws from "@pulumi/aws";

export function createVpc(name: string) {
    return new aws.ec2.Vpc(name, {
        cidrBlock: "10.0.0.0/16",
        enableDnsHostnames: true,
        enableDnsSupport: true,
        tags: {
            Name: name,
        },
    });
}
