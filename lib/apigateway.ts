import { LambdaRestApi } from "aws-cdk-lib/aws-apigateway";
import { IFunction } from "aws-cdk-lib/aws-lambda";
import { Construct } from "constructs";

interface SwnApigatewayProps {
  productMicroservice: IFunction;
  basketMicroservice: IFunction;
  orderMicroservice: IFunction;
}
export class SwnApiGatway extends Construct {
  public readonly ApiGatewayProduct: LambdaRestApi;
  constructor(scope: Construct, id: string, prop: SwnApigatewayProps) {
    super(scope, id);

    this.ApiGatewayProduct = this.createApiGatewayProduct(
      prop.productMicroservice
    );
    this.createApiGatewayBasket(prop.basketMicroservice);
    this.createApiGatewayOrder(prop.orderMicroservice);
  }

  private createApiGatewayProduct(productMicroservice: IFunction) {
    const productApi = new LambdaRestApi(this, "productApi", {
      proxy: false,
      restApiName: "productApi",
      handler: productMicroservice,
    });
    const products = productApi.root.addResource("product"); // /product
    products.addMethod("GET"); // GET /product
    products.addMethod("POST"); // POST /product

    const product = products.addResource("{id}"); // /product/{id}
    product.addMethod("GET");
    product.addMethod("PUT");
    product.addMethod("DELETE");
    return productApi;
  }

  // Basket Api Gateway
  // root name = basket

  //GET /basket
  //POST /basket

  // resource name = basket/{userName}
  // GET /basket/{userName}
  // DELETE /basket/{userName}

  //POST /basket/checkout
  private createApiGatewayBasket(basketMicroservice: IFunction) {
    const basketApi = new LambdaRestApi(this, "basketApi", {
      proxy: false,
      restApiName: "basketApi",
      handler: basketMicroservice,
    });

    const baskets = basketApi.root.addResource("basket"); // /basket
    baskets.addMethod("GET"); // GET /basket
    baskets.addMethod("POST"); // POST /basket

    const basket = baskets.addResource("{userName}"); // /basket/{userName}
    basket.addMethod("GET");
    basket.addMethod("PUT");
    basket.addMethod("DELETE");

    const basketCheckout = baskets.addResource("checkout");
    basketCheckout.addMethod("POST");
    // expect request payload : {username: swn}
  }

  // Order Api Gateway
  // root name = order

  //GET /order
  //GET /order/{userName}
  // expect request : xxx/order/{userName}?orderDate=timestamp
  // because we have Secondary Key(SK)
  private createApiGatewayOrder(orderMicroservice: IFunction) {
    const orderApi = new LambdaRestApi(this, "orderApi", {
      proxy: false,
      restApiName: "orderApi",
      handler: orderMicroservice,
    });

    const orders = orderApi.root.addResource("order"); // /order
    orders.addMethod("GET"); //GET /order

    const order = orders.addResource("{userName}"); // /order/{userName}
    order.addMethod("GET");
  }
}
