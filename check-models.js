const https = require('https');
const fs = require('fs');

const env = fs.readFileSync('.env.local', 'utf8');
const match = env.match(/GROQ_API_KEY=(.+)/);
if (!match) {
  console.log("No key");
  process.exit(1);
}
const key = match[1].trim();

const req = https.request('https://api.groq.com/openai/v1/models', {
  headers: { 'Authorization': `Bearer ${key}` }
}, (res) => {
  let data = '';
  res.on('data', c => data += c);
  res.on('end', () => {
    try {
      const parsed = JSON.parse(data);
      console.log("Models:", parsed.data.map(m => m.id).join('\n'));
    } catch(e) {
      console.log(data);
    }
  });
});
req.end();
