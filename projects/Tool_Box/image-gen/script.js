(function() {

const DOM = {};
['provider','apiKey','saveKeyBtn','testKeyBtn','keyHint','endpointField','customEndpoint','model','refreshModelsBtn','customModel','modelCustomField','count','size','customSizeField','customW','customH','qualityField','quality','styleField','style','watermarkField','watermarkEnabled','prompt','negativePrompt','negativeField','generateBtn','codeToggleBtn','codeContent','codeDisplay','copyCodeBtn','resultSection','resultGrid','revisedPrompt','historyGrid','loadingOverlay','loadingText'].forEach(id => {
    DOM[id] = document.getElementById(id);
});

const KEYS = {};
function getKey(p) { return KEYS[p] || localStorage.getItem('apiKey_' + p) || ''; }
function setKey(p, k) { KEYS[p] = k; localStorage.setItem('apiKey_' + p, k); }

function gcd(a, b) { return b ? gcd(b, a % b) : a; }
function closestAspect(w, h) {
    const r = w / h;
    const map = { '16:9':16/9, '21:9':21/9, '3:2':3/2, '5:4':5/4, '1:1':1, '4:5':4/5, '2:3':2/3, '9:16':9/16, '9:21':9/21 };
    let best = '1:1', bestD = Infinity;
    for (const [k,v] of Object.entries(map)) { const d = Math.abs(r - v); if (d < bestD) { bestD = d; best = k; } }
    return best;
}
function parseSize(s) { const p = s.split('x').map(Number); return { w: p[0], h: p[1] }; }

const PRESET_SIZES = [
    { l:'1024 × 1024（方形）', v:'1024x1024' },
    { l:'1792 × 1024（横版 16:9）', v:'1792x1024' },
    { l:'1024 × 1792（竖版 9:16）', v:'1024x1792' },
    { l:'1344 × 768（横版 16:9）', v:'1344x768' },
    { l:'768 × 1344（竖版 9:16）', v:'768x1344' },
    { l:'1152 × 864（横版 4:3）', v:'1152x864' },
    { l:'864 × 1152（竖版 3:4）', v:'864x1152' },
    { l:'1216 × 832（横版 3:2）', v:'1216x832' },
    { l:'832 × 1216（竖版 2:3）', v:'832x1216' },
    { l:'1536 × 640（横版 12:5）', v:'1536x640' },
    { l:'640 × 1536（竖版 5:12）', v:'640x1536' },
    { l:'512 × 512', v:'512x512' },
    { l:'自定义...', v:'custom' },
];

const PROVIDERS = [
{
    id:'openai', name:'OpenAI DALL·E',
    models:[{ id:'dall-e-3', label:'DALL-E 3' }, { id:'dall-e-2', label:'DALL-E 2' }],
    getSizes(m) {
        if (m === 'dall-e-3') return ['1024x1024','1792x1024','1024x1792','custom'];
        return ['1024x1024','512x512','256x256','custom'];
    },
    features: { negative:false, quality:['dall-e-3'], style:['dall-e-3'], endpoint:false, watermark:false },
    async testKey(key) {
        const res = await fetch('https://api.openai.com/v1/models?limit=1', {
            headers: { 'Authorization':`Bearer ${key}` }
        });
        if (res.ok) return { valid: true };
        const data = await res.json().catch(() => ({}));
        return { valid: false, msg: data.error?.message || 'Key 无效' };
    },
    async generate(key, prompt, opts) {
        const { model, count, size, quality, style } = opts;
        const body = { model, prompt, n: model === 'dall-e-3' ? 1 : count, size };
        if (model === 'dall-e-3') { body.quality = quality; body.style = style; }
        const res = await fetch('https://api.openai.com/v1/images/generations', {
            method:'POST',
            headers: { 'Authorization':`Bearer ${key}`, 'Content-Type':'application/json' },
            body: JSON.stringify(body)
        });
        const data = await res.json();
        if (!res.ok) throw new Error(data.error?.message || JSON.stringify(data));
        return { images: data.data.map(d => d.url), revised: data.data[0]?.revised_prompt };
    }
},
{
    id:'zhipu', name:'智谱 CogView',
    models:[
        { id:'glm-image', label:'GLM-Image' },
        { id:'cogview-4-250304', label:'CogView-4 (250304)' },
        { id:'cogview-4', label:'CogView-4' },
        { id:'cogview-3-flash', label:'CogView-3 Flash' }
    ],
    getSizes(m) {
        if (m && m.startsWith('glm')) {
            return ['1280x1280','1568x1056','1056x1568','1472x1088','1088x1472','1728x960','960x1728','custom'];
        }
        return ['1024x1024','768x1344','864x1152','1344x768','1152x864','1440x720','720x1440','custom'];
    },
    features: { negative:true, quality:true, style:false, endpoint:false, watermark:true },
    async testKey(key) {
        const res = await fetch('https://open.bigmodel.cn/api/paas/v4/models?limit=1', {
            headers: { 'Authorization':`Bearer ${key}` }
        });
        if (res.ok) return { valid: true };
        const data = await res.json().catch(() => ({}));
        return { valid: false, msg: data.error?.message || 'Key 无效' };
    },
    async generate(key, prompt, opts) {
        const { model, count, size, quality, watermark, negativePrompt } = opts;
        const body = { model, prompt, n: count, size };
        body.quality = model === 'glm-image' ? 'hd' : (quality || 'standard');
        if (watermark !== undefined) body.watermark_enabled = watermark;
        if (negativePrompt) body.negative_prompt = negativePrompt;
        const res = await fetch('https://open.bigmodel.cn/api/paas/v4/images/generations', {
            method:'POST',
            headers: { 'Authorization':`Bearer ${key}`, 'Content-Type':'application/json' },
            body: JSON.stringify(body)
        });
        const data = await res.json();
        if (!res.ok) throw new Error(data.error?.message || JSON.stringify(data));
        return { images: data.data.map(d => d.url), revised: data.data[0]?.revised_prompt };
    }
},
{
    id:'stability', name:'Stability AI',
    models:[
        { id:'sd3.5-large', label:'SD 3.5 Large' },
        { id:'sd3.5-medium', label:'SD 3.5 Medium' },
        { id:'sd3.5-turbo', label:'SD 3.5 Turbo' }
    ],
    getSizes() { return PRESET_SIZES.filter(s => s.v !== '512x512' && s.v !== '256x256').map(s => s.v); },
    features: { negative:true, quality:false, style:false, endpoint:false, watermark:false },
    async testKey(key) {
        const res = await fetch('https://api.stability.ai/v1/user/account', {
            headers: { 'Authorization':`Bearer ${key}` }
        });
        if (res.ok) return { valid: true };
        return { valid: false, msg: res.status === 401 ? 'Key 无效' : '请求失败' };
    },
    async generate(key, prompt, opts) {
        const { model, negativePrompt, size } = opts;
        const { w, h } = parseSize(size);
        const fd = new FormData();
        fd.append('prompt', prompt);
        if (negativePrompt) fd.append('negative_prompt', negativePrompt);
        fd.append('aspect_ratio', closestAspect(w, h));
        fd.append('output_format', 'jpeg');
        fd.append('model', model);
        const res = await fetch('https://api.stability.ai/v2beta/stable-image/generate/sd3', {
            method:'POST',
            headers: { 'Authorization':`Bearer ${key}` },
            body: fd
        });
        if (!res.ok) {
            let msg = 'Stability AI 请求失败';
            try { const e = await res.json(); msg = e.message || msg; } catch {}
            throw new Error(msg);
        }
        const blob = await res.blob();
        return { images: [URL.createObjectURL(blob)], blobs: [blob] };
    }
},
{
    id:'replicate', name:'Replicate',
    models:[
        { id:'black-forest-labs/flux-schnell', label:'Flux Schnell' },
        { id:'black-forest-labs/flux-dev', label:'Flux Dev' },
        { id:'black-forest-labs/flux-pro', label:'Flux Pro' }
    ],
    getSizes() { return ['1024x1024','1360x768','768x1360','custom']; },
    features: { negative:true, quality:false, style:false, endpoint:false, watermark:false },
    async testKey(key) {
        const res = await fetch('https://api.replicate.com/v1/account', {
            headers: { 'Authorization':`Bearer ${key}` }
        });
        if (res.ok) return { valid: true };
        return { valid: false, msg: 'Key 无效' };
    },
    async generate(key, prompt, opts) {
        const { model, negativePrompt, count, size } = opts;
        const { w, h } = parseSize(size);
        const res = await fetch(`https://api.replicate.com/v1/models/${model}/predictions`, {
            method:'POST',
            headers: { 'Authorization':`Bearer ${key}`, 'Content-Type':'application/json' },
            body: JSON.stringify({ input: {
                prompt,
                ...(negativePrompt ? { negative_prompt: negativePrompt } : {}),
                num_outputs: count,
                aspect_ratio: `${w}:${h}`,
                output_format: 'jpg',
                go_fast: model.includes('schnell') ? true : undefined
            }})
        });
        let pred = await res.json();
        if (!res.ok) throw new Error(pred.detail || 'Replicate 请求失败');
        if (pred.status === 'succeeded') {
            const urls = Array.isArray(pred.output) ? pred.output : [pred.output];
            return { images: urls };
        }
        if (pred.status === 'failed') throw new Error('Replicate 生成失败: ' + (pred.error || ''));
        const getUrl = pred.urls?.get;
        if (!getUrl) throw new Error('Replicate 返回数据异常');
        while (true) {
            await new Promise(r => setTimeout(r, 1500));
            const sr = await fetch(getUrl, { headers: { 'Authorization':`Bearer ${key}` } });
            pred = await sr.json();
            if (pred.status === 'succeeded') {
                const urls = Array.isArray(pred.output) ? pred.output : [pred.output];
                return { images: urls };
            }
            if (pred.status === 'failed') throw new Error('Replicate 生成失败: ' + (pred.error || ''));
        }
    }
},
{
    id:'custom', name:'通用 (OpenAI 兼容)',
    models:[{ id:'custom', label:'自定义模型' }],
    getSizes() { return PRESET_SIZES.map(s => s.v); },
    features: { negative:false, quality:false, style:false, endpoint:true, watermark:false },
    async testKey(key, endpoint) {
        const base = ((endpoint || '').replace(/\/+$/, '')) || 'https://api.openai.com/v1';
        const url = base + (base.endsWith('/v1') ? '/models' : '/v1/models') + '?limit=1';
        const res = await fetch(url, { headers: { 'Authorization':`Bearer ${key}` } });
        if (res.ok) return { valid: true };
        const data = await res.json().catch(() => ({}));
        return { valid: false, msg: data.error?.message || 'Key 或地址无效' };
    },
    async generate(key, prompt, opts) {
        const { model, count, size, endpoint } = opts;
        const { w, h } = parseSize(size);
        const base = endpoint.replace(/\/+$/, '');
        const url = base + (base.endsWith('/v1') ? '/images/generations' : '/v1/images/generations');
        const res = await fetch(url, {
            method:'POST',
            headers: { 'Authorization':`Bearer ${key}`, 'Content-Type':'application/json' },
            body: JSON.stringify({ model, prompt, n: count, size: `${w}x${h}` })
        });
        const data = await res.json();
        if (!res.ok) throw new Error(data.error?.message || JSON.stringify(data));
        return { images: data.data.map(d => d.url), revised: data.data[0]?.revised_prompt };
    }
}
];

function getProvider(id) { return PROVIDERS.find(p => p.id === id); }

function getModelName() {
    return DOM.model.value === '_custom' ? DOM.customModel.value.trim() || 'custom-model' : DOM.model.value;
}

function renderProviders() {
    DOM.provider.innerHTML = PROVIDERS.map(p => `<option value="${p.id}">${p.name}</option>`).join('');
    DOM.provider.value = 'zhipu';
}

function renderModels() {
    const p = getProvider(DOM.provider.value);
    const list = [...p.models, { id:'_custom', label:'自定义模型...' }];
    DOM.model.innerHTML = list.map(m => `<option value="${m.id}">${m.label}</option>`).join('');
    if (!list.find(m => m.id === DOM.model.value)) DOM.model.value = list[0].id;
    toggleCustomModel();
}

function renderSizes() {
    const p = getProvider(DOM.provider.value);
    const m = DOM.model.value;
    const sizes = p.getSizes ? p.getSizes(m) : PRESET_SIZES.map(s => s.v);
    const labels = {};
    PRESET_SIZES.forEach(s => { labels[s.v] = s.l; });
    DOM.size.innerHTML = sizes.map(s => {
        const label = labels[s] || s;
        return `<option value="${s}">${label}</option>`;
    }).join('');
    DOM.size.value = sizes.includes(DOM.size.value) ? DOM.size.value : sizes[0];
    toggleCustomSize();
}

function updateCustomSizeConstraints() {
    const pId = DOM.provider.value;
    const m = DOM.model.value;
    if (pId === 'zhipu' && m && m.startsWith('glm')) {
        DOM.customW.min = 1024; DOM.customW.max = 2048; DOM.customW.step = 32;
        DOM.customH.min = 1024; DOM.customH.max = 2048; DOM.customH.step = 32;
    } else if (pId === 'zhipu') {
        DOM.customW.min = 512; DOM.customW.max = 2048; DOM.customW.step = 16;
        DOM.customH.min = 512; DOM.customH.max = 2048; DOM.customH.step = 16;
    } else {
        DOM.customW.min = 64; DOM.customW.max = 4096; DOM.customW.step = 64;
        DOM.customH.min = 64; DOM.customH.max = 4096; DOM.customH.step = 64;
    }
}

function toggleCustomSize() {
    DOM.customSizeField.classList.toggle('hidden', DOM.size.value !== 'custom');
}

function toggleCustomModel() {
    DOM.modelCustomField.classList.toggle('hidden', DOM.model.value !== '_custom');
}

function toggleFeatures() {
    const p = getProvider(DOM.provider.value);
    const m = DOM.model.value;
    DOM.negativeField.classList.toggle('hidden', !p.features.negative);
    const showQuality = p.features.quality === true || (Array.isArray(p.features.quality) && p.features.quality.includes(m));
    DOM.qualityField.classList.toggle('hidden', !showQuality);
    DOM.styleField.classList.toggle('hidden', !(p.features.style && p.features.style.includes(m)));
    DOM.endpointField.classList.toggle('hidden', !p.features.endpoint);
    DOM.watermarkField.classList.toggle('hidden', !p.features.watermark);
    toggleCustomModel();
    updateCustomSizeConstraints();
}

function getEndpoint() {
    const p = getProvider(DOM.provider.value);
    return p.features.endpoint ? (DOM.customEndpoint.value.trim() || 'https://api.openai.com/v1') : null;
}

function updateKeyHint() {
    const p = DOM.provider.value;
    const k = getKey(p);
    DOM.apiKey.value = k;
    if (k) {
        DOM.keyHint.textContent = '✓ Key 已保存';
        DOM.keyHint.className = 'key-hint saved';
    } else {
        DOM.keyHint.textContent = 'Key 仅保存在本地浏览器中';
        DOM.keyHint.className = 'key-hint';
    }
}

function updateAll() {
    renderModels();
    renderSizes();
    toggleFeatures();
    updateKeyHint();
}

function getSize() {
    if (DOM.size.value === 'custom') {
        const w = parseInt(DOM.customW.value) || 1024;
        const h = parseInt(DOM.customH.value) || 1024;
        return `${w}x${h}`;
    }
    return DOM.size.value;
}

async function handleTestKey() {
    const pId = DOM.provider.value;
    const p = getProvider(pId);
    const key = DOM.apiKey.value.trim();
    if (!key) { DOM.keyHint.textContent = '请先输入 API Key'; DOM.keyHint.className = 'key-hint error'; return; }

    DOM.keyHint.textContent = '检测中...';
    DOM.keyHint.className = 'key-hint';
    DOM.testKeyBtn.disabled = true;

    try {
        const result = await p.testKey(key, getEndpoint());
        if (result.valid) {
            DOM.keyHint.textContent = '✓ Key 有效';
            DOM.keyHint.className = 'key-hint saved';
        } else {
            DOM.keyHint.textContent = '✗ ' + (result.msg || 'Key 无效');
            DOM.keyHint.className = 'key-hint error';
        }
    } catch (err) {
        DOM.keyHint.textContent = '✗ ' + (err.message || '检测失败');
        DOM.keyHint.className = 'key-hint error';
    } finally {
        DOM.testKeyBtn.disabled = false;
    }
}

async function refreshModels() {
    const pId = DOM.provider.value;
    const p = getProvider(pId);
    const key = getKey(pId);
    if (!key) { return; }
    DOM.refreshModelsBtn.disabled = true;
    DOM.refreshModelsBtn.textContent = '...';
    try {
        let models = null;
        if (p.id === 'openai') {
            const res = await fetch('https://api.openai.com/v1/models', {
                headers: { 'Authorization':`Bearer ${key}` }
            });
            if (res.ok) {
                const data = await res.json();
                const imgModels = data.data.filter(m => m.id.includes('dall-e'));
                if (imgModels.length > 0) models = imgModels.map(m => ({ id: m.id, label: m.id }));
            }
        } else if (p.id === 'replicate') {
            const res = await fetch('https://api.replicate.com/v1/models', {
                headers: { 'Authorization':`Bearer ${key}` }
            });
            if (res.ok) {
                const data = await res.json();
                const textImg = (data.results || data).filter(m =>
                    m.description && (m.description.toLowerCase().includes('image') || m.description.toLowerCase().includes('text-to-image'))
                );
                if (textImg.length > 0) models = textImg.map(m => ({ id: m.owner + '/' + m.name, label: m.owner + '/' + m.name }));
            }
        }
        if (!models) models = [...p.models];
        models.push({ id:'_custom', label:'自定义模型...' });
        DOM.model.innerHTML = models.map(m => `<option value="${m.id}">${m.label}</option>`).join('');
        DOM.model.value = models[0].id;
        toggleCustomModel();
        renderSizes();
        toggleFeatures();
    } catch {}
    DOM.refreshModelsBtn.disabled = false;
    DOM.refreshModelsBtn.textContent = '⟳';
}

function buildRequestBody() {
    const pId = DOM.provider.value;
    const p = getProvider(pId);
    const prompt = DOM.prompt.value.trim() || 'your prompt';
    const model = getModelName();
    const count = parseInt(DOM.count.value);
    const size = getSize();
    const quality = DOM.quality.value;
    const style = DOM.style.value;
    const endpoint = getEndpoint();
    const watermark = DOM.watermarkEnabled.checked;

    let body = {};
    if (p.id === 'openai') {
        body = { model, prompt, n: model === 'dall-e-3' ? 1 : count, size };
        if (model === 'dall-e-3') { body.quality = quality; body.style = style; }
    } else if (p.id === 'zhipu') {
        body = { model, prompt, n: count, size };
        body.quality = model === 'glm-image' ? 'hd' : quality;
        body.watermark_enabled = watermark;
        const np = DOM.negativePrompt.value.trim();
        if (np) body.negative_prompt = np;
    } else if (p.id === 'stability') {
        body = { prompt, model, negative_prompt: DOM.negativePrompt.value.trim() || undefined, aspect_ratio: closestAspect(parseSize(size).w, parseSize(size).h), output_format: 'jpeg' };
    } else if (p.id === 'replicate') {
        body = { input: { prompt, num_outputs: count, aspect_ratio: `${parseSize(size).w}:${parseSize(size).h}`, output_format: 'jpg' } };
    } else if (p.id === 'custom') {
        const { w, h } = parseSize(size);
        const base = (endpoint || 'https://api.openai.com/v1').replace(/\/+$/, '');
        body = { model, prompt, n: count, size: `${w}x${h}` };
    }
    return { pId, body, endpoint };
}

function generateCodeSnippet(lang) {
    const { pId, body, endpoint } = buildRequestBody();
    const keyPlaceholder = 'YOUR_API_KEY';
    let baseUrl, headers, requestBody, url;

    if (pId === 'openai') {
        baseUrl = 'https://api.openai.com/v1/images/generations';
        headers = { 'Authorization': `Bearer ${keyPlaceholder}`, 'Content-Type': 'application/json' };
        requestBody = JSON.stringify(body, null, 4);
        url = baseUrl;
    } else if (pId === 'zhipu') {
        baseUrl = 'https://open.bigmodel.cn/api/paas/v4/images/generations';
        headers = { 'Authorization': `Bearer ${keyPlaceholder}`, 'Content-Type': 'application/json' };
        requestBody = JSON.stringify(body, null, 4);
        url = baseUrl;
    } else if (pId === 'stability') {
        baseUrl = 'https://api.stability.ai/v2beta/stable-image/generate/sd3';
        url = baseUrl;
    } else if (pId === 'replicate') {
        const m = getModelName();
        baseUrl = `https://api.replicate.com/v1/models/${m}/predictions`;
        headers = { 'Authorization': `Bearer ${keyPlaceholder}`, 'Content-Type': 'application/json' };
        requestBody = JSON.stringify(body, null, 4);
        url = baseUrl;
    } else if (pId === 'custom') {
        const { w, h } = parseSize(getSize());
        const base = ((endpoint || 'https://api.openai.com/v1').replace(/\/+$/, ''));
        url = base + (base.endsWith('/v1') ? '/images/generations' : '/v1/images/generations');
        headers = { 'Authorization': `Bearer ${keyPlaceholder}`, 'Content-Type': 'application/json' };
        requestBody = body;
        requestBody = JSON.stringify(body, null, 4);
    }

    if (lang === 'curl') {
        let lines = [`curl ${url} \\`];
        if (headers) {
            for (const [k, v] of Object.entries(headers)) {
                lines.push(`  -H "${k}: ${v}" \\`);
            }
        }
        if (pId === 'stability') {
            const pw = prompt || 'your prompt';
            lines.push(`  -F "prompt=${pw}" \\`);
            const neg = DOM.negativePrompt.value.trim();
            if (neg) lines.push(`  -F "negative_prompt=${neg}" \\`);
            const { w, h } = parseSize(getSize());
            lines.push(`  -F "aspect_ratio=${closestAspect(w, h)}" \\`);
            lines.push(`  -F "output_format=jpeg"`);
        } else if (requestBody) {
            lines.push(`  -H "Content-Type: application/json" \\`);
            lines.push(`  -d '${requestBody}'`);
        }
        return lines.join('\n');
    }

    if (lang === 'python') {
        let lines = ['import requests', '', `url = "${url}"`];
        if (pId === 'stability') {
            lines.push('');
            lines.push('headers = {');
            lines.push(`    "Authorization": "Bearer ${keyPlaceholder}"`);
            lines.push('}');
            lines.push('');
            lines.push('files = {');
            lines.push(`    "prompt": (None, "${prompt || 'your prompt'}"),`);
            const neg = DOM.negativePrompt.value.trim();
            if (neg) lines.push(`    "negative_prompt": (None, "${neg}"),`);
            const { w, h } = parseSize(getSize());
            lines.push(`    "aspect_ratio": (None, "${closestAspect(w, h)}"),`);
            lines.push('    "output_format": (None, "jpeg"),');
            lines.push('}');
            lines.push('');
            lines.push('response = requests.post(url, headers=headers, files=files)');
        } else {
            lines.push(`headers = ${JSON.stringify(headers, null, 4)}`);
            lines.push('');
            lines.push('data = ' + requestBody);
            lines.push('');
            lines.push('response = requests.post(url, headers=headers, json=data)');
        }
        lines.push('');
        lines.push('if response.status_code == 200:');
        lines.push('    print("Success:", response.json())');
        lines.push('else:');
        lines.push('    print("Error:", response.text)');
        return lines.join('\n');
    }

    if (lang === 'java') {
        const indent = '    ';
        let lines = ['import java.net.URI;', 'import java.net.http.HttpClient;', 'import java.net.http.HttpRequest;', 'import java.net.http.HttpResponse;', 'import com.google.gson.Gson;', 'import com.google.gson.JsonObject;', '', 'public class ImageGen {', `${indent}public static void main(String[] args) throws Exception {`];
        lines.push(`${indent}${indent}String url = "${url}";`);
        lines.push(`${indent}${indent}String apiKey = "${keyPlaceholder}";`);
        if (pId === 'stability') {
            lines.push(`${indent}${indent}var client = HttpClient.newHttpClient();`);
            lines.push(`${indent}${indent}var bodyBuilder = new MultipartBodyBuilder();`);
            const pw = prompt || 'your prompt';
            lines.push(`${indent}${indent}bodyBuilder.add("prompt", "${pw}");`);
            const neg = DOM.negativePrompt.value.trim();
            if (neg) lines.push(`${indent}${indent}bodyBuilder.add("negative_prompt", "${neg}");`);
            const { w, h } = parseSize(getSize());
            lines.push(`${indent}${indent}bodyBuilder.add("aspect_ratio", "${closestAspect(w, h)}");`);
            lines.push(`${indent}${indent}bodyBuilder.add("output_format", "jpeg");`);
            lines.push(`${indent}${indent}var request = HttpRequest.newBuilder()`);
            lines.push(`${indent}${indent}${indent}.uri(URI.create(url))`);
            lines.push(`${indent}${indent}${indent}.header("Authorization", "Bearer " + apiKey)`);
            lines.push(`${indent}${indent}${indent}.POST(bodyBuilder.build())`);
            lines.push(`${indent}${indent}${indent}.build();`);
        } else {
            lines.push(`${indent}${indent}Gson gson = new Gson();`);
            lines.push(`${indent}${indent}String json = gson.toJson(${JSON.stringify(body)});`);
            lines.push(`${indent}${indent}var request = HttpRequest.newBuilder()`);
            lines.push(`${indent}${indent}${indent}.uri(URI.create(url))`);
            lines.push(`${indent}${indent}${indent}.header("Authorization", "Bearer " + apiKey)`);
            lines.push(`${indent}${indent}${indent}.header("Content-Type", "application/json")`);
            lines.push(`${indent}${indent}${indent}.POST(HttpRequest.BodyPublishers.ofString(json))`);
            lines.push(`${indent}${indent}${indent}.build();`);
        }
        lines.push(`${indent}${indent}var client = HttpClient.newHttpClient();`);
        lines.push(`${indent}${indent}var response = client.send(request, HttpResponse.BodyHandlers.ofString());`);
        lines.push(`${indent}${indent}System.out.println(response.body());`);
        lines.push(`${indent}}`);
        lines.push('}');
        return lines.join('\n');
    }

    return '';
}

function updateCodeDisplay(lang) {
    DOM.codeDisplay.textContent = generateCodeSnippet(lang);
}

function blobToBase64(blob) {
    return new Promise((resolve, reject) => {
        const r = new FileReader();
        r.onload = () => resolve(r.result);
        r.onerror = reject;
        r.readAsDataURL(blob);
    });
}

function showError(msg) {
    const card = document.createElement('div');
    card.className = 'result-card';
    card.style.gridColumn = '1 / -1';
    card.style.padding = '20px';
    card.style.textAlign = 'center';
    card.style.color = '#ef4444';
    card.textContent = '❌ ' + msg;
    DOM.resultGrid.innerHTML = '';
    DOM.resultGrid.appendChild(card);
    DOM.resultSection.classList.remove('hidden');
}

async function handleGenerate() {
    const pId = DOM.provider.value;
    const p = getProvider(pId);
    const key = getKey(pId);
    if (!key) { showError('请先输入并保存 API Key'); return; }
    const prompt = DOM.prompt.value.trim();
    if (!prompt) { showError('请输入 Prompt'); return; }
    const negativePrompt = DOM.negativePrompt.value.trim();
    const model = getModelName();
    const count = parseInt(DOM.count.value);
    const size = getSize();
    const quality = DOM.quality.value;
    const style = DOM.style.value;
    const endpoint = getEndpoint();
    const watermark = DOM.watermarkEnabled.checked;

    if (pId === 'zhipu' && DOM.size.value === 'custom') {
        const w = parseInt(DOM.customW.value) || 0;
        const h = parseInt(DOM.customH.value) || 0;
        const isGlm = model && model.startsWith('glm');
        const info = isGlm
            ? { min: 1024, max: 2048, step: 32, maxPx: 4194304, label: 'glm-image' }
            : { min: 512, max: 2048, step: 16, maxPx: 2097152, label: 'cogview' };
        if (w < info.min || w > info.max || h < info.min || h > info.max) {
            showError(`${info.label} 自定义尺寸需在 ${info.min}-${info.max}px 之间`); return;
        }
        if (w % info.step !== 0 || h % info.step !== 0) {
            showError(`${info.label} 自定义尺寸需为 ${info.step} 的整数倍`); return;
        }
        if (w * h > info.maxPx) {
            showError(`${info.label} 自定义尺寸像素数不能超过 ${info.maxPx}`); return;
        }
    }

    DOM.generateBtn.disabled = true;
    DOM.loadingOverlay.classList.remove('hidden');
    DOM.resultSection.classList.add('hidden');

    try {
        let result;
        if (p.id === 'stability') {
            result = await p.generate(key, prompt, { model, negativePrompt, size, count });
        } else if (p.id === 'replicate') {
            result = await p.generate(key, prompt, { model, negativePrompt, count, size });
        } else if (p.id === 'custom') {
            result = await p.generate(key, prompt, { model, size: `${parseSize(size).w}x${parseSize(size).h}`, count, endpoint });
        } else if (p.id === 'zhipu') {
            result = await p.generate(key, prompt, { model, count, size, quality, watermark, negativePrompt });
        } else {
            result = await p.generate(key, prompt, { model, count, size, quality, style });
        }

        const imageUrls = result.images || [];
        const blobs = result.blobs || [];
        if (imageUrls.length === 0) { showError('API 未返回任何图像'); return; }

        const finalBlobs = [];
        for (let i = 0; i < imageUrls.length; i++) {
            if (blobs[i]) {
                finalBlobs.push(blobs[i]);
            } else {
                try {
                    const resp = await fetch(imageUrls[i]);
                    finalBlobs.push(await resp.blob());
                } catch {
                    finalBlobs.push(null);
                }
            }
        }

        const displayUrls = finalBlobs.map((b, i) => {
            if (b) return URL.createObjectURL(b);
            return imageUrls[i];
        });

        DOM.resultGrid.innerHTML = '';
        displayUrls.forEach((url, i) => {
            const card = document.createElement('div');
            card.className = 'result-card';
            const img = document.createElement('img');
            img.src = url;
            img.alt = prompt;
            img.addEventListener('click', () => showLightbox(url));
            const footer = document.createElement('div');
            footer.className = 'card-footer';
            const dlBtn = document.createElement('button');
            dlBtn.textContent = '下载';
            dlBtn.addEventListener('click', () => {
                const a = document.createElement('a');
                if (finalBlobs[i]) {
                    a.href = URL.createObjectURL(finalBlobs[i]);
                } else {
                    a.href = imageUrls[i];
                }
                a.download = `ai-image-${i+1}.jpg`;
                a.click();
            });
            const copyBtn = document.createElement('button');
            copyBtn.textContent = '复制到剪贴板';
            copyBtn.addEventListener('click', async () => {
                try {
                    if (finalBlobs[i]) {
                        await navigator.clipboard.write([
                            new ClipboardItem({ [finalBlobs[i].type]: finalBlobs[i] })
                        ]);
                    } else {
                        const resp = await fetch(imageUrls[i]);
                        const b = await resp.blob();
                        await navigator.clipboard.write([new ClipboardItem({ [b.type]: b })]);
                    }
                    copyBtn.textContent = '已复制';
                    setTimeout(() => { copyBtn.textContent = '复制到剪贴板'; }, 2000);
                } catch {}
            });
            footer.appendChild(dlBtn);
            footer.appendChild(copyBtn);
            card.appendChild(img);
            card.appendChild(footer);
            DOM.resultGrid.appendChild(card);
        });

        DOM.revisedPrompt.textContent = result.revised ? 'Revised: ' + result.revised : '';
        DOM.resultSection.classList.remove('hidden');

        const base64List = [];
        for (const b of finalBlobs) {
            if (b) base64List.push(await blobToBase64(b));
        }

        if (base64List.length > 0) {
            await saveToHistory({
                id: Date.now() + '-' + Math.random().toString(36).slice(2, 6),
                prompt,
                negativePrompt,
                provider: p.name,
                model,
                size,
                timestamp: Date.now(),
                images: base64List
            });
        }

        await renderHistory();
    } catch (err) {
        showError(err.message || '生成失败，请检查网络和 API Key');
    } finally {
        DOM.generateBtn.disabled = false;
        DOM.loadingOverlay.classList.add('hidden');
    }
}

function showLightbox(url) {
    const existing = document.getElementById('lightbox');
    if (existing) existing.remove();
    const div = document.createElement('div');
    div.id = 'lightbox';
    div.addEventListener('click', () => div.remove());
    const img = document.createElement('img');
    img.src = url;
    div.appendChild(img);
    document.body.appendChild(div);
}

let db = null;
function openDB() {
    return new Promise((resolve, reject) => {
        if (db) return resolve(db);
        const req = indexedDB.open('ToolBoxDB', 1);
        req.onupgradeneeded = () => {
            const d = req.result;
            if (!d.objectStoreNames.contains('imageGenHistory')) {
                d.createObjectStore('imageGenHistory', { keyPath: 'id' }).createIndex('timestamp', 'timestamp', { unique: false });
            }
        };
        req.onsuccess = () => { db = req.result; resolve(db); };
        req.onerror = () => reject(req.error);
    });
}

async function saveToHistory(entry) {
    const d = await openDB();
    return new Promise((resolve, reject) => {
        const tx = d.transaction('imageGenHistory', 'readwrite');
        const store = tx.objectStore('imageGenHistory');
        const countReq = store.count();
        countReq.onsuccess = () => {
            if (countReq.result >= 30) {
                const idx = store.index('timestamp');
                const cursorReq = idx.openCursor(null, 'next');
                cursorReq.onsuccess = () => {
                    if (cursorReq.result) {
                        store.delete(cursorReq.result.primaryKey);
                    }
                };
            }
        };
        store.put(entry);
        tx.oncomplete = resolve;
        tx.onerror = () => reject(tx.error);
    });
}

async function loadHistory() {
    const d = await openDB();
    return new Promise((resolve, reject) => {
        const tx = d.transaction('imageGenHistory', 'readonly');
        const store = tx.objectStore('imageGenHistory');
        const idx = store.index('timestamp');
        const req = idx.openCursor(null, 'prev');
        const entries = [];
        req.onsuccess = () => {
            const cursor = req.result;
            if (cursor) { entries.push(cursor.value); cursor.continue(); }
            else resolve(entries);
        };
        req.onerror = () => reject(req.error);
    });
}

async function deleteHistory(id) {
    const d = await openDB();
    return new Promise((resolve, reject) => {
        const tx = d.transaction('imageGenHistory', 'readwrite');
        tx.objectStore('imageGenHistory').delete(id);
        tx.oncomplete = resolve;
        tx.onerror = () => reject(tx.error);
    });
}

async function renderHistory() {
    try {
        const entries = await loadHistory();
        if (entries.length === 0) {
            DOM.historyGrid.innerHTML = '<p class="empty-hint">暂无记录</p>';
            return;
        }
        DOM.historyGrid.innerHTML = '';
        for (const entry of entries) {
            const item = document.createElement('div');
            item.className = 'history-item';
            const img = document.createElement('img');
            img.src = entry.images[0];
            img.alt = entry.prompt;
            img.loading = 'lazy';
            const info = document.createElement('div');
            info.className = 'history-info';
            const d = new Date(entry.timestamp);
            info.textContent = `${entry.provider} · ${d.toLocaleDateString()} ${d.toLocaleTimeString([], {hour:'2-digit',minute:'2-digit'})}`;
            item.appendChild(img);
            item.appendChild(info);
            item.addEventListener('click', () => { showHistoryDetail(entry); });
            const del = document.createElement('button');
            del.className = 'history-del';
            del.textContent = '×';
            del.addEventListener('click', async e => {
                e.stopPropagation();
                await deleteHistory(entry.id);
                renderHistory();
            });
            item.appendChild(del);
            DOM.historyGrid.appendChild(item);
        }
    } catch {}
}

function showHistoryDetail(entry) {
    DOM.resultGrid.innerHTML = '';
    const { w, h } = entry.size ? parseSize(entry.size) : { w: 1024, h: 1024 };
    entry.images.forEach((src, i) => {
        const card = document.createElement('div');
        card.className = 'result-card';
        const img = document.createElement('img');
        img.src = src;
        img.alt = entry.prompt;
        img.style.aspectRatio = `${w}/${h}`;
        img.addEventListener('click', () => showLightbox(src));
        const footer = document.createElement('div');
        footer.className = 'card-footer';
        const dlBtn = document.createElement('button');
        dlBtn.textContent = '下载';
        dlBtn.addEventListener('click', () => {
            const a = document.createElement('a');
            a.href = src;
            a.download = `ai-image-${i+1}.jpg`;
            a.click();
        });
        footer.appendChild(dlBtn);
        card.appendChild(img);
        card.appendChild(footer);
        DOM.resultGrid.appendChild(card);
    });
    const meta = document.createElement('p');
    meta.style.cssText = 'grid-column:1/-1;font-size:12px;color:var(--text2);margin-top:4px;';
    meta.textContent = `${entry.provider} · ${entry.model || ''} · ${entry.size || ''} · Prompt: ${entry.prompt}`;
    DOM.resultGrid.appendChild(meta);
    DOM.revisedPrompt.textContent = '';
    DOM.resultSection.classList.remove('hidden');
}

function init() {
    renderProviders();
    renderModels();
    renderSizes();
    toggleFeatures();
    updateKeyHint();

    DOM.provider.addEventListener('change', updateAll);
    DOM.model.addEventListener('change', () => { renderSizes(); toggleFeatures(); toggleCustomModel(); });
    DOM.size.addEventListener('change', toggleCustomSize);

    DOM.saveKeyBtn.addEventListener('click', () => {
        const p = DOM.provider.value;
        const k = DOM.apiKey.value.trim();
        if (k) { setKey(p, k); updateKeyHint(); }
    });

    DOM.testKeyBtn.addEventListener('click', handleTestKey);
    DOM.refreshModelsBtn.addEventListener('click', refreshModels);
    DOM.generateBtn.addEventListener('click', handleGenerate);

    DOM.prompt.addEventListener('keydown', e => {
        if (e.key === 'Enter' && (e.ctrlKey || e.metaKey)) handleGenerate();
    });

    let codeOpen = false;
    let currentLang = 'curl';
    DOM.codeToggleBtn.addEventListener('click', () => {
        codeOpen = !codeOpen;
        DOM.codeContent.classList.toggle('hidden', !codeOpen);
        DOM.codeToggleBtn.textContent = codeOpen ? '▾ 收起 API 调用示例' : '▸ 查看 API 调用示例';
        if (codeOpen) updateCodeDisplay(currentLang);
    });

    DOM.codeContent.addEventListener('click', e => {
        const tab = e.target.closest('.code-tab');
        if (tab) {
            document.querySelectorAll('.code-tab').forEach(t => t.classList.remove('active'));
            tab.classList.add('active');
            currentLang = tab.dataset.lang;
            updateCodeDisplay(currentLang);
        }
    });

    DOM.copyCodeBtn.addEventListener('click', () => {
        const text = DOM.codeDisplay.textContent;
        if (text) {
            navigator.clipboard.writeText(text).then(() => {
                DOM.copyCodeBtn.textContent = '已复制';
                setTimeout(() => { DOM.copyCodeBtn.textContent = '复制代码'; }, 2000);
            }).catch(() => {});
        }
    });

    renderHistory();
}

document.addEventListener('DOMContentLoaded', init);

})();
