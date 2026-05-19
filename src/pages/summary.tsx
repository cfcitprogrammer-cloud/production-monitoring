"use client";

import { useEffect, useState, Fragment } from "react";
import { supabase } from "../utils/supabase";
import { Label } from "@heroui/react";
import * as XLSX from "xlsx";
import Page from "../ui/_page";

/* =========================
   TYPES
========================= */

type Row = {
  item_code: string;
  value: number;
  unit?: string;
};

type ModuleConfig = {
  key: string;
  label: string;
  table: string;
  valueKey: string;
  displayValueLabel?: string;
  hasUnit: boolean;
};

/* =========================
   MODULE CONFIG SYSTEM
========================= */

const MODULES: Record<string, ModuleConfig[]> = {
  snackfood: [
    {
      key: "blending",
      label: "Blending",
      table: "sf_blending",
      valueKey: "usage",
      hasUnit: false,
    },
    {
      key: "premix",
      label: "Premix",
      table: "sf_premix",
      valueKey: "usage",
      hasUnit: false,
    },
    {
      key: "mixing",
      label: "Mixing",
      table: "sf_mix",
      valueKey: "weight",
      hasUnit: false,
    },
    {
      key: "frying",
      label: "Frying",
      table: "sf_frying",
      valueKey: "weight",
      hasUnit: false,
    },
    {
      key: "flavoring",
      label: "Flavoring",
      table: "sf_flavoring",
      valueKey: "weight",
      hasUnit: false,
    },
    {
      key: "piece",
      label: "Piece",
      table: "sf_piece",
      valueKey: "pcs",
      hasUnit: false,
    },
    {
      key: "fg",
      label: "FG",
      table: "sf_fg",
      valueKey: "qty",
      hasUnit: false,
    },
  ],
  bihon: [
    {
      key: "cooking",
      label: "Cooking",
      table: "bh_cooking",
      valueKey: "weight",
      hasUnit: false,
    },
    {
      key: "packing",
      label: "Packing",
      table: "bh_packing",
      valueKey: "qty",
      hasUnit: false,
    },
    {
      key: "fg",
      label: "FG",
      table: "bh_fg",
      valueKey: "qty",
      displayValueLabel: "Cases/Bundles",
      hasUnit: false,
    },
  ],
  catmon: [
    {
      key: "mixing",
      label: "Mixing",
      table: "catmon_mixing",
      valueKey: "weight",
      hasUnit: false,
    },
    {
      key: "packing",
      label: "Packing",
      table: "catmon_packing",
      valueKey: "qty",
      hasUnit: false,
    },
    {
      key: "fg",
      label: "FG",
      table: "catmon_fg",
      valueKey: "qty",
      displayValueLabel: "Cases/Bundles",
      hasUnit: false,
    },
  ],
  sotanghon: [
    {
      key: "seasoning",
      label: "Seasoning",
      table: "kf_seasoning",
      valueKey: "qty",
      hasUnit: true,
    },
    {
      key: "packing",
      label: "Packing",
      table: "kf_packing",
      valueKey: "qty",
      hasUnit: false,
    },
    {
      key: "fg",
      label: "FG",
      table: "kf_fg",
      valueKey: "qty",
      displayValueLabel: "Cases/Bundles",
      hasUnit: false,
    },
  ],
};

export default function ProductionSummary() {
  const [loading, setLoading] = useState(false);
  const [selectedDate, setSelectedDate] = useState(
    () => new Date().toISOString().split("T")[0],
  );
  const [productType, setProductType] = useState<
    "bihon" | "snackfood-old" | "snackfood-new" | "catmon" | "sotanghon"
  >("bihon");
  const [selectedShift, setSelectedShift] = useState<string>("");
  const [dataMap, setDataMap] = useState<Record<string, Row[]>>({});

  const modules =
    productType === "snackfood-old" || productType === "snackfood-new"
      ? MODULES.snackfood
      : MODULES[productType];

  // const isNewBuilding =
  //   productType === "snackfood-new"
  //     ? true
  //     : productType === "snackfood-old"
  //       ? false
  //       : null;

  /* =========================
      HELPERS
  ========================= */
  const capitalize = (str: string) =>
    str.charAt(0).toUpperCase() + str.slice(1);
  const sum = (arr: Row[] = []) =>
    arr.reduce((a, b) => a + (Number(b.value) || 0), 0);

  const shouldShowUnit = (m: ModuleConfig) => {
    if (!m.hasUnit) return false;
    return dataMap[m.key]?.some((row) => row.unit && row.unit.trim() !== "");
  };

  /* =========================
      FETCHING LOGIC
  ========================= */
  useEffect(() => {
    const fetchAllModuleData = async () => {
      if (!selectedShift || !selectedDate) {
        setDataMap({});
        return;
      }

      setLoading(true);
      const targetId = `PROD-${selectedDate}-${selectedShift.toLowerCase()}`;

      console.log("🔍 Fetching data for ID:", targetId);

      const results: Record<string, Row[]> = {};

      try {
        await Promise.all(
          modules.map(async (m) => {
            // FIX: Casting the template literal to 'any' stops the ParserError
            let selectStr = `item_code, ${m.valueKey}`;
            if (m.hasUnit) selectStr += `, unit`;

            let query = supabase
              .from(m.table)
              .select(selectStr as any)
              .eq("prod_id", targetId);

            if (productType === "snackfood-new") {
              query = query.eq("is_new_building", true);
            }

            if (productType === "snackfood-old") {
              query = query.or(
                "is_new_building.is.null,is_new_building.eq.false",
              );
            }

            let { data, error } = await query;

            // Fallback for missing columns
            if (error?.message.includes("unit")) {
              console.warn(
                `⚠️ Table ${m.table} missing unit column. Retrying...`,
              );
              let retryQuery = supabase
                .from(m.table)
                .select(`item_code, ${m.valueKey}` as any)
                .eq("prod_id", targetId);

              if (productType === "snackfood-new") {
                retryQuery = retryQuery.eq("is_new_building", true);
              }

              if (productType === "snackfood-old") {
                retryQuery = retryQuery.or(
                  "is_new_building.is.null,is_new_building.eq.false",
                );
              }

              const retry = await retryQuery;
              data = retry.data;
              error = retry.error;
            }

            if (error) {
              console.error(`❌ Error fetching ${m.table}:`, error.message);
              results[m.key] = [];
            } else {
              console.log(`✅ ${m.table} fetched:`, data?.length || 0, "rows");
              results[m.key] = (data || []).map((r: any) => ({
                item_code: r.item_code,
                value: r[m.valueKey] ?? 0,
                unit: r.unit ?? "",
              }));
            }
          }),
        );

        console.log("📊 Final Data Map:", results);
        setDataMap(results);
      } catch (err) {
        console.error("💥 Critical fetching error:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchAllModuleData();
  }, [selectedDate, selectedShift, productType, modules]);

  const maxLen = Math.max(
    0,
    ...modules.map((m) => dataMap[m.key]?.length || 0),
  );

  /* =========================
      EXPORT
  ========================= */
  const exportToExcel = () => {
    const wsData: any[] = [];
    wsData.push(
      modules.flatMap((m) =>
        shouldShowUnit(m) ? [m.label, "", ""] : [m.label, ""],
      ),
    );
    wsData.push(
      modules.flatMap((m) => {
        const cols = ["Item Code", capitalize(m.valueKey)];
        if (shouldShowUnit(m)) cols.push("Unit");
        return cols;
      }),
    );

    for (let i = 0; i < maxLen; i++) {
      wsData.push(
        modules.flatMap((m) => {
          const row = dataMap[m.key]?.[i];
          const rowData = [row?.item_code ?? "", row?.value ?? ""];
          if (shouldShowUnit(m)) rowData.push(row?.unit ?? "");
          return rowData;
        }),
      );
    }

    const ws = XLSX.utils.aoa_to_sheet(wsData);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "Summary");
    XLSX.writeFile(wb, `Production_${productType}_${selectedDate}.xlsx`);
  };

  return (
    <Page>
      <div className="p-6 space-y-6">
        {/* FILTERS */}
        <div className="flex gap-4 flex-wrap items-end bg-gray-50 p-4 rounded-lg border border-gray-200 shadow-sm">
          <div className="flex flex-col gap-1">
            <Label className="text-[10px] font-bold text-gray-500 uppercase tracking-wider">
              Date
            </Label>
            <input
              type="date"
              value={selectedDate}
              onChange={(e) => setSelectedDate(e.target.value)}
              className="border p-2 rounded bg-white h-[40px] text-sm focus:ring-2 focus:ring-blue-500 outline-none"
            />
          </div>

          <div className="flex flex-col gap-1">
            <Label className="text-[10px] font-bold text-gray-500 uppercase tracking-wider">
              Line
            </Label>
            <select
              value={productType}
              onChange={(e) => {
                setProductType(e.target.value as any);
                setSelectedShift("");
              }}
              className="border p-2 rounded bg-white h-[40px] min-w-[140px] text-sm outline-none"
            >
              <option value="bihon">Bihon</option>
              <option value="snackfood-old">Snackfood (Old Building)</option>

              <option value="snackfood-new">Snackfood (New Building)</option>
              <option value="catmon">Canton</option>
              <option value="sotanghon">Sotanghon</option>
            </select>
          </div>

          <div className="flex flex-col gap-1">
            <Label className="text-[10px] font-bold text-gray-500 uppercase tracking-wider">
              Shift
            </Label>
            <select
              value={selectedShift}
              onChange={(e) => setSelectedShift(e.target.value)}
              className="border p-2 rounded bg-white h-[40px] min-w-[140px] text-sm outline-none"
            >
              <option value="">Select shift</option>
              <option value="day">Day Shift</option>
              <option value="night">Night Shift</option>
            </select>
          </div>

          <button
            onClick={exportToExcel}
            disabled={!selectedShift || loading}
            className="bg-blue-600 hover:bg-blue-700 disabled:bg-gray-300 text-white px-6 py-2 rounded h-[40px] text-sm font-semibold transition-all shadow-sm"
          >
            {loading ? "Fetching Data..." : "Export Excel"}
          </button>
        </div>

        {/* TABLE SECTION */}
        {!selectedShift ? (
          <div className="p-20 text-center border-2 border-dashed rounded-xl text-gray-400 bg-white">
            Please select a date and shift to display the summary.
          </div>
        ) : (
          <div className="overflow-auto border rounded-xl shadow-sm bg-white">
            <table className="w-full text-sm border-collapse">
              <thead>
                <tr className="bg-slate-800 text-white">
                  {modules.map((m) => (
                    <th
                      key={m.key}
                      colSpan={shouldShowUnit(m) ? 3 : 2}
                      className="py-3 px-4 border-x border-slate-700 font-bold uppercase text-[11px] tracking-widest"
                    >
                      {m.label}
                    </th>
                  ))}
                </tr>
                <tr className="bg-slate-50 text-slate-500 border-b">
                  {modules.map((m) => (
                    <Fragment key={m.key}>
                      <th className="p-2 border-x font-bold text-[10px]">
                        ITEM
                      </th>
                      <th className="p-2 border-x font-bold text-[10px] uppercase">
                        {m.displayValueLabel || m.valueKey}
                      </th>
                      {shouldShowUnit(m) && (
                        <th className="p-2 border-x font-bold text-[10px]">
                          UNIT
                        </th>
                      )}
                    </Fragment>
                  ))}
                </tr>
              </thead>
              <tbody>
                {maxLen > 0 ? (
                  Array.from({ length: maxLen }).map((_, i) => (
                    <tr
                      key={i}
                      className="text-center border-b hover:bg-blue-50/40 transition-colors"
                    >
                      {modules.map((m) => {
                        const row = dataMap[m.key]?.[i];
                        const showUnit = shouldShowUnit(m);
                        return (
                          <Fragment key={`${m.key}-${i}`}>
                            <td className="p-2 border-x text-gray-600 font-mono text-[12px]">
                              {row?.item_code || "-"}
                            </td>
                            <td className="p-2 border-x font-semibold text-slate-800">
                              {row?.value !== undefined
                                ? row.value.toLocaleString()
                                : ""}
                            </td>
                            {showUnit && (
                              <td className="p-2 border-x text-gray-400 italic text-[11px]">
                                {row?.unit || ""}
                              </td>
                            )}
                          </Fragment>
                        );
                      })}
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td
                      colSpan={100}
                      className="p-16 text-center text-gray-400"
                    >
                      No records found for ID:{" "}
                      <span className="font-mono text-blue-500 font-bold">
                        PROD-{selectedDate}-{selectedShift.toLowerCase()}
                      </span>
                    </td>
                  </tr>
                )}
              </tbody>
              {maxLen > 0 && (
                <tfoot>
                  <tr className="font-bold bg-slate-100 text-blue-900 border-t-2 border-slate-200">
                    {modules.map((m) => (
                      <td
                        key={m.key}
                        colSpan={shouldShowUnit(m) ? 3 : 2}
                        className="p-4 border-x"
                      >
                        <div className="flex justify-between items-center">
                          <span className="text-[9px] text-slate-400 font-bold uppercase">
                            Total {m.label}
                          </span>
                          <span className="text-lg tracking-tight">
                            {sum(dataMap[m.key]).toLocaleString()}
                          </span>
                        </div>
                      </td>
                    ))}
                  </tr>
                </tfoot>
              )}
            </table>
          </div>
        )}
      </div>
    </Page>
  );
}
