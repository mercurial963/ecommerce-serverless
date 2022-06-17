import { ITable } from "aws-cdk-lib/aws-dynamodb";
import { Runtime } from "aws-cdk-lib/aws-lambda";
import {
  NodejsFunction,
  NodejsFunctionProps,
} from "aws-cdk-lib/aws-lambda-nodejs";
import { Construct } from "constructs";
import { join } from "path";

interface SwnMicroserviceProps {
  productTable: ITable;
  basketTable: ITable;
  orderTable: ITable;
}
export class SwnMicroservice extends Construct {
  public readonly productMicroservices: NodejsFunction;
  public readonly basketMicroservices: NodejsFunction;
  public readonly orderMicroservices: NodejsFunction;

  constructor(scope: Construct, id: string, prop: SwnMicroserviceProps) {
    super(scope, id);

    this.productMicroservices = this.createProductMicroservices(
      prop.productTable
    );
    this.basketMicroservices = this.createBasketMicroservices(prop.basketTable);
    this.orderMicroservices = this.createOrderMicroservices(prop.orderTable);
  }

  private createProductMicroservices(productTable: ITable): NodejsFunction {
    const productFnProp: NodejsFunctionProps = {
      bundling: {
        externalModules: ["aws-sdk"],
      },
      environment: {
        PRIMARY_KEY: "id",
        DYNAMODB_TABLE_NAME: productTable.tableName,
      },
      runtime: Runtime.NODEJS_14_X,
      entry: join(__dirname, "/../src/product/index.js"),
    };
    const productFn = new NodejsFunction(this, "productFn", {
      ...productFnProp,
    });

    productTable.grantReadWriteData(productFn);
    return productFn;
  }
  private createBasketMicroservices(basketTable: ITable): NodejsFunction {
    const basketFnProp: NodejsFunctionProps = {
      bundling: {
        externalModules: ["aws-sdk"],
      },
      environment: {
        PRIMARY_KEY: "userName",
        DYNAMODB_TABLE_NAME: basketTable.tableName,
        EVENT_SOURCE: "com.swn.basket.checkoutbasket",
        EVENT_DETAILTYPE: "CheckoutBasket",
        EVENT_BUSNAME: "SwnEventBus",
      },
      runtime: Runtime.NODEJS_14_X,
      entry: join(__dirname, "/../src/basket/index.js"),
    };
    const basketFn = new NodejsFunction(this, "basketFn", {
      ...basketFnProp,
    });

    basketTable.grantReadWriteData(basketFn);
    return basketFn;
  }

  private createOrderMicroservices(orderTable: ITable): NodejsFunction {
    const orderFnProp: NodejsFunctionProps = {
      bundling: {
        externalModules: ["aws-sdk"],
      },
      environment: {
        PRIMARY_KEY: "userName",
        SORT_KEY: "orderDate",
        DYNAMODB_TABLE_NAME: orderTable.tableName,
      },
      runtime: Runtime.NODEJS_14_X,
      entry: join(__dirname, "/../src/ordering/index.js"),
    };
    const orderFn = new NodejsFunction(this, "orderFn", {
      ...orderFnProp,
    });

    orderTable.grantReadWriteData(orderFn);
    return orderFn;
  }
}
