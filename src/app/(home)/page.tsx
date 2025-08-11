
import { ProjectForm } from "@/modules/home/ui/components/project-form";
import { ProjectList } from "@/modules/home/ui/components/project-list";
import { ManitLogo } from "@/components/icons/ManitLogo";

export default function Home() {


  return (
    <div className="relative flex flex-col max-w-6xl mx-auto w-full px-4" style={{ zIndex: 10 }}>
      <section className="space-y-8 py-20">
        {/* Logo and brand */}
        <div className="flex flex-col items-center space-y-4">
          <ManitLogo className="w-12 h-12" />
          <span className="text-sm font-ui font-medium text-muted-foreground tracking-wider uppercase">Manit AI</span>
        </div>

        {/* Main headline with gradient */}
        <h1 className="text-center text-5xl md:text-6xl lg:text-7xl font-display leading-tight">
          <span className="text-gradient-primary">Your linktree,</span>
          <br />
          <span className="text-gradient">but AI made it.</span>
        </h1>

        {/* Tagline */}
        <p className="text-center text-lg md:text-xl text-muted-foreground max-w-2xl mx-auto font-ui font-light">
          Stop wasting hours on design. Just tell AI what vibe you want 
          and get a fire link-in-bio page deployed in literally seconds.
        </p>

        {/* Form container with animated aura effect */}
        <div className="max-w-3xl mx-auto w-full relative">
          <div className="aura-wrapper aura-border">
            <div className="aura-glow" />
            <ProjectForm />
          </div>
        </div>

        {/* Trust indicators */}
        <div className="flex flex-col items-center space-y-4 pt-8">
          <p className="text-sm text-muted-foreground">Loved by creators worldwide</p>
          <div className="flex items-center gap-8 opacity-60">
            <span className="text-xs font-mono text-muted-foreground">30+ million links created</span>
            <span className="text-xs text-muted-foreground">•</span>
            <span className="text-xs font-mono text-muted-foreground">Powered by AI</span>
          </div>
        </div>
      </section>

      {/* Project list section */}
      <ProjectList />
    </div>
  );
}
