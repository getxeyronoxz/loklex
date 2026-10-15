"use client";

import Link from "next/link";
import { FileWarning } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { EmptyState } from "@/components/ui/EmptyState";
import { Panel } from "@/components/ui/Panel";

export default function NotFound() {
  return (
    <div className="mx-auto max-w-xl">
      <Panel>
        <EmptyState
          icon={FileWarning}
          title="This corner doesn't exist"
          body="The address is wrong or the page was moved. Start back from the workspace."
          action={
            <Link href="/">
              <Button size="sm">Back to workspace</Button>
            </Link>
          }
        />
      </Panel>
    </div>
  );
}
