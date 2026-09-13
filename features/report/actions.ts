"use server";

import { requireAuth } from "@/lib/auth/jwt";
import { reportService } from "./service";

export type ReportFilterParams = {
  mode?: string;
  start?: string;
  end?: string;
};

export async function getReportAction(params: ReportFilterParams) {
  await requireAuth();
  return reportService.getReport(params);
}
