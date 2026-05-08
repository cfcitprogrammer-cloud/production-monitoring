"use client";

import { useEffect, useMemo, useState } from "react";

import {
  Autocomplete,
  EmptyState,
  Label,
  ListBox,
  SearchField,
  useFilter,
  Button,
  Input,
  Select,
} from "@heroui/react";

import type { Key } from "@heroui/react";
import { supabase } from "../../utils/supabase";

type FGItem = {
  itemCode: string;
  quantity: string;
  unit: string;
};

type ItemCode = {
  id: number;
  item_code: string;
};

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

export default function SFFGForm() {
  const { contains } = useFilter({ sensitivity: "base" });

  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);

  const [itemCodes, setItemCodes] = useState<ItemCode[]>([]);
  const [overviewRows, setOverviewRows] = useState<OverviewRow[]>([]);

  const [selectedShift, setSelectedShift] = useState<ShiftOption | null>(null);

  const [selectedKey, setSelectedKey] = useState<Key | null>(null);
  const [quantity, setQuantity] = useState("");
  const [unit, setUnit] = useState<Key | null>(null);

  const [items, setItems] = useState<FGItem[]>([]);

  const unitOptions = [
    { id: "pc/s", label: "pc/s" },
    { id: "case/s", label: "case/s" },
    { id: "bundle/s", label: "bundle/s" },
  ];

  // ======================
  // DATE
  // ======================
  const today = useMemo(() => formatDate(new Date()), []);
  const yesterday = useMemo(() => {
    const d = new Date();
    d.setDate(d.getDate() - 1);
    return formatDate(d);
  }, []);

  function formatDate(d: Date) {
    const yyyy = d.getFullYear();
    const mm = String(d.getMonth() + 1).padStart(2, "0");
    const dd = String(d.getDate()).padStart(2, "0");
    return `${yyyy}-${mm}-${dd}`;
  }

  // ======================
  // FETCH
  // ======================
  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);

      const [codesRes, overviewRes] = await Promise.all([
        supabase
          .from("sf_sku")
          .select("id, item_code")
          .eq("type", "fg")
          .order("item_code"),

        supabase
          .from("bh_overview")
          .select("uid, prod_date, shift")
          .in("prod_date", [today, yesterday]),
      ]);

      if (codesRes.data) setItemCodes(codesRes.data);
      if (overviewRes.data) setOverviewRows(overviewRes.data);

      setLoading(false);
    };

    fetchData();
  }, [today, yesterday]);

  const shiftOptions: ShiftOption[] = overviewRows.map((row) => ({
    id: `${row.prod_date}-${row.shift}`,
    label: `${row.prod_date} ${row.shift.toUpperCase()}`,
    prod_date: row.prod_date,
    shift: row.shift,
    uid: row.uid,
  }));

  const itemsList = itemCodes.map((i) => ({
    id: i.item_code,
    name: i.item_code,
  }));

  // ======================
  // ADD ITEM
  // ======================
  const addItem = () => {
    if (!selectedKey || !quantity || !unit) return;

    const code = String(selectedKey);

    if (items.some((i) => i.itemCode === code)) return;

    setItems((prev) => [
      ...prev,
      {
        itemCode: code,
        quantity,
        unit: String(unit),
      },
    ]);

    setSelectedKey(null);
    setQuantity("");
    setUnit(null);
  };

  // ======================
  // REMOVE ITEM
  // ======================
  const removeItem = (index: number) => {
    setItems((prev) => prev.filter((_, i) => i !== index));
  };

  // ======================
  // SUBMIT
  // ======================
  async function submitFGForm(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();

    if (!selectedShift) {
      alert("Select a shift");
      return;
    }

    if (items.length === 0) {
      alert("Add items first");
      return;
    }

    setSubmitting(true);

    try {
      const payload = items.map((item) => ({
        item_code: item.itemCode,
        quantity: Number(item.quantity),
        unit: item.unit,
        prod_id: selectedShift.uid,
      }));

      const { error } = await supabase.from("sf_fg").insert(payload);

      if (error) {
        alert(error.message);
        return;
      }

      alert("FG form submitted!");

      setItems([]);
      setSelectedKey(null);
      setQuantity("");
      setUnit(null);
      setSelectedShift(null);
    } finally {
      setSubmitting(false);
    }
  }

  if (loading) {
    return <div className="py-10 text-center">Loading...</div>;
  }

  return (
    <form className="space-y-6" onSubmit={submitFGForm}>
      {/* SHIFT */}
      <div>
        <Label className="mb-2 block">Select Production Shift</Label>

        <Select
          className="w-full sm:w-[320px]"
          selectedKey={selectedShift?.id ?? null}
          onSelectionChange={(key) => {
            const found = shiftOptions.find((s) => s.id === String(key));
            setSelectedShift(found ?? null);
          }}
        >
          <Select.Trigger>
            <Select.Value />
            <Select.Indicator />
          </Select.Trigger>

          <Select.Popover>
            <ListBox>
              {shiftOptions.map((s) => (
                <ListBox.Item key={s.id} id={s.id}>
                  {s.label}
                </ListBox.Item>
              ))}
            </ListBox>
          </Select.Popover>
        </Select>
      </div>

      {/* INPUT */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-end">
        <div className="w-full sm:w-[280px]">
          <Label>Item Code</Label>

          <Autocomplete
            value={selectedKey}
            onChange={(key) => setSelectedKey(key as Key | null)}
          >
            <Autocomplete.Trigger>
              <Autocomplete.Value />
              <Autocomplete.Indicator />
            </Autocomplete.Trigger>

            <Autocomplete.Popover>
              <SearchField>
                <SearchField.Input placeholder="Search..." />
              </SearchField>

              <ListBox>
                {itemsList.map((item) => (
                  <ListBox.Item key={item.id} id={item.id}>
                    {item.name}
                  </ListBox.Item>
                ))}
              </ListBox>
            </Autocomplete.Popover>
          </Autocomplete>
        </div>

        <div className="w-[160px]">
          <Label>Quantity</Label>
          <Input
            type="number"
            value={quantity}
            onChange={(e) => setQuantity(e.target.value)}
          />
        </div>

        <div className="w-[160px]">
          <Label>Unit</Label>

          <Select
            selectedKey={unit}
            onSelectionChange={(key) => setUnit(key as Key)}
          >
            <Select.Trigger>
              <Select.Value />
            </Select.Trigger>

            <Select.Popover>
              <ListBox>
                {unitOptions.map((u) => (
                  <ListBox.Item key={u.id} id={u.id}>
                    {u.label}
                  </ListBox.Item>
                ))}
              </ListBox>
            </Select.Popover>
          </Select>
        </div>

        <Button type="button" onPress={addItem}>
          Add
        </Button>
      </div>

      {/* LIST */}
      <div className="space-y-3">
        {items.map((item, i) => (
          <div
            key={i}
            className="flex flex-col gap-2 rounded border p-3 sm:flex-row sm:items-end"
          >
            <Input value={item.itemCode} disabled className="sm:w-[200px]" />
            <Input value={item.quantity} disabled className="sm:w-[120px]" />
            <Input value={item.unit} disabled className="sm:w-[120px]" />

            <Button type="button" onPress={() => removeItem(i)}>
              Remove
            </Button>
          </div>
        ))}
      </div>

      {/* SUBMIT */}
      <Button type="submit" isDisabled={submitting}>
        Submit FG Form
      </Button>
    </form>
  );
}
