import * as aws from "@pulumi/aws";
import { Subnet } from "@pulumi/aws/ec2";
import { SecurityGroup } from "@pulumi/aws/ec2";
import { TargetGroup } from "@pulumi/aws/lb";
import { InstanceProfile } from "@pulumi/aws/iam";

export function createAsg(
    resourceName: (baseName: string) => string,
    publicSubnet1: Subnet,
    publicSubnet2: Subnet,
    ec2SecurityGroup: SecurityGroup,
    targetGroup: TargetGroup,
    instanceProfile: InstanceProfile
) {
    const ami = aws.ec2.getAmi({
        filters: [
            { name: "name", values: ["ubuntu/images/hvm-ssd/ubuntu-focal-20.04-amd64-server-*"] },
            { name: "virtualization-type", values: ["hvm"] },
        ],
        owners: ["099720109477"],
        mostRecent: true,
    });

    const launchConfig = new aws.ec2.LaunchConfiguration(resourceName("launch-config"), {
        imageId: ami.then(ami => ami.id),
        instanceType: "t3.micro",
        securityGroups: [ec2SecurityGroup.id],
        iamInstanceProfile: instanceProfile.name,
        userData: `#!/bin/bash
        {
            sudo apt update -y
            sudo apt install -y git

            curl -fsSL https://deb.nodesource.com/setup_18.x | sudo -E bash -
            sudo apt-get install -y nodejs

            git clone https://github.com/soniharshil54/get-client-ip-node.git /home/ubuntu/get-client-ip-node
            cd /home/ubuntu/get-client-ip-node
            pwd
            ls
            npm install
            sudo npm install -g pm2
            npm run start:prod
        } &>> /var/log/startup-script.log`,
    });

    return new aws.autoscaling.Group(resourceName("asg"), {
        vpcZoneIdentifiers: [publicSubnet1.id, publicSubnet2.id],
        launchConfiguration: launchConfig.id,
        desiredCapacity: 2,
        minSize: 2,
        maxSize: 4,
        targetGroupArns: [targetGroup.arn],
        tags: [
            {
                key: "Name",
                value: resourceName("asg-instance"),
                propagateAtLaunch: true,
            },
        ],
    });
}
