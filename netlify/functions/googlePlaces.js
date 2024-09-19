const axios = require('axios');

exports.handler = async function(event, context) {
  const { httpMethod, queryStringParameters } = event;
  const API_KEY = process.env.GOOGLE_PLACES_API_KEY;

  if (httpMethod !== 'GET') {
    return { statusCode: 405, body: 'Method Not Allowed' };
  }

  const { action, zipCode, lat, lng, placeId, type, keyword } = queryStringParameters;

  try {
    let url, params;

    if (action === 'geocode') {
      url = 'https://maps.googleapis.com/maps/api/geocode/json';
      params = {
        address: zipCode,
        key: API_KEY
      };
    } else if (action === 'nearbySearch') {
      url = 'https://maps.googleapis.com/maps/api/place/nearbysearch/json';
      params = {
        location: `${lat},${lng}`,
        radius: 5000, // 5km radius
        type: type || 'restaurant',
        keyword: keyword || '',
        key: API_KEY
      };
    }
      else if (action === 'placeDetails') {
      url = 'https://maps.googleapis.com/maps/api/place/details/json';
      params = {
        place_id: placeId,
        fields: 'name,rating,formatted_phone_number,formatted_address,website,reviews,user_ratings_total,price_level',
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
    console.error('Error details:', error);
    return { 
      statusCode: 500, 
      body: JSON.stringify({ 
        error: 'Failed to fetch data',
        details: error.message,
        stack: error.stack
      }) 
    };
  }
};