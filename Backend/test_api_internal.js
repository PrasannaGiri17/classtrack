const axios = require('axios');

async function test() {
    try {
        const response = await axios.get('http://localhost:7000/api/fee-records/admin-status');
        console.log('Status Code:', response.status);
        console.log('Total Results:', response.data.length);
        if (response.data.length > 0) {
            console.log('Sample Result:', response.data[0]);
        }
    } catch (err) {
        console.error('API Error:', err.message);
        if (err.response) {
            console.error('Response Data:', err.response.data);
        }
    }
}

test();
