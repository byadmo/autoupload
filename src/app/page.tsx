import { UploadForm } from '@/components/UploadForm';

export default function Home() {
  return (
    <main className="min-h-screen bg-[radial-gradient(circle_at_top_left,#451a1a,transparent_35%),#08090f] px-4 py-6 md:px-8 md:py-10">
      <div className="mx-auto grid max-w-7xl gap-6">
        <header className="rounded-[2rem] border border-white/10 bg-white/[0.05] p-6 shadow-2xl backdrop-blur md:p-8">
          <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
            <div className="max-w-3xl">
              <div className="inline-flex rounded-full border border-white/10 bg-white/5 px-4 py-2 text-sm text-red-100">
                AutoUpload dashboard
              </div>
              <h1 className="mt-5 text-4xl font-bold tracking-tight text-white md:text-6xl">Upload and publish from one page.</h1>
              <p className="mt-4 text-lg leading-8 text-slate-300">
                Sign in with Google, connect your social channels, upload a vertical video, write the caption, choose hashtags and visibility, then publish your Short.
              </p>
            </div>
            <div className="grid gap-2 rounded-3xl bg-slate-950/70 p-4 text-sm text-slate-300 sm:min-w-72">
              <p className="font-semibold text-white">Sign-in method</p>
              <p>Google OAuth with your YouTube account</p>
            </div>
          </div>
        </header>
        <UploadForm />
      </div>
    </main>
  );
}
