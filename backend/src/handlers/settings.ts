import { APIGatewayProxyEvent, APIGatewayProxyResult } from 'aws-lambda';
import { DynamoDBClient } from '@aws-sdk/client-dynamodb';
import { DynamoDBDocumentClient, GetCommand, PutCommand } from '@aws-sdk/lib-dynamodb';

const client = new DynamoDBClient({});
const docClient = DynamoDBDocumentClient.from(client);

const TABLE_NAME = process.env.SETTINGS_TABLE_NAME || '';

const createResponse = (statusCode: number, body: any) => ({
    statusCode,
    headers: {
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Credentials': true,
    },
    body: JSON.stringify(body),
});

const getUserId = (event: APIGatewayProxyEvent): string | undefined => {
    return event.requestContext.authorizer?.claims?.sub;
};

export const getSettings = async (event: APIGatewayProxyEvent): Promise<APIGatewayProxyResult> => {
    try {
        const userId = getUserId(event);
        if (!userId) {
            return createResponse(401, { error: 'Unauthorized' });
        }

        const result = await docClient.send(new GetCommand({
            TableName: TABLE_NAME,
            Key: { userId }
        }));

        // If no settings exist yet, return empty or default struct
        if (!result.Item) {
            return createResponse(200, { categories: [] });
        }

        return createResponse(200, result.Item);
    } catch (error) {
        console.error('Error fetching settings:', error);
        return createResponse(500, { error: 'Internal Server Error' });
    }
};

export const updateSettings = async (event: APIGatewayProxyEvent): Promise<APIGatewayProxyResult> => {
    try {
        const userId = getUserId(event);
        if (!userId) {
            return createResponse(401, { error: 'Unauthorized' });
        }

        if (!event.body) {
            return createResponse(400, { error: 'Missing body' });
        }

        const { categories } = JSON.parse(event.body);

        await docClient.send(new PutCommand({
            TableName: TABLE_NAME,
            Item: {
                userId,
                categories: categories || []
            }
        }));

        return createResponse(200, { message: 'Settings updated successfully', categories });
    } catch (error) {
        console.error('Error updating settings:', error);
        return createResponse(500, { error: 'Internal Server Error' });
    }
};
