
import { ProjectForm } from "@/modules/home/ui/components/project-form";
import { ProjectList } from "@/modules/home/ui/components/project-list";
import { Sparkles } from "lucide-react";

export default function Home() {


  return (
    <div className="relative flex flex-col max-w-6xl mx-auto w-full px-4" style={{ zIndex: 10 }}>
        <section className="space-y-8 py-[20vh] 2xl:py-52">
          {/* Logo and brand */}
          <div className="flex flex-col items-center space-y-2">
            <div className="p-3 rounded-2xl bg-gradient-to-br from-orange-500/20 to-amber-500/20 backdrop-blur-sm border border-white/10">
              <Sparkles className="w-8 h-8 text-orange-500" />
            </div>
            <span className="text-sm font-medium text-muted-foreground tracking-wider uppercase">Manit AI</span>
          </div>
          
          {/* Main headline with gradient */}
          <h1 className="text-center text-5xl md:text-6xl lg:text-7xl font-bold leading-tight">
            <span className="text-gradient-primary">Link tree to app,</span>
            <br />
            <span className="text-gradient">fast.</span>
          </h1>
          
          {/* Tagline */}
          <p className="text-center text-lg md:text-xl text-muted-foreground max-w-2xl mx-auto">
            Create beautiful, modern link trees at the speed of thought. 
            Describe what you need and Manit&apos;s AI builds it for you.
          </p>
          
          {/* Form container with glass effect */}
          <div className="max-w-3xl mx-auto w-full">
            <ProjectForm />
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
