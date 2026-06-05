const fs = require('fs');
const data = JSON.parse(fs.readFileSync('models_list.json', 'utf8'));

const freeVisionModels = data.filter(m => {
    const isFree = m.id.endsWith(':free') || m.id === 'openrouter/free';
    const hasVision = m.architecture && m.architecture.modality && m.architecture.modality.includes('image');
    return isFree && hasVision;
});

console.log('Free Vision Models:');
freeVisionModels.forEach(m => {
    console.log(`- ${m.id} (${m.name})`);
});
