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

    // User Login Check
    console.log('Checking User Login for leakage...');
    const userLoginRes = await api.post('/auth/login', {
        username: 'testuser', // Assuming this might exist or 404 is fine as long as we check fields when it succeeds
        password: 'Password123!'
    });
    console.log('User Login Status:', userLoginRes.status);
    if (userLoginRes.data.data) {
        const leaked = ['password', 'tokenVersion', 'resetOTP', '__v'].filter(field => field in userLoginRes.data.data);
        if (leaked.length === 0) {
            console.log('✅ Success: No sensitive fields leaked in user login response.');
        } else {
            console.log('❌ Error: Leaked fields in user login:', leaked);
        }
    }

    // Admin Login Check
    console.log('\nChecking Admin Login for leakage...');
    const adminLoginRes = await api.post('/admin/auth/login', {
        email: 'admin@ezhuthidu.com',
        password: 'Admin@123'
    });
    console.log('Admin Login Status:', adminLoginRes.status);
    if (adminLoginRes.data.data) {
        const leaked = ['password', 'tokenVersion', 'resetOTP', '__v', 'apiKeys'].filter(field => field in adminLoginRes.data.data);
        if (leaked.length === 0) {
            console.log('✅ Success: No sensitive fields leaked in admin login response.');
        } else {
            console.log('❌ Error: Leaked fields in admin login:', leaked, adminLoginRes.data.data);
        }
    } else {
        console.log('⚠️ Warning: Admin login failed or returned no data. Status:', adminLoginRes.status);
    }
};

verifySecurity();
