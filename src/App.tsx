import { useState } from 'react';
import DockerfileGuide from './components/DockerfileGuide';
import ComposeGuide from './components/ComposeGuide';
import Quiz from './components/Quiz';
import DockerfileGenerator from './components/DockerfileGenerator';

type Tab = 'dockerfile' | 'compose' | 'generator' | 'quiz';

function App() {
  const [activeTab, setActiveTab] = useState<Tab>('dockerfile');

  const tabs: { id: Tab; label: string; icon: string; color: string }[] = [
    { id: 'dockerfile', label: 'Dockerfile', icon: '🐳', color: 'blue' },
    { id: 'compose', label: 'Compose', icon: '🎼', color: 'purple' },
    { id: 'generator', label: 'Генератор', icon: '⚡', color: 'green' },
    { id: 'quiz', label: 'Квиз', icon: '🧠', color: 'orange' },
  ];

  return (
    <div className="min-h-screen bg-gray-900 text-gray-100">
      {/* Header */}
      <header className="bg-gray-800/80 backdrop-blur-sm border-b border-gray-700 sticky top-0 z-50">
        <div className="max-w-6xl mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-cyan-400 rounded-xl flex items-center justify-center text-xl">
                🐋
              </div>
              <div>
                <h1 className="text-xl font-bold text-white">Docker Manifests</h1>
                <p className="text-xs text-gray-400">Шпаргалка и тренажёр</p>
              </div>
            </div>
            <div className="hidden sm:flex items-center gap-2 text-xs text-gray-500">
              <span className="px-2 py-1 bg-gray-700 rounded-full">v24.0+</span>
              <span className="px-2 py-1 bg-gray-700 rounded-full">Compose V2</span>
            </div>
          </div>
        </div>
      </header>

      {/* Navigation */}
      <nav className="bg-gray-800/50 border-b border-gray-700">
        <div className="max-w-6xl mx-auto px-4">
          <div className="flex gap-1 overflow-x-auto py-2 scrollbar-hide">
            {tabs.map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex items-center gap-2 px-4 py-2.5 rounded-lg text-sm font-medium whitespace-nowrap transition-all cursor-pointer ${
                  activeTab === tab.id
                    ? `bg-${tab.color}-600/20 text-${tab.color}-400 border border-${tab.color}-500/30`
                    : 'text-gray-400 hover:text-white hover:bg-gray-700/50'
                }`}
                style={activeTab === tab.id ? {
                  backgroundColor: tab.color === 'blue' ? 'rgba(37, 99, 235, 0.2)' :
                                   tab.color === 'purple' ? 'rgba(147, 51, 234, 0.2)' :
                                   tab.color === 'green' ? 'rgba(34, 197, 94, 0.2)' :
                                   'rgba(249, 115, 22, 0.2)',
                  color: tab.color === 'blue' ? '#60a5fa' :
                         tab.color === 'purple' ? '#c084fc' :
                         tab.color === 'green' ? '#4ade80' :
                         '#fb923c',
                  borderColor: tab.color === 'blue' ? 'rgba(59, 130, 246, 0.3)' :
                               tab.color === 'purple' ? 'rgba(168, 85, 247, 0.3)' :
                               tab.color === 'green' ? 'rgba(74, 222, 128, 0.3)' :
                               'rgba(251, 146, 60, 0.3)',
                } : {}}
              >
                <span>{tab.icon}</span>
                <span>{tab.label}</span>
              </button>
            ))}
          </div>
        </div>
      </nav>

      {/* Content */}
      <main className="max-w-6xl mx-auto px-4 py-8">
        {activeTab === 'dockerfile' && (
          <div>
            <div className="mb-6">
              <h2 className="text-2xl font-bold text-white mb-2">📖 Справочник Dockerfile</h2>
              <p className="text-gray-400">
                Все инструкции Dockerfile с описанием, синтаксисом, примерами и советами.
              </p>
            </div>
            <DockerfileGuide />
          </div>
        )}

        {activeTab === 'compose' && (
          <div>
            <div className="mb-6">
              <h2 className="text-2xl font-bold text-white mb-2">🎼 Docker Compose</h2>
              <p className="text-gray-400">
                Справочник по docker-compose.yml — поля, синтаксис и готовые примеры.
              </p>
            </div>
            <ComposeGuide />
          </div>
        )}

        {activeTab === 'generator' && (
          <div>
            <div className="mb-6">
              <h2 className="text-2xl font-bold text-white mb-2">⚡ Генератор Dockerfile</h2>
              <p className="text-gray-400">
                Интерактивный генератор Dockerfile с настройками для вашего стека.
              </p>
            </div>
            <DockerfileGenerator />
          </div>
        )}

        {activeTab === 'quiz' && (
          <div>
            <div className="mb-6">
              <h2 className="text-2xl font-bold text-white mb-2">🧠 Проверь себя</h2>
              <p className="text-gray-400">
                Квиз из 10 вопросов для проверки знаний Docker.
              </p>
            </div>
            <Quiz />
          </div>
        )}
      </main>

      {/* Footer */}
      <footer className="border-t border-gray-700 bg-gray-800/30 mt-12">
        <div className="max-w-6xl mx-auto px-4 py-6">
          <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
            <p className="text-sm text-gray-500">
              Docker Manifests — интерактивный справочник для изучения Docker
            </p>
            <div className="flex items-center gap-4 text-xs text-gray-500">
              <span>Dockerfile</span>
              <span>•</span>
              <span>Docker Compose</span>
              <span>•</span>
              <span>Best Practices</span>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}

export default App;
