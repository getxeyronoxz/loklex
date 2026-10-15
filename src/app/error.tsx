"use client";

import { useEffect } from "react";
import { TriangleAlert } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { EmptyState } from "@/components/ui/EmptyState";
import { Panel } from "@/components/ui/Panel";

export default function RootError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error(error);
  }, [error]);

  return (
    <div className="mx-auto max-w-xl">
      <Panel>
        <EmptyState
          icon={TriangleAlert}
          title="Something interrupted this view"
          body="Nothing was filed or sent — the page simply failed to render. Trying again usually fixes it."
          action={
            <div className="flex gap-2">
              <Button size="sm" onClick={() => reset()}>
                Try again
              </Button>
              <Button
                size="sm"
                variant="subtle"
                onClick={() => (window.location.href = "/")}
              >
                Back to workspace
              </Button>
            </div>
          }
        />
      </Panel>
    </div>
  );
}
