import { db } from './src/db';
import { users, userProfiles, projects, documents, galleryItems, skillCategories, skills, education, experience, certifications, additionalSkills } from './src/db/schema';
import { eq } from 'drizzle-orm';
import bcrypt from 'bcryptjs';

async function seedDatabase() {
  console.log('Seeding database...');

  // Hash the password
  const hashedPassword = await bcrypt.hash('123456', 10);

  // Create the main user
  const [createdUser] = await db.insert(users).values({
    name: 'Isaac Maina',
    email: 'mainaisaacwachira2000@gmail.com',
    password: hashedPassword,
  }).returning({ id: users.id });

  const userId = createdUser.id;
  console.log(`Created user with ID: ${userId}`);

  // Create user profile
  await db.insert(userProfiles).values({
    userId: userId,
    name: 'Isaac Maina',
    title: 'Web Developer • IT Support • Data Analyst',
    about: 'I am a passionate IT Specialist with expertise in web development, IT support, and data analysis. With experience in technologies like Next.js, React, and various databases, I create efficient and user-friendly solutions.',
    location: 'Kenya',
    phone: '+254758302725',
    careerFocus: 'Web Development • IT Support • Data Analysis',
    image: '/me.jpg',
    skills: ['Web Dev', 'IT Support', 'Data Analysis', 'Database Mgmt'],
  });

  // Create skill categories and skills
  const [webDevCategory] = await db.insert(skillCategories).values({
    title: '⭐ Web Development',
    orderIndex: 0,
  }).returning({ id: skillCategories.id });

  await db.insert(skills).values([
    { name: 'Next.js', level: 90, categoryId: webDevCategory.id, orderIndex: 0 },
    { name: 'React', level: 85, categoryId: webDevCategory.id, orderIndex: 1 },
    { name: 'TypeScript', level: 80, categoryId: webDevCategory.id, orderIndex: 2 },
    { name: 'Tailwind CSS', level: 95, categoryId: webDevCategory.id, orderIndex: 3 },
    { name: 'Supabase', level: 75, categoryId: webDevCategory.id, orderIndex: 4 },
    { name: 'Prisma', level: 70, categoryId: webDevCategory.id, orderIndex: 5 },
    { name: 'PostgreSQL', level: 75, categoryId: webDevCategory.id, orderIndex: 6 },
    { name: 'Git/GitHub', level: 85, categoryId: webDevCategory.id, orderIndex: 7 },
    { name: 'Vercel', level: 80, categoryId: webDevCategory.id, orderIndex: 8 },
  ]);

  const [dataAnalysisCategory] = await db.insert(skillCategories).values({
    title: '⭐ Data Analysis',
    orderIndex: 1,
  }).returning({ id: skillCategories.id });

  await db.insert(skills).values([
    { name: 'Python', level: 85, categoryId: dataAnalysisCategory.id, orderIndex: 0 },
    { name: 'Pandas', level: 80, categoryId: dataAnalysisCategory.id, orderIndex: 1 },
    { name: 'NumPy', level: 75, categoryId: dataAnalysisCategory.id, orderIndex: 2 },
    { name: 'SQL', level: 80, categoryId: dataAnalysisCategory.id, orderIndex: 3 },
    { name: 'Excel', level: 85, categoryId: dataAnalysisCategory.id, orderIndex: 4 },
    { name: 'Data Visualization', level: 70, categoryId: dataAnalysisCategory.id, orderIndex: 5 },
  ]);

  const [itSupportCategory] = await db.insert(skillCategories).values({
    title: '⭐ IT Support & Systems',
    orderIndex: 2,
  }).returning({ id: skillCategories.id });

  await db.insert(skills).values([
    { name: 'Networking Basics', level: 75, categoryId: itSupportCategory.id, orderIndex: 0 },
    { name: 'Troubleshooting', level: 85, categoryId: itSupportCategory.id, orderIndex: 1 },
    { name: 'Database Management', level: 80, categoryId: itSupportCategory.id, orderIndex: 2 },
    { name: 'Operating Systems', level: 80, categoryId: itSupportCategory.id, orderIndex: 3 },
    { name: 'System Administration', level: 70, categoryId: itSupportCategory.id, orderIndex: 4 },
  ]);

  // Add additional skills
  await db.insert(additionalSkills).values([
    { name: 'JavaScript', orderIndex: 0 },
    { name: 'HTML5/CSS3', orderIndex: 1 },
    { name: 'RESTful APIs', orderIndex: 2 },
    { name: 'Responsive Design', orderIndex: 3 },
    { name: 'CI/CD', orderIndex: 4 },
    { name: 'Testing', orderIndex: 5 },
    { name: 'Agile Methodology', orderIndex: 6 },
    { name: 'Project Management', orderIndex: 7 },
  ]);

  // Add projects
  await db.insert(projects).values([
    {
      title: 'Inventory Management System',
      description: 'Next.js + Supabase + Neon database system for managing inventory efficiently.',
      image: '/projects/inventory.png',
      link: 'https://example.com',
      github: 'https://github.com/example/inventory',
      stack: ['Next.js', 'Supabase', 'Tailwind', 'PostgreSQL'],
      category: 'Web Development',
      orderIndex: 0,
    },
    {
      title: 'University Human Resource System',
      description: 'A comprehensive HR system for managing university staff information and processes.',
      image: '/projects/hr-system.png',
      link: 'https://example.com',
      github: 'https://github.com/example/hr-system',
      stack: ['React', 'Node.js', 'MongoDB', 'Express'],
      category: 'Web Development',
      orderIndex: 1,
    },
    {
      title: 'Data Analysis Dashboard',
      description: 'Interactive dashboard for visualizing data with various chart types and filters.',
      image: '/projects/dashboard.png',
      link: 'https://example.com',
      github: 'https://github.com/example/dashboard',
      stack: ['React', 'D3.js', 'Python', 'Pandas'],
      category: 'Data Analysis',
      orderIndex: 2,
    }
  ]);

  // Add documents
  await db.insert(documents).values([
    {
      title: 'Curriculum Vitae',
      file: '/documents/cv.pdf',
      description: 'My professional resume with detailed work experience and skills',
      orderIndex: 0,
    },
    {
      title: 'Google Technical Support Certificate',
      file: '/documents/google-tech-support.pdf',
      description: 'Certificate from Google Technical Support Professional Certificate program',
      orderIndex: 1,
    },
    {
      title: 'IBM Database Certificate',
      file: '/documents/ibm-database.pdf',
      description: 'Certificate from IBM Database Management course',
      orderIndex: 2,
    },
    {
      title: 'Oracle Cloud Certificate',
      file: '/documents/oracle-cloud.pdf',
      description: 'Certificate from Oracle Cloud Infrastructure Foundations course',
      orderIndex: 3,
    }
  ]);

  // Add gallery items
  await db.insert(galleryItems).values([
    {
      src: '/gallery/certificate1.jpg',
      alt: 'Google Technical Support Certificate',
      category: 'certificates',
      orderIndex: 0,
    },
    {
      src: '/gallery/certificate2.jpg',
      alt: 'IBM Database Certificate',
      category: 'certificates',
      orderIndex: 1,
    },
    {
      src: '/gallery/work1.jpg',
      alt: 'Working at desk',
      category: 'work',
      orderIndex: 2,
    },
    {
      src: '/gallery/certificate3.jpg',
      alt: 'Oracle Cloud Certificate',
      category: 'certificates',
      orderIndex: 3,
    },
    {
      src: '/gallery/event1.jpg',
      alt: 'Tech conference',
      category: 'events',
      orderIndex: 4,
    },
    {
      src: '/gallery/work2.jpg',
      alt: 'Coding session',
      category: 'work',
      orderIndex: 5,
    },
    {
      src: '/gallery/event2.jpg',
      alt: 'Team collaboration',
      category: 'events',
      orderIndex: 6,
    },
    {
      src: '/gallery/personal1.jpg',
      alt: 'Personal photo',
      category: 'personal',
      orderIndex: 7,
    }
  ]);

  // Add education
  await db.insert(education).values([
    {
      school: 'University Name',
      degree: 'Bachelor of Science in Computer Science',
      period: '20XX - 20XX',
      description: 'Relevant coursework included software engineering, databases, algorithms, and data structures.',
      orderIndex: 0,
    }
  ]);

  // Add experience
  await db.insert(experience).values([
    {
      title: 'Technical Support Intern',
      company: 'Kiambu County',
      period: '2023',
      description: 'Provided technical support for hardware and software issues, managed user accounts, and maintained network infrastructure. Developed strong problem-solving and communication skills.',
      orderIndex: 0,
    },
    {
      title: 'Freelance Web Developer',
      company: '',
      period: '2022 - Present',
      description: 'Developed and maintained web applications for clients using modern technologies including React, Next.js, and various backend solutions. Focused on creating responsive, user-friendly interfaces with optimal performance.',
      orderIndex: 1,
    }
  ]);

  // Add certifications
  await db.insert(certifications).values([
    {
      title: 'IBM Database Certificate',
      description: 'Database Management and Design',
      orderIndex: 0,
    },
    {
      title: 'Google Technical Support Certificate',
      description: 'Technical Support Fundamentals',
      orderIndex: 1,
    },
    {
      title: 'Oracle Cloud Certificate',
      description: 'Oracle Cloud Infrastructure Foundations',
      orderIndex: 2,
    }
  ]);

  console.log('Database seeded successfully!');
}

seedDatabase().catch((error) => {
  console.error('Error seeding database:', error);
  process.exit(1);
});