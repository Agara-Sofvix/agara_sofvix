import axios from 'axios';

const api = axios.create({
    baseURL: 'http://localhost:5001/api',
    validateStatus: () => true,
});

const verifySecurity = async () => {
    console.log('--- Verifying NoSQL Injection (Bug 23) ---');
    const nosqlPayload = {
        username: { "$gt": "" },
        password: "any"
    };

    const nosqlRes = await api.post('/auth/login', nosqlPayload);
    console.log('NoSQL Login Response:', nosqlRes.status, nosqlRes.data);

    if (nosqlRes.data.success === false) {
        console.log('✅ Success: NoSQL Injection attempt blocked/sanitized.');
    } else {
        console.log('❌ Error: NoSQL Injection might be possible!');
    }

    console.log('\n--- Verifying XSS Sanitization (Bug 22) ---');
    // Note: To truly test XSS, we'd need to save and then fetch. 
    // Usually express-xss-sanitizer cleans req.body/params/query.
    const xssPayload = {
        name: 'Attacker <script>alert("xss")</script>',
        username: 'xssuser',
        email: 'xss@example.com',
        password: 'Password123!',
        dob: '1990-01-01'
    };

    const xssRes = await api.post('/auth/register', xssPayload);
    console.log('XSS Register Response:', xssRes.status, xssRes.data);

    if (xssRes.data.data && xssRes.data.data.name && !xssRes.data.data.name.includes('<script>')) {
        console.log('✅ Success: XSS Payload sanitized in response.');
    } else if (xssRes.status === 400) {
        console.log('✅ Success: XSS Payload rejected by validation.');
    } else {
        console.log('❌ Error: XSS Payload preserved!');
    }

    console.log('\n--- Verifying Admin Bypass Removal (Bug 25) ---');
    const bypassRes = await api.get('/admin/dashboard/stats', {
        headers: { Authorization: 'Bearer mock-token' }
    });
    console.log('Admin Bypass Response Status:', bypassRes.status);
    console.log('Admin Bypass Response Data:', JSON.stringify(bypassRes.data));

    if (bypassRes.status === 401) {
        console.log('✅ Success: Admin bypass (mock-token) correctly removed.');
    } else {
        console.log('❌ Error: Admin bypass STILL WORKS! Status:', bypassRes.status);
    }

    console.log('\n--- Verifying Data Leakage (Bug 26) ---');
    const loginRes = await api.post('/auth/login', {
        username: 'admin@ezhuthidu.com',
        password: 'Admin@123'
    });

    if (loginRes.data.data) {
        const leaked = ['password', 'tokenVersion', 'resetOTP', '__v'].filter(field => field in loginRes.data.data);
        if (leaked.length === 0) {
            console.log('✅ Success: No sensitive fields leaked in login response.');
        } else {
            console.log('❌ Error: Leaked fields:', leaked);
        }
    }
};

verifySecurity();
