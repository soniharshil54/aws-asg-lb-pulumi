import * as aws from "@pulumi/aws";
import { Vpc } from "@pulumi/aws/ec2";

export function createSubnets(resourceName: (baseName: string) => string, vpc: Vpc, availabilityZones: string[]) {
    const publicSubnet1 = new aws.ec2.Subnet(resourceName("subnet-1"), {
        vpcId: vpc.id,
        cidrBlock: "10.0.1.0/24",
        availabilityZone: availabilityZones[0], // Use the first AZ from the map
        tags: {
            Name: resourceName("subnet-1"),
        },
    });

    const publicSubnet2 = new aws.ec2.Subnet(resourceName("subnet-2"), {
        vpcId: vpc.id,
        cidrBlock: "10.0.2.0/24",
        availabilityZone: availabilityZones[1], // Use the second AZ from the map
        tags: {
            Name: resourceName("subnet-2"),
        },
    });

    return { publicSubnet1, publicSubnet2 };
}
