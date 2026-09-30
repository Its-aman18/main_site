const http = require('http');

const emails = [
  { email: 'aman@scriet.edu', roleDesc: 'NORMAL USER' },
  { email: 'priya@scriet.ac.in', roleDesc: 'PENDING ADMIN' },
  { email: 'vikram@scriet.ac.in', roleDesc: 'REJECTED ADMIN' },
  { email: 'rohan@scriet.ac.in', roleDesc: 'SUSPENDED ADMIN' },
  { email: 'applicationinformation73737@gmail.com', roleDesc: 'VERIFIED BOOTSTRAP SUPER ADMIN' },
  { email: 'kavita@scriet.ac.in', roleDesc: 'VERIFIED EVENT ADMIN' },
];

function testAuth(email, roleDesc) {
  return new Promise((resolve) => {
    const postData = JSON.stringify({ status: 'ROUND_2' });
    const req = http.request(
      {
        hostname: 'localhost',
        port: parseInt(process.env.ZERO_ONE_TEST_PORT || process.env.ZERO_ONE_PORT || process.env.PORT || '5003', 10),
        path: '/api/admin/event/status',
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Content-Length': Buffer.byteLength(postData),
          'x-user-email': email,
        },
      },
      (res) => {
        let data = '';
        res.on('data', (chunk) => (data += chunk));
        res.on('end', () => {
          resolve({
            email,
            roleDesc,
            statusCode: res.statusCode,
            body: data,
          });
        });
      }
    );

    req.on('error', (err) => {
      resolve({ email, roleDesc, error: err.message });
    });

    req.write(postData);
    req.end();
  });
}

async function run() {
  console.log('=== ZERO → ONE SERVER AUTHORIZATION TESTS ===');
  for (const item of emails) {
    const res = await testAuth(item.email, item.roleDesc);
    const pass = (item.roleDesc.includes('VERIFIED') && res.statusCode === 200) ||
                 (!item.roleDesc.includes('VERIFIED') && res.statusCode === 403);
    console.log(
      `[${pass ? 'PASS' : 'FAIL'}] ${item.roleDesc.padEnd(30)} | Email: ${item.email.padEnd(40)} | Status: ${res.statusCode} | Response: ${res.body}`
    );
  }
}

run();
