import { useEffect, useMemo, useState } from "react";

import {
  Autocomplete,
  Label,
  ListBox,
  SearchField,
  Button,
  Input,
  Select,
  Spinner,
  toast,
} from "@heroui/react";

import type { Key } from "@heroui/react";
import { supabase } from "../../utils/supabase";

type PackingItem = {
  item_code: string;
  quantity: number;
};

type ItemCode = {
  id: number;
  item_code: string;
};

export default function BHPackingForm() {
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);

  const [itemCodes, setItemCodes] = useState<ItemCode[]>([]);
  const [prodDate, setProdDate] = useState("");

  const [shift, setShift] = useState<string | null>(null);

  const [opType, setOpType] = useState<string | null>(null);

  const [selectedKey, setSelectedKey] = useState<Key | null>(null);
  const [quantity, setQuantity] = useState("");

  const [items, setItems] = useState<PackingItem[]>([]);

  // ======================
  // DATES
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
    if (!selectedKey || !quantity) return;

    const code = String(selectedKey);

    if (items.some((i) => i.item_code === code)) return;

    setItems((prev) => [
      ...prev,
      {
        item_code: code,
        quantity: Number(quantity),
      },
    ]);

    setSelectedKey(null);
    setQuantity("");
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

  async function submitPackingForm(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();

    if (items.length === 0) {
      toast.info("Add items first");
      return;
    }

    setSubmitting(true);

    try {
      const payload = items.map((item) => ({
        item_code: item.item_code,
        qty: item.quantity,
        prod_id: `PROD-${prodDate}-${shift}`,
      }));

      const { error } = await supabase.from("bh_packing").insert(payload);

      if (error) {
        toast.danger(error.message);
        return;
      }

      toast.success("Packing form submitted!");

      setItems([]);
      setSelectedKey(null);
      setQuantity("");
    } finally {
      setSubmitting(false);
    }
  }

  // ======================
  // LOADING
  // ======================

  if (loading) {
    return <div className="py-10 text-center">Loading...</div>;
  }

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

      {/* INPUT ROW */}
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

        <div className="w-full sm:w-[200px]">
          <Label>Quantity</Label>
          <Input
            type="number"
            value={quantity}
            onChange={(e) => setQuantity(e.target.value)}
          />
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
            <Input value={item.item_code} className="w-full sm:w-[200px]" />

            <Input
              value={String(item.quantity)}
              className="w-full sm:w-[120px]"
            />

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
      <Button type="submit" isPending={submitting}>
        {({ isPending }) => (
          <>
            {isPending ? <Spinner color="current" size="sm" /> : null}
            Submit Packing Form
          </>
        )}
      </Button>
    </form>
  );
}
