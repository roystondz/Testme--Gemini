'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';

export default function Home() {

  const router = useRouter();

  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [response, setResponse] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    const res = await fetch('/api/gemini', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ title, description }),
    });

    if (res.ok) {
      const data = await res.json();
      console.log('Response:', data);
      setResponse('MCQs generated successfully!'); 
      router.push(`/home?title=${encodeURIComponent(title)}&description=${encodeURIComponent(description)}`);
    }
    else {
      const errorData = await res.json();
      console.error('Error:', errorData);
      setResponse('Error generating MCQs. Please try again.');
    }
    // Reset the form fields
    
  };

  return (
    <main className="flex flex-col items-center p-10">
      <h1 className="text-2xl font-bold mb-4">Submit Title and Description</h1>
      <form onSubmit={handleSubmit} className="space-y-4 w-full max-w-md">
        <input
          type="text"
          placeholder="Title"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          className="w-full p-2 border rounded"
        />
        <textarea
          placeholder="Description"
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          className="w-full p-2 border rounded"
        />
        <button
          type="submit"
          className="w-full bg-blue-600 text-white py-2 rounded hover:bg-blue-700"
        >
          Submit
        </button>
      </form>
      {response && <p className="mt-4 text-green-600">{response}</p>}
    </main>
  );
}
