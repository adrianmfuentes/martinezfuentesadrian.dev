# 🚀 Modern Portfolio Website

A modern, interactive, and internationalized personal portfolio website for Software Engineering students and professionals. Built with Next.js, React Three Fiber, and Tailwind CSS.

![Portfolio Preview](/placeholder.svg?height=400&width=800)

## ✨ Features

- **🌐 Internationalization**: Full support for multiple languages (English and Spanish)
- **🎨 Modern Design**: Clean, professional UI with dark/light mode
- **📱 Responsive**: Fully responsive design for all devices
- **🔄 Interactive Elements**: 3D animations, parallax effects, and smooth transitions
- **🔍 SEO Optimized**: Meta tags and structured data for better search engine visibility
- **⚡ Performance Optimized**: Fast loading times and optimized assets

## 🛠️ Technologies

- **Framework**: [Next.js](https://nextjs.org/) (App Router)
- **Styling**: [Tailwind CSS](https://tailwindcss.com/)
- **UI Components**: [shadcn/ui](https://ui.shadcn.com/)
- **3D Graphics**: [React Three Fiber](https://docs.pmnd.rs/react-three-fiber)
- **Animations**: [Framer Motion](https://www.framer.com/motion/)
- **Form Handling**: [React Hook Form](https://react-hook-form.com/) with [Zod](https://github.com/colinhacks/zod)
- **Icons**: [Lucide React](https://lucide.dev/)

## 📋 Project Structure

\`\`\`
portfolio-website/
├── app/                    # Next.js App Router
│   ├── [lang]/             # Language-specific routes
│   │   ├── dictionaries/   # Translation files
│   │   ├── about/          # About page
│   │   ├── cv/             # CV page
│   │   ├── portfolio/      # Portfolio page
│   │   ├── contact/        # Contact page
│   │   └── page.tsx        # Home page
├── components/             # React components
├── public/                 # Static assets
└── ...
\`\`\`

## 🚀 Getting Started

### Prerequisites

- Node.js 18.x or later
- npm or yarn

### Installation

1. Clone the repository:
   \`\`\`bash
   git clone https://github.com/yourusername/portfolio-website.git
   cd portfolio-website
   \`\`\`

2. Install dependencies:
   \`\`\`bash
   npm install
   # or
   yarn install
   \`\`\`

3. Run the development server:
   \`\`\`bash
   npm run dev
   # or
   yarn dev
   \`\`\`

4. Open [http://localhost:3000](http://localhost:3000) in your browser.

## 🌐 Internationalization

The website supports multiple languages through Next.js App Router internationalization. The language files are located in `app/[lang]/dictionaries/`.

To add a new language:

1. Create a new JSON file in the dictionaries folder (e.g., `fr.json`)
2. Add the language to the supported locales in `middleware.ts`
3. Update the `getDictionary` function in `app/[lang]/dictionaries.ts`


## 📱 Mobile Optimization

The website is fully responsive and optimized for mobile devices. Key mobile features include:

- Responsive navigation with hamburger menu
- Touch-friendly interactive elements
- Optimized 3D rendering for mobile devices
- Properly sized text and UI elements

## 🔒 License

This project is licensed under the MIT License - see the LICENSE file for details.

## 🙏 Acknowledgements

- [Next.js](https://nextjs.org/) - The React Framework
- [Tailwind CSS](https://tailwindcss.com/) - Utility-first CSS framework
- [shadcn/ui](https://ui.shadcn.com/) - UI components
- [React Three Fiber](https://docs.pmnd.rs/react-three-fiber) - Three.js React renderer
- [Framer Motion](https://www.framer.com/motion/) - Animation library

---

Created by Adrian
