'use client';

import { ChangeEvent, FormEvent, useEffect, useMemo, useState } from 'react';

type PublishResult = {
  url: string;
  videoId: string;
};

type VideoDetails = {
  name: string;
  size: string;
  type: string;
};

type ProviderStatus = 'ready' | 'needs_env' | 'coming_soon';

type DeploymentConfig = {
  authenticated: boolean;
  youtubeReady: boolean;
  hasGoogleClientId: boolean;
  hasGoogleClientSecret: boolean;
  hasCookieSecret: boolean;
  callbackUrl: string;
  isVercel: boolean;
  providers: {
    youtube: ProviderStatus;
    tiktok: ProviderStatus;
    instagram: ProviderStatus;
  };
};

type AppSession = {
  authenticated: boolean;
  username: string | null;
};

const captionPrompts = [
  'Behind the scenes from today. What should we make next?',
  'Quick tip: save this for later and follow for more.',
  'A tiny moment worth sharing. #Shorts',
];

const suggestedTags = ['Shorts', 'behindthescenes', 'tutorial', 'launch', 'creator', 'dailyvlog'];

function formatFileSize(bytes: number) {
  if (bytes < 1024 * 1024) {
    return `${(bytes / 1024).toFixed(1)} KB`;
  }

  return `${(bytes / 1024 / 1024).toFixed(1)} MB`;
}

export function UploadForm() {
  const [isConnected, setIsConnected] = useState(false);
  const [isPublishing, setIsPublishing] = useState(false);
  const [message, setMessage] = useState('');
  const [result, setResult] = useState<PublishResult | null>(null);
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [tags, setTags] = useState('Shorts');
  const [visibility, setVisibility] = useState('private');
  const [videoDetails, setVideoDetails] = useState<VideoDetails | null>(null);
  const [deploymentConfig, setDeploymentConfig] = useState<DeploymentConfig | null>(null);
  const [session, setSession] = useState<AppSession>({ authenticated: false, username: null });
  const [username, setUsername] = useState('admin');
  const [password, setPassword] = useState('admin');

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const authStatus = params.get('auth') ?? (params.get('login') === 'required' ? 'login-required' : null);
    const authMessages: Record<string, string> = {
      connected: 'YouTube connected. You can publish when your Short is ready.',
      failed: 'YouTube connection failed. Please try connecting again.',
      'missing-config': 'Add Google OAuth environment variables before connecting YouTube.',
      'tiktok-coming-soon': 'TikTok OAuth is ready in the interface, but TIKTOK_AUTH_URL is not configured yet.',
      'instagram-coming-soon': 'Instagram OAuth is ready in the interface, but INSTAGRAM_AUTH_URL is not configured yet.',
      'login-required': 'Log in as admin before connecting channels.',
    };

    if (authStatus && authMessages[authStatus]) {
      setMessage(authMessages[authStatus]);
      window.history.replaceState({}, '', window.location.pathname);
    }

    Promise.all([
      fetch('/api/app/status').then((response) => response.json()),
      fetch('/api/auth/status').then((response) => response.json()),
      fetch('/api/config/status').then((response) => response.json()),
    ])
      .then(([sessionData, authData, configData]: [AppSession, { youtube: boolean }, DeploymentConfig]) => {
        setSession(sessionData);
        setIsConnected(authData.youtube);
        setDeploymentConfig(configData);
      })
      .catch(() => setMessage('Could not read YouTube connection or deployment status.'));
  }, []);

  const parsedTags = useMemo(
    () =>
      tags
        .split(',')
        .map((tag) => tag.trim().replace(/^#/, ''))
        .filter(Boolean),
    [tags],
  );

  const shortTitle = title.includes('#Shorts') ? title : `${title || 'Your Short title'} #Shorts`;
  const isLoggedIn = session.authenticated;
  const isYouTubeReady = Boolean(isLoggedIn && deploymentConfig?.youtubeReady);
  const completedSteps = [Boolean(videoDetails), title.trim().length > 0, description.trim().length > 0, isConnected].filter(Boolean).length;

  function handleVideoChange(event: ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0];

    if (!file) {
      setVideoDetails(null);
      return;
    }

    setVideoDetails({
      name: file.name,
      size: formatFileSize(file.size),
      type: file.type || 'video file',
    });
  }

  function addTag(tag: string) {
    const nextTags = new Set(parsedTags);
    nextTags.add(tag.replace(/^#/, ''));
    setTags(Array.from(nextTags).join(', '));
  }

  async function login(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setMessage('Signing in...');

    const response = await fetch('/api/app/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ username, password }),
    });
    const data = await response.json();

    if (!response.ok) {
      setMessage(data.error ?? 'Login failed.');
      return;
    }

    setSession(data);
    setMessage('Signed in as admin. Connect your channels to continue.');

    const [authData, configData] = await Promise.all([
      fetch('/api/auth/status').then((authResponse) => authResponse.json()),
      fetch('/api/config/status').then((configResponse) => configResponse.json()),
    ]);
    setIsConnected(authData.youtube);
    setDeploymentConfig(configData);
  }

  async function logout() {
    await fetch('/api/app/logout', { method: 'POST' });
    setSession({ authenticated: false, username: null });
    setIsConnected(false);
    setResult(null);
    setMessage('Signed out.');
  }

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
    <section className="grid gap-6 rounded-[2rem] border border-white/10 bg-white/[0.06] p-5 shadow-2xl backdrop-blur md:p-7">
      <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
        <div>
          <p className="text-sm uppercase tracking-[0.3em] text-red-300">Creator dashboard</p>
          <h2 className="mt-2 text-3xl font-semibold">Prepare your YouTube Short</h2>
          <p className="mt-2 max-w-2xl text-sm text-slate-300">Upload the video, shape the caption, choose hashtags, review the preview, then publish.</p>
        </div>
        <div className="flex items-center gap-3">
          <span className={`rounded-full px-3 py-1 text-xs font-semibold ${isLoggedIn ? 'bg-emerald-400/15 text-emerald-200' : 'bg-amber-400/15 text-amber-100'}`}>
            {isLoggedIn ? 'Signed in as admin' : 'Login required'}
          </span>
          {isLoggedIn ? (
            <button onClick={logout} className="rounded-full border border-white/15 px-4 py-2 text-sm hover:bg-white/10" type="button">
              Log out
            </button>
          ) : (
            <span className="rounded-full border border-amber-300/30 bg-amber-400/10 px-4 py-2 text-sm text-amber-100">
              admin / admin
            </span>
          )}
        </div>
      </div>

      {!isLoggedIn && (
        <form className="grid gap-3 rounded-3xl border border-white/10 bg-slate-950/70 p-5 sm:grid-cols-[1fr_1fr_auto]" onSubmit={login}>
          <label className="grid gap-2 text-sm">
            <span className="text-slate-300">Username</span>
            <input className="rounded-2xl border border-white/10 bg-slate-950 p-3" value={username} onChange={(event) => setUsername(event.target.value)} autoComplete="username" />
          </label>
          <label className="grid gap-2 text-sm">
            <span className="text-slate-300">Password</span>
            <input className="rounded-2xl border border-white/10 bg-slate-950 p-3" type="password" value={password} onChange={(event) => setPassword(event.target.value)} autoComplete="current-password" />
          </label>
          <button className="self-end rounded-2xl bg-white px-5 py-3 font-semibold text-slate-950" type="submit">
            Log in
          </button>
          <p className="text-sm text-slate-400 sm:col-span-3">Use username <code>admin</code> and password <code>admin</code> to access channel connections and publishing.</p>
        </form>
      )}

      {isLoggedIn && (
        <div className="grid gap-3 rounded-3xl border border-white/10 bg-slate-950/60 p-4 md:grid-cols-3">
          {[
            { provider: 'youtube', label: 'YouTube', connected: isConnected, helper: 'Official Data API upload flow.' },
            { provider: 'tiktok', label: 'TikTok', connected: false, helper: 'Connector slot ready for TikTok OAuth credentials.', href: '/api/auth/tiktok/start' },
            { provider: 'instagram', label: 'Instagram', connected: false, helper: 'Connector slot ready for Instagram Graph API credentials.', href: '/api/auth/instagram/start' },
          ].map((channel) => {
            const status = deploymentConfig?.providers[channel.provider as keyof DeploymentConfig['providers']];
            return (
              <div key={channel.provider} className="rounded-2xl border border-white/10 bg-white/5 p-4">
                <div className="flex items-center justify-between gap-3">
                  <h3 className="font-semibold">{channel.label}</h3>
                  <span className={`rounded-full px-2 py-1 text-xs ${channel.connected ? 'bg-emerald-400/15 text-emerald-200' : 'bg-white/10 text-slate-300'}`}>
                    {channel.connected ? 'Connected' : status === 'ready' ? 'Ready' : status === 'needs_env' ? 'Needs env' : 'Next'}
                  </span>
                </div>
                <p className="mt-2 text-sm text-slate-400">{channel.helper}</p>
                {channel.provider === 'youtube' && !channel.connected && isYouTubeReady && (
                  <a className="mt-4 inline-flex rounded-full bg-red-500 px-4 py-2 text-sm font-semibold text-white hover:bg-red-400" href="/api/auth/youtube/start">Connect YouTube</a>
                )}
                {channel.provider === 'youtube' && channel.connected && (
                  <button onClick={disconnect} className="mt-4 rounded-full border border-white/15 px-4 py-2 text-sm hover:bg-white/10" type="button">Disconnect</button>
                )}
                {channel.provider !== 'youtube' && 'href' in channel && (
                  <a className="mt-4 inline-flex rounded-full border border-white/15 px-4 py-2 text-sm text-slate-300 hover:bg-white/10" href={channel.href}>Connect {channel.label}</a>
                )}
              </div>
            );
          })}
        </div>
      )}

      {isLoggedIn && deploymentConfig && !deploymentConfig.youtubeReady && (
        <div className="rounded-3xl border border-amber-300/30 bg-amber-400/10 p-4 text-sm text-amber-50">
          <p className="font-semibold">Vercel page is live. Finish one-time YouTube setup to enable publishing.</p>
          <p className="mt-2 text-amber-100/90">Add <code>GOOGLE_CLIENT_ID</code>, <code>GOOGLE_CLIENT_SECRET</code>, and <code>AUTH_COOKIE_SECRET</code> in Vercel, then add this callback URL in Google Cloud:</p>
          <code className="mt-3 block overflow-x-auto rounded-2xl bg-black/30 p-3 text-xs text-white">{deploymentConfig.callbackUrl}</code>
        </div>
      )}

      <div className="grid gap-3 rounded-3xl border border-white/10 bg-slate-950/60 p-4 sm:grid-cols-4">
        {['Video', 'Caption', 'Details', 'Account'].map((step, index) => (
          <div key={step} className={`rounded-2xl p-3 ${completedSteps > index ? 'bg-emerald-400/10 text-emerald-100' : 'bg-white/5 text-slate-400'}`}>
            <p className="text-xs uppercase tracking-[0.2em]">Step {index + 1}</p>
            <p className="mt-1 font-semibold">{step}</p>
          </div>
        ))}
      </div>

      <form className="grid gap-6 xl:grid-cols-[1.1fr_0.9fr]" onSubmit={handleSubmit}>
        <div className="grid gap-5">
          <label className="grid gap-2 rounded-3xl border border-dashed border-white/15 bg-slate-950/50 p-5">
            <span className="text-sm font-medium text-slate-200">1. Choose vertical video</span>
            <input className="rounded-2xl border border-white/10 bg-slate-950 p-3" name="video" type="file" accept="video/*" onChange={handleVideoChange} required />
            {videoDetails ? (
              <span className="text-sm text-slate-300">Selected {videoDetails.name} · {videoDetails.size} · {videoDetails.type}</span>
            ) : (
              <span className="text-sm text-slate-500">Use a 9:16 video under 60 seconds for best Shorts eligibility.</span>
            )}
          </label>

          <label className="grid gap-2">
            <span className="text-sm font-medium text-slate-200">2. Title</span>
            <input className="rounded-2xl border border-white/10 bg-slate-950 p-3" name="title" placeholder="My launch day Short" maxLength={100} value={title} onChange={(event) => setTitle(event.target.value)} required />
            <span className="text-xs text-slate-500">{title.length}/100 characters. #Shorts will be added automatically if missing.</span>
          </label>

          <div className="grid gap-2">
            <span className="text-sm font-medium text-slate-200">3. Caption / description</span>
            <textarea className="min-h-36 rounded-2xl border border-white/10 bg-slate-950 p-3" name="description" placeholder="Write the caption viewers will see under your Short." value={description} onChange={(event) => setDescription(event.target.value)} />
            <div className="flex flex-wrap gap-2">
              {captionPrompts.map((prompt) => (
                <button key={prompt} type="button" onClick={() => setDescription(prompt)} className="rounded-full border border-white/10 px-3 py-1 text-xs text-slate-300 hover:bg-white/10">
                  Use template
                </button>
              ))}
            </div>
          </div>

          <label className="grid gap-2">
            <span className="text-sm font-medium text-slate-200">4. Hashtags / tags</span>
            <input className="rounded-2xl border border-white/10 bg-slate-950 p-3" name="tags" placeholder="Shorts, tutorial, launch" value={tags} onChange={(event) => setTags(event.target.value)} />
            <div className="flex flex-wrap gap-2">
              {suggestedTags.map((tag) => (
                <button key={tag} type="button" onClick={() => addTag(tag)} className="rounded-full bg-white/10 px-3 py-1 text-xs text-slate-200 hover:bg-white/15">
                  #{tag}
                </button>
              ))}
            </div>
          </label>

          <label className="grid gap-2">
            <span className="text-sm font-medium text-slate-200">5. Visibility</span>
            <select className="rounded-2xl border border-white/10 bg-slate-950 p-3" name="visibility" value={visibility} onChange={(event) => setVisibility(event.target.value)}>
              <option value="private">Private — review before sharing</option>
              <option value="unlisted">Unlisted — share by link</option>
              <option value="public">Public — publish immediately</option>
            </select>
          </label>
        </div>

        <aside className="grid content-start gap-5 rounded-3xl border border-white/10 bg-slate-950/70 p-5">
          <div>
            <p className="text-sm uppercase tracking-[0.25em] text-slate-400">Live preview</p>
            <div className="mt-4 aspect-[9/16] rounded-[2rem] border border-white/10 bg-gradient-to-b from-slate-800 to-black p-4 shadow-inner">
              <div className="flex h-full flex-col justify-end rounded-[1.5rem] bg-black/30 p-4">
                <p className="text-lg font-bold text-white">{shortTitle}</p>
                <p className="mt-2 line-clamp-5 text-sm text-slate-200">{description || 'Your caption will appear here. Add context, credits, links, and calls to action.'}</p>
                <div className="mt-3 flex flex-wrap gap-2">
                  {parsedTags.slice(0, 5).map((tag) => (
                    <span key={tag} className="rounded-full bg-white/15 px-2 py-1 text-xs text-white">#{tag}</span>
                  ))}
                </div>
              </div>
            </div>
          </div>

          <dl className="grid gap-3 rounded-2xl bg-white/5 p-4 text-sm">
            <div className="flex justify-between gap-4"><dt className="text-slate-400">Destination</dt><dd>YouTube Shorts</dd></div>
            <div className="flex justify-between gap-4"><dt className="text-slate-400">Visibility</dt><dd className="capitalize">{visibility}</dd></div>
            <div className="flex justify-between gap-4"><dt className="text-slate-400">Tags</dt><dd>{parsedTags.length}</dd></div>
            <div className="flex justify-between gap-4"><dt className="text-slate-400">Video</dt><dd>{videoDetails ? videoDetails.size : 'Not selected'}</dd></div>
          </dl>

          <button className="rounded-2xl bg-white px-5 py-3 font-semibold text-slate-950 disabled:cursor-not-allowed disabled:opacity-50" disabled={!isYouTubeReady || !isConnected || isPublishing} type="submit">
            {isPublishing ? 'Publishing...' : 'Publish Short'}
          </button>
          {!isLoggedIn && <p className="text-center text-sm text-amber-100">Log in with admin/admin before connecting channels.</p>}
          {isLoggedIn && !isYouTubeReady && <p className="text-center text-sm text-amber-100">Finish environment setup before connecting YouTube.</p>}
          {isYouTubeReady && !isConnected && <p className="text-center text-sm text-amber-100">Connect YouTube before publishing.</p>}
        </aside>
      </form>

      {message && <p className="rounded-2xl bg-slate-950 p-4 text-sm text-slate-200">{message}</p>}
      {result && (
        <a className="block rounded-2xl border border-emerald-400/40 bg-emerald-400/10 p-4 text-emerald-200" href={result.url} target="_blank" rel="noreferrer">
          View Short: {result.videoId}
        </a>
      )}
    </section>
  );
}
