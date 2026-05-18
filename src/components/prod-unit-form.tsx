import { useEffect, useState } from "react";

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
  useFilter,
  Description,
} from "@heroui/react";

import type { Key } from "@heroui/react";

import { supabase } from "../utils/supabase";

type ItemCode = {
  id: number;
  item_code: string;
  item_description: string;
  uom: string;
};

type LineItem = {
  item_code: string;
  qty: number;
  unit: string;
};

type Props = {
  title: string;

  skuTable: string;

  submitTable: string;

  skuFilterColumn?: string;

  skuFilterValue?: string;

  units?: string[];
};

export default function ProductionQtyUnitForm({
  title,

  skuTable,

  submitTable,

  skuFilterColumn = "type",

  skuFilterValue,

  units = ["wt", "pc"],
}: Props) {
  const [loading, setLoading] = useState(true);

  const [submitting, setSubmitting] = useState(false);

  const [itemCodes, setItemCodes] = useState<ItemCode[]>([]);

  const [prodDate, setProdDate] = useState("");

  const [shift, setShift] = useState<string | null>(null);

  const [selectedKey, setSelectedKey] = useState<Key | null>(null);

  const [qty, setQty] = useState("");

  const [unit, setUnit] = useState<string>("wt");

  const [items, setItems] = useState<LineItem[]>([]);

  const { contains } = useFilter({
    sensitivity: "base",
  });

  // ======================
  // FETCH
  // ======================

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);

      let query = supabase
        .from(skuTable)
        .select("id, item_code, item_description, uom")
        .order("item_code");

      if (skuFilterValue) {
        query = query.eq(skuFilterColumn, skuFilterValue);
      }

      const { data } = await query;

      if (data) {
        setItemCodes(data);
      }

      setLoading(false);
    };

    fetchData();
  }, [skuTable, skuFilterColumn, skuFilterValue]);

  // ======================
  // OPTIONS
  // ======================

  const itemsList = itemCodes.map((i) => ({
    id: i.item_code,

    name: i.item_code,

    description: i.item_description,
  }));

  // ======================
  // ADD
  // ======================

  const addItem = () => {
    if (!selectedKey || !qty || !unit) {
      return;
    }

    const code = String(selectedKey);

    if (items.some((i) => i.item_code === code)) {
      return;
    }

    setItems((prev) => [
      ...prev,
      {
        item_code: code,

        qty: Number(qty),

        unit,
      },
    ]);

    setSelectedKey(null);

    setQty("");

    setUnit("wt");
  };

  // ======================
  // REMOVE
  // ======================

  const removeItem = (index: number) => {
    setItems((prev) => prev.filter((_, i) => i !== index));
  };

  // ======================
  // SUBMIT
  // ======================

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();

    if (items.length === 0) {
      toast.info("Add items first");

      return;
    }

    setSubmitting(true);

    try {
      const payload = items.map((item) => ({
        item_code: item.item_code,

        qty: item.qty,

        unit: item.unit,

        prod_id: `PROD-${prodDate}-${shift}`,
      }));

      const { error } = await supabase.from(submitTable).insert(payload);

      if (error) {
        toast.danger(error.message);

        return;
      }

      toast.success("Form submitted!");

      setItems([]);

      setSelectedKey(null);

      setQty("");

      setUnit("wt");
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
    <form className="space-y-6" onSubmit={handleSubmit}>
      <h2 className="text-xl font-semibold">{title}</h2>

      {/* DATE */}

      <div>
        <Label className="block mb-2">Production Date</Label>

        <Input
          type="date"
          value={prodDate}
          onChange={(e) => setProdDate(e.target.value)}
          // min={new Date(Date.now() - 86400000).toLocaleDateString("sv-SE")}
          // max={new Date().toLocaleDateString("sv-SE")}
          required
        />
      </div>

      {/* SHIFT */}

      <div>
        <Label className="block mb-2">Shift</Label>

        <Select
          selectedKey={shift}
          onSelectionChange={(key) => setShift(String(key))}
          isRequired
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

      {/* INPUT ROW */}

      <div className="flex flex-col gap-3 sm:flex-row sm:items-end">
        {/* ITEM */}

        <div className="w-full sm:w-[280px]">
          <Label>Item Code</Label>

          <Autocomplete
            value={selectedKey}
            onChange={(key) => setSelectedKey(key as Key | null)}
          >
            <Autocomplete.Trigger>
              <Autocomplete.Value />

              <Autocomplete.ClearButton type="button" />

              <Autocomplete.Indicator />
            </Autocomplete.Trigger>

            <Autocomplete.Popover>
              <Autocomplete.Filter filter={contains}>
                <SearchField>
                  <SearchField.Group>
                    <SearchField.Input placeholder="Search..." />
                  </SearchField.Group>
                </SearchField>

                <ListBox items={itemsList} selectionMode="single">
                  {(item) => (
                    <ListBox.Item id={item.id} textValue={item.name}>
                      <div className="flex flex-col">
                        <Label>{item.name}</Label>

                        <Description>{item.description}</Description>
                      </div>
                    </ListBox.Item>
                  )}
                </ListBox>
              </Autocomplete.Filter>
            </Autocomplete.Popover>
          </Autocomplete>
        </div>

        {/* QTY */}

        <div className="w-full sm:w-[140px]">
          <Label>Qty</Label>

          <Input
            type="number"
            value={qty}
            onChange={(e) => setQty(e.target.value)}
          />
        </div>

        {/* UNIT */}

        <div className="w-full sm:w-[140px]">
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
                    {u.toUpperCase()}
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
        {items.map((item, i) => {
          const itemInfo = itemCodes.find(
            (x) => x.item_code === item.item_code,
          );

          return (
            <div
              key={i}
              className="flex flex-col md:flex-row gap-2 rounded border p-3"
            >
              <Input value={item.item_code} disabled />

              <Input value={itemInfo?.item_description || ""} disabled />

              <Input value={String(item.qty)} disabled />

              <Input value={item.unit} disabled />

              <Button type="button" onPress={() => removeItem(i)}>
                Remove
              </Button>
            </div>
          );
        })}
      </div>

      {/* SUBMIT */}

      <Button type="submit" isPending={submitting}>
        {({ isPending }) => (
          <>
            {isPending ? <Spinner color="current" size="sm" /> : null}
            Submit
          </>
        )}
      </Button>
    </form>
  );
}
