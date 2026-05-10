"use client";

import { useEffect, useMemo, useState, Fragment } from "react";
import { supabase } from "../utils/supabase";
import { Label } from "@heroui/react";
import * as XLSX from "xlsx";
import Page from "../ui/_page";

/* =========================
   TYPES
========================= */

type OverviewRow = {
  prod_date: string;
  shift: "day" | "night";
  uid: string;
};

type ShiftOption = {
  id: string;
  label: string;
  prod_date: string;
  shift: string;
  uid: string;
};

type Row = {
  item_code: string;
  value: number;
  unit?: string;
};

/* =========================
   MODULE CONFIG SYSTEM
========================= */

const MODULES = {
  snackfood: [
    { key: "frying", label: "Frying", table: "sf_frying", valueKey: "weight" },
    { key: "blending", label: "Blending", table: "sf_blending", valueKey: "usage" },
    { key: "premix", label: "Premix", table: "sf_premix", valueKey: "usage" },
    { key: "mixing", label: "Mixing", table: "sf_mix", valueKey: "weight" },
    { key: "flavoring", label: "Flavoring", table: "sf_flavoring", valueKey: "weight" },
    { key: "piece", label: "Piece", table: "sf_piece", valueKey: "pcs" },
    { key: "fg", label: "FG", table: "sf_fg", valueKey: "quantity" },
  ],

  bihon: [
    { key: "cooking", label: "Cooking", table: "bh_cooking", valueKey: "weight" },
    { key: "packing", label: "Packing", table: "bh_packing", valueKey: "weight" },
    { key: "fg", label: "FG", table: "bh_fg", valueKey: "quantity" },
  ],
} as const;

/* =========================
   MAIN
========================= */

export default function SFProductionSummary() {
  const [loading, setLoading] = useState(true);
  const [overviewRows, setOverviewRows] = useState<OverviewRow[]>([]);
  const [selectedDate, setSelectedDate] = useState(() => formatDate(new Date()));
  const [productType, setProductType] = useState<"bihon" | "snackfood">("bihon");
  const [selectedShift, setSelectedShift] = useState<ShiftOption | null>(null);
  const [dataMap, setDataMap] = useState<Record<string, Row[]>>({});

  /* =========================
     HELPERS
  ========================= */

  function formatDate(d: Date) {
    const yyyy = d.getFullYear();
    const mm = String(d.getMonth() + 1).padStart(2, "0");
    const dd = String(d.getDate()).padStart(2, "0");
    return `${yyyy}-${mm}-${dd}`;
  }

  const capitalize = (str: string) => str.charAt(0).toUpperCase() + str.slice(1);

  const today = useMemo(() => formatDate(new Date()), []);
  const yesterday = useMemo(() => {
    const d = new Date();
    d.setDate(d.getDate() - 1);
    return formatDate(d);
  }, []);

  const modules = MODULES[productType];

  // Logic to determine if a module column should show a unit
  const hasUnit = (moduleKey: string) => {
    return dataMap[moduleKey]?.some((row) => row.unit && row.unit.trim() !== "");
  };

  /* =========================
     FETCHING
  ========================= */

  useEffect(() => {
    const fetchOverview = async () => {
      setLoading(true);
      const table = productType === "bihon" ? "bh_overview" : "sf_overview";
      const { data } = await supabase
        .from(table)
        .select("uid, prod_date, shift")
        .in("prod_date", [today, yesterday]);

      setOverviewRows(data || []);
      setLoading(false);
    };
    fetchOverview();
  }, [productType, today, yesterday]);

  useEffect(() => {
    if (!selectedShift?.uid) {
      setDataMap({});
      return;
    }

    const fetchModules = async () => {
      setLoading(true);
      const results: Record<string, Row[]> = {};

      await Promise.all(
        modules.map(async (m) => {
          const { data } = await supabase
            .from(m.table)
            .select("*")
            .eq("prod_id", selectedShift.uid);

          results[m.key] = (data || []).map((r: any) => ({
            item_code: r.item_code,
            value: r[m.valueKey] ?? 0,
            unit: r.unit,
          }));
        })
      );

      setDataMap(results);
      setLoading(false);
    };

    fetchModules();
  }, [selectedShift, productType, modules]);

  const shiftOptions: ShiftOption[] = overviewRows
    .filter((r) => r.prod_date === selectedDate)
    .map((row) => ({
      id: `${row.prod_date}-${row.shift}`,
      label: `${row.prod_date} ${row.shift.toUpperCase()}`,
      prod_date: row.prod_date,
      shift: row.shift,
      uid: row.uid,
    }));

  const maxLen = Math.max(0, ...modules.map((m) => dataMap[m.key]?.length || 0));
  const sum = (arr: Row[] = []) => arr.reduce((a, b) => a + (Number(b.value) || 0), 0);

  /* =========================
     EXPORT
  ========================= */

  const exportToExcel = () => {
    const wsData: any[] = [];

    // Header Row 1: Labels
    wsData.push(modules.flatMap((m) => {
      const showUnit = hasUnit(m.key);
      return showUnit ? [m.label, "", ""] : [m.label, ""];
    }));

    // Header Row 2: Dynamic Column Titles
    wsData.push(modules.flatMap((m) => {
      const cols = ["Item Code", capitalize(m.valueKey)];
      if (hasUnit(m.key)) cols.push("Unit");
      return cols;
    }));

    // Data Rows
    for (let i = 0; i < maxLen; i++) {
      wsData.push(modules.flatMap((m) => {
        const row = dataMap[m.key]?.[i];
        const rowData = [row?.item_code ?? "", row?.value ?? ""];
        if (hasUnit(m.key)) rowData.push(row?.unit ?? "");
        return rowData;
      }));
    }

    const ws = XLSX.utils.aoa_to_sheet(wsData);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "Summary");
    XLSX.writeFile(wb, `production-${productType}-${selectedDate}.xlsx`);
  };

  if (loading && Object.keys(dataMap).length === 0) 
    return <div className="p-10 text-center text-gray-500">Loading data...</div>;

  return (
    <Page>
      <div className="p-6 space-y-6">
        {/* FILTERS */}
        <div className="flex gap-4 flex-wrap items-end bg-gray-50 p-4 rounded-lg border">
          <div className="flex flex-col gap-1">
            <Label>Date</Label>
            <input
              type="date"
              value={selectedDate}
              onChange={(e) => setSelectedDate(e.target.value)}
              className="border p-2 rounded bg-white"
            />
          </div>

          <div className="flex flex-col gap-1">
            <Label>Product</Label>
            <select
              value={productType}
              onChange={(e) => {
                  setProductType(e.target.value as any);
                  setSelectedShift(null);
              }}
              className="border p-2 rounded bg-white h-[42px]"
            >
              <option value="bihon">Bihon</option>
              <option value="snackfood">Snackfood</option>
            </select>
          </div>

          <div className="flex flex-col gap-1">
            <Label>Shift</Label>
            <select
              value={selectedShift?.id || ""}
              onChange={(e) => {
                const found = shiftOptions.find((s) => s.id === e.target.value);
                setSelectedShift(found || null);
              }}
              className="border p-2 rounded bg-white h-[42px] min-w-[150px]"
            >
              <option value="">Select shift</option>
              {shiftOptions.map((s) => (
                <option key={s.id} value={s.id}>{s.label}</option>
              ))}
            </select>
          </div>

          <button
            onClick={exportToExcel}
            disabled={!selectedShift}
            className="bg-blue-600 hover:bg-blue-700 disabled:bg-gray-400 text-white px-6 py-2 rounded h-[42px]"
          >
            Export
          </button>
        </div>

        {/* TABLE */}
        {!selectedShift ? (
          <div className="p-20 text-center border-2 border-dashed rounded-lg text-gray-400">
            Select a shift to display data.
          </div>
        ) : (
          <div className="overflow-auto border rounded-lg shadow-sm">
            <table className="w-full text-sm border-collapse bg-white">
              <thead>
                <tr className="bg-gray-800 text-white text-center">
                  {modules.map((m) => (
                    <th 
                      key={m.key} 
                      colSpan={hasUnit(m.key) ? 3 : 2} 
                      className="py-2 border-x border-gray-700"
                    >
                      {m.label}
                    </th>
                  ))}
                </tr>
                <tr className="bg-gray-100 text-gray-700 text-center border-b">
                  {modules.map((m) => (
                    <Fragment key={m.key}>
                      <th className="p-2 border-x font-semibold">Item</th>
                      <th className="p-2 border-x font-semibold capitalize">{m.valueKey}</th>
                      {hasUnit(m.key) && <th className="p-2 border-x font-semibold">Unit</th>}
                    </Fragment>
                  ))}
                </tr>
              </thead>
              <tbody>
                {maxLen > 0 ? (
                  Array.from({ length: maxLen }).map((_, i) => (
                    <tr key={i} className="text-center border-b hover:bg-gray-50">
                      {modules.map((m) => {
                        const row = dataMap[m.key]?.[i];
                        const showUnit = hasUnit(m.key);
                        return (
                          <Fragment key={`${m.key}-${i}`}>
                            <td className="p-2 border-x">{row?.item_code || "-"}</td>
                            <td className="p-2 border-x">{row?.value ?? ""}</td>
                            {showUnit && <td className="p-2 border-x text-gray-500 italic">{row?.unit || ""}</td>}
                          </Fragment>
                        );
                      })}
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan={100} className="p-10 text-center text-gray-400">No records found.</td>
                  </tr>
                )}
                <tr className="font-bold bg-gray-50 text-center">
                  {modules.map((m) => (
                    <td key={m.key} colSpan={hasUnit(m.key) ? 3 : 2} className="p-3 border-x border-t-2">
                      Total {capitalize(m.valueKey)}: {sum(dataMap[m.key]).toLocaleString()}
                    </td>
                  ))}
                </tr>
              </tbody>
            </table>
          </div>
        )}
      </div>
    </Page>
  );
}