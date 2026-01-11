import { Suspense } from "react";
import BlogDetailFromQueryClient from "./BlogDetailFromQueryClient";

export default function Page() {
  return (
    <Suspense fallback={<div className="container-xl py-12">Loading...</div>}>
      <BlogDetailFromQueryClient />
    </Suspense>
  );
}
