import { UploadForm } from '@/components/UploadForm';

export default function Home() {
  return (
    <main className="min-h-screen bg-[radial-gradient(circle_at_top_left,#451a1a,transparent_35%),#08090f] px-6 py-10">
      <div className="mx-auto grid max-w-5xl gap-8 lg:grid-cols-[0.9fr_1.1fr] lg:items-center">
        <section className="space-y-6">
          <div className="inline-flex rounded-full border border-white/10 bg-white/5 px-4 py-2 text-sm text-red-100">
            V1 YouTube publisher
          </div>
          <h1 className="text-5xl font-bold tracking-tight text-white md:text-6xl">Upload once. Publish as a YouTube Short.</h1>
          <p className="text-lg leading-8 text-slate-300">
            Connect a Google account, choose a vertical video, add metadata, and publish through the official YouTube Data API. The publisher layer is isolated so Instagram and TikTok connectors can be added next.
          </p>
          <div className="grid gap-3 text-sm text-slate-300">
            <p>• Uses OAuth 2.0 with the YouTube upload scope.</p>
            <p>• Appends #Shorts and tags the upload for Shorts discovery.</p>
            <p>• Keeps provider-specific code behind a reusable publisher interface.</p>
          </div>
        </section>
        <UploadForm />
      </div>
    </main>
  );
}
