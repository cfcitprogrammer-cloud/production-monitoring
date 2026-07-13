"use client";

import { useEffect, useMemo, useState } from "react";
import type { Key } from "@heroui/react";
import {
  Input,
  Label,
  TextArea,
  Checkbox,
  CheckboxGroup,
  Button,
  Select,
  ListBox,
  Spinner,
  toast,
  Autocomplete,
  SearchField,
  Description,
} from "@heroui/react";
import { supabase } from "../../utils/supabase";
import * as telegram from "../../utils/telegram";

// Output Item Interface
interface OutputItem {
  item_code: string;
  item_description: string;
  quantity: number;
  unit: string;
}

type CantonSku = {
  id: number;
  item_code: string;
  item_description: string;
  uom: string;
};

export default function CantonMainForm() {
  const allLines = ["Line 1", "Line 2", "Line 3", "Line 4", "Line 5"];

  // ======================
  // FORM STATE
  // ======================
  const [prodDate, setProdDate] = useState("");
  const [shift, setShift] = useState<string | null>(null);
  const [flourUsed, setFlourUsed] = useState(0);
  const [totalInput, setTotalInput] = useState(0);
  const [scrap, setScrap] = useState(0);
  const [sweepings, setSweepings] = useState(0);

  // Machine Trouble
  const [machineTroublesCount, setMachineTroublesCount] = useState(0);
  const [troubleRemarks, setTroubleRemarks] = useState("");

  const [selectedLines, setSelectedLines] = useState<string[]>(["Line 1"]);
  const [additionalRemarks, setAdditionalRemarks] = useState("");
  const [loading, setLoading] = useState(false);

  // ======================
  // CANTON PACKING STATE
  // ======================
  const [cantonSkus, setCantonSkus] = useState<CantonSku[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [packingItems, setPackingItems] = useState<OutputItem[]>([]);
  const [packSelectedKey, setPackSelectedKey] = useState<Key | null>(null);
  const [packQty, setPackQty] = useState("");

  // Fetch SKUs from 'canton_sku'
  useEffect(() => {
    const fetchCantonSkus = async () => {
      let query = supabase
        .from("catmon_sku")
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
        toast.danger("Failed to load Canton SKUs: " + error.message);
      } else if (data) {
        setCantonSkus(data);
      }
    };

    const delayDebounce = setTimeout(() => {
      fetchCantonSkus();
    }, 300);

    return () => clearTimeout(delayDebounce);
  }, [searchTerm]);

  const itemsList = useMemo(
    () =>
      cantonSkus.map((i, index) => ({
        id: String(i.id ?? `item-${index}`),
        itemCode: i.item_code || "Unknown Code",
        name: i.item_code || "Unknown Code",
        description: i.item_description || "",
        uom: i.uom || "pcs",
      })),
    [cantonSkus],
  );

  // Packing List Handlers
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

  // ======================
  // CHECKBOX LOGIC
  // ======================
  const isAllSelected = selectedLines.length === allLines.length;
  const isIndeterminate =
    selectedLines.length > 0 && selectedLines.length < allLines.length;

  // ======================
  // SUBMIT HANDLER
  // ======================
  async function submitCantonForm(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    if (!prodDate || !shift) {
      toast.danger("Please complete all required fields (Date & Shift).");
      return;
    }

    setLoading(true);

    const formattedLinesString = selectedLines.join(", ");

    try {
      // Complete Payload WITHOUT packing_output for Supabase
      const completePayload = {
        uid: `PROD-${prodDate}-${shift}`,
        prod_date: prodDate,
        shift: shift,
        flour_used: flourUsed,
        total_input: totalInput,
        scrap: scrap,
        sweepings: sweepings,
        machine_troubles: machineTroublesCount,
        trouble_remarks: troubleRemarks,
        lines_running: formattedLinesString,
        additional_remarks: additionalRemarks,
      };

      // 1. Commit to Supabase DB (Does NOT receive packing_output)
      const { error: dbError } = await supabase
        .from("canton_overview")
        .insert([completePayload]);

      if (dbError) throw dbError;

      // 2. Fire payload WITH packing_output ONLY to Telegram
      try {
        const tgResult = await telegram.submitProductionOverview({
          ...completePayload,
          packing_output: packingItems, // Passed only here
          dept: "CANTON",
        } as any);

        if (tgResult.success) {
          toast.success("Canton report submitted and broadcasted to Telegram!");
        } else {
          toast.warning("Saved to DB, but Telegram broadcast failed.");
        }
      } catch (tgError) {
        console.error("Telegram Transmission Error:", tgError);
        toast.warning("Saved to DB, but Telegram broadcast failed.");
      }

      // RESET FORM FIELDS
      setProdDate("");
      setShift(null);
      setFlourUsed(0);
      setTotalInput(0);
      setScrap(0);
      setSweepings(0);
      setMachineTroublesCount(0);
      setTroubleRemarks("");
      setSelectedLines(["Line 1"]);
      setAdditionalRemarks("");
      setPackingItems([]);
    } catch (error: any) {
      toast.danger(
        error.message || "Failed to commit transaction to Database.",
      );
    } finally {
      setLoading(false);
    }
  }

  return (
    <form className="space-y-6 max-w-2xl" onSubmit={submitCantonForm}>
      <header>
        <h1 className="text-2xl font-bold">Canton Production Form</h1>
        <p className="text-default-500">
          Input daily canton production metrics
        </p>
      </header>

      {/* PRODUCTION DETAILS */}
      <div className="flex flex-wrap gap-4">
        <div className="flex-1 min-w-[200px]">
          <Label className="block mb-2 font-medium">Production Date</Label>
          <Input
            type="date"
            required
            value={prodDate}
            onChange={(e) => setProdDate(e.target.value)}
          />
        </div>

        <div className="flex-1 min-w-[200px]">
          <Label className="block mb-2 font-medium">Shift</Label>
          <Select
            placeholder="Select Shift"
            selectedKey={shift}
            onSelectionChange={(key) => setShift(String(key))}
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
      </div>

      {/* INPUT METRICS */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <Label className="block mb-2 font-medium">Flour Used (kgs)</Label>
          <Input
            type="number"
            value={String(flourUsed)}
            onChange={(e) => setFlourUsed(Number(e.target.value))}
          />
        </div>
        <div>
          <Label className="block mb-2 font-medium">Total Input (kgs)</Label>
          <Input
            type="number"
            value={String(totalInput)}
            onChange={(e) => setTotalInput(Number(e.target.value))}
          />
        </div>
      </div>

      {/* CANTON PACKING OUTPUT */}
      <div className="p-4 border rounded-lg space-y-4">
        <h2 className="text-xl font-semibold">Canton Packing Output</h2>
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

        {/* CANTON PACKING LIST */}
        <div className="space-y-2">
          {packingItems.map((item, i) => (
            <div
              key={`canton-pack-${i}`}
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

      {/* WASTE METRICS */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <Label className="block mb-2 font-medium">Scrap (kgs)</Label>
          <Input
            type="number"
            value={String(scrap)}
            onChange={(e) => setScrap(Number(e.target.value))}
          />
        </div>
        <div>
          <Label className="block mb-2 font-medium">Sweepings (kgs)</Label>
          <Input
            type="number"
            value={String(sweepings)}
            onChange={(e) => setSweepings(Number(e.target.value))}
          />
        </div>
      </div>

      {/* MACHINE TROUBLE SECTION */}
      <div className="p-4 border rounded-lg bg-default-50">
        <h2 className="text-lg font-semibold mb-4">Machine Troubles</h2>

        <div className="mb-4">
          <Label className="block mb-2 font-medium">
            Number of Occurrences
          </Label>
          <Input
            type="number"
            placeholder="0"
            value={String(machineTroublesCount)}
            onChange={(e) => setMachineTroublesCount(Number(e.target.value))}
          />
        </div>

        <Label className="block mb-2 font-medium">Trouble Remarks</Label>
        <TextArea
          placeholder="Describe the mechanical issues encountered..."
          value={troubleRemarks}
          onChange={(e) => setTroubleRemarks(e.target.value)}
        />
      </div>

      {/* LINES RUNNING */}
      <div>
        <h2 className="text-lg font-semibold mb-2">Lines Running</h2>
        <Checkbox
          isIndeterminate={isIndeterminate}
          isSelected={isAllSelected}
          onChange={(checked) => setSelectedLines(checked ? allLines : [])}
        >
          <Checkbox.Control>
            <Checkbox.Indicator />
          </Checkbox.Control>
          <Checkbox.Content>
            <Label className="font-medium">Select All Lines</Label>
          </Checkbox.Content>
        </Checkbox>

        <div className="ml-6 mt-2">
          <CheckboxGroup
            value={selectedLines}
            onChange={(values) => setSelectedLines(values as string[])}
          >
            {allLines.map((line) => (
              <Checkbox key={line} value={line}>
                <Checkbox.Control>
                  <Checkbox.Indicator />
                </Checkbox.Control>
                <Checkbox.Content>
                  <Label>{line}</Label>
                </Checkbox.Content>
              </Checkbox>
            ))}
          </CheckboxGroup>
        </div>
      </div>

      {/* ADDITIONAL REMARKS */}
      <div>
        <Label className="block mb-2 font-medium">Additional Remarks</Label>
        <TextArea
          placeholder="Any other notes for today's production..."
          value={additionalRemarks}
          onChange={(e) => setAdditionalRemarks(e.target.value)}
        />
      </div>

      <Button type="submit" className="w-full md:w-auto" isPending={loading}>
        {({ isPending }) => (
          <>
            {isPending ? <Spinner color="current" size="sm" /> : null}
            Submit Canton Report
          </>
        )}
      </Button>
    </form>
  );
}
