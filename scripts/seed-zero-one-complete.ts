import { makePrismaClient } from './prismaClient.js';
import bcrypt from 'bcrypt';
import * as dotenv from 'dotenv';

dotenv.config();

const prisma = makePrismaClient();

async function seedZeroOneComplete() {
  console.log('🚀 Starting Complete ZERO → ONE Fake Event & Team Seeding...');

  // 1. Password Hashes
  const adminPassword = 'change_this_password';
  const teamPassword = 'ZeroOne#2026';

  const hashedAdminPassword = await bcrypt.hash(adminPassword, 12);
  const hashedTeamPassword = await bcrypt.hash(teamPassword, 12);

  // 2. Admin User
  const adminId = '7b9962b4-a08c-4d24-9f28-8c722d81d20f';
  const adminEmail = 'admin@example.com';
  console.log(`👤 Upserting Admin (${adminEmail})...`);

  const admin = await prisma.user.upsert({
    where: { email: adminEmail },
    update: {
      password: hashedAdminPassword,
      role: 'ADMIN',
      profileCompleted: true,
      name: 'Super Admin',
    },
    create: {
      id: adminId,
      name: 'Super Admin',
      email: adminEmail,
      password: hashedAdminPassword,
      oauthProvider: 'email',
      oauthId: `email-${adminId}`,
      role: 'ADMIN',
      profileCompleted: true,
      avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=150&q=80',
    },
  });

  // 3. Team Users (TechNova Squad)
  const arjunId = '34c5c597-69ed-4004-a070-53953b708ee9';
  const teamUsersData = [
    {
      id: arjunId,
      name: 'Arjun Patel',
      email: 'arjun@scriet.edu',
      role: 'LEADER' as const,
      avatar: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&w=150&q=80',
      branch: 'Computer Science',
      year: '3rd Year',
    },
    {
      id: 'usr-sneha-reddy',
      name: 'Sneha Sharma',
      email: 'sneha@scriet.edu',
      role: 'MEMBER' as const,
      avatar: 'https://images.unsplash.com/photo-1580489944761-15a19d654956?auto=format&fit=crop&w=150&q=80',
      branch: 'Information Technology',
      year: '3rd Year',
    },
    {
      id: 'usr-vikram-singh',
      name: 'Vikram Singh',
      email: 'vikram@scriet.edu',
      role: 'MEMBER' as const,
      avatar: 'https://images.unsplash.com/photo-1570295999919-56ceb5ecca61?auto=format&fit=crop&w=150&q=80',
      branch: 'Computer Science',
      year: '3rd Year',
    },
    {
      id: 'usr-divya-verma',
      name: 'Divya Verma',
      email: 'divya@scriet.edu',
      role: 'MEMBER' as const,
      avatar: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?auto=format&fit=crop&w=150&q=80',
      branch: 'Electronics & Comm',
      year: '3rd Year',
    },
  ];

  const createdUsers: any[] = [];
  for (const tu of teamUsersData) {
    console.log(`👤 Upserting Team User (${tu.name} - ${tu.email})...`);
    const u = await prisma.user.upsert({
      where: { email: tu.email },
      update: {
        password: hashedTeamPassword,
        name: tu.name,
        profileCompleted: true,
        branch: tu.branch,
        year: tu.year,
        avatar: tu.avatar,
      },
      create: {
        id: tu.id,
        name: tu.name,
        email: tu.email,
        password: hashedTeamPassword,
        oauthProvider: 'email',
        oauthId: `email-${tu.email}`,
        role: 'USER',
        profileCompleted: true,
        branch: tu.branch,
        year: tu.year,
        avatar: tu.avatar,
      },
    });
    createdUsers.push({ ...u, teamRole: tu.role });
  }

  // 4. ZERO → ONE Event (slug: zero-one-2026)
  const eventSlug = 'zero-one-2026';
  console.log(`🎪 Upserting Event (slug: ${eventSlug})...`);

  const now = new Date();
  const startDate = new Date(now.getTime() - 2 * 3600 * 1000); // started 2 hours ago
  const endDate = new Date(now.getTime() + 48 * 3600 * 1000); // ends in 48 hours
  const regStartDate = new Date(now.getTime() - 7 * 86400 * 1000);
  const regEndDate = new Date(now.getTime() + 24 * 3600 * 1000);

  const event = await prisma.event.upsert({
    where: { slug: eventSlug },
    update: {
      title: 'ZERO → ONE 2026: Live Startup Ecosystem Simulation',
      shortDescription: 'Flagship startup simulation: build, spend, survive crises, pitch.',
      description:
        'ZERO → ONE is the flagship interactive startup simulation of Code.SCRIET. ' +
        'Squads of founders receive ₹10,00,000 in virtual capital, trade on a live ' +
        'market, survive timed crisis events, bid in auctions, and pitch to judges. ' +
        'Register here, then enter the live arena from this page on event day.',
      startDate,
      endDate,
      registrationStartDate: regStartDate,
      registrationEndDate: regEndDate,
      teamRegistration: true,
      teamMinSize: 1,
      teamMaxSize: 4,
      venue: 'SCRIET Campus Multipurpose Arena, CCS University Meerut',
      eventType: 'Competition',
      targetAudience: 'Student founders (teams of 3-5)',
      capacity: 500,
      tags: ['zero-one', 'flagship', 'simulation', 'startup', 'arena'],
      featured: true,
      status: 'UPCOMING',
    },
    create: {
      id: 'evt-zero-one-2026',
      slug: eventSlug,
      title: 'ZERO → ONE 2026: Live Startup Ecosystem Simulation',
      shortDescription: 'Flagship startup simulation: build, spend, survive crises, pitch.',
      description:
        'ZERO → ONE is the flagship interactive startup simulation of Code.SCRIET. ' +
        'Squads of founders receive ₹10,00,000 in virtual capital, trade on a live ' +
        'market, survive timed crisis events, bid in auctions, and pitch to judges. ' +
        'Register here, then enter the live arena from this page on event day.',
      startDate,
      endDate,
      registrationStartDate: regStartDate,
      registrationEndDate: regEndDate,
      teamRegistration: true,
      teamMinSize: 1,
      teamMaxSize: 4,
      venue: 'SCRIET Campus Multipurpose Arena, CCS University Meerut',
      eventType: 'Competition',
      targetAudience: 'Student founders (teams of 3-5)',
      capacity: 500,
      tags: ['zero-one', 'flagship', 'simulation', 'startup', 'arena'],
      featured: true,
      status: 'UPCOMING',
      createdBy: admin.id,
    },
  });

  // 5. TechNova Squad (EventTeam)
  const teamName = 'TechNova';
  const inviteCode = 'TECH01';
  console.log(`🛡️ Upserting Team (${teamName} - ${inviteCode})...`);

  const arjunUser = createdUsers.find((u) => u.email === 'arjun@scriet.edu')!;

  const team = await prisma.eventTeam.upsert({
    where: {
      eventId_teamName: {
        eventId: event.id,
        teamName,
      },
    },
    update: {
      leaderId: arjunUser.id,
      inviteCode,
    },
    create: {
      id: 'team-technova-01',
      eventId: event.id,
      teamName,
      inviteCode,
      leaderId: arjunUser.id,
    },
  });

  // 6. Registrations and Team Memberships
  for (const u of createdUsers) {
    console.log(`📝 Registering ${u.name} for ${event.title} in team ${team.teamName}...`);

    // Create or find registration
    const registration = await prisma.eventRegistration.upsert({
      where: {
        userId_eventId: {
          userId: u.id,
          eventId: event.id,
        },
      },
      update: {
        registrationType: 'PARTICIPANT',
      },
      create: {
        userId: u.id,
        eventId: event.id,
        registrationType: 'PARTICIPANT',
      },
    });

    // Create or find team member record
    await prisma.eventTeamMember.upsert({
      where: {
        teamId_userId: {
          teamId: team.id,
          userId: u.id,
        },
      },
      update: {
        registrationId: registration.id,
        role: u.teamRole,
      },
      create: {
        teamId: team.id,
        userId: u.id,
        registrationId: registration.id,
        role: u.teamRole,
      },
    });
  }

  // 7. Summary
  console.log('\n======================================================');
  console.log('✅ ZERO → ONE FAKE EVENT & SQUAD SEEDED SUCCESSFULLY!');
  console.log('======================================================');
  console.log('📋 ADMIN CREDENTIALS:');
  console.log(`  Email:    ${adminEmail}`);
  console.log(`  Password: ${adminPassword}`);
  console.log(`  User ID:  ${admin.id}`);
  console.log(`  Role:     ADMIN (main site) + SUPER_ADMIN (zero-one arena)`);
  console.log(`  Control:  Open /admin.html on ZERO → ONE for full event control`);
  console.log('------------------------------------------------------');
  console.log('🚀 TEAM TECHNOVA (CEO / LEADER) CREDENTIALS:');
  console.log(`  Email:    ${arjunUser.email}`);
  console.log(`  Password: ${teamPassword}`);
  console.log(`  User ID:  ${arjunUser.id}`);
  console.log(`  Role:     USER, Registered for ${eventSlug}`);
  console.log(`  Team:     ${teamName} (Invite Code: ${inviteCode})`);
  console.log('------------------------------------------------------');
  console.log('👥 TEAMMATES (Same password: ZeroOne#2026):');
  for (const u of createdUsers.filter((u) => u.email !== 'arjun@scriet.edu')) {
    console.log(`  • ${u.name} (${u.email}) [Role: ${u.teamRole}]`);
  }
  console.log('======================================================\n');
}

seedZeroOneComplete()
  .catch((err) => {
    console.error('❌ Seeding failed:', err);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
