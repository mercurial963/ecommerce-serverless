import { Stack, StackProps } from "aws-cdk-lib";
import { Construct } from "constructs";
import { SwnApiGatway } from "./apigateway";
import { SwnUserPool } from "./auth";
import { SwnDatabase } from "./database";
import { SwnEventBus } from "./eventbus";
import { SwnMicroservice } from "./microservice";
import { SwnQueue } from "./queue";

export class EcommerceServerlessStack extends Stack {
  private userpool: SwnUserPool;
  constructor(scope: Construct, id: string, props?: StackProps) {
    super(scope, id, props);

    const database = new SwnDatabase(this, "Database");

    const microservice = new SwnMicroservice(this, "Microservices", {
      productTable: database.productTable,
      basketTable: database.basketTable,
      orderTable: database.orderTable,
    });
    this.userpool = new SwnUserPool(this, "UserPool");

    const apigateway = new SwnApiGatway(this, "ApiGateway", {
      productMicroservice: microservice.productMicroservices,
      basketMicroservice: microservice.basketMicroservices,
      orderMicroservice: microservice.orderMicroservices,
      userpool: this.userpool.pool,
    });
    const queue = new SwnQueue(this, "OrderQueue", {
      consumer: microservice.orderMicroservices,
    });
    new SwnEventBus(this, "EventBus", {
      publisherFunction: microservice.basketMicroservices,
      targetQueue: queue.orderQueue,
    });
  }
}
