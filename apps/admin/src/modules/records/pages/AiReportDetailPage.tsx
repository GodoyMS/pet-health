import { Link, useParams } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { ArrowLeft } from "lucide-react";

import { Badge } from "@repo/ui";

import { adminApi } from "@shared/api/adminApi";
import { apiErrorMessage } from "@shared/api/httpClient";
import { PageHeader } from "@shared/components/PageHeader";
import { PageError, PageLoading } from "@shared/components/States";
import { formatDateTime } from "@shared/utils/format";

export function AiReportDetailPage() {
  const { reportId = "" } = useParams();

  const query = useQuery({
    queryKey: ["admin", "ai-reports", reportId],
    queryFn: () => adminApi.getAiReport(reportId),
    enabled: !!reportId
  });

  if (query.isLoading) return <PageLoading />;
  if (query.isError || !query.data) {
    return (
      <PageError
        message={apiErrorMessage(query.error)}
        onRetry={() => query.refetch()}
      />
    );
  }

  const report = query.data;

  return (
    <div className="space-y-6">
      <Link
        to="/ai-reports"
        className="inline-flex items-center gap-1 text-sm text-muted-foreground transition-colors hover:text-foreground"
      >
        <ArrowLeft className="size-4" /> Back to AI reports
      </Link>

      <PageHeader
        title={report.headline}
        description={
          report.pet
            ? `${report.pet.name} · ${report.pet.ownerEmail ?? "unknown owner"}`
            : undefined
        }
        actions={<Badge variant="secondary">score {report.awarenessScore}</Badge>}
      />

      <p className="text-xs text-muted-foreground">
        Generated {formatDateTime(report.generatedAt)}
        {report.model ? ` · model ${report.model}` : ""}
        {report.pet ? (
          <>
            {" · "}
            <Link to={`/pets/${report.pet.id}`} className="hover:underline">
              open pet profile
            </Link>
          </>
        ) : null}
      </p>

      <section className="rounded-xl border border-border bg-card p-4">
        <h3 className="mb-3 text-sm font-semibold">Raw report content</h3>
        <pre className="max-h-[32rem] overflow-auto rounded-lg bg-background p-4 font-mono text-xs leading-relaxed">
          {JSON.stringify(report.content, null, 2)}
        </pre>
      </section>
    </div>
  );
}
