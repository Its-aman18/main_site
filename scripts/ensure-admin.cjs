const { makePrismaClient } = require('./prismaClient.js');
const bcrypt = require('bcrypt');

async function main() {
  const p = makePrismaClient();
  const hash = await bcrypt.hash('change_this_password', 10);
  
  await p.user.upsert({
    where: { email: 'applicationinformation73737@gmail.com' },
    update: { password: hash, role: 'ADMIN' },
    create: {
      name: 'Aman Gupta',
      email: 'applicationinformation73737@gmail.com',
      password: hash,
      role: 'ADMIN',
    },
  });

  await p.user.upsert({
    where: { email: 'admin@example.com' },
    update: { password: hash, role: 'ADMIN' },
    create: {
      name: 'Super Admin',
      email: 'admin@example.com',
      password: hash,
      role: 'ADMIN',
    },
  });

  console.log('SUCCESS: Both admin accounts ready with password "change_this_password"');
  await p.$disconnect();
}

main().catch(err => {
  console.error(err);
  process.exit(1);
});
