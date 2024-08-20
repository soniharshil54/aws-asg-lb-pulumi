import * as pulumi from "@pulumi/pulumi";
import * as aws from "@pulumi/aws";

export function createS3Bucket(name: string) {
    const s3Bucket = new aws.s3.Bucket(name, {
        bucket: name,
        acl: "private",
        tags: {
            Name: name,
        },
    });

    const originAccessIdentity = new aws.cloudfront.OriginAccessIdentity(`${name}-oai`, {
        comment: `OAI for ${name}`,
    });

    new aws.s3.BucketPolicy(`${name}-policy`, {
        bucket: s3Bucket.id,
        policy: pulumi.all([s3Bucket.id, originAccessIdentity.iamArn]).apply(([bucketId, iamArn]: [string, string]) => JSON.stringify({
            Version: "2012-10-17",
            Statement: [
                {
                    Effect: "Allow",
                    Principal: {
                        AWS: iamArn,
                    },
                    Action: "s3:GetObject",
                    Resource: `arn:aws:s3:::${bucketId}/*`,
                },
            ],
        })),
    });

    return { s3Bucket, originAccessIdentity };
}
