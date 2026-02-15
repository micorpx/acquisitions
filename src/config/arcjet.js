import arcjet, { shield, detectBot, slidingWindow } from '@arcjet/node';

const aj = arcjet({
  key: process.env.ARCJET_KEY,
  rules: [
    shield({ mode: 'LIVE' }),
    detectBot({
      mode: 'LIVE',
      // Allow search engines, preview bots, and development tools
      allow: [
        'CATEGORY:SEARCH_ENGINE', // Google, Bing, etc.
        'CATEGORY:PREVIEW', // Link previews (Slack, Discord, etc.)
        // Development and testing tools
        'POSTMAN', // Postman
        'THUNDERSHEET', // Thunder Client (VS Code)
        'REST CLIENT', // REST Client (VS Code)
        'HTTPIE', // HTTPie
        'INSOMNIA', // Insomnia
        'CURL', // cURL
        'WGET', // wget
        'FETCH', // Node.js fetch
        'NODE', // Node.js HTTP client
        'SUPERTEST', // Jest supertest
        'CHROME', // Chrome browser
        'FIREFOX', // Firefox browser
        'SAFARI', // Safari browser
        'EDGE', // Edge browser
      ],
    }),
    slidingWindow({
      mode: 'LIVE',
      interval: '2s',
      max: 5,
    }),
  ],
});

export default aj;
