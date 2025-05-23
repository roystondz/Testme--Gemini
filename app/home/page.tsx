'use client';

import { Suspense, useEffect, useState } from 'react';
import { useSearchParams } from 'next/navigation';

type Mcq = {
  question: string;
  options: string[];
  answer: string;
};

export default function HomePage() {
  return (
    <Suspense fallback={<div className="text-white text-center p-4">Loading MCQs...</div>}>
      <McqContent />
    </Suspense>
  );
}

function McqContent() {
  const p = useSearchParams();
  const title = p.get('title') || 'Sample Title';
  const description = p.get('description') || 'This is a sample description used to auto-generate MCQs.';

  const [mcqs, setMcqs] = useState<Mcq[]>([]);
  const [loading, setLoading] = useState(true);
  const [userAnswers, setUserAnswers] = useState<string[]>([]);
  const [score, setScore] = useState(0);
  const [answered, setAnswered] = useState(false);

  useEffect(() => {
    const fetchMcqs = async () => {
      try {
        const res = await fetch('/api/gemini', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ title, description }),
        });

        const data = await res.json();
        if (data && Array.isArray(data.result)) {
          setMcqs(data.result);
          setUserAnswers(new Array(data.result.length).fill(''));
        } else {
          console.error('Invalid data format received');
        }
      } catch (error) {
        console.error('Error generating MCQs:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchMcqs();
  }, [title, description]);

  const handleAnswerChange = (index: number, answer: string) => {
    const updatedAnswers = [...userAnswers];
    updatedAnswers[index] = answer;
    setUserAnswers(updatedAnswers);
  };

  const handleSubmit = () => {
    let userScore = 0;
    mcqs.forEach((mcq, index) => {
      if (userAnswers[index] === mcq.answer) userScore++;
    });
    setScore(userScore);
    setAnswered(true);
  };

  return (
    <div className="p-6 max-w-3xl mx-auto rounded-lg shadow-lg">
      <h1 className="text-2xl font-semibold mb-6 text-center text-white">Generated MCQs</h1>
      {loading && <p className="text-center text-white">Generating MCQs...</p>}

      {mcqs.length > 0 ? (
        <div>
          {mcqs.map((mcq, index) => (
            <div key={index} className="mb-6 p-4 border rounded-lg shadow-sm">
              <p className="text-lg font-medium mb-3">{index + 1}. {mcq.question}</p>
              <ul className="list-none pl-5">
                {mcq.options.map((opt, i) => (
                  <li key={i} className="mb-2">
                    <label className="flex items-center space-x-2">
                      <input
                        type="radio"
                        name={`mcq-${index}`}
                        value={opt}
                        checked={userAnswers[index] === opt}
                        onChange={() => handleAnswerChange(index, opt)}
                        disabled={answered}
                        className="h-4 w-4 border-black focus:ring-blue-500"
                      />
                      <span className="text-white">{opt}</span>
                    </label>
                  </li>
                ))}
              </ul>

              {answered && (
                <p className="text-sm mt-3 ml-3">
                  <span className={mcq.answer === userAnswers[index] ? 'text-green-600' : 'text-red-600'}>
                    {mcq.answer === userAnswers[index] ? 'Correct' : 'Incorrect'}
                  </span>
                  {mcq.answer !== userAnswers[index] && ` (Correct answer: ${mcq.answer})`}
                </p>
              )}
            </div>
          ))}

          {!answered ? (
            <div className="text-center mt-6 px-4 py-10">
              <button
                onClick={handleSubmit}
                className="bg-blue-600 text-white py-2 mt-4 px-4 rounded-xl shadow-md hover:bg-blue-700 transition duration-200"
              >
                Submit Answers
              </button>
            </div>
          ) : (
            <div className="mt-6 text-center">
              <p className="text-xl font-semibold">Your Score: {score} / {mcqs.length}</p>
            </div>
          )}
        </div>
      ) : (
        !loading && <p className="text-center text-gray-600">No MCQs found.</p>
      )}
    </div>
  );
}
