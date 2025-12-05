# Isaac Maina Portfolio

Welcome to my professional portfolio website! This project showcases my skills, projects, and experience as an IT Specialist, Web Developer, and Data Analyst.

## Features

- Modern, responsive design using Next.js and Tailwind CSS
- Animated components using Framer Motion
- Professional sections for:
  - Home
  - About
  - Skills
  - Projects
  - Gallery
  - Documents
  - Contact

## Technology Stack

- Next.js 14 (App Router)
- React 18
- TypeScript
- Tailwind CSS
- Framer Motion (Animations)
- React Icons
- Node.js

## Color Palette

- Midnight Blue: #0f172a
- Slate Gray: #1e293b
- Accent Cyan: #06b6d4
- White: #ffffff

## Project Structure

```
isaac-maina-portfolio/
├── public/
│   ├── documents/          # Resume, certificates
│   ├── projects/           # Project screenshots
│   ├── images/             # Personal photos
│   └── favicon.ico
├── src/
│   ├── app/               # Page components
│   │   ├── about/
│   │   ├── skills/
│   │   ├── projects/
│   │   ├── gallery/
│   │   ├── documents/
│   │   ├── contact/
│   │   ├── layout.tsx
│   │   └── page.tsx
│   ├── components/        # Reusable components
│   │   ├── Header.tsx
│   │   └── Footer.tsx
│   ├── data/              # Portfolio data
│   │   ├── profile.ts
│   │   ├── projects.ts
│   │   └── documents.ts
└── package.json
```

## Getting Started

### Prerequisites

- Node.js (v16 or higher)
- npm or yarn

### Installation

1. Clone the repository:
```bash
git clone <repository-url>
cd isaac-maina-portfolio
```

2. Install dependencies:
```bash
npm install
```

3. Run the development server:
```bash
npm run dev
# or
yarn dev
```

4. Open [http://localhost:3000](http://localhost:3000) in your browser.

## Customization

To customize the portfolio with your own information:

1. Update the data in `src/data/profile.ts`
2. Add your projects to `src/data/projects.ts`
3. Add your documents to `src/data/documents.ts`
4. Replace placeholder images in the `public` directory
5. Update your contact information

## Deployment

This project is ready to be deployed to platforms like Vercel, Netlify, or any other hosting service that supports Next.js applications.

### Vercel (recommended)

The easiest way to deploy your Next.js app is to use the [Vercel Platform](https://vercel.com/new?utm_medium=default-template&filter=next.js&utm_source=create-next-app&utm_campaign=create-next-app-readme) from the creators of Next.js.

## Contributing

Feel free to fork this repository, make changes, and submit pull requests if you'd like to improve the portfolio.

## Contact

Isaac Maina
- Email: [mainaisaacwachira2000@gmail.com](mailto:mainaisaacwachira2000@gmail.com)
- LinkedIn: [Isaac Maina](https://www.linkedin.com/in/isaac-maina/?skipRedirect=true)
- GitHub: [IsaacMaina](https://github.com/IsaacMaina)

---

© {new Date().getFullYear()} Isaac Maina. All rights reserved.