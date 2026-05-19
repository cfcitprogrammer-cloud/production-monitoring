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
  useFilter,
  Description,
} from "@heroui/react";

import type { Key } from "@heroui/react";
import { supabase } from "../../utils/supabase";

type CookingItem = {
  item_code: string;
  usage: number;
  // item_description: string;
};

type ItemCode = {
  id: number;
  item_code: string;
  item_description: string;
  uom: string;
};

export default function SFBlendingForm() {
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);

  const [itemCodes, setItemCodes] = useState<ItemCode[]>([]);
  const [prodDate, setProdDate] = useState("");

  const [shift, setShift] = useState<string | null>(null);

  const [opType, setOpType] = useState<string | null>(null);

  const [selectedKey, setSelectedKey] = useState<Key | null>(null);
  const [usage, setUsage] = useState("");

  const [items, setItems] = useState<CookingItem[]>([]);

  const [site, setSite] = useState<string | null>(null);

  const { contains } = useFilter({ sensitivity: "base" });

  // ======================
  // FETCH
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

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);

      const [codesRes] = await Promise.all([
        supabase
          .from("sf_sku")
          .select("id, item_code, item_description, uom")
          .eq("type", "blending")
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
    if (!selectedKey || !usage) return;

    const code = String(selectedKey);

    if (items.some((i) => i.item_code === code)) return;

    setItems((prev) => [
      ...prev,
      {
        item_code: code,
        usage: Number(usage),
      },
    ]);

    setSelectedKey(null);
    setUsage("");
  };

  // ======================
  // REMOVE ITEM (NEW)
  // ======================

  const removeItem = (index: number) => {
    setItems((prev) => prev.filter((_, i) => i !== index));
  };

  // ======================
  // SUBMIT
  // ======================

  async function submitCookingForm(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();

    if (items.length === 0) {
      toast.info("Add items first");
      return;
    }

    setSubmitting(true);

    try {
      const payload = items.map((item) => ({
        item_code: item.item_code,
        usage: item.usage,
        prod_id: `PROD-${prodDate}-${shift}`,
        is_new_building: site === "sf2",
      }));

      const { error } = await supabase.from("sf_blending").insert(payload);

      if (error) {
        toast.danger(error.message);
        return;
      }

      toast.success("Form submitted!");

      setItems([]);
      setSelectedKey(null);
      setUsage("");
      setSite(null);
    } finally {
      setSubmitting(false);
    }
  }

  if (loading) {
    return <div className="py-10 text-center">Loading...</div>;
  }

  return (
    <form className="space-y-6" onSubmit={submitCookingForm}>
      {/* HEADER */}
      {/* ====================== */}
      {/* PRODUCTION DETAILS */}
      {/* ====================== */}

      <h2 className="text-xl font-semibold">Production Details</h2>

      {/* SITE */}

      <div>
        <Label className="block mb-2">Site</Label>

        <Select
          className="w-[256px]"
          selectedKey={site}
          onSelectionChange={(key) => {
            setSite(String(key));
          }}
          isRequired
        >
          <Select.Trigger>
            <Select.Value />
            <Select.Indicator />
          </Select.Trigger>

          <Select.Popover>
            <ListBox>
              <ListBox.Item id="sf1">SF1</ListBox.Item>

              <ListBox.Item id="sf2">SF2</ListBox.Item>
            </ListBox>
          </Select.Popover>
        </Select>
      </div>

      {/* DATE */}

      <div>
        <Label className="block mb-2">Production Date</Label>

        <Input
          type="date"
          value={prodDate}
          onChange={(e) => setProdDate(e.target.value)}
          min={new Date(Date.now() - 86400000).toLocaleDateString("sv-SE")}
          max={new Date().toLocaleDateString("sv-SE")}
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
          isRequired={true}
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

      {/* INPUT ROW (RESPONSIVE FIXED) */}
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
                      isDisabled={items.some((i) => i.item_code === item.id)}
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

        <div className="w-full sm:w-[200px]">
          <Label>Usage</Label>
          <Input
            type="number"
            value={usage}
            onChange={(e) => setUsage(e.target.value)}
          />
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
              {/* ITEM CODE */}
              <div>
                <Label className="block mb-2">Item Code</Label>
                <Input
                  value={item.item_code}
                  className="w-full sm:w-[200px]"
                  disabled
                />
              </div>

              {/* DESCRIPTION */}
              <div>
                <Label className="block mb-2">Item Description</Label>
                <Input value={itemInfo?.item_description || ""} disabled />
              </div>

              {/* USAGE + REMOVE */}
              <div>
                <Label className="block mb-2">Usage</Label>
                <Input value={String(item.usage)} />
              </div>

              <div className="flex flex-col gap-2 sm:flex-row sm:items-end">
                <Button
                  type="button"
                  className="w-full sm:w-auto"
                  onPress={() => removeItem(i)}
                >
                  Remove
                </Button>
              </div>
            </div>
          );
        })}
      </div>

      {/* SUBMIT */}
      <Button type="submit" isPending={submitting}>
        {({ isPending }) => (
          <>
            {isPending ? <Spinner color="current" size="sm" /> : null}
            Submit Blending Form
          </>
        )}
      </Button>
    </form>
  );
}
