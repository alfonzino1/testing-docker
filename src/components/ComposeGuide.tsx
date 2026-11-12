import { useState } from 'react';
import { composeFields, composeExamples } from '../data/dockerData';
import CodeBlock from './CodeBlock';

export default function ComposeGuide() {
  const [expandedField, setExpandedField] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<'fields' | 'examples'>('fields');

  return (
    <div className="space-y-6">
      {/* Tabs */}
      <div className="flex gap-2 border-b border-gray-700 pb-2">
        <button
          onClick={() => setActiveTab('fields')}
          className={`px-4 py-2 rounded-t-lg text-sm font-medium transition-colors cursor-pointer ${
            activeTab === 'fields'
              ? 'bg-purple-600 text-white'
              : 'bg-gray-800 text-gray-400 hover:text-white'
          }`}
        >
          📖 Поля
        </button>
        <button
          onClick={() => setActiveTab('examples')}
          className={`px-4 py-2 rounded-t-lg text-sm font-medium transition-colors cursor-pointer ${
            activeTab === 'examples'
              ? 'bg-purple-600 text-white'
              : 'bg-gray-800 text-gray-400 hover:text-white'
          }`}
        >
          📝 Примеры
        </button>
      </div>

      {/* Fields Tab */}
      {activeTab === 'fields' && (
        <div className="space-y-3">
          <p className="text-gray-400 text-sm">
            Основные поля docker-compose.yml. Нажмите для подробностей.
          </p>
          {composeFields.map((item) => (
            <div
              key={item.field}
              className="border border-gray-700 rounded-lg overflow-hidden"
            >
              <button
                onClick={() =>
                  setExpandedField(expandedField === item.field ? null : item.field)
                }
                className="w-full flex items-center justify-between px-4 py-3 bg-gray-800 hover:bg-gray-750 transition-colors cursor-pointer"
              >
                <div className="flex items-center gap-3">
                  <span className="font-mono font-bold text-purple-400 text-lg">
                    {item.field}
                  </span>
                  <span className="text-gray-400 text-sm hidden sm:inline">
                    {item.description.slice(0, 50)}...
                  </span>
                </div>
                <svg
                  className={`w-5 h-5 text-gray-400 transition-transform ${
                    expandedField === item.field ? 'rotate-180' : ''
                  }`}
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                </svg>
              </button>
              {expandedField === item.field && (
                <div className="px-4 py-4 bg-gray-850 border-t border-gray-700 space-y-3">
                  <div>
                    <span className="text-xs text-gray-500 uppercase tracking-wider">Описание</span>
                    <p className="text-gray-300 text-sm mt-1">{item.description}</p>
                  </div>
                  <div>
                    <span className="text-xs text-gray-500 uppercase tracking-wider">Пример</span>
                    <CodeBlock code={item.example} language="yaml" />
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
            Готовые docker-compose.yml для различных сценариев.
          </p>
          {composeExamples.map((example) => (
            <div key={example.title} className="space-y-2">
              <h3 className="text-lg font-semibold text-white flex items-center gap-2">
                <span className="text-purple-400">▸</span>
                {example.title}
              </h3>
              <CodeBlock code={example.code} language="yaml" title="docker-compose.yml" />
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
