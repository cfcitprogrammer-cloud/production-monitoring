"use client";

import { useEffect, useMemo, useState } from "react";
import type { Key } from "@heroui/react";
import {
  Input,
  Label,
  ListBox,
  Select,
  TextArea,
  Checkbox,
  CheckboxGroup,
  Button,
  Spinner,
  toast,
  Autocomplete,
  SearchField,
  Description,
} from "@heroui/react";
import { supabase } from "../../utils/supabase";
import * as telegram from "../../utils/telegram";

// Dynamic Item Interface
interface OutputItem {
  item_code: string;
  item_description: string;
  quantity: number;
  unit: string;
}

type ItemCode = {
  id: number;
  item_code: string;
  item_description: string;
  uom: string;
};

export default function SFMainForm() {
  const allFryers = ["Fryer 1", "Fryer 2", "Fryer 3", "Fryer 4", "Fryer 5"];

  // ======================
  // STATE MANAGEMENT
  // ======================
  const [loading, setLoading] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  const [itemCodes, setItemCodes] = useState<ItemCode[]>([]);
  const [searchTerm, setSearchTerm] = useState("");

  // Production Details
  const [prodDate, setProdDate] = useState("");
  const [shift, setShift] = useState<string | null>(null);
  const [opType, setOpType] = useState<string | null>(null);
  const [site, setSite] = useState<string | null>(null);
  const [totalBatches, setTotalBatches] = useState<number>(60); // <-- Initialized Total Batches to 60

  // Machine Trouble & Remarks
  const [machineTroubleOccurred, setMachineTroubleOccurred] = useState(0);
  const [troubleRemarks, setTroubleRemarks] = useState("");
  const [additionalRemarks, setAdditionalRemarks] = useState("");
  const [selectedFryers, setSelectedFryers] = useState<string[]>(["Fryer 1"]);

  // Multi Weigher Output State
  const [multiWeigherItems, setMultiWeigherItems] = useState<OutputItem[]>([]);
  const [mwSelectedKey, setMwSelectedKey] = useState<Key | null>(null);
  const [mwQty, setMwQty] = useState("");

  // Packing Output State
  const [packingItems, setPackingItems] = useState<OutputItem[]>([]);
  const [packSelectedKey, setPackSelectedKey] = useState<Key | null>(null);
  const [packQty, setPackQty] = useState("");

  // ======================
  // FETCH ITEM CODES FROM SUPABASE
  // ======================
  useEffect(() => {
    const fetchItemCodes = async () => {
      setLoading(true);

      let query = supabase
        .from("sf_sku")
        .select("id, item_code, item_description, uom")
        .order("item_code")
        .limit(10);

      if (searchTerm.trim()) {
        query = query.or(
          `item_code.ilike.%${searchTerm.trim()}%,item_description.ilike.%${searchTerm.trim()}%`,
        );
      }

      const { data, error } = await query;

      if (error) {
        toast.danger("Failed to load item codes: " + error.message);
      } else if (data) {
        setItemCodes(data);
      }

      setLoading(false);
    };

    const delayDebounce = setTimeout(() => {
      fetchItemCodes();
    }, 300);

    return () => clearTimeout(delayDebounce);
  }, [searchTerm]);

  const itemsList = useMemo(
    () =>
      itemCodes.map((i, index) => ({
        id: String(i.id ?? `item-${index}`),
        itemCode: i.item_code || "Unknown Code",
        name: i.item_code || "Unknown Code",
        description: i.item_description || "",
        uom: i.uom || "pcs",
      })),
    [itemCodes],
  );

  // ======================
  // DYNAMIC ITEMS HANDLERS
  // ======================
  const addMultiWeigherItem = () => {
    if (!mwSelectedKey || !mwQty) return;

    const found = itemsList.find((i) => i.id === String(mwSelectedKey));
    if (!found) return;

    if (multiWeigherItems.some((i) => i.item_code === found.itemCode)) {
      toast.info("Item code already added in Multi Weigher Output.");
      return;
    }

    setMultiWeigherItems((prev) => [
      ...prev,
      {
        item_code: found.itemCode,
        item_description: found.description,
        quantity: Number(mwQty),
        unit: found.uom,
      },
    ]);
    setMwSelectedKey(null);
    setMwQty("");
  };

  const removeMultiWeigherItem = (index: number) => {
    setMultiWeigherItems((prev) => prev.filter((_, i) => i !== index));
  };

  const addPackingItem = () => {
    if (!packSelectedKey || !packQty) return;

    const found = itemsList.find((i) => i.id === String(packSelectedKey));
    if (!found) return;

    if (packingItems.some((i) => i.item_code === found.itemCode)) {
      toast.info("Item code already added in Packing Output.");
      return;
    }

    setPackingItems((prev) => [
      ...prev,
      {
        item_code: found.itemCode,
        item_description: found.description,
        quantity: Number(packQty),
        unit: found.uom,
      },
    ]);
    setPackSelectedKey(null);
    setPackQty("");
  };

  const removePackingItem = (index: number) => {
    setPackingItems((prev) => prev.filter((_, i) => i !== index));
  };

  // Checkbox Helpers
  const isAllSelected = selectedFryers.length === allFryers.length;
  const isIndeterminate =
    selectedFryers.length > 0 && selectedFryers.length < allFryers.length;

  async function submitOverview(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();

    if (!prodDate || !shift || !site) {
      toast.danger(
        "Please complete required field metrics (Site, Date, Shift).",
      );
      return;
    }

    setSubmitting(true);

    try {
      // 1. Database Payload
      const dbPayload = {
        uid: `SF-${prodDate}-${shift}`,
        prod_date: prodDate,
        shift: shift,
        op_type: opType,
        total_batches: totalBatches, // <-- Included total_batches in DB payload
        machine_trouble: machineTroubleOccurred,
        trouble_remarks: troubleRemarks,
        additional_remarks: additionalRemarks,
        fryers_running: selectedFryers,
        is_new_building: site === "sf2",
      };

      const { error: dbError } = await supabase
        .from("sf_overview")
        .insert([dbPayload]);

      if (dbError) throw dbError;

      // 2. Telegram Payload
      try {
        const tgResult = await telegram.submitProductionOverview({
          ...dbPayload,
          multi_weigher_output: multiWeigherItems,
          packing_output: packingItems,
          dept: "SNACKFOOD",
        } as any);

        if (tgResult.success) {
          toast.success("SF Report submitted and broadcasted to Telegram!");
        } else {
          toast.warning("Saved to Database, but Telegram notification failed.");
        }
      } catch (tgError) {
        console.error("Telegram Transmission Error:", tgError);
        toast.warning("Saved to Database, but Telegram broadcast failed.");
      }

      // Reset Form Fields
      setProdDate("");
      setShift(null);
      setOpType(null);
      setTotalBatches(60);
      setMachineTroubleOccurred(0);
      setTroubleRemarks("");
      setAdditionalRemarks("");
      setSelectedFryers(["Fryer 1"]);
      setSite(null);
      setMultiWeigherItems([]);
      setPackingItems([]);
    } catch (error: any) {
      toast.danger(
        error.message || "An unexpected error occurred during submission.",
      );
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <form className="space-y-6 max-w-3xl" onSubmit={submitOverview}>
      <header>
        <h1 className="text-2xl font-bold">SF Overview</h1>
        <p className="text-default-500">
          Snack Factory production monitoring form
        </p>
      </header>

      {/* PRODUCTION DETAILS */}
      <h2 className="text-xl font-semibold">Production Details</h2>

      {/* SITE */}
      <div>
        <Label className="block mb-2 font-medium">Site</Label>
        <Select
          className="w-[256px]"
          placeholder="Select Factory Site"
          selectedKey={site}
          onSelectionChange={(key) => setSite(String(key))}
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
        <Label className="block mb-2 font-medium">Production Date</Label>
        <Input
          type="date"
          value={prodDate}
          onChange={(e) => setProdDate(e.target.value)}
          required
        />
      </div>

      {/* SHIFT */}
      <div>
        <Label className="block mb-2 font-medium">Shift</Label>
        <Select
          className="w-[256px]"
          placeholder="Select Shift"
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

      {/* OPERATION TYPE */}
      <div>
        <Label className="block mb-2 font-medium">Operation Type</Label>
        <Select
          className="w-[256px]"
          placeholder="Select Operation Type"
          selectedKey={opType}
          onSelectionChange={(key) => setOpType(String(key))}
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

      {/* TOTAL BATCHES FIELD */}
      <div>
        <Label className="block mb-2 font-medium">Total Batches</Label>
        <Input
          type="number"
          value={String(totalBatches)}
          onChange={(e) => setTotalBatches(Number(e.target.value))}
          required
        />
      </div>

      {/* MULTI WEIGHER OUTPUT */}
      <div className="p-4 border rounded-lg space-y-4">
        <h2 className="text-xl font-semibold">SF Multi Weigher Output</h2>
        <div className="flex flex-col gap-3 sm:flex-row sm:items-end">
          <div className="flex-1 sm:w-[280px]">
            <Label>Item Code</Label>
            <Autocomplete
              selectedKey={mwSelectedKey}
              onSelectionChange={(key) => setMwSelectedKey(key)}
            >
              <Autocomplete.Trigger>
                <Autocomplete.Value />
                <Autocomplete.ClearButton type="button" />
                <Autocomplete.Indicator />
              </Autocomplete.Trigger>
              <Autocomplete.Popover>
                <SearchField>
                  <SearchField.Group>
                    <SearchField.Input
                      placeholder="Search SKU..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                    />
                  </SearchField.Group>
                </SearchField>
                <ListBox items={itemsList} selectionMode="single">
                  {(item) => (
                    <ListBox.Item
                      id={item.id}
                      textValue={item.name}
                      isDisabled={multiWeigherItems.some(
                        (i) => i.item_code === item.itemCode,
                      )}
                    >
                      <div className="flex flex-col">
                        <Label>{item.name}</Label>
                        <Description>{item.description}</Description>
                      </div>
                    </ListBox.Item>
                  )}
                </ListBox>
              </Autocomplete.Popover>
            </Autocomplete>
          </div>

          <div className="w-full sm:w-[160px]">
            <Label>Quantity</Label>
            <Input
              type="number"
              value={mwQty}
              onChange={(e) => setMwQty(e.target.value)}
            />
          </div>

          <Button type="button" onPress={addMultiWeigherItem}>
            Add
          </Button>
        </div>

        <div className="space-y-2">
          {multiWeigherItems.map((item, i) => (
            <div
              key={`mw-${i}`}
              className="flex justify-between items-center border p-3 rounded"
            >
              <div className="flex flex-col">
                <span className="font-semibold text-sm">
                  {item.item_code}
                  {item.item_description ? ` — ${item.item_description}` : ""}
                </span>
                <span className="text-xs text-default-500">
                  Qty: {item.quantity} {item.unit}
                </span>
              </div>
              <Button
                type="button"
                size="sm"
                onPress={() => removeMultiWeigherItem(i)}
              >
                Remove
              </Button>
            </div>
          ))}
        </div>
      </div>

      {/* PACKING OUTPUT */}
      <div className="p-4 border rounded-lg space-y-4">
        <h2 className="text-xl font-semibold">SF Packing Output</h2>
        <div className="flex flex-col gap-3 sm:flex-row sm:items-end">
          <div className="flex-1 sm:w-[280px]">
            <Label>Item Code</Label>
            <Autocomplete
              selectedKey={packSelectedKey}
              onSelectionChange={(key) => setPackSelectedKey(key)}
            >
              <Autocomplete.Trigger>
                <Autocomplete.Value />
                <Autocomplete.ClearButton type="button" />
                <Autocomplete.Indicator />
              </Autocomplete.Trigger>
              <Autocomplete.Popover>
                <SearchField>
                  <SearchField.Group>
                    <SearchField.Input
                      placeholder="Search SKU..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                    />
                  </SearchField.Group>
                </SearchField>
                <ListBox items={itemsList} selectionMode="single">
                  {(item) => (
                    <ListBox.Item
                      id={item.id}
                      textValue={item.name}
                      isDisabled={packingItems.some(
                        (i) => i.item_code === item.itemCode,
                      )}
                    >
                      <div className="flex flex-col">
                        <Label>{item.name}</Label>
                        <Description>{item.description}</Description>
                      </div>
                    </ListBox.Item>
                  )}
                </ListBox>
              </Autocomplete.Popover>
            </Autocomplete>
          </div>

          <div className="w-full sm:w-[160px]">
            <Label>Quantity</Label>
            <Input
              type="number"
              value={packQty}
              onChange={(e) => setPackQty(e.target.value)}
            />
          </div>

          <Button type="button" onPress={addPackingItem}>
            Add
          </Button>
        </div>

        <div className="space-y-2">
          {packingItems.map((item, i) => (
            <div
              key={`pack-${i}`}
              className="flex justify-between items-center border p-3 rounded"
            >
              <div className="flex flex-col">
                <span className="font-semibold text-sm">
                  {item.item_code}
                  {item.item_description ? ` — ${item.item_description}` : ""}
                </span>
                <span className="text-xs text-default-500">
                  Qty: {item.quantity} {item.unit}
                </span>
              </div>
              <Button
                type="button"
                size="sm"
                onPress={() => removePackingItem(i)}
              >
                Remove
              </Button>
            </div>
          ))}
        </div>
      </div>

      {/* MACHINE TROUBLE */}
      <h2 className="text-xl font-semibold">Machine Trouble</h2>

      <div>
        <Label className="block mb-2 font-medium">
          Machine Trouble Occurred (Count)
        </Label>
        <Input
          type="number"
          value={String(machineTroubleOccurred)}
          onChange={(e) => setMachineTroubleOccurred(Number(e.target.value))}
        />
      </div>

      <div>
        <Label className="block mb-2 font-medium">Trouble Remarks</Label>
        <TextArea
          placeholder="Describe any mechanical issues experienced..."
          value={troubleRemarks}
          onChange={(e) => setTroubleRemarks(e.target.value)}
        />
      </div>

      {/* FRYERS RUNNING */}
      <h2 className="text-xl font-semibold">Fryers Running</h2>

      <Checkbox
        isIndeterminate={isIndeterminate}
        isSelected={isAllSelected}
        onChange={(checked) => setSelectedFryers(checked ? allFryers : [])}
      >
        <Checkbox.Control>
          <Checkbox.Indicator />
        </Checkbox.Control>
        <Checkbox.Content>
          <Label className="font-medium">Select All Fryers</Label>
        </Checkbox.Content>
      </Checkbox>

      <div className="ml-6 flex flex-col gap-2">
        <CheckboxGroup
          value={selectedFryers}
          onChange={(values) => setSelectedFryers(values as string[])}
        >
          {allFryers.map((fryer) => (
            <Checkbox key={fryer} value={fryer}>
              <Checkbox.Control>
                <Checkbox.Indicator />
              </Checkbox.Control>
              <Checkbox.Content>
                <Label>{fryer}</Label>
              </Checkbox.Content>
            </Checkbox>
          ))}
        </CheckboxGroup>
      </div>

      {/* ADDITIONAL REMARKS */}
      <div>
        <h2 className="text-xl font-semibold mb-2">Additional Remarks</h2>
        <TextArea
          placeholder="Enter standard processing notes..."
          value={additionalRemarks}
          onChange={(e) => setAdditionalRemarks(e.target.value)}
        />
      </div>

      <Button type="submit" className="w-full md:w-auto" isPending={submitting}>
        {({ isPending }) => (
          <>
            {isPending ? <Spinner color="current" size="sm" /> : null}
            Submit Overview
          </>
        )}
      </Button>
    </form>
  );
}
