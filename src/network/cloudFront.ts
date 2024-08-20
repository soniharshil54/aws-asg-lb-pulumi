import * as aws from "@pulumi/aws";
import { Bucket } from "@pulumi/aws/s3";
import { LoadBalancer } from "@pulumi/aws/lb";

export function createCloudFrontDistribution(name: string, s3Bucket: Bucket, loadBalancer: LoadBalancer) {
    const originAccessIdentity = new aws.cloudfront.OriginAccessIdentity(`${name}-oai`, {
        comment: `OAI for ${name}`,
    });

    new aws.s3.BucketPolicy(`${name}-policy`, {
        bucket: s3Bucket.id,
        policy: s3Bucket.id.apply(bucketName => JSON.stringify({
            Version: "2012-10-17",
            Statement: [
                {
                    Effect: "Allow",
                    Principal: {
                        AWS: originAccessIdentity.iamArn,
                    },
                    Action: "s3:GetObject",
                    Resource: `arn:aws:s3:::${bucketName}/*`,
                },
            ],
        })),
    });

    return new aws.cloudfront.Distribution(name, {
        enabled: true,
        restrictions: {
            geoRestriction: {
                restrictionType: "none",
            },
        },
        origins: [
            {
                domainName: s3Bucket.bucketRegionalDomainName,
                originId: "s3Origin",
                s3OriginConfig: {
                    originAccessIdentity: originAccessIdentity.cloudfrontAccessIdentityPath,
                },
            },
            {
                domainName: loadBalancer.dnsName,
                originId: "albOrigin",
                customOriginConfig: {
                    originProtocolPolicy: "http-only",
                    httpPort: 80,
                    httpsPort: 443,
                    originSslProtocols: ["TLSv1.2"],
                },
            },
        ],
        defaultRootObject: "index.html",
        defaultCacheBehavior: {
            targetOriginId: "s3Origin",
            viewerProtocolPolicy: "redirect-to-https",
            allowedMethods: ["GET", "HEAD", "OPTIONS"],
            cachedMethods: ["GET", "HEAD"],
            forwardedValues: {
                queryString: false,
                cookies: {
                    forward: "none",
                },
            },
        },
        orderedCacheBehaviors: [
            {
                pathPattern: "/v1/*",
                targetOriginId: "albOrigin",
                viewerProtocolPolicy: "redirect-to-https",
                allowedMethods: ["GET", "HEAD"],
                cachedMethods: ["GET", "HEAD"],
            },
        ],
        viewerCertificate: {
            cloudfrontDefaultCertificate: true,
        },
    });
}
