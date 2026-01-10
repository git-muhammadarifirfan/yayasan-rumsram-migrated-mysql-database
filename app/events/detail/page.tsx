import { Suspense } from "react";
import EventDetailFromQueryClient from "./EventDetailFromQueryClient";

export default function Page() {
  return (
    <Suspense fallback={<div className="container-xl py-12">Loading...</div>}>
      <EventDetailFromQueryClient />
    </Suspense>
  );
}
