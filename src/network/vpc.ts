import * as aws from "@pulumi/aws";

export function createVpc(name: string) {
    const vpc = new aws.ec2.Vpc(name, {
        cidrBlock: "10.0.0.0/16",
        enableDnsHostnames: true,
        enableDnsSupport: true,
        tags: {
            Name: name,
        },
    });

    // Create an Internet Gateway
    const internetGateway = new aws.ec2.InternetGateway(`${name}-igw`, {
        vpcId: vpc.id,
        tags: {
            Name: `${name}-igw`,
        },
    });

    // Create a Route Table
    const routeTable = new aws.ec2.RouteTable(`${name}-route-table`, {
        vpcId: vpc.id,
        routes: [{
            cidrBlock: "0.0.0.0/0",
            gatewayId: internetGateway.id,
        }],
        tags: {
            Name: `${name}-route-table`,
        },
    });

    return { vpc, internetGateway, routeTable };
}
