

import { ProjectForm } from "@/modules/home/ui/components/project-form";
import { ProjectList } from "@/modules/home/ui/components/project-list";

export default function Home() {


  return (
    <div className="flex flex-col max-w-5xl mx-auto w-full">
      <section className="space-y-6 py-[16vh] 2xl:py-48">
        <div className="flex flex-col items-center">
          // TODO logo
        </div>
        <h1 className="text-center text-4xl font-bold">
          Let Manit AI help you build your next project
        </h1>
        <p className="text-center text-muted-foreground">
          Manit AI is a platform that helps you build your next project.
        </p>
        <div className="max-w-3xl mx-auto w-full">
          <ProjectForm />
        </div>
      </section>
      <ProjectList />
    </div>
  );
}
