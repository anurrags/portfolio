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
    title: "Wordle Clone",
    description: "A fully functional iteration of the popular Wordle game built with React, featuring interactive keyboard state and precise guess validation.",
    url: "https://wordle-six-psi.vercel.app",
    thumbnail: "/projects/wordle.png",
    github: "https://github.com/anurrags/Wordle",
    tags: ["React", "Game", "Logic"]
  },
  {
    title: "Exam Flow",
    description: "A complete web application to conduct online exams. Features advanced anti-cheat mechanisms for secure remote testing.",
    url: "https://examflow-nine.vercel.app",
    thumbnail: "/projects/examflow.png",
    github: "https://github.com/anurrags/exam-flow",
    tags: ["React", "Education", "Anti-Cheat"]
  },
  {
    title: "Typing Panda",
    description: "An elegant, customizable typing speed test application with a sleek, minimalist dark-mode design.",
    url: "https://typingpanda.vercel.app",
    thumbnail: "/projects/typingpanda.png",
    github: "https://github.com/anurrags/typing-panda",
    tags: ["Typing", "Productivity", "UI/UX"]
  },
  {
    title: "Multiplayer Ludo",
    description: "A real-time multiplayer Ludo game allowing friends to play the classic board game interactively from anywhere.",
    url: "https://ludo-ten-lemon.vercel.app",
    thumbnail: "/projects/ludo.png",
    github: "https://github.com/anurrags/ludo",
    tags: ["Game", "Multiplayer", "Real-time"]
  }
];
