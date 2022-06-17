import { OAuthScope, UserPool } from "aws-cdk-lib/aws-cognito";
import { Construct } from "constructs";

export class SwnUserPool extends Construct {
  public readonly pool: UserPool;
  constructor(scope: Construct, id: string) {
    super(scope, id);

    this.pool = new UserPool(this, "EcommerceServerlessPool", {
      userPoolName: "EcommerceServerlessPool",
      selfSignUpEnabled: true,
      passwordPolicy: {
        minLength: 8,
        requireLowercase: true,
        requireUppercase: true,
        requireDigits: true,
        requireSymbols: true,
      },
      signInAliases: {
        username: true,
        email: true,
      },
    });
    this.pool.addClient("client", {
      authFlows: {
        adminUserPassword: true,
        custom: true,
        userPassword: true,
        userSrp: true,
      },
      generateSecret: false,
      oAuth: {
        flows: {
          authorizationCodeGrant: true,
        },
        scopes: [OAuthScope.OPENID],
        callbackUrls: ["http://localhost:3000"],
        logoutUrls: ["https://my-app-domain.com/signin"],
      },
    });
  }
}
