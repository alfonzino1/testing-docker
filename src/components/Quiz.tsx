import { useState } from 'react';
import { quizQuestions } from '../data/dockerData';
import CodeBlock from './CodeBlock';

export default function Quiz() {
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [selectedAnswer, setSelectedAnswer] = useState<number | null>(null);
  const [showResult, setShowResult] = useState(false);
  const [score, setScore] = useState(0);
  const [quizFinished, setQuizFinished] = useState(false);
  const [answers, setAnswers] = useState<(number | null)[]>(new Array(quizQuestions.length).fill(null));

  const question = quizQuestions[currentQuestion];
  const isCorrect = selectedAnswer === question.correct;

  const handleAnswer = (index: number) => {
    if (showResult) return;
    setSelectedAnswer(index);
    setShowResult(true);
    const newAnswers = [...answers];
    newAnswers[currentQuestion] = index;
    setAnswers(newAnswers);
    if (index === question.correct) {
      setScore(score + 1);
    }
  };

  const handleNext = () => {
    if (currentQuestion < quizQuestions.length - 1) {
      setCurrentQuestion(currentQuestion + 1);
      setSelectedAnswer(null);
      setShowResult(false);
    } else {
      setQuizFinished(true);
    }
  };

  const handleRestart = () => {
    setCurrentQuestion(0);
    setSelectedAnswer(null);
    setShowResult(false);
    setScore(0);
    setQuizFinished(false);
    setAnswers(new Array(quizQuestions.length).fill(null));
  };

  const getScoreColor = () => {
    const percentage = (score / quizQuestions.length) * 100;
    if (percentage >= 80) return 'text-green-400';
    if (percentage >= 60) return 'text-yellow-400';
    return 'text-red-400';
  };

  const getScoreMessage = () => {
    const percentage = (score / quizQuestions.length) * 100;
    if (percentage === 100) return '🏆 Отлично! Вы мастер Docker!';
    if (percentage >= 80) return '🎉 Отличный результат! Вы хорошо знаете Docker!';
    if (percentage >= 60) return '👍 Неплохо! Но есть что повторить.';
    if (percentage >= 40) return '📚 Стоит подучить материал. Повторите справочник.';
    return '🔄 Нужно вернуться к основам. Не сдавайтесь!';
  };

  if (quizFinished) {
    return (
      <div className="max-w-2xl mx-auto text-center space-y-6">
        <div className="bg-gray-800 rounded-xl p-8 border border-gray-700">
          <h2 className="text-2xl font-bold text-white mb-4">Результаты квиза</h2>
          <div className={`text-6xl font-bold ${getScoreColor()} mb-4`}>
            {score}/{quizQuestions.length}
          </div>
          <p className="text-gray-300 text-lg mb-2">{getScoreMessage()}</p>
          <p className="text-gray-400 text-sm mb-6">
            Правильных ответов: {Math.round((score / quizQuestions.length) * 100)}%
          </p>
          
          {/* Progress bar */}
          <div className="w-full bg-gray-700 rounded-full h-4 mb-6">
            <div
              className={`h-4 rounded-full transition-all duration-500 ${
                (score / quizQuestions.length) >= 0.8 ? 'bg-green-500' :
                (score / quizQuestions.length) >= 0.6 ? 'bg-yellow-500' : 'bg-red-500'
              }`}
              style={{ width: `${(score / quizQuestions.length) * 100}%` }}
            />
          </div>

          {/* Answers review */}
          <div className="text-left space-y-2 mb-6">
            {quizQuestions.map((q, i) => (
              <div key={i} className="flex items-center gap-2 text-sm">
                <span className={answers[i] === q.correct ? 'text-green-400' : 'text-red-400'}>
                  {answers[i] === q.correct ? '✓' : '✗'}
                </span>
                <span className="text-gray-400 truncate">{q.question.slice(0, 50)}...</span>
              </div>
            ))}
          </div>

          <button
            onClick={handleRestart}
            className="px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-medium transition-colors cursor-pointer"
          >
            🔄 Пройти заново
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      {/* Progress */}
      <div className="flex items-center justify-between">
        <span className="text-sm text-gray-400">
          Вопрос {currentQuestion + 1} из {quizQuestions.length}
        </span>
        <span className="text-sm text-gray-400">
          Счёт: <span className="text-green-400 font-bold">{score}</span>
        </span>
      </div>
      
      {/* Progress bar */}
      <div className="w-full bg-gray-700 rounded-full h-2">
        <div
          className="h-2 rounded-full bg-blue-500 transition-all duration-300"
          style={{ width: `${((currentQuestion + 1) / quizQuestions.length) * 100}%` }}
        />
      </div>

      {/* Question */}
      <div className="bg-gray-800 rounded-xl p-6 border border-gray-700">
        <h3 className="text-lg font-semibold text-white mb-4">
          {question.question}
        </h3>

        {question.code && (
          <CodeBlock code={question.code} language="dockerfile" />
        )}

        {/* Options */}
        <div className="space-y-3 mt-4">
          {question.options.map((option, index) => {
            let optionClass = 'border-gray-600 hover:border-blue-500 hover:bg-gray-750';
            
            if (showResult) {
              if (index === question.correct) {
                optionClass = 'border-green-500 bg-green-900/20';
              } else if (index === selectedAnswer && !isCorrect) {
                optionClass = 'border-red-500 bg-red-900/20';
              } else {
                optionClass = 'border-gray-700 opacity-50';
              }
            } else if (selectedAnswer === index) {
              optionClass = 'border-blue-500 bg-blue-900/20';
            }

            return (
              <button
                key={index}
                onClick={() => handleAnswer(index)}
                disabled={showResult}
                className={`w-full text-left px-4 py-3 rounded-lg border transition-all cursor-pointer ${optionClass}`}
              >
                <div className="flex items-center gap-3">
                  <span className={`w-7 h-7 rounded-full flex items-center justify-center text-sm font-bold border ${
                    showResult && index === question.correct
                      ? 'border-green-500 text-green-400'
                      : showResult && index === selectedAnswer && !isCorrect
                      ? 'border-red-500 text-red-400'
                      : 'border-gray-500 text-gray-400'
                  }`}>
                    {String.fromCharCode(65 + index)}
                  </span>
                  <span className="text-gray-200 text-sm">{option}</span>
                </div>
              </button>
            );
          })}
        </div>

        {/* Explanation */}
        {showResult && (
          <div className={`mt-4 p-4 rounded-lg border ${
            isCorrect
              ? 'bg-green-900/20 border-green-700/50'
              : 'bg-red-900/20 border-red-700/50'
          }`}>
            <div className="flex items-center gap-2 mb-2">
              <span className="text-lg">{isCorrect ? '✅' : '❌'}</span>
              <span className={`font-medium ${isCorrect ? 'text-green-400' : 'text-red-400'}`}>
                {isCorrect ? 'Правильно!' : 'Неправильно'}
              </span>
            </div>
            <p className="text-gray-300 text-sm">{question.explanation}</p>
          </div>
        )}

        {/* Next button */}
        {showResult && (
          <button
            onClick={handleNext}
            className="mt-4 w-full px-4 py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-medium transition-colors cursor-pointer"
          >
            {currentQuestion < quizQuestions.length - 1 ? 'Следующий вопрос →' : 'Показать результаты'}
          </button>
        )}
      </div>
    </div>
  );
}
