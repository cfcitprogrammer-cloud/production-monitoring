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

// Updated Type to include requested fields
type PackingItem = {
  item_code: string;
  kgs: number;
  qty: number;
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
  uid: string;
};

export default function CantonPackingForm() {
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);

  const [itemCodes, setItemCodes] = useState<ItemCode[]>([]);

  const [prodDate, setProdDate] = useState("");

  const [shift, setShift] = useState<string | null>(null);

  const [opType, setOpType] = useState<string | null>(null);

  // Form State
  const [selectedKey, setSelectedKey] = useState<Key | null>(null);
  const [kgs, setKgs] = useState("");
  const [qty, setQty] = useState("");
  const [unit, setUnit] = useState<string>("pcs"); // Default unit

  const [items, setItems] = useState<PackingItem[]>([]);

  const units = ["bdl", "pcs", "pack", "case"];

  // ======================
  // DATES (formatting helper)
  // ======================
  const today = useMemo(() => formatDate(new Date()), []);
  const yesterday = useMemo(() => {
    const d = new Date();
    d.setDate(d.getDate() - 1);
    return formatDate(d);
  }, []);

  function formatDate(d: Date) {
    return d.toISOString().split("T")[0];
  }

  // ======================
  // FETCH DATA
  // ======================
  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      const [codesRes] = await Promise.all([
        supabase
          .from("bihon_sku")
          .select("id, item_code")
          .eq("type", "packing_bihon")
          .order("item_code"),
      ]);

      if (codesRes.data) setItemCodes(codesRes.data);
      setLoading(false);
    };
    fetchData();
  }, [today, yesterday]);

  const itemsList = itemCodes.map((i) => ({
    id: i.item_code,
    name: i.item_code,
  }));

  // ======================
  // ADD ITEM
  // ======================
  const addItem = () => {
    if (!selectedKey || !qty || !kgs || !unit) return;

    const code = String(selectedKey);
    if (items.some((i) => i.item_code === code)) return;

    setItems((prev) => [
      ...prev,
      {
        item_code: code,
        kgs: Number(kgs),
        qty: Number(qty),
        unit: unit,
      },
    ]);

    // Reset row inputs
    setSelectedKey(null);
    setKgs("");
    setQty("");
  };

  const removeItem = (index: number) => {
    setItems((prev) => prev.filter((_, i) => i !== index));
  };

  // ======================
  // SUBMIT
  // ======================
  async function submitPackingForm(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    if (items.length === 0) {
      alert("Please select a shift and add at least one item.");
      return;
    }

    setSubmitting(true);
    try {
      const payload = items.map((item) => ({
        prod_id: `PROD-${prodDate}-${shift}`,
        item_code: item.item_code,
        kgs: item.kgs,
        qty: item.qty,
        unit: item.unit,
      }));

      const { error } = await supabase.from("bh_packing").insert(payload);
      if (error) throw error;

      alert("Packing form submitted!");
      setItems([]);
    } catch (err: any) {
      alert(err.message);
    } finally {
      setSubmitting(false);
    }
  }

  if (loading) return <div className="py-10 text-center">Loading...</div>;

  return (
    <form className="space-y-6" onSubmit={submitPackingForm}>
      {/* HEADER */}
      {/* ====================== */}
      {/* PRODUCTION DETAILS */}
      {/* ====================== */}

      <h2 className="text-xl font-semibold">Production Details</h2>

      {/* DATE */}

      <div>
        <Label className="block mb-2">Production Date</Label>

        <Input
          type="date"
          value={prodDate}
          onChange={(e) => setProdDate(e.target.value)}
        />
      </div>

      {/* SHIFT */}

      <div>
        <Label className="block mb-2">Shift</Label>

        <Select
          className="w-[256px]"
          selectedKey={shift}
          onSelectionChange={(key) => {
            setShift(String(key));
          }}
        >
          <Select.Trigger>
            <Select.Value />
            <Select.Indicator />
          </Select.Trigger>

          <Select.Popover>
            <ListBox>
              <ListBox.Item id="day">Day Shift</ListBox.Item>

              <ListBox.Item id="night">Night Shift</ListBox.Item>
            </ListBox>
          </Select.Popover>
        </Select>
      </div>

      {/* OPERATION TYPE */}

      <div>
        <Label className="block mb-2">Operation Type</Label>

        <Select
          className="w-[256px]"
          selectedKey={opType}
          onSelectionChange={(key) => {
            setOpType(String(key));
          }}
        >
          <Select.Trigger>
            <Select.Value />
            <Select.Indicator />
          </Select.Trigger>

          <Select.Popover>
            <ListBox>
              <ListBox.Item id="startup">Start Up</ListBox.Item>

              <ListBox.Item id="regular">Regular Operation</ListBox.Item>

              <ListBox.Item id="last-prod">Last Production</ListBox.Item>
            </ListBox>
          </Select.Popover>
        </Select>
      </div>

      <hr />

      {/* INPUT ROW */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-5 items-end bg-default-50 p-4 rounded-lg">
        <div className="sm:col-span-1">
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
                <SearchField.Input placeholder="Search code..." />
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

        <div>
          <Label>KGs</Label>
          <Input
            type="number"
            value={kgs}
            onChange={(e) => setKgs(e.target.value)}
            placeholder="0.00"
          />
        </div>

        <div>
          <Label>Qty</Label>
          <Input
            type="number"
            value={qty}
            onChange={(e) => setQty(e.target.value)}
            placeholder="0"
          />
        </div>

        <div>
          <Label>Unit</Label>
          <Select
            selectedKey={unit}
            onSelectionChange={(key) => setUnit(String(key))}
          >
            <Select.Trigger>
              <Select.Value />
              <Select.Indicator />
            </Select.Trigger>
            <Select.Popover>
              <ListBox>
                {units.map((u) => (
                  <ListBox.Item key={u} id={u}>
                    {u}
                  </ListBox.Item>
                ))}
              </ListBox>
            </Select.Popover>
          </Select>
        </div>

        <Button
          type="button"
          onPress={addItem}
          className="bg-primary text-white"
        >
          Add Item
        </Button>
      </div>

      {/* LIST OF ADDED ITEMS */}
      <div className="space-y-2">
        <Label className="font-bold">Items to Submit ({items.length})</Label>
        {items.map((item, i) => (
          <div
            key={i}
            className="flex items-center gap-4 rounded border border-default-200 p-3 bg-white shadow-sm"
          >
            <div className="flex-1 grid grid-cols-4 gap-2 text-sm">
              <div>
                <span className="text-default-500 text-xs block">Code</span>
                {item.item_code}
              </div>
              <div>
                <span className="text-default-500 text-xs block">KGs</span>
                {item.kgs}
              </div>
              <div>
                <span className="text-default-500 text-xs block">Qty</span>
                {item.qty}
              </div>
              <div>
                <span className="text-default-500 text-xs block">Unit</span>
                {item.unit}
              </div>
            </div>
            <Button
              size="sm"
              variant="ghost"
              className="text-danger"
              onPress={() => removeItem(i)}
            >
              Remove
            </Button>
          </div>
        ))}
      </div>

      <Button
        type="submit"
        className="w-full bg-success text-white font-bold"
        isDisabled={submitting}
      >
        {submitting ? "Submitting..." : "Submit Packing Form"}
      </Button>
    </form>
  );
}
