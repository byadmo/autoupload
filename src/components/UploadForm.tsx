'use client';

import { FormEvent, useEffect, useState } from 'react';

type PublishResult = {
  url: string;
  videoId: string;
};

export function UploadForm() {
  const [isConnected, setIsConnected] = useState(false);
  const [isPublishing, setIsPublishing] = useState(false);
  const [message, setMessage] = useState('');
  const [result, setResult] = useState<PublishResult | null>(null);

  useEffect(() => {
    fetch('/api/auth/status')
      .then((response) => response.json())
      .then((data: { youtube: boolean }) => setIsConnected(data.youtube))
      .catch(() => setMessage('Could not read YouTube connection status.'));
  }, []);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setIsPublishing(true);
    setMessage('Uploading to YouTube...');
    setResult(null);

    const response = await fetch('/api/publish/youtube', {
      method: 'POST',
      body: new FormData(event.currentTarget),
    });
    const data = await response.json();

    setIsPublishing(false);
    if (!response.ok) {
      setMessage(data.error ?? 'Publishing failed.');
      return;
    }

    setMessage('Published successfully.');
    setResult(data);
  }

  async function disconnect() {
    await fetch('/api/auth/logout', { method: 'POST' });
    setIsConnected(false);
    setResult(null);
    setMessage('Disconnected YouTube.');
  }

  return (
    <section className="rounded-3xl border border-white/10 bg-white/[0.06] p-6 shadow-2xl backdrop-blur">
      <div className="mb-6 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <p className="text-sm uppercase tracking-[0.3em] text-red-300">YouTube Shorts</p>
          <h2 className="text-2xl font-semibold">Publish a vertical video</h2>
        </div>
        {isConnected ? (
          <button onClick={disconnect} className="rounded-full border border-white/15 px-4 py-2 text-sm hover:bg-white/10" type="button">
            Disconnect
          </button>
        ) : (
          <a className="rounded-full bg-red-500 px-4 py-2 text-sm font-semibold text-white hover:bg-red-400" href="/api/auth/youtube/start">
            Connect YouTube
          </a>
        )}
      </div>

      <form className="grid gap-5" onSubmit={handleSubmit}>
        <label className="grid gap-2">
          <span className="text-sm font-medium text-slate-200">Vertical video file</span>
          <input className="rounded-2xl border border-white/10 bg-slate-950 p-3" name="video" type="file" accept="video/*" required />
        </label>
        <label className="grid gap-2">
          <span className="text-sm font-medium text-slate-200">Title</span>
          <input className="rounded-2xl border border-white/10 bg-slate-950 p-3" name="title" placeholder="My launch day Short" maxLength={100} required />
        </label>
        <label className="grid gap-2">
          <span className="text-sm font-medium text-slate-200">Description</span>
          <textarea className="min-h-32 rounded-2xl border border-white/10 bg-slate-950 p-3" name="description" placeholder="Add links, credits, and context." />
        </label>
        <label className="grid gap-2">
          <span className="text-sm font-medium text-slate-200">Visibility</span>
          <select className="rounded-2xl border border-white/10 bg-slate-950 p-3" name="visibility" defaultValue="private">
            <option value="private">Private</option>
            <option value="unlisted">Unlisted</option>
            <option value="public">Public</option>
          </select>
        </label>
        <button className="rounded-2xl bg-white px-5 py-3 font-semibold text-slate-950 disabled:cursor-not-allowed disabled:opacity-50" disabled={!isConnected || isPublishing} type="submit">
          {isPublishing ? 'Publishing...' : 'Publish Short'}
        </button>
      </form>

      {message && <p className="mt-5 rounded-2xl bg-slate-950 p-4 text-sm text-slate-200">{message}</p>}
      {result && (
        <a className="mt-4 block rounded-2xl border border-emerald-400/40 bg-emerald-400/10 p-4 text-emerald-200" href={result.url} target="_blank" rel="noreferrer">
          View Short: {result.videoId}
        </a>
      )}
    </section>
  );
}
