const fs = require('fs');
const data = JSON.parse(fs.readFileSync('models_list.json', 'utf8'));

const allModels = data.data || data;

const freeModels = allModels.filter(m => {
    return m.id.includes(':free') || m.id === 'openrouter/free';
});

console.log('Valid Free Models on OpenRouter:');
freeModels.forEach(m => {
    const supportsVision = m.architecture && m.architecture.modality && m.architecture.modality.includes('image');
    console.log(`- ID: ${m.id} | Name: ${m.name} | Vision: ${supportsVision ? 'YES' : 'NO'}`);
});
