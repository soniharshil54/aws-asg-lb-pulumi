import * as aws from "@pulumi/aws";

export function createIamResources(resourceName: (baseName: string) => string) {
    const role = new aws.iam.Role(resourceName("ec2-role"), {
        assumeRolePolicy: aws.iam.assumeRolePolicyForPrincipal({ Service: "ec2.amazonaws.com" }),
        tags: {
            Name: resourceName("ec2-role"),
        },
    });

    new aws.iam.RolePolicyAttachment(resourceName("ssm-policy"), {
        role: role,
        policyArn: "arn:aws:iam::aws:policy/AmazonSSMManagedInstanceCore",
    });

    const instanceProfile = new aws.iam.InstanceProfile(resourceName("instance-profile"), {
        role: role.name,
        tags: {
            Name: resourceName("instance-profile"),
        },
    });

    return instanceProfile;
}
