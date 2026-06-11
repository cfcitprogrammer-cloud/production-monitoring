/**
 * production-telegram-helper.ts
 */
import axios from "axios";

// --- 1. SCHEMAS & TYPES ---

export interface BaseOverview {
  uid: string;
  prod_date: string;
  shift: string;
  op_type?: string;
  trouble_remarks?: string;
  additional_remarks?: string;
}

export interface BihonOverview extends BaseOverview {
  cornstarch_used: number;
  reworks_used?: number;
  local_output: number;
  export_output: number;
  trimmings?: number;
  rejects?: number;
  sweepings?: number;
  // Make sure these are declared here so you don't even need 'as any'
  ip_hh?: number;
  ip_mm?: number;
  cp_hh?: number;
  cp_mm?: number;
  mt_hh?: number;
  mt_mm?: number;
  lines_running?: string;
}

export interface SFOverview extends BaseOverview {
  machine_trouble: number;
  fryers_running?: string;
  is_new_building: boolean;
}

export interface CantonOverview extends BaseOverview {
  flour_used: number;
  total_input: number;
  scrap?: number;
  sweepings?: number;
  lines_running?: string;
}

export type ProductionData = BihonOverview | SFOverview | CantonOverview;
export type DeptType = "bihon" | "sf" | "canton";

// --- 2. THE HELPER FUNCTION ---

const GAS_WEBAPP_URL =
  "https://script.google.com/macros/s/AKfycby2w-k7ZxoZZn5H5_2QDmsJkUT3aJNDvWEbZ0RucKxzTz5Pb160fRxuBojOqpzQvZ0/exec";

export const submitProductionOverview = async (payload: ProductionData) => {
  // Identify department based on unique schema keys
  let dept: DeptType = "bihon";

  if ("cornstarch_used" in payload) {
    dept = "bihon";
  } else if ("machine_trouble" in payload) {
    dept = "sf";
  } else if ("flour_used" in payload) {
    dept = "canton";
  }

  try {
    const response = await axios.post(
      GAS_WEBAPP_URL,
      {
        type: dept,
        data: payload,
      },
      {
        headers: {
          // Force text/plain content type because GAS handles text/plain payloads
          // without triggering pre-flight CORS issues in some browser environments
          "Content-Type": "text/plain;charset=utf-8",
        },
      },
    );

    // Because GAS always returns a 200 status even on execution errors,
    // we safely check the custom status property returned by your code.
    if (response.data && response.data.status === "error") {
      throw new Error(response.data.message);
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
