import { RemovalPolicy, Stack } from "aws-cdk-lib";
import {
  AttributeType,
  BillingMode,
  ITable,
  Table,
} from "aws-cdk-lib/aws-dynamodb";
import { Construct } from "constructs";

export class SwnDatabase extends Construct {
  public readonly productTable: ITable;
  public readonly basketTable: ITable;
  public readonly orderTable: ITable;

  constructor(scope: Construct, id: string) {
    super(scope, id);
    this.productTable = this.createProductTable();

    this.basketTable = this.createBasketTable();
    this.orderTable = this.createOrderTable();
  }

  // product: PK: id -- name -description - imageFile - price - category
  private createProductTable(): ITable {
    const productTable = new Table(this, "productTable", {
      partitionKey: { name: "id", type: AttributeType.STRING },
      billingMode: BillingMode.PAY_PER_REQUEST,
      tableName: "product",
      removalPolicy: RemovalPolicy.DESTROY,
    });
    return productTable;
  }

  // basket : PK: Username -- items (SET-MAP object)
  // item1 - {quantity - color - price -  productId - productName}
  // item2 - {quantity - color - price -  productId - productName}
  private createBasketTable(): ITable {
    const basketTable = new Table(this, "basketTable", {
      partitionKey: { name: "userName", type: AttributeType.STRING },
      billingMode: BillingMode.PAY_PER_REQUEST,
      tableName: "basket",
      removalPolicy: RemovalPolicy.DESTROY,
    });
    return basketTable;
  }

  // Order PK: userName - SK: Orderdate -- totalPrice - firstName - lastname - email - address - paymentMethod - cardInfo
  private createOrderTable(): ITable {
    const orderTable = new Table(this, "orderTable", {
      partitionKey: { name: "userName", type: AttributeType.STRING },
      sortKey: { name: "orderDate", type: AttributeType.STRING },
      billingMode: BillingMode.PAY_PER_REQUEST,
      tableName: "order",
      removalPolicy: RemovalPolicy.DESTROY,
    });
    return orderTable;
  }
}
