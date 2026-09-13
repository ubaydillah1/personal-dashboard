"use client";

import { useQuery } from "@tanstack/react-query";
import { getReportAction, type ReportFilterParams } from "./actions";

export const REPORT_QUERY_KEYS = {
  all: ["report"] as const,
  detail: (params: ReportFilterParams) =>
    ["report", params.mode ?? "week", params.start ?? "", params.end ?? ""] as const,
};

export function useReport(params: ReportFilterParams) {
  return useQuery({
    queryKey: REPORT_QUERY_KEYS.detail(params),
    queryFn: () => getReportAction(params),
  });
}
