import { experienceDataInteface } from "../utils/interface";

const experienceData: experienceDataInteface[] = [
  {
    date: "July 2024 - Present",
    company: "Upstox",
    position: "SDE-1 Full Stack",
    description:
      "• Re-engineered the pledge pipeline on CDSL's latest APIs (87% faster, 5 min → 40 s) and cut pledge rejections by 90%; shipped one-click Pledge & Buy and Hedge.\n• Designed an event-driven technical-indicator alerts platform (EMA/SMA, RSI, MACD, VWAP) on Kafka, MongoDB and Redis.\n• Ended 404s on SEO stock pages for delisted and merged companies with an instrument snapshot store, sitemaps and redirects.\n• Cut Redis CPU from 90% to 20% with a master–replica split, connection pooling and batched UNLINK.",
    techStack: "Java, Spring Boot, Kafka, Redis, MongoDB, Kubernetes, Next.js, TypeScript",
  },
  {
    date: "January 2024 - June 2024",
    company: "Upstox",
    position: "SDE Intern",
    description:
      "• Built an internal dashboard to compose and send targeted in-app notifications, cutting redundant notifications to zero, secured with Azure AD SSO.\n• Designed a Kafka pub/sub mechanism that hot-reloads the template cache on every deployed pod when a new template is added, with no restarts or redeploys.",
    techStack: "React.js, Spring Boot, TypeScript, Kafka, Azure AD",
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
