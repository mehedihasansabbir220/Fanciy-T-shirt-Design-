import { Order } from "@framework/types";
import { generateNanoId } from "../utils";
import { ddbDocClient } from "./libs/ddbClient";
import { getTableName } from "./libs/getTableName";

const TABLE_NAME = getTableName("Orders");

export async function putOrder(order: Order) {
  const data = await ddbDocClient.put({
    TableName: TABLE_NAME,
    Item: order,
  });
  console.log("putOrder response:", data);
  return data;
}

export async function getOrderById(orderId: string) {
  console.log("getOrderById", orderId);
  const response = await ddbDocClient.get({
    TableName: TABLE_NAME,
    Key: {
      id: orderId,
    },
  });
  console.log("ddb get response:", response);
  return response.Item as Order | undefined;
}

export async function getUniqueOrderId() {
  console.log("getUniqueOrderId");
  const orderId = await generateNanoId();
  const existingOrder = await getOrderById(orderId);

  if (existingOrder) {
    console.log(
      `A document for the generated order id  ${orderId} exists already`
    );
    return orderId;
  } else {
    console.log(
      `No document for the generated order id  ${orderId} exists, returning it.`
    );
    return orderId;
  }
}
