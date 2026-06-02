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

// Represents a single dynamic input config (e.g., Weight, Qty, Usage)
export type FormFieldConfig = {
  key: string; // The actual database column name (e.g., 'weight', 'qty')
  label: string; // The UI display name (e.g., 'Weight (kg)', 'Qty / Pieces')
  type?: "number" | "text";
};

type LineItem = {
  item_code: string;
  fields: Record<string, string | number>; // Dynamically holds values keyed by FormFieldConfig.key
};

type Props = {
  title: string;
  skuTable: string;
  submitTable: string;
  skuFilterColumn?: string;
  skuFilterValue?: string;
  /** Pass an array of fields you want this form stage to handle */
  fieldsConfig: FormFieldConfig[];
};

export default function ProductionFormV2({
  title,
  skuTable,
  submitTable,
  skuFilterColumn = "type",
  skuFilterValue,
  fieldsConfig,
}: Props) {
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [itemCodes, setItemCodes] = useState<ItemCode[]>([]);

  // Header Meta States
  const [prodDate, setProdDate] = useState("");
  const [shift, setShift] = useState<string | null>(null);
  const [opType, setOpType] = useState<string | null>(null);

  // Row Entry States
  const [selectedKey, setSelectedKey] = useState<Key | null>(null);
  // Holds the staging values for the entry row, e.g., { weight: "", qty: "" }
  const [fieldValues, setFieldValues] = useState<Record<string, string>>({});

  const [items, setItems] = useState<LineItem[]>([]);
  const { contains } = useFilter({ sensitivity: "base" });

  // Initialize staging values when config changes
  useEffect(() => {
    const initialValues = fieldsConfig.reduce(
      (acc, current) => {
        acc[current.key] = "";
        return acc;
      },
      {} as Record<string, string>,
    );
    setFieldValues(initialValues);
  }, [fieldsConfig]);

  // ======================
  // FETCH SKU LOOKUPS
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
      if (data) setItemCodes(data);
      setLoading(false);
    };

    fetchData();
  }, [skuTable, skuFilterColumn, skuFilterValue]);

  const itemsList = itemCodes.map((i) => ({
    id: i.item_code,
    name: i.item_code,
    description: i.item_description,
  }));

  const handleInputChange = (fieldKey: string, val: string) => {
    setFieldValues((prev) => ({ ...prev, [fieldKey]: val }));
  };

  // ======================
  // ADD ITEM TO GRID
  // ======================
  const addItem = () => {
    if (!selectedKey) return;

    // Ensure all configured inputs have been filled out
    const missingFields = fieldsConfig.some((f) => !fieldValues[f.key]);
    if (missingFields) {
      toast.info("Please fill out all metric values.");
      return;
    }

    const code = String(selectedKey);
    if (items.some((i) => i.item_code === code)) {
      toast.info("Item code already added to this list.");
      return;
    }

    // Standardize text vs numeric entries based on schema intentions
    const dynamicFieldsPayload: Record<string, string | number> = {};
    fieldsConfig.forEach((f) => {
      dynamicFieldsPayload[f.key] =
        f.type === "text" ? fieldValues[f.key] : Number(fieldValues[f.key]);
    });

    setItems((prev) => [
      ...prev,
      {
        item_code: code,
        fields: dynamicFieldsPayload,
      },
    ]);

    // Reset entry inputs
    setSelectedKey(null);
    setFieldValues(
      fieldsConfig.reduce(
        (acc, f) => ({ ...acc, [f.key]: "" }),
        {} as Record<string, string>,
      ),
    );
  };

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
      // Structure the flat array payload for Supabase insertion
      const payload = items.map((item) => ({
        item_code: item.item_code,
        prod_id: `PROD-${prodDate}-${shift}`,
        ...item.fields, // Spread the dynamic attributes (weight, qty, etc.) directly into row
      }));

      const { error } = await supabase.from(submitTable).insert(payload);

      if (error) {
        toast.danger(error.message);
        return;
      }

      toast.success("Form submitted successfully!");
      setItems([]);
      setSelectedKey(null);
    } finally {
      setSubmitting(false);
    }
  }

  if (loading) {
    return <div className="py-10 text-center">Loading...</div>;
  }

  return (
    <form className="space-y-6" onSubmit={handleSubmit}>
      <h2 className="text-xl font-semibold">{title}</h2>

      {/* METADATA DROPDOWNS */}
      <div className="flex flex-wrap gap-4">
        <div>
          <Label className="block mb-2">Production Date</Label>
          <Input
            type="date"
            value={prodDate}
            onChange={(e) => setProdDate(e.target.value)}
            required
          />
        </div>

        <div>
          <Label className="block mb-2">Shift</Label>
          <Select
            className="w-[216px]"
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

        <div>
          <Label className="block mb-2">Operation Type</Label>
          <Select
            className="w-[216px]"
            selectedKey={opType}
            onSelectionChange={(key) => setOpType(String(key))}
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
      </div>

      <hr className="border-neutral-200" />

      {/* COMPACT ENTRY ROW */}
      <div className="flex flex-col gap-3 lg:flex-row lg:items-end bg-neutral-50 p-4 rounded-lg border">
        <div className="w-full lg:w-[280px]">
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
                    <SearchField.Input placeholder="Search items..." />
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

        {/* DYNAMIC METRIC INJECTOR */}
        {fieldsConfig.map((field) => (
          <div key={field.key} className="lg:ml-4">
            <Label className="block">{field.label}</Label>
            <Input
              type={field.type || "number"}
              value={fieldValues[field.key] || ""}
              onChange={(e) => handleInputChange(field.key, e.target.value)}
            />
          </div>
        ))}

        <Button type="button" onPress={addItem} className="h-10">
          Add
        </Button>
      </div>

      {/* HISTORIC SUBMISSION LIST STAGING */}
      <div className="space-y-2">
        {items.map((item, i) => {
          const itemInfo = itemCodes.find(
            (x) => x.item_code === item.item_code,
          );
          return (
            <div
              key={i}
              className="flex flex-col lg:flex-row gap-2 items-center rounded border p-3 bg-white shadow-sm"
            >
              <div className="w-full lg:w-1/4">
                <span className="text-xs text-neutral-400 block font-bold">
                  Item Code
                </span>
                <p className="text-sm font-medium">{item.item_code}</p>
              </div>
              <div className="w-full lg:w-1/3">
                <span className="text-xs text-neutral-400 block font-bold">
                  Description
                </span>
                <p className="text-sm text-neutral-600 truncate">
                  {itemInfo?.item_description || "—"}
                </p>
              </div>

              {fieldsConfig.map((f) => (
                <div key={f.key} className="w-full lg:w-1/6">
                  <span className="text-xs text-neutral-400 block font-bold">
                    {f.label}
                  </span>
                  <p className="text-sm font-semibold">{item.fields[f.key]}</p>
                </div>
              ))}

              <Button type="button" size="sm" onPress={() => removeItem(i)}>
                Remove
              </Button>
            </div>
          );
        })}
      </div>

      {/* SUBMIT OVERALL BATCH */}
      <Button type="submit" isPending={submitting} className="text-white">
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
