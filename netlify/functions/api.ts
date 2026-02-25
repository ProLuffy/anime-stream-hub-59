// /netlify/functions/api.ts

const API_BASE = "https://hianimeapi-1vww.onrender.com/api/v1";

export const handler = async (event: any) => {
  try {
    const endpoint = event.queryStringParameters?.endpoint;

    if (!endpoint) {
      return {
        statusCode: 400,
        body: JSON.stringify({ error: "Missing endpoint" }),
      };
    }

    const response = await fetch(`${API_BASE}${endpoint}`, {
      headers: {
        Accept: "application/json",
      },
    });

    if (!response.ok) {
      return {
        statusCode: response.status,
        body: JSON.stringify({ error: "API failed" }),
      };
    }

    const data = await response.text();

    return {
      statusCode: 200,
      headers: {
        "Content-Type": "application/json",
        "Cache-Control": "public, max-age=300",
      },
      body: data,
    };
  } catch (error: any) {
    return {
      statusCode: 500,
      body: JSON.stringify({ error: "Server error" }),
    };
  }
};
