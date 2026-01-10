import { Suspense } from "react";
import ProgramDetailFromQueryClient from "./ProgramDetailFromQueryClient";

export default function Page() {
  return (
    <Suspense fallback={<div className="container-xl py-12">Loading...</div>}>
      <ProgramDetailFromQueryClient />
    </Suspense>
  );
}
