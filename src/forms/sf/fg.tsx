"use client";

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
  Description,
  useFilter,
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
  item_description: string;
};

export default function SFFGForm() {
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);

  const [itemCodes, setItemCodes] = useState<ItemCode[]>([]);
  const [prodDate, setProdDate] = useState("");

  const [shift, setShift] = useState<string | null>(null);

  const [opType, setOpType] = useState<string | null>(null);
  const [selectedKey, setSelectedKey] = useState<Key | null>(null);
  const [quantity, setQuantity] = useState("");
  const [unit, setUnit] = useState<Key | null>(null);

  const [items, setItems] = useState<FGItem[]>([]);

  const { contains } = useFilter({ sensitivity: "base" });

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

      const [codesRes] = await Promise.all([
        supabase
          .from("sf_sku")
          .select("id, item_code, item_description, uom")
          .eq("type", "fg")
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
    description: i.item_description,
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

    if (items.length === 0) {
      toast.info("Add items first");
      return;
    }

    setSubmitting(true);

    try {
      const payload = items.map((item) => ({
        item_code: item.itemCode,
        qty: Number(item.quantity),
        unit: item.unit,
        prod_id: `PROD-${prodDate}-${shift}`,
      }));

      const { error } = await supabase.from("sf_fg").insert(payload);

      if (error) {
        toast.danger(error.message);
        return;
      }

      toast.success("Form submitted!");

      setItems([]);
      setSelectedKey(null);
      setQuantity("");
      setUnit(null);
    } finally {
      setSubmitting(false);
    }
  }

  if (loading) {
    return <div className="py-10 text-center">Loading...</div>;
  }

  return (
    <form className="space-y-6" onSubmit={submitFGForm}>
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
          required
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
          isRequired={true}
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
          isRequired
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
                    <ListBox.Item
                      id={item.id}
                      textValue={`${item.name}`}
                      isDisabled={items.some((i) => i.itemCode === item.id)}
                    >
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
        {items.map((item, i) => {
          const itemInfo = itemCodes.find((x) => x.item_code === item.itemCode);

          return (
            <div
              key={i}
              className="flex flex-col gap-2 rounded border p-3 sm:flex-row sm:items-end"
            >
              <div>
                <Label className="block mb-2">Item Code</Label>
                <Input value={item.itemCode} disabled />
              </div>

              <div>
                <Label className="block mb-2">Item Description</Label>
                <Input value={itemInfo?.item_description || ""} disabled />
              </div>

              <div>
                <Label className="block mb-2">Item Code</Label>
                <Input value={item.quantity} disabled />
              </div>

              <div>
                <Label className="block mb-2">Item Code</Label>
                <Input value={item.unit} disabled />
              </div>

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
            Submit FG Form
          </>
        )}
      </Button>
    </form>
  );
}
