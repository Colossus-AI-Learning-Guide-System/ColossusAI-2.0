<div align="center">

![Colossus.AI Logo](/public/logo.png)

### Intelligent Solutions for Modern Development

[![Next.js](https://img.shields.io/badge/Next.js-000000?style=for-the-badge&logo=next.js&logoColor=white)](https://nextjs.org/)
[![React](https://img.shields.io/badge/React-61DAFB?style=for-the-badge&logo=react&logoColor=black)](https://reactjs.org/)
[![TypeScript](https://img.shields.io/badge/TypeScript-3178C6?style=for-the-badge&logo=typescript&logoColor=white)](https://www.typescriptlang.org/)
[![Tailwind CSS](https://img.shields.io/badge/Tailwind_CSS-38B2AC?style=for-the-badge&logo=tailwind-css&logoColor=white)](https://tailwindcss.com/)
[![Vercel](https://img.shields.io/badge/Vercel-000000?style=for-the-badge&logo=vercel&logoColor=white)](https://vercel.com/)
[![Claude](https://img.shields.io/badge/Powered_by_Claude-000000?style=for-the-badge&logo=anthropic&logoColor=white)](https://www.anthropic.com/claude)

</div>

## 🚀 About Colossus.AI

Colossus.AI is an AI-powered Learning Guide System that generates visual learning roadmaps and knowledge graphs to help users easily navigate complex educational content. Our platform processes uploaded documents and user queries to generate structured Knowledge Graphs that highlight key concepts, relationships, and summaries, making it easier to understand dense academic or technical materials.

Designed for students, educators, researchers, and professionals, Colossus.AI simplifies complex study materials, research papers, and documentation through intelligent visualization and organization. Our solution combines modern web technologies with advanced AI capabilities to transform how users interact with and extract value from documents and knowledge.

Getting started is simple: create an account, upload your document, enter your query, and let our AI generate a structured roadmap tailored to your learning needs.

### 🌟 Key Features

- 🧠 **AI-Powered Knowledge Graphs**: Process documents and generate structured, interactive visual roadmaps
  ![Knowledge Graphs Screenshot](/public/Scroll%20Animation/Sample%20Graph.mp4)
  - Automated graph generation
  - Interactive visualization
  - Semantic relationship mapping
  - Real-time updates

- 🔍 **Intelligent Search & Query**: Enter natural language queries and retrieve relevant insights from documents
  ![Intelligent Search Screenshot](/public/Scroll%20Animation/Sample%20Search.mp4)
  - Natural language processing
  - Semantic search
  - Context-aware results
  - Quick filtering options

- 📚 **Smart Document Management**: Upload, organize, and search documents effortlessly
  ![Document Management Screenshot](/public/features/document-management.png)
  - Drag-and-drop upload
  - Automatic categorization
  - Version control
  - Advanced search capabilities

- 📝 **AI-Generated Summaries**: Save time with concise, AI-powered document summaries
  ![AI Summaries Screenshot](/public/about/Chatpage.png)
  - Automatic summarization
  - Key points extraction
  - Customizable length
  - Multi-document synthesis

- 👥 **Collaboration & Sharing**: Easily share generated knowledge graphs with peers
  ![Collaboration Screenshot](/public/about/Landing_Page_Group31.png)
  - Real-time collaboration
  - Access control
  - Comment system
  - Export and sharing options

## 📱 Application Preview

<img width="1600" alt="Colossus.AI Dashboard" src="/public/about/Landing.jpg" />

## 🛠️ Technology Stack

- **Frontend Framework**: [Next.js](https://nextjs.org/) - React framework for production
- **UI Library**: [Lucid React](https://lucide.dev/guide/packages/lucide-react) & [Framer Motion](https://www.framer.com/motion/) - UI components and animation libraries
- **Styling**: [Tailwind CSS](https://tailwindcss.com/) - Utility-first CSS framework
- **Language**: [TypeScript](https://www.typescriptlang.org/) - Typed JavaScript
- **AI Integration**: [Claude API](https://www.anthropic.com/claude) - Advanced language model by Anthropic
- **Graph Visualization**: [Neo4j](https://neo4j.com/) - Graph database for knowledge representation
- **Authentication**: [Supabase Auth](https://supabase.com/docs/guides/auth) - User authentication service
- **Database**: [Supabase](https://supabase.com/) & [Neo4j](https://neo4j.com/) - Data storage and management
- **Deployment**: [Vercel](https://vercel.com/) (Frontend) & [RunPod](https://www.runpod.io/) (Backend) - Hosting platforms

## 🏁 Getting Started

### Prerequisites

- Node.js (version 20.x or higher)
- npm
- Git
- API key (for AI features)

### Installation

1. Clone the repository
   ```bash
   git clone https://github.com/Colossus-AI-Learning-Guide-System/ColossusAI-2.0.git
   cd platform
   ```

2. Install dependencies
   ```bash
   npm install
   ```

3. Set up environment variables
   ```bash
   cp .env.example .env.local
   # Then edit .env.local with your API keys and configuration
   ```

4. Run the development server
   ```bash
   npm run dev
   ```

5. Open [http://colossusai.net](http://colossusai.net) with your browser to see the application.

## 📂 Project Structure

```
colossus-ai/
├── app/                # Next.js app directory
│   ├── api/            # API routes for backend functionality
│   ├── auth/           # Authentication routes
│   ├── dashboard/      # Dashboard pages
│   ├── documents/      # Document management pages
│   ├── graphs/         # Knowledge graph pages
│   ├── search/         # Search functionality
│   ├── settings/       # User settings
│   ├── layout.tsx      # Root layout
│   └── page.tsx        # Home page
├── components/         # Reusable components
│   ├── ui/             # UI components (buttons, inputs, etc.)
│   ├── dashboard/      # Dashboard-specific components
│   ├── documents/      # Document-related components
│   ├── graphs/         # Graph visualization components
│   ├── search/         # Search components
│   └── shared/         # Shared components
├── lib/                # Utility functions and shared logic
│   ├── ai/             # AI integration services
│   ├── api/            # API client functions
│   ├── graph/          # Graph processing utilities
│   └── utils/          # Helper utilities
├── public/             # Static assets
├── styles/             # Global styles
├── types/              # TypeScript type definitions
└── ...                 # Configuration files
```

## 📊 Features in Detail

### AI-Powered Knowledge Graphs
Transform complex documents into interactive visual knowledge maps. Our advanced AI analyzes content, identifies key concepts and their relationships, and generates intuitive graph visualizations that make learning and information discovery more engaging and effective.

![Knowledge Graphs Detailed](/public/details/knowledge-graphs-detailed.png)

### Intelligent Search & Query
Go beyond keyword matching with our semantic search engine. Ask questions in natural language and receive precise answers extracted directly from your documents. The system understands context and can connect information across multiple sources.

![Intelligent Search Detailed]

### Smart Document Management
Our intelligent document system automatically organizes your uploads, extracts metadata, and makes everything searchable. Version control ensures you always have access to previous iterations, while our categorization system helps maintain order even with large document collections.

![Document Management Detailed]

### AI-Generated Summaries
Don't have time to read entire documents? Our AI generates concise, accurate summaries that capture the essential information. Customize summary length based on your needs, from brief overviews to detailed abstracts.

![AI Summaries Detailed]

### Collaboration & Sharing
Knowledge is more valuable when shared. Our platform makes it easy to collaborate with team members, classmates, or colleagues. Share documents, knowledge graphs, and insights with customizable access controls to maintain security.

![Collaboration Detailed]


## 🧪 Testing

```bash
# Run unit tests
npm run test

# Run end-to-end tests
npm run test:e2e

# Run both
npm run test:all
```

## 🚀 Deployment

This project uses a dual deployment strategy:

### Frontend Deployment
The frontend is deployed on [Vercel](https://vercel.com/), the platform created by the makers of Next.js.

1. Push your code to a GitHub repository
2. Import your project to Vercel
3. Vercel will detect Next.js and configure the build settings automatically
4. Your application will be deployed and available at [colossusai.net](https://colossusai.net)

### Backend Deployment
The backend services, including AI processing and graph generation, are deployed on [RunPod](https://www.runpod.io/), a GPU cloud platform optimized for AI workloads.

1. Our custom AI models and processing pipelines run on dedicated GPU instances
2. The RunPod deployment ensures fast processing of documents and generation of knowledge graphs
3. This separation of concerns allows us to scale the compute-intensive backend independently from the frontend

This architecture provides optimal performance and cost efficiency, with the ability to scale each component based on demand.

For more details on Next.js deployment, check out the [Next.js deployment documentation](https://nextjs.org/docs/app/building-your-application/deploying).

## 👥 Meet the Team

| Name | Role |
|------|------|
| Ruhan Nandalal | Team Lead |
| Tharana Bopearachchi | Project Manager |
| Sudesh Seneviratne | Frontend Lead |
| Akila Senanayake | Marketing Manager |
| Chiran Senarath | Business Analyst |
| Pasindu Gamage | UI Designer |


## 📫 Contact Us

- 📧 Email: colossus.ai.lk@gmail.com
- 🌐 Website: [colossusai.net](https://colossusai.net) - Our official website
- 📱 Social Media: 
  - [LinkedIn](https://www.linkedin.com/company/colossusai/)
  - [Facebook](https://web.facebook.com/colossusai)
  - [Instagram](https://www.instagram.com/colossusailk/)
  - [X (Twitter)](https://x.com/colossusailk)
  - [YouTube](https://www.youtube.com/@ColossusAI)
  - [Discord](https://discord.com/invite/JB473YPGUM)
  - [GitHub](https://github.com/Colossus-AI-Learning-Guide-System)





## ❓ FAQ

### Is Colossus.AI free to use?
Yes, Colossus.AI is free to use.

### What types of documents can I upload?
You can upload any type of documents.

### How accurate are the AI-generated summaries?
The AI-generated summaries are highly accurate and can be customized to your needs.

### Can I collaborate with others in real-time?
Yes, you can collaborate with others in real-time.

### Is my data secure?
Yes, your data is secure. We use the latest encryption and security practices to ensure your data is safe. Stored in a supabase secure cloud environment.

## 🌐 Supported Languages

- English

<div align="center">

---

Made with ❤️ by [Colossus.AI]

</div>
