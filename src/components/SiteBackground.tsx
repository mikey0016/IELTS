import { useBackground } from "@/hooks/useBackground";

export function SiteBackground() {
  const bg = useBackground();
  const isGradient = !!bg.url && bg.url.startsWith("linear-gradient");

  // default aurora mesh when no custom bg
  if (!bg.url) {
    return (
      <>
        <div className="pointer-events-none fixed inset-0 -z-10 bg-[#fcfcfd] dark:bg-[#070711]" aria-hidden />
        {/* soft aurora orbs */}
        <div className="pointer-events-none fixed inset-0 -z-10 overflow-hidden" aria-hidden>
          <div className="aurora-blob h-[520px] w-[520px] bg-brand-500/10 -top-32 -right-32 blur-[80px] dark:bg-brand-500/15" />
          <div className="aurora-blob h-[480px] w-[480px] bg-violet-500/8 top-1/3 -left-32 blur-[90px] dark:bg-violet-500/10" style={{ animationDelay: "2s" } as any} />
          <div className="aurora-blob h-[600px] w-[600px] bg-cyan-500/5 bottom-0 right-1/4 blur-[100px] dark:bg-cyan-500/8" style={{ animationDelay: "4s" } as any} />
          <div className="absolute inset-0 bg-[linear-gradient(to_right,rgba(148,163,184,0.04)_1px,transparent_1px),linear-gradient(to_bottom,rgba(148,163,184,0.04)_1px,transparent_1px)] bg-[size:40px_40px] [mask-image:radial-gradient(ellipse_at_center,black_50%,transparent_80%)] opacity-60 dark:opacity-20" />
        </div>
      </>
    );
  }

  return (
    <>
      <div
        className="pointer-events-none fixed inset-0 -z-10"
        style={
          isGradient
            ? { background: bg.url!, backgroundAttachment: "fixed" }
            : {
                backgroundImage: `url(${bg.url})`,
                backgroundSize: "cover",
                backgroundAttachment: "fixed",
                backgroundPosition: "center",
              }
        }
        aria-hidden
      />
      <div className="pointer-events-none fixed inset-0 -z-10 bg-white/55 backdrop-blur-[1px] dark:bg-[#070711]/70" aria-hidden />
      {bg.isVideo && bg.url && !isGradient && (
        <video autoPlay loop muted playsInline className="pointer-events-none fixed inset-0 -z-10 h-full w-full object-cover" src={bg.url} />
      )}
    </>
  );
}
