export interface Project {
  title: string;
  description: string;
  url: string;
  thumbnail: string;
  github: string;
  tags: string[];
}

export const projectsData: Project[] = [
  {
    title: "Multiplayer Chess Game",
    description: "A real-time multiplayer chess application built with WebSockets, enabling live matches between players globally.",
    url: "https://chess.anurags.in",
    thumbnail: "/projects/chessgame.png",
    github: "https://github.com/anurrags/ChessGame",
    tags: ["React", "WebSockets", "Node.js"]
  },
  {
    title: "Exam Flow",
    description: "A complete web application to conduct online exams. Features advanced anti-cheat mechanisms for secure remote testing.",
    url: "https://examflow.anurags.in",
    thumbnail: "/projects/examflow.png",
    github: "https://github.com/anurrags/exam-flow",
    tags: ["React", "Education", "Anti-Cheat"]
  },
  {
    title: "Typing Panda",
    description: "An elegant, customizable typing speed test application with a sleek, minimalist dark-mode design.",
    url: "https://typing-panda.anurags.in",
    thumbnail: "/projects/typingpanda.png",
    github: "https://github.com/anurrags/typing-panda",
    tags: ["Typing", "Productivity", "UI/UX"]
  },
  {
    title: "Multiplayer Ludo",
    description: "A real-time multiplayer Ludo game allowing friends to play the classic board game interactively from anywhere.",
    url: "https://ludo.anurags.in",
    thumbnail: "/projects/ludo.png",
    github: "https://github.com/anurrags/ludo",
    tags: ["Game", "Multiplayer", "Real-time"]
  }
];
