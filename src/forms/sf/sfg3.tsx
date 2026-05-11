import { useEffect, useMemo, useState } from "react";

import {
  Autocomplete,
  Label,
  ListBox,
  SearchField,
  Button,
  Input,
  Select,
} from "@heroui/react";

import type { Key } from "@heroui/react";

import { supabase } from "../../utils/supabase";

type FryingItem = {
  item_code: string;
  weight: number;
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

export default function SFFryingForm() {
  const [loading, setLoading] = useState(true);

  const [_, setSubmitting] = useState(false);

  const [itemCodes, setItemCodes] = useState<ItemCode[]>([]);

  const [overviewRows, setOverviewRows] = useState<OverviewRow[]>([]);

  const [selectedShift, setSelectedShift] = useState<ShiftOption | null>(null);

  const [selectedKey, setSelectedKey] = useState<Key | null>(null);

  const [weight, setWeight] = useState("");

  const [items, setItems] = useState<FryingItem[]>([]);

  // ======================
  // DATE HELPERS
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
  // FETCH DATA
  // ======================

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);

      const [codesRes, overviewRes] = await Promise.all([
        supabase
          .from("sf_sku")
          .select("id, item_code")
          .eq("type", "frying")
          .order("item_code"),

        // IMPORTANT:
        // use sf_overview

        supabase
          .from("sf_overview")
          .select("uid, prod_date, shift")
          .in("prod_date", [today, yesterday]),
      ]);

      if (codesRes.data) {
        setItemCodes(codesRes.data);
      }

      if (overviewRes.data) {
        setOverviewRows(overviewRes.data);
      }

      setLoading(false);
    };

    fetchData();
  }, [today, yesterday]);

  // ======================
  // SHIFT OPTIONS
  // ======================

  const shiftOptions: ShiftOption[] = overviewRows.map((row) => ({
    id: `${row.prod_date}-${row.shift}`,

    label: `${row.prod_date} ${row.shift.toUpperCase()}`,

    prod_date: row.prod_date,

    shift: row.shift,

    uid: row.uid,
  }));

  // ======================
  // ITEM OPTIONS
  // ======================

  const itemsList = itemCodes.map((i) => ({
    id: i.item_code,

    name: i.item_code,
  }));

  // ======================
  // ADD ITEM
  // ======================

  const addItem = () => {
    if (!selectedKey || !weight) {
      return;
    }

    const code = String(selectedKey);

    // prevent duplicates

    if (items.some((i) => i.item_code === code)) {
      return;
    }

    setItems((prev) => [
      ...prev,

      {
        item_code: code,

        weight: Number(weight),
      },
    ]);

    setSelectedKey(null);

    setWeight("");
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

  async function submitForm(e: React.FormEvent<HTMLFormElement>) {
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
      // child rows referencing sf_overview

      const payload = items.map((item) => ({
        item_code: item.item_code,

        weight: item.weight,

        prod_id: selectedShift.uid,
      }));

      const { error } = await supabase.from("sf_frying").insert(payload);

      if (error) {
        alert(error.message);

        return;
      }

      alert("Frying form submitted!");

      // reset

      setItems([]);

      setSelectedKey(null);

      setWeight("");

      setSelectedShift(null);
    } finally {
      setSubmitting(false);
    }
  }

  if (loading) {
    return <div className="py-10 text-center">Loading...</div>;
  }

  return (
    <form className="space-y-6" onSubmit={submitForm}>
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

      {/* INPUT ROW */}

      <div className="flex flex-col gap-3 sm:flex-row sm:items-end">
        {/* ITEM CODE */}

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

        {/* WEIGHT */}

        <div className="w-full sm:w-[200px]">
          <Label>Weight</Label>

          <Input
            type="number"
            value={weight}
            onChange={(e) => setWeight(e.target.value)}
          />
        </div>

        {/* ADD BUTTON */}

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
            {/* ITEM CODE */}

            <Input
              value={item.item_code}
              className="w-full sm:w-[200px]"
              disabled
            />

            {/* WEIGHT */}

            <Input
              value={String(item.weight)}
              className="w-full sm:w-[120px]"
              disabled
            />

            {/* REMOVE */}

            <Button
              type="button"
              className="w-full sm:w-auto"
              onPress={() => removeItem(i)}
            >
              Remove
            </Button>
          </div>
        ))}
      </div>

      {/* SUBMIT */}

      <Button type="submit">Submit Frying Form</Button>
    </form>
  );
}
