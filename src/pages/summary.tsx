"use client";

import { useEffect, useMemo, useState } from "react";

import { Label, Select, ListBox, Input, Button } from "@heroui/react";

import { supabase } from "../utils/supabase";
import type { Key } from "@heroui/react";

type TableType = "bh" | "sf";
type Shift = "day" | "night";

type Batch = {
  uid: string;
  prod_date: string;
  shift: Shift;
};

type ShiftOption = {
  id: string;
  uid: string;
  label: string;
  prod_date: string;
  shift: Shift;
};

type Row = {
  item_code: string;
  weight?: number;
  usage?: number;
  pcs?: number;
  quantity?: number;
};

export default function SummaryPage() {
  const [tableType, setTableType] = useState<TableType | null>(null);
  const [date, setDate] = useState("");
  const [shift, setShift] = useState<Shift | null>(null);

  const [batches, setBatches] = useState<Batch[]>([]);
  const [selectedBatch, setSelectedBatch] = useState<ShiftOption | null>(null);

  const [rows, setRows] = useState<Row[]>([]);
  const [loading, setLoading] = useState(false);

  // ======================
  // FETCH BATCHES (CONTROLLED)
  // ======================
  const fetchBatches = async () => {
    if (!tableType || !date || !shift) return;

    const { data, error } = await supabase
      .from("bh_overview")
      .select("uid, prod_date, shift")
      .eq("prod_date", date)
      .eq("shift", shift);

    if (error) {
      console.error("Batch fetch error:", error.message);
      return;
    }

    setBatches(data || []);
  };

  // trigger ONLY when all filters are ready
  useEffect(() => {
    setBatches([]);
    setSelectedBatch(null);
    setRows([]);

    if (tableType && date && shift) {
      fetchBatches();
    }
  }, [tableType, date, shift]);

  // ======================
  // FETCH ITEMS
  // ======================
  const fetchData = async () => {
    if (!tableType || !selectedBatch) return;

    setLoading(true);

    const table = tableType === "bh" ? "bh_cooking" : "sf_frying"; // adjust if needed

    const { data, error } = await supabase
      .from(table)
      .select("*")
      .eq("prod_id", selectedBatch.uid);

    if (error) {
      console.error("Fetch error:", error.message);
      setLoading(false);
      return;
    }

    setRows(data || []);
    setLoading(false);
  };

  // ======================
  // PIVOT LOGIC
  // ======================
  const pivotData = useMemo(() => {
    const map = new Map<string, number>();

    for (const r of rows) {
      const value = Number(r.weight ?? r.usage ?? r.pcs ?? r.quantity ?? 0);

      map.set(r.item_code, (map.get(r.item_code) || 0) + value);
    }

    return Array.from(map.entries()).map(([item_code, value]) => ({
      item_code,
      value,
    }));
  }, [rows]);

  return (
    <div className="space-y-6">
      <h1 className="text-xl font-bold">Summary Pivot View</h1>

      {/* FILTERS */}
      <div className="flex flex-col gap-4 md:flex-row md:items-end">
        {/* MODULE */}
        <div>
          <Label>Module</Label>
          <Select
            className="w-[160px]"
            selectedKey={tableType}
            onSelectionChange={(key) => setTableType(key as TableType)}
          >
            <Select.Trigger>
              <Select.Value />
            </Select.Trigger>

            <Select.Popover>
              <ListBox>
                <ListBox.Item id="bh">Bihon (BH)</ListBox.Item>
                <ListBox.Item id="sf">Snackfood (SF)</ListBox.Item>
              </ListBox>
            </Select.Popover>
          </Select>
        </div>

        {/* DATE */}
        <div>
          <Label>Production Date</Label>
          <Input
            type="date"
            className="w-[180px]"
            value={date}
            onChange={(e) => setDate(e.target.value)}
          />
        </div>

        {/* SHIFT */}
        <div>
          <Label>Shift</Label>
          <Select
            className="w-[140px]"
            selectedKey={shift}
            onSelectionChange={(key) => setShift(key as Shift)}
          >
            <Select.Trigger>
              <Select.Value />
            </Select.Trigger>

            <Select.Popover>
              <ListBox>
                <ListBox.Item id="day">Day</ListBox.Item>
                <ListBox.Item id="night">Night</ListBox.Item>
              </ListBox>
            </Select.Popover>
          </Select>
        </div>

        {/* BATCH (ONLY AFTER ALL FILLED) */}
        <div>
          <Label>Batch</Label>

          <Select
            className="w-[280px]"
            selectedKey={selectedBatch?.id ?? null}
            onSelectionChange={(key) => {
              const found = batches.find((b) => b.uid === String(key));

              if (!found) return;

              setSelectedBatch({
                id: found.uid,
                uid: found.uid,
                prod_date: found.prod_date,
                shift: found.shift,
                label: `${found.prod_date} - ${found.shift.toUpperCase()}`,
              });
            }}
          >
            <Select.Trigger>
              <Select.Value />
            </Select.Trigger>

            <Select.Popover>
              <ListBox>
                {batches.map((b) => (
                  <ListBox.Item key={b.uid} id={b.uid}>
                    {b.prod_date} - {b.shift.toUpperCase()}
                  </ListBox.Item>
                ))}
              </ListBox>
            </Select.Popover>
          </Select>
        </div>

        {/* LOAD */}
        <Button onPress={fetchData} className="w-[140px]">
          Load
        </Button>
      </div>

      {/* TABLE */}
      <div className="overflow-auto rounded border">
        <table className="w-full border-collapse text-sm">
          <thead className="bg-gray-100">
            <tr>
              <th className="border p-2 text-left">Item Code</th>
              <th className="border p-2 text-right">Total</th>
            </tr>
          </thead>

          <tbody>
            {loading ? (
              <tr>
                <td colSpan={2} className="p-4 text-center">
                  Loading...
                </td>
              </tr>
            ) : pivotData.length === 0 ? (
              <tr>
                <td colSpan={2} className="p-4 text-center">
                  No data found
                </td>
              </tr>
            ) : (
              pivotData.map((row) => (
                <tr key={row.item_code}>
                  <td className="border p-2">{row.item_code}</td>
                  <td className="border p-2 text-right">{row.value}</td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
