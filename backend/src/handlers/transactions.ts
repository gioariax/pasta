import { APIGatewayProxyEvent, APIGatewayProxyResult } from 'aws-lambda';
import { DynamoDBClient } from '@aws-sdk/client-dynamodb';
import { DynamoDBDocumentClient, PutCommand, QueryCommand, DeleteCommand } from '@aws-sdk/lib-dynamodb';
import { v4 as uuidv4 } from 'uuid';

const client = new DynamoDBClient({});
const docClient = DynamoDBDocumentClient.from(client);

const TABLE_NAME = process.env.TABLE_NAME;

const createResponse = (statusCode: number, body: any) => ({
    statusCode,
    headers: {
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Credentials': true,
    },
    body: JSON.stringify(body),
});

const getUserId = (event: APIGatewayProxyEvent): string => {
    // Expected to be called with Cognito Authorizer
    return event.requestContext.authorizer?.claims?.sub || 'test-user';
};

export const getTransactions = async (event: APIGatewayProxyEvent): Promise<APIGatewayProxyResult> => {
    try {
        const userId = getUserId(event);
        const { Items } = await docClient.send(new QueryCommand({
            TableName: TABLE_NAME,
            KeyConditionExpression: 'userId = :userId',
            ExpressionAttributeValues: {
                ':userId': userId,
            },
            ScanIndexForward: false, // newest first if SK is timestamp-based
        }));

        return createResponse(200, { transactions: Items });
    } catch (err) {
        console.error(err);
        return createResponse(500, { message: 'Internal Server Error' });
    }
};

export const createTransaction = async (event: APIGatewayProxyEvent): Promise<APIGatewayProxyResult> => {
    try {
        const userId = getUserId(event);
        if (!event.body) {
            return createResponse(400, { message: 'Missing request body' });
        }

        const data = JSON.parse(event.body);
        const transactionId = new Date().toISOString() + '_' + uuidv4();

        const item = {
            userId,
            transactionId,
            amount: data.amount,
            type: data.type, // 'income' or 'expense'
            category: data.category,
            description: data.description,
            date: data.date || new Date().toISOString(),
        };

        await docClient.send(new PutCommand({
            TableName: TABLE_NAME,
            Item: item,
        }));

        return createResponse(201, item);
    } catch (err) {
        console.error(err);
        return createResponse(500, { message: 'Internal Server Error' });
    }
};

export const updateTransaction = async (event: APIGatewayProxyEvent): Promise<APIGatewayProxyResult> => {
    try {
        const userId = getUserId(event);
        const transactionId = event.pathParameters?.id;

        if (!event.body || !transactionId) {
            return createResponse(400, { message: 'Missing request body or transaction ID' });
        }

        const data = JSON.parse(event.body);

        const item = {
            userId,
            transactionId,
            amount: data.amount,
            type: data.type,
            category: data.category,
            description: data.description,
            date: data.date,
        };

        await docClient.send(new PutCommand({
            TableName: TABLE_NAME,
            Item: item,
        }));

        return createResponse(200, item);
    } catch (err) {
        console.error(err);
        return createResponse(500, { message: 'Internal Server Error' });
    }
};

export const deleteTransaction = async (event: APIGatewayProxyEvent): Promise<APIGatewayProxyResult> => {
    try {
        const userId = getUserId(event);
        const transactionId = event.pathParameters?.id;

        if (!transactionId) {
            return createResponse(400, { message: 'Missing transaction ID' });
        }

        await docClient.send(new DeleteCommand({
            TableName: TABLE_NAME,
            Key: {
                userId,
                transactionId,
            }
        }));

        return createResponse(200, { message: 'Transaction deleted successfully' });
    } catch (err) {
        console.error(err);
        return createResponse(500, { message: 'Internal Server Error' });
    }
};
