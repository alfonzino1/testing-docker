import { useState } from 'react';
import { dockerfileInstructions, dockerfileExamples, bestPractices } from '../data/dockerData';
import CodeBlock from './CodeBlock';

export default function DockerfileGuide() {
  const [expandedInstruction, setExpandedInstruction] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<'instructions' | 'examples' | 'practices'>('instructions');

  return (
    <div className="space-y-6">
      {/* Tabs */}
      <div className="flex gap-2 border-b border-gray-700 pb-2">
        <button
          onClick={() => setActiveTab('instructions')}
          className={`px-4 py-2 rounded-t-lg text-sm font-medium transition-colors cursor-pointer ${
            activeTab === 'instructions'
              ? 'bg-blue-600 text-white'
              : 'bg-gray-800 text-gray-400 hover:text-white'
          }`}
        >
          📖 Инструкции
        </button>
        <button
          onClick={() => setActiveTab('examples')}
          className={`px-4 py-2 rounded-t-lg text-sm font-medium transition-colors cursor-pointer ${
            activeTab === 'examples'
              ? 'bg-blue-600 text-white'
              : 'bg-gray-800 text-gray-400 hover:text-white'
          }`}
        >
          📝 Примеры
        </button>
        <button
          onClick={() => setActiveTab('practices')}
          className={`px-4 py-2 rounded-t-lg text-sm font-medium transition-colors cursor-pointer ${
            activeTab === 'practices'
              ? 'bg-blue-600 text-white'
              : 'bg-gray-800 text-gray-400 hover:text-white'
          }`}
        >
          ✅ Best Practices
        </button>
      </div>

      {/* Instructions Tab */}
      {activeTab === 'instructions' && (
        <div className="space-y-3">
          <p className="text-gray-400 text-sm">
            Нажмите на инструкцию, чтобы увидеть подробности и примеры.
          </p>
          {dockerfileInstructions.map((item) => (
            <div
              key={item.instruction}
              className="border border-gray-700 rounded-lg overflow-hidden"
            >
              <button
                onClick={() =>
                  setExpandedInstruction(
                    expandedInstruction === item.instruction ? null : item.instruction
                  )
                }
                className="w-full flex items-center justify-between px-4 py-3 bg-gray-800 hover:bg-gray-750 transition-colors cursor-pointer"
              >
                <div className="flex items-center gap-3">
                  <span className="font-mono font-bold text-blue-400 text-lg">
                    {item.instruction}
                  </span>
                  <span className="text-gray-400 text-sm hidden sm:inline">
                    {item.description.slice(0, 60)}...
                  </span>
                </div>
                <svg
                  className={`w-5 h-5 text-gray-400 transition-transform ${
                    expandedInstruction === item.instruction ? 'rotate-180' : ''
                  }`}
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                </svg>
              </button>
              {expandedInstruction === item.instruction && (
                <div className="px-4 py-4 bg-gray-850 border-t border-gray-700 space-y-3">
                  <div>
                    <span className="text-xs text-gray-500 uppercase tracking-wider">Синтаксис</span>
                    <p className="font-mono text-sm text-green-400 mt-1">{item.syntax}</p>
                  </div>
                  <div>
                    <span className="text-xs text-gray-500 uppercase tracking-wider">Описание</span>
                    <p className="text-gray-300 text-sm mt-1">{item.description}</p>
                  </div>
                  <div>
                    <span className="text-xs text-gray-500 uppercase tracking-wider">Пример</span>
                    <CodeBlock code={item.example} language="dockerfile" />
                  </div>
                  {item.tip && (
                    <div className="flex items-start gap-2 p-3 bg-yellow-900/20 border border-yellow-700/30 rounded-lg">
                      <span className="text-yellow-400 text-lg">💡</span>
                      <p className="text-yellow-200 text-sm">{item.tip}</p>
                    </div>
                  )}
                </div>
              )}
            </div>
          ))}
        </div>
      )}

      {/* Examples Tab */}
      {activeTab === 'examples' && (
        <div className="space-y-6">
          <p className="text-gray-400 text-sm">
            Готовые Dockerfile для различных стеков технологий.
          </p>
          {dockerfileExamples.map((example) => (
            <div key={example.title} className="space-y-2">
              <h3 className="text-lg font-semibold text-white flex items-center gap-2">
                <span className="text-blue-400">▸</span>
                {example.title}
              </h3>
              <CodeBlock code={example.code} language="dockerfile" title="Dockerfile" />
            </div>
          ))}
        </div>
      )}

      {/* Best Practices Tab */}
      {activeTab === 'practices' && (
        <div className="space-y-6">
          <p className="text-gray-400 text-sm">
            Рекомендации для написания эффективных и безопасных Dockerfile.
          </p>
          {bestPractices.map((practice, index) => (
            <div key={index} className="border border-gray-700 rounded-lg p-4 space-y-3">
              <h3 className="text-lg font-semibold text-white flex items-center gap-2">
                <span className="bg-green-600 text-white text-xs font-bold px-2 py-1 rounded">
                  {index + 1}
                </span>
                {practice.title}
              </h3>
              <p className="text-gray-300 text-sm">{practice.description}</p>
              <CodeBlock code={practice.example} language="dockerfile" />
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
