import type { Handler } from '@netlify/functions';

const BASE_URL = "https://hianimeapi-1vww.onrender.com";

export const handler: Handler = async (event) => {
  try {
    const { path, q, page } = event.queryStringParameters || {};

    let url = BASE_URL;

    if (path === "search") {
      url += `/search?keyword=${q}&page=${page || 1}`;
    } else if (path === "suggestion") {
      url += `/search/suggest?keyword=${q}`;
    }

    const res = await fetch(url);
    const data = await res.json();

    return {
      statusCode: 200,
      body: JSON.stringify(data),
    };
  } catch (err) {
    return {
      statusCode: 500,
      body: JSON.stringify({ error: "Server error" }),
    };
  }
};
