const http = require('http');

http.get('http://localhost:7000/api/fee-records/admin-status', (res) => {
    let data = '';
    res.on('data', (chunk) => { data += chunk; });
    res.on('end', () => {
        try {
            console.log('Status Code:', res.statusCode);
            console.log('Headers:', res.headers['content-type']);
            const json = JSON.parse(data);
            console.log('Response Length:', Array.isArray(json) ? json.length : 'Not an array');
            if (Array.isArray(json) && json.length > 0) {
                console.log('First Item:', json[0]);
            } else {
                console.log('Raw Response:', data.substring(0, 100));
            }
        } catch (e) {
            console.log('Parse Error:', e.message);
            console.log('Raw Response:', data.substring(0, 100));
        }
    });
}).on('error', (err) => {
    console.log('Request Error:', err.message);
});
