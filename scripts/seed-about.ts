import { config } from 'dotenv';
config({ path: '.env.local' }); // Load environment variables from .env.local file

import { neon } from '@neondatabase/serverless';
import { drizzle } from 'drizzle-orm/neon-http';
import * as schema from '../src/db/schema';
import { users, userProfiles, education, experience, certifications } from '../src/db/schema';
import { eq } from 'drizzle-orm';
import bcrypt from 'bcryptjs';

const databaseUrl = process.env.DATABASE_URL;
if (!databaseUrl) {
  throw new Error('DATABASE_URL is not set in environment variables');
}

const sql = neon(databaseUrl);
const db = drizzle(sql, { schema });

async function seedAboutDatabase() {
  console.log('Seeding about page database...');

  // Hash the password for the user
  const hashedPassword = await bcrypt.hash('123456', 10);

  // Check if user already exists
  const existingUser = await db.select().from(users).where(eq(users.email, 'mainaisaacwachira2000@gmail.com'));
  
  let userId: number;

  if (existingUser.length > 0) {
    userId = existingUser[0].id;
    console.log(`Using existing user with ID: ${userId}`);
    
    // Update the existing user profile if it exists
    const existingProfile = await db.select().from(userProfiles).where(eq(userProfiles.userId, userId));
    if (existingProfile.length > 0) {
      await db.update(userProfiles)
        .set({
          name: 'Isaac Maina',
          title: 'Web Developer • IT Support • Data Analyst',
          about: 'I am a passionate IT Specialist with expertise in web development, IT support, and data analysis. With experience in technologies like Next.js, React, and various databases, I create efficient and user-friendly solutions.',
          location: 'Kenya',
          phone: '+254758302725',
          careerFocus: 'Web Development • IT Support • Data Analysis',
          image: 'profile-images/img34.png', // Updated to use Supabase path
          skills: ['Web Dev', 'IT Support', 'Data Analysis', 'Database Mgmt'],
        })
        .where(eq(userProfiles.userId, userId));
      console.log('Updated existing user profile');
    } else {
      await db.insert(userProfiles).values({
        userId: userId,
        name: 'Isaac Maina',
        title: 'Web Developer • IT Support • Data Analyst',
        about: 'I am a passionate IT Specialist with expertise in web development, IT support, and data analysis. With experience in technologies like Next.js, React, and various databases, I create efficient and user-friendly solutions.',
        location: 'Kenya',
        phone: '+254758302725',
        careerFocus: 'Web Development • IT Support • Data Analysis',
        image: 'profile-images/img34.png', // Changed to use Supabase path
        skills: ['Web Dev', 'IT Support', 'Data Analysis', 'Database Mgmt'],
      });
      console.log('Created new user profile');
    }
  } else {
    // Create the main user if it doesn't exist
    const [createdUser] = await db.insert(users).values({
      name: 'Isaac Maina',
      email: 'mainaisaacwachira2000@gmail.com',
      password: hashedPassword,
    }).returning({ id: users.id });

    userId = createdUser.id;
    console.log(`Created user with ID: ${userId}`);

    // Create user profile with Supabase-stored image
    await db.insert(userProfiles).values({
      userId: userId,
      title: 'Web Developer • IT Support • Data Analyst',
      about: 'I am a passionate IT Specialist with expertise in web development, IT support, and data analysis. With experience in technologies like Next.js, React, and various databases, I create efficient and user-friendly solutions.',
      location: 'Kenya',
      phone: '+254758302725',
      careerFocus: 'Web Development • IT Support • Data Analysis',
      image: 'profile-images/img34.png', // Changed to use Supabase path
      skills: ['Web Dev', 'IT Support', 'Data Analysis', 'Database Mgmt'],
    });
    console.log('Created new user profile');
  }

  // Clear and add education
  await db.delete(education);
  await db.insert(education).values([
    {
      school: 'University of Nairobi',
      degree: 'Bachelor of Science in Computer Science',
      period: '2019 - 2023',
      description: 'Relevant coursework included software engineering, databases, algorithms, data structures, and web development technologies. Graduated with Second Class Upper Division.',
      orderIndex: 0,
    },
    {
      school: 'Technical University of Kenya',
      degree: 'Diploma in Information Technology',
      period: '2017 - 2019',
      description: 'Focused on practical IT skills, networking, database management, and basic programming concepts. Laid the foundation for further studies in Computer Science.',
      orderIndex: 1,
    }
  ]);
  console.log('Added education data');

  // Clear and add experience
  await db.delete(experience);
  await db.insert(experience).values([
    {
      title: 'Senior Web Developer',
      company: 'Tech Solutions Ltd',
      period: '2023 - Present',
      description: 'Lead development of full-stack web applications using Next.js, React, TypeScript, and PostgreSQL. Implemented responsive UI/UX designs and integrated third-party APIs to enhance functionality. Mentored junior developers and collaborated with cross-functional teams to deliver high-quality products on time.',
      orderIndex: 0,
    },
    {
      title: 'IT Support Specialist',
      company: 'Kiambu County Government',
      period: '2022 - 2023',
      description: 'Provided technical support for hardware and software issues, managed user accounts, and maintained network infrastructure. Developed strong problem-solving and communication skills while ensuring minimal downtime for critical systems. Implemented new documentation processes that improved efficiency by 30%.',
      orderIndex: 1,
    },
    {
      title: 'Freelance Web Developer',
      company: 'Self Employed',
      period: '2020 - Present',
      description: 'Developed and maintained web applications for clients using modern technologies including React, Next.js, Node.js, and various backend solutions. Focused on creating responsive, user-friendly interfaces with optimal performance and accessibility. Completed over 15 successful projects for diverse clients.',
      orderIndex: 2,
    },
    {
      title: 'Data Analysis Intern',
      company: 'Data Insights Co.',
      period: '2021',
      description: 'Assisted in analyzing large datasets using Python, Pandas, and SQL to extract meaningful insights for business decisions. Created data visualization dashboards and automated reporting systems that reduced manual work by 50%. Conducted statistical analysis and prepared comprehensive reports for stakeholders.',
      orderIndex: 3,
    }
  ]);
  console.log('Added experience data');

  // Clear and add certifications
  await db.delete(certifications);
  await db.insert(certifications).values([
    {
      title: 'Google Technical Support Certificate',
      description: 'Google Technical Support Professional Certificate - Covers troubleshooting, customer service, networking, operating systems, system administration, and security.',
      orderIndex: 0,
    },
    {
      title: 'IBM Database Management Certificate',
      description: 'IBM Database Management Professional Certificate - Focuses on SQL, database design, data modeling, and database administration concepts.',
      orderIndex: 1,
    },
    {
      title: 'Oracle Cloud Infrastructure Foundations',
      description: 'Oracle Cloud Infrastructure 2022 Certified Foundations Associate - Demonstrates knowledge of cloud concepts, services, and architecture.',
      orderIndex: 2,
    },
    {
      title: 'AWS Cloud Practitioner Essentials',
      description: 'Amazon Web Services Cloud Practitioner certification - Validates knowledge of cloud concepts, AWS services, security, and compliance.',
      orderIndex: 3,
    },
    {
      title: 'Full Stack Web Development Certificate',
      description: 'FreeCodeCamp Full Stack Web Development certification - Covers HTML, CSS, JavaScript, React, Node.js, Express, and MongoDB.',
      orderIndex: 4,
    }
  ]);
  console.log('Added certifications data');

  console.log('About page database seeded successfully!');
}

seedAboutDatabase().catch((error) => {
  console.error('Error seeding about page database:', error);
  process.exit(1);
});