import { useState } from "react";
import { FileText, Headphones, BookOpen, Mic, X, ExternalLink, ChevronRight } from "lucide-react";
import { cn } from "@/lib/cn";

interface CDIFile {
  id: string;
  name: string;
  skill: "listening" | "reading" | "writing" | "speaking";
  number: number;
  path: string;
  preview: {
    title: string;
    sections: string[];
    taskCount: number;
  };
}

const SKILL_CONFIG = {
  listening: {
    icon: Headphones,
    color: "from-green-600 to-green-400",
    darkColor: "dark:from-green-500 dark:to-green-400",
    bgColor: "bg-green-50 dark:bg-green-900/30",
    textColor: "text-green-700 dark:text-green-300",
    borderColor: "border-green-200 dark:border-green-800",
    count: 66,
  },
  reading: {
    icon: BookOpen,
    color: "from-blue-600 to-blue-400",
    darkColor: "dark:from-blue-500 dark:to-blue-400",
    bgColor: "bg-blue-50 dark:bg-blue-900/30",
    textColor: "text-blue-700 dark:text-blue-300",
    borderColor: "border-blue-200 dark:border-blue-800",
    count: 75,
  },
  writing: {
    icon: FileText,
    color: "from-purple-600 to-purple-400",
    darkColor: "dark:from-purple-500 dark:to-purple-400",
    bgColor: "bg-purple-50 dark:bg-purple-900/30",
    textColor: "text-purple-700 dark:text-purple-300",
    borderColor: "border-purple-200 dark:border-purple-800",
    count: 49,
  },
  speaking: {
    icon: Mic,
    color: "from-orange-600 to-orange-400",
    darkColor: "dark:from-orange-500 dark:to-orange-400",
    bgColor: "bg-orange-50 dark:bg-orange-900/30",
    textColor: "text-orange-700 dark:text-orange-300",
    borderColor: "border-orange-200 dark:border-orange-800",
    count: 10,
  },
};

const generateCDIFiles = (): Record<string, CDIFile[]> => {
  const files: Record<string, CDIFile[]> = {
    listening: Array.from({ length: 66 }, (_, i) => ({
      id: `listening-${i + 1}`,
      name: `CDI Listening ${i + 1}`,
      skill: "listening" as const,
      number: i + 1,
      path: `/cdi/full-cdi-listening-${i + 1}.html`,
      preview: {
        title: `Listening Test ${i + 1}`,
        sections: ["Section 1", "Section 2", "Section 3", "Section 4"],
        taskCount: 40,
      },
    })),
    reading: Array.from({ length: 75 }, (_, i) => ({
      id: `reading-${i + 1}`,
      name: `CDI Reading ${i + 1}`,
      skill: "reading" as const,
      number: i + 1,
      path: `/cdi/full-cdi-reading-${i + 1}.html`,
      preview: {
        title: `Reading Test ${i + 1}`,
        sections: ["Passage 1", "Passage 2", "Passage 3"],
        taskCount: 40,
      },
    })),
    writing: Array.from({ length: 49 }, (_, i) => ({
      id: `writing-${i + 1}`,
      name: `CDI Writing ${i + 1}`,
      skill: "writing" as const,
      number: i + 1,
      path: `/cdi/writing-test-${i + 1}.html`,
      preview: {
        title: `Writing Test ${i + 1}`,
        sections: ["Task 1", "Task 2"],
        taskCount: 2,
      },
    })),
    speaking: Array.from({ length: 10 }, (_, i) => ({
      id: `speaking-${i + 1}`,
      name: `CDI Speaking ${i + 1}`,
      skill: "speaking" as const,
      number: i + 1,
      path: `/cdi/speaking-test-${i + 1}.html`,
      preview: {
        title: `Speaking Test ${i + 1}`,
        sections: ["Part 1", "Part 2", "Part 3"],
        taskCount: 3,
      },
    })),
  };
  return files;
};

export function CDIPractice() {
  const [selectedSkill, setSelectedSkill] = useState<"listening" | "reading" | "writing" | "speaking" | null>(null);
  const [selectedCard, setSelectedCard] = useState<CDIFile | null>(null);
  const cdiFiles = generateCDIFiles();

  const skillsData = [
    { key: "listening" as const, label: "Listening" },
    { key: "reading" as const, label: "Reading" },
    { key: "writing" as const, label: "Writing" },
    { key: "speaking" as const, label: "Speaking" },
  ];

  // Main Skills View
  if (!selectedSkill) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 dark:from-slate-900 dark:to-slate-800">
        {/* Header */}
        <div className="bg-gradient-to-r from-blue-600 to-purple-600 text-white py-12 px-4 sm:px-6 lg:px-8">
          <div className="max-w-7xl mx-auto">
            <h1 className="text-5xl font-bold mb-2">CDI Practice</h1>
            <p className="text-blue-100 text-lg">208 authentic IELTS Computer-Delivered tests</p>
          </div>
        </div>

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          {/* Skills Section */}
          <div className="mb-8">
            <h2 className="text-2xl font-bold text-slate-900 dark:text-white mb-6">SKILLS</h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
              {skillsData.map((skill) => {
                const config = SKILL_CONFIG[skill.key];
                const IconComponent = config.icon;
                const testCount = config.count;

                return (
                  <button
                    key={skill.key}
                    onClick={() => setSelectedSkill(skill.key)}
                    className={cn(
                      "group relative overflow-hidden rounded-2xl p-8 text-white transition-all duration-300 transform hover:scale-105 hover:shadow-2xl",
                      `bg-gradient-to-br ${config.color}`,
                    )}
                  >
                    {/* Background gradient overlay */}
                    <div className="absolute inset-0 opacity-0 group-hover:opacity-20 bg-white transition-opacity" />

                    {/* Content */}
                    <div className="relative">
                      <div className="mb-4">
                        <div className="inline-flex p-3 rounded-xl bg-white/20 group-hover:bg-white/30 transition">
                          <IconComponent className="w-8 h-8" />
                        </div>
                      </div>
                      <h3 className="text-3xl font-bold mb-1">{skill.label}</h3>
                      <p className="text-white/90 font-semibold text-lg">{testCount} Tests</p>
                      <p className="text-white/70 text-sm mt-3 flex items-center gap-1">
                        Explore <ChevronRight className="w-4 h-4 group-hover:translate-x-1 transition" />
                      </p>
                    </div>
                  </button>
                );
              })}
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Flash Cards View
  const currentSkill = selectedSkill;
  const currentSkillConfig = SKILL_CONFIG[currentSkill];
  const files = cdiFiles[currentSkill];
  const IconComponent = currentSkillConfig.icon;

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 dark:from-slate-900 dark:to-slate-800">
      {/* Header */}
      <div className={cn(
        "bg-gradient-to-r text-white py-8 px-4 sm:px-6 lg:px-8",
        `${currentSkillConfig.color}`
      )}>
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-4">
            <button
              onClick={() => setSelectedSkill(null)}
              className="p-2 hover:bg-white/20 rounded-lg transition"
            >
              <ChevronRight className="w-6 h-6 rotate-180" />
            </button>
            <div>
              <div className="flex items-center gap-2 mb-1">
                <IconComponent className="w-6 h-6" />
                <h1 className="text-3xl font-bold capitalize">{currentSkill}</h1>
              </div>
              <p className="text-white/90">
                {files.length} {files.length === 1 ? "test" : "tests"} available
              </p>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Flash Cards Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
          {files.map((file) => (
            <button
              key={file.id}
              onClick={() => setSelectedCard(file)}
              className={cn(
                "group text-left p-5 rounded-xl transition-all duration-300 transform hover:scale-105",
                "border-2 hover:shadow-lg cursor-pointer",
                `border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800`,
              )}
            >
              {/* Skill Badge */}
              <div className={cn(
                "inline-flex items-center gap-2 mb-3 px-3 py-1.5 rounded-full text-xs font-bold uppercase tracking-wider",
                currentSkillConfig.bgColor,
                currentSkillConfig.textColor,
              )}>
                <IconComponent className="w-3 h-3" />
                {currentSkill}
              </div>

              {/* Title */}
              <h3 className="font-bold text-lg mb-3 text-slate-900 dark:text-white group-hover:text-blue-600 dark:group-hover:text-blue-400 transition">
                {file.preview.title}
              </h3>

              {/* Sections */}
              <div className="mb-3 space-y-1">
                {file.preview.sections.map((section, idx) => (
                  <p key={idx} className="text-sm text-slate-600 dark:text-slate-400">
                    • {section}
                  </p>
                ))}
              </div>

              {/* Task Count */}
              <div className={cn(
                "text-xs font-bold",
                currentSkillConfig.textColor,
              )}>
                {file.preview.taskCount} {file.preview.taskCount === 1 ? "task" : "tasks"}
              </div>
            </button>
          ))}
        </div>
      </div>

      {/* Detail Modal */}
      {selectedCard && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/50 backdrop-blur-sm p-4">
          <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-2xl max-w-md w-full overflow-hidden animate-in">
            {/* Header */}
            <div className={cn(
              "bg-gradient-to-r p-6 text-white",
              `${currentSkillConfig.color}`
            )}>
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center gap-2">
                  <IconComponent className="w-5 h-5" />
                  <span className="text-sm font-semibold uppercase tracking-wider opacity-90">
                    {currentSkill}
                  </span>
                </div>
                <button
                  onClick={() => setSelectedCard(null)}
                  className="p-1 hover:bg-white/20 rounded-lg transition"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
              <h2 className="text-2xl font-bold">{selectedCard.preview.title}</h2>
            </div>

            {/* Content */}
            <div className="p-6 space-y-5">
              {/* Sections */}
              <div>
                <h3 className="font-semibold text-slate-900 dark:text-white mb-2 text-sm uppercase tracking-widest">
                  Sections
                </h3>
                <div className="space-y-1.5">
                  {selectedCard.preview.sections.map((section, idx) => (
                    <p key={idx} className="text-sm text-slate-600 dark:text-slate-400 flex items-center gap-2">
                      <span className="w-2 h-2 bg-blue-500 rounded-full" />
                      {section}
                    </p>
                  ))}
                </div>
              </div>

              {/* Task Info */}
              <div className={cn(
                "p-3 rounded-lg",
                currentSkillConfig.bgColor,
              )}>
                <p className={cn("text-sm font-semibold", currentSkillConfig.textColor)}>
                  📋 {selectedCard.preview.taskCount} {selectedCard.preview.taskCount === 1 ? "Task" : "Tasks"}
                </p>
              </div>

              {/* Test Info */}
              <p className="text-xs text-slate-500 dark:text-slate-400 text-center">
                Test #{selectedCard.number} • Authentic CDI Material
              </p>
            </div>

            {/* Footer - Buttons */}
            <div className="border-t border-slate-200 dark:border-slate-700 p-6 flex gap-3">
              <button
                onClick={() => setSelectedCard(null)}
                className="flex-1 px-4 py-2.5 text-sm font-semibold text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-700 rounded-lg transition"
              >
                Close
              </button>
              <button
                onClick={() => {
                  window.open(selectedCard.path, "_blank");
                  setSelectedCard(null);
                }}
                className={cn(
                  "flex-1 px-4 py-2.5 text-sm font-semibold text-white rounded-lg transition flex items-center justify-center gap-2 hover:shadow-lg",
                  `bg-gradient-to-r ${currentSkillConfig.color}`,
                )}
              >
                <ExternalLink className="w-4 h-4" />
                Open
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
