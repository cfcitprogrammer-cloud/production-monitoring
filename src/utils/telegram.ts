/**
 * production-telegram-helper.ts
 */
import axios from "axios";

// --- 1. SCHEMAS & TYPES ---

export interface BaseOverview {
  uid: string;
  prod_date: string;
  shift: string;
  op_type?: string | null;
  trouble_remarks?: string;
  additional_remarks?: string;
}

export interface OutputItem {
  item_code: string;
  item_description: string;
  quantity: number;
  unit: string;
}

export interface BihonOverview extends BaseOverview {
  cornstarch_used: number;
  reworks_used?: number;
  local_output: number;
  export_output: number;
  trimmings?: number;
  rejects?: number;
  sweepings?: number;
  ip_hh?: number;
  ip_mm?: number;
  cp_hh?: number;
  cp_mm?: number;
  mt_hh?: number;
  mt_mm?: number;
  lines_running?: string;
}

export interface SFOverview extends BaseOverview {
  total_batches?: number;
  machine_trouble: number;
  fryers_running?: string | string[];
  is_new_building: boolean;
  multi_weigher_output?: OutputItem[];
  packing_output?: OutputItem[];
  dept?: string;
}

export interface CantonOverview extends BaseOverview {
  flour_used: number;
  total_input: number;
  scrap?: number;
  sweepings?: number;
  lines_running?: string;
  packing_output?: OutputItem[]; // <-- Added Canton Packing Output
  dept?: string;
}

export type ProductionData = BihonOverview | SFOverview | CantonOverview;
export type DeptType = "bihon" | "sf" | "canton";

interface GASResponse {
  status: "success" | "error";
  message?: string;
}

export type TelegramSubmissionResult =
  | { success: true; message: string }
  | { success: false; error: string };

// --- 2. THE HELPER FUNCTION ---

const GAS_WEBAPP_URL =
  "https://script.google.com/macros/s/AKfycby6WVeMn-9ZeO0EFHx44iGlALzeLYcXZpwigb792tMIFS4Fn2wPTXWokYnmtTZw7Zs/exec";

export const submitProductionOverview = async (
  payload: ProductionData,
): Promise<TelegramSubmissionResult> => {
  let dept: DeptType = "bihon";

  if ("cornstarch_used" in payload) {
    dept = "bihon";
  } else if ("machine_trouble" in payload) {
    dept = "sf";
  } else if ("flour_used" in payload) {
    dept = "canton";
  }

  try {
    const response = await axios.post<GASResponse>(
      GAS_WEBAPP_URL,
      JSON.stringify({
        type: dept,
        data: payload,
      }),
      {
        headers: {
          "Content-Type": "text/plain;charset=utf-8",
        },
      },
    );

    if (response.data && response.data.status === "error") {
      throw new Error(
        response.data.message || "Unknown error from Apps Script",
      );
    }

    return {
      success: true,
      message: `Notification for ${dept.toUpperCase()} sent successfully.`,
    };
  } catch (error) {
    console.error("Telegram Axios Submission Error:", error);
    return {
      success: false,
      error: error instanceof Error ? error.message : String(error),
    };
  }
};
