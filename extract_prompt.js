const fs = require('fs');
const lines = fs.readFileSync('C:\\Users\\Mahaj\\.gemini\\antigravity-ide\\brain\\38e51318-e687-4746-a91a-8005991ed511\\.system_generated\\logs\\transcript_full.jsonl', 'utf-8').split('\n');
const userInputs = lines.filter(l => l.includes('"type":"USER_INPUT"'));

// Find the input that contains the massive spec (it probably has "VELOOP Rewards" and "Frontend Development Task")
let target = null;
for (const line of userInputs) {
    if (line.includes('VELOOP Rewards') && line.includes('Frontend Development Task')) {
        target = line;
        break;
    }
}

if (target) {
    const content = JSON.parse(target).content;
    fs.writeFileSync('C:\\Users\\Mahaj\\Desktop\\VEloop\\original_spec.txt', content);
    console.log('Spec written to original_spec.txt. Length: ' + content.length);
} else {
    console.log('Original spec not found in transcript.');
}
