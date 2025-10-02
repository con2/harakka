import { useLanguage } from "@/context/LanguageContext";
import { t } from "@/translations";
import { useState } from "react";

// TODO: should we upload our real images/logos?
// Also, currently the social links are AI created svgs, we should replace them with real icons later, but should agree whether to import or to use Lucide or similar library

interface TeamMember {
  name: string;
  role: { fi: string; en: string };
  bio: { fi: string; en: string };
  linkedin?: string;
  github?: string;
}

const DevTeam = () => {
  const { lang } = useLanguage();
  const [selectedMember, setSelectedMember] = useState<TeamMember | null>(null);

  const teamMembers = [
    {
      name: "Jonathan Gian",
      role: { fi: "Full Stack -kehittäjä", en: "Full Stack Developer" },
      bio: {
        fi: "Cool stuff in Finnish",
        en: "Jon writes here some cool stuff about himself.",
      },
      linkedin: "https://www.linkedin.com/in/",
      github: "https://github.com/JonathanGian",
    },
    {
      name: "Stefanie Jana",
      role: { fi: "Full Stack -kehittäjä", en: "Full Stack Developer" },
      bio: {
        fi: "Cool stuff in Finnish",
        en: "Steffi writes here some cool stuff about herself.",
      },
      linkedin: "https://www.linkedin.com/in/",
      github: "https://github.com/stabjana",
    },
    {
      name: "Athina Kantis",
      role: { fi: "Full Stack -kehittäjä", en: "Full Stack Developer" },
      bio: {
        fi: "Cool stuff in Finnish",
        en: "Athina writes here some cool stuff about herself.",
      },
      linkedin: "https://www.linkedin.com/in/",
      github: "https://github.com/athinakantis",
    },
    {
      name: "Vladimir Beliakov",
      role: { fi: "Full Stack -kehittäjä", en: "Full Stack Developer" },
      bio: {
        fi: "Cool stuff in Finnish",
        en: "Vova writes here some cool stuff about himself.",
      },
      linkedin: "https://www.linkedin.com/in/",
      github: "https://github.com/Ermegilius",
    },
    {
      name: "Maria Aluko",
      role: { fi: "Full Stack -kehittäjä", en: "Full Stack Developer" },
      bio: {
        fi: "Cool stuff in Finnish",
        en: "Maria writes here some cool stuff about herself.",
      },
      linkedin: "https://www.linkedin.com/in/maria-aluko/",
      github: "https://github.com/maria-aluko",
    },
  ];

  return (
    <div className="min-h-screen bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto">
        {/* Header Section */}
        <div className="text-center mb-12">
          <h1 className="text-3xl font-semibold text-gray-900 mb-4">
            {t.devTeam.title[lang]}
          </h1>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto">
            {t.devTeam.subtitle[lang]}
          </p>
        </div>

        {/* Team Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-12">
          {teamMembers.map((member, index) => (
            <div key={index} className="bg-transparent">
              {/* Avatar */}
              {/* TODO: REPLACE WITH REAL IMAGES/LOGOS */}
              <div
                className="h-48 flex items-center justify-center cursor-pointer"
                onClick={() => setSelectedMember(member)}
              >
                <div className="bg-gradient-to-br from-blue-400 to-blue-600 border-2 border-gray-400 w-32 h-32 rounded-full flex items-center justify-center shadow-lg hover:shadow-xl transition-shadow duration-300">
                  <div className="text-white text-4xl font-bold">
                    {member.name
                      .split(" ")
                      .map((n) => n[0])
                      .join("")}
                  </div>
                </div>
              </div>

              {/* Member Info */}
              <div className="flex flex-col justify-center items-center">
                <h3
                  className="text-xl font-bold text-gray-700 mb-1 cursor-pointer hover:text-blue-600 transition-colors duration-300"
                  onClick={() => setSelectedMember(member)}
                >
                  {member.name}
                </h3>
                <p className="text-gray-400 font-medium mb-3">
                  {member.role[lang]}
                </p>

                {/* Social Links */}
                {/* TODO: REPLACE WITH REAL ICONS */}
                <div className="flex gap-4">
                  {member.linkedin && (
                    <a
                      href={member.linkedin}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-gray-600 hover:text-blue-700 transition-colors duration-400"
                      title="LinkedIn"
                    >
                      <svg
                        className="w-6 h-6"
                        fill="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433c-1.144 0-2.063-.926-2.063-2.065 0-1.138.92-2.063 2.063-2.063 1.14 0 2.064.925 2.064 2.063 0 1.139-.925 2.065-2.064 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z" />
                      </svg>
                    </a>
                  )}
                  {member.github && (
                    <a
                      href={member.github}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-gray-500 hover:text-orange-600 transition-colors duration-400"
                      title="GitHub"
                    >
                      <svg
                        className="w-6 h-6"
                        fill="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path d="M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576 4.765-1.589 8.199-6.086 8.199-11.386 0-6.627-5.373-12-12-12z" />
                      </svg>
                    </a>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Member Details Dialog */}
        {selectedMember && (
          <div
            className="fixed inset-0 backdrop-blur-sm bg-white/30 flex items-center justify-center z-50 p-4"
            onClick={() => setSelectedMember(null)}
          >
            <div
              className="bg-white rounded-lg shadow-2xl max-w-lg w-full p-6 relative"
              onClick={(e) => e.stopPropagation()}
            >
              {/* Close Button */}
              <button
                onClick={() => setSelectedMember(null)}
                className="absolute top-4 right-4 text-gray-500 hover:text-gray-700 transition-colors"
              >
                <svg
                  className="w-6 h-6"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M6 18L18 6M6 6l12 12"
                  />
                </svg>
              </button>

              {/* Dialog Content */}
              <div className="flex flex-col items-center">
                {/* Avatar */}
                <div className="bg-gradient-to-br from-blue-400 to-blue-600 border-2 border-gray-400 w-24 h-24 rounded-full flex items-center justify-center shadow-lg mb-4">
                  <div className="text-white text-3xl font-bold">
                    {selectedMember.name
                      .split(" ")
                      .map((n) => n[0])
                      .join("")}
                  </div>
                </div>

                {/* Name and Role */}
                <h2 className="text-2xl font-bold text-gray-700">
                  {selectedMember.name}
                </h2>
                <p className="text-gray-400 font-medium mb-4">
                  {selectedMember.role[lang]}
                </p>

                {/* Bio */}
                <div className="w-full mb-6 text-center">
                  <p className="text-gray-600">{selectedMember.bio[lang]}</p>
                </div>

                {/* Social Links */}
                <div className="flex gap-4">
                  {selectedMember.linkedin && (
                    <a
                      href={selectedMember.linkedin}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-gray-600 hover:text-blue-700 transition-colors duration-400"
                      title="LinkedIn"
                    >
                      <svg
                        className="w-8 h-8"
                        fill="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433c-1.144 0-2.063-.926-2.063-2.065 0-1.138.92-2.063 2.063-2.063 1.14 0 2.064.925 2.064 2.063 0 1.139-.925 2.065-2.064 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z" />
                      </svg>
                    </a>
                  )}
                  {selectedMember.github && (
                    <a
                      href={selectedMember.github}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-gray-500 hover:text-orange-600 transition-colors duration-400"
                      title="GitHub"
                    >
                      <svg
                        className="w-8 h-8"
                        fill="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path d="M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576 4.765-1.589 8.199-6.086 8.199-11.386 0-6.627-5.373-12-12-12z" />
                      </svg>
                    </a>
                  )}
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default DevTeam;
