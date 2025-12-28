import fetch from 'node-fetch';

// Get the API key from environment variables
const API_KEY = process.env.API_KEY || 'AIzaSyC31-FSELr9miVuUa-IvTUagClGdqmxdp0';

async function listModels() {
  try {
    const response = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models?key=${API_KEY}`,
      {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json'
        }
      }
    );

    const data = await response.json();
    
    if (data.models) {
      console.log('Available models:');
      data.models.forEach(model => {
        console.log(`- ${model.name}`);
        if (model.supportedGenerationMethods) {
          console.log(`  Supported methods: ${model.supportedGenerationMethods.join(', ')}`);
        }
      });
    } else {
      console.error('Error:', data);
    }
  } catch (error) {
    console.error('Error fetching models:', error);
  }
}

listModels();