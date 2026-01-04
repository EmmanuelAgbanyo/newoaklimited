
import fs from 'fs';
const apiKey = 'AIzaSyCdB2NvmHvOqOs8HAYmC1BCHusvQm5KffA';
const url = `https://generativelanguage.googleapis.com/v1beta/models?key=${apiKey}`;

async function check() {
    try {
        const res = await fetch(url);
        const data = await res.json();
        let output = '';
        if (data.models) {
            data.models.forEach(m => {
                if (m.name.includes('gemini')) {
                    output += m.name + '\n';
                }
            });
        } else {
            output = 'No models found: ' + JSON.stringify(data);
        }
        fs.writeFileSync('models_node.txt', output);
    } catch (e) {
        fs.writeFileSync('models_node.txt', 'Error: ' + e.message);
    }
}

check();
