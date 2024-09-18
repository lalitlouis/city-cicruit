const axios = require('axios');

exports.handler = async function(event, context) {
  const { httpMethod, queryStringParameters } = event;
  const API_KEY = process.env.GOOGLE_PLACES_API_KEY;

  if (httpMethod !== 'GET') {
    return { statusCode: 405, body: 'Method Not Allowed' };
  }

  const { action, zipCode, placeId } = queryStringParameters;

  try {
    let url, params;

    if (action === 'nearbySearch') {
      url = 'https://maps.googleapis.com/maps/api/place/textsearch/json';
      params = {
        query: `restaurants in ${zipCode}`,
        key: API_KEY
      };
    } else if (action === 'placeDetails') {
      url = 'https://maps.googleapis.com/maps/api/place/details/json';
      params = {
        place_id: placeId,
        fields: 'name,rating,formatted_phone_number,website,reviews,user_ratings_total,price_level,formatted_address',
        key: API_KEY
      };
    } else {
      return { statusCode: 400, body: 'Invalid action' };
    }

    const response = await axios.get(url, { params });
    return {
      statusCode: 200,
      body: JSON.stringify(response.data)
    };
  } catch (error) {
    return { statusCode: 500, body: JSON.stringify({ error: 'Failed to fetch data' }) };
  }
};