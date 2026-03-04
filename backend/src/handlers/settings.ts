import { APIGatewayProxyEvent, APIGatewayProxyResult } from 'aws-lambda';
import { DynamoDBClient } from '@aws-sdk/client-dynamodb';
import { DynamoDBDocumentClient, GetCommand, PutCommand } from '@aws-sdk/lib-dynamodb';

const client = new DynamoDBClient({});
const docClient = DynamoDBDocumentClient.from(client);

const TABLE_NAME = process.env.SETTINGS_TABLE_NAME || '';

export const getSettings = async (event: APIGatewayProxyEvent): Promise<APIGatewayProxyResult> => {
    try {
        const userId = event.requestContext.authorizer?.claims?.sub;
        if (!userId) {
            return { statusCode: 401, body: JSON.stringify({ error: 'Unauthorized' }) };
        }

        const result = await docClient.send(new GetCommand({
            TableName: TABLE_NAME,
            Key: { userId }
        }));

        // If no settings exist yet, return empty or default struct
        if (!result.Item) {
            return {
                statusCode: 200,
                headers: {
                    'Access-Control-Allow-Origin': '*',
                },
                body: JSON.stringify({ categories: [] })
            };
        }

        return {
            statusCode: 200,
            headers: {
                'Access-Control-Allow-Origin': '*',
            },
            body: JSON.stringify(result.Item)
        };
    } catch (error) {
        console.error('Error fetching settings:', error);
        return {
            statusCode: 500,
            headers: {
                'Access-Control-Allow-Origin': '*',
            },
            body: JSON.stringify({ error: 'Internal Server Error' })
        };
    }
};

export const updateSettings = async (event: APIGatewayProxyEvent): Promise<APIGatewayProxyResult> => {
    try {
        const userId = event.requestContext.authorizer?.claims?.sub;
        if (!userId) {
            return { statusCode: 401, body: JSON.stringify({ error: 'Unauthorized' }) };
        }

        if (!event.body) {
            return { statusCode: 400, body: JSON.stringify({ error: 'Missing body' }) };
        }

        const { categories } = JSON.parse(event.body);

        await docClient.send(new PutCommand({
            TableName: TABLE_NAME,
            Item: {
                userId,
                categories: categories || []
            }
        }));

        return {
            statusCode: 200,
            headers: {
                'Access-Control-Allow-Origin': '*',
            },
            body: JSON.stringify({ message: 'Settings updated successfully', categories })
        };
    } catch (error) {
        console.error('Error updating settings:', error);
        return {
            statusCode: 500,
            headers: {
                'Access-Control-Allow-Origin': '*',
            },
            body: JSON.stringify({ error: 'Internal Server Error' })
        };
    }
};
