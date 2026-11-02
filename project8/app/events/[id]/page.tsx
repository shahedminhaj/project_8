import { Suspense } from "react";
import { CommunityApp } from "../../../components/community-app";

export default function EventDetailsPage({ params }: { params: Promise<{ id: string }> }) {
  return (
    <Suspense fallback={<div className="page-width loading-skeleton" />}>
      <EventDetailsContent params={params} />
    </Suspense>
  );
}

async function EventDetailsContent({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  return <CommunityApp view="details" eventId={id} />;
}
