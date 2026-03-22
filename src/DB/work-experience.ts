import { experienceDataInteface } from "../utils/interface";

const experienceData: experienceDataInteface[] = [
  {
    date: "July 2024 - Present",
    company: "Upstox",
    position: "SDE-1 Fullstack",
    description:
      "• Engineered real-time price alert notification systems and dynamic health insurance quote backends.\n• Developed the SEO-optimized Help Center using Next.js SSR and built the UI for the Upstox AI Copilot chatbot.\n• Integrated DynamoDB pipelines to empower the support and IVR teams with real-time customer investment insights.",
    techStack: "Next.js, Java, SpringBoot, TypeScript, DynamoDB",
  },
  {
    date: "January 2024 - June 2024",
    company: "Upstox",
    position: "SDE Intern",
    description:
      "• Built a secure internal dashboard backed by AzureAD for managing and deploying custom in-app notifications, eliminating redundant alerts.\n• Implemented a pub/sub event system with Kafka to automatically synchronize local caches across horizontally scaled pods.",
    techStack: "React.js, SpringBoot, TypeScript, Kafka, AzureAD",
  },
  {
    date: "December 2022 - January 2023",
    company: "Rhizobee Innovations",
    position: "Backend Developer Intern",
    description:
      "• Engineered a robust server-side application to streamline the management, storage, and retrieval of 3D models and their metadata.\n• Developed efficient APIs to seamlessly serve 3D models from the database directly to the frontend rendering engine.",
    techStack: "React.js, Node.js, MongoDB, Three.js",
  },
];

export default experienceData;
