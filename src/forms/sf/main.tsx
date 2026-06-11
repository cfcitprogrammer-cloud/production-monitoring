import { useState } from "react";
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
} from "@heroui/react";
import { supabase } from "../../utils/supabase";
import * as telegram from "../../utils/telegram";

export default function SFMainForm() {
  const allFryers = ["Fryer 1", "Fryer 2", "Fryer 3", "Fryer 4", "Fryer 5"];

  // ======================
  // FORM STATE
  // ======================
  const [prodDate, setProdDate] = useState("");
  const [shift, setShift] = useState<string | null>(null);
  const [opType, setOpType] = useState<string | null>(null);
  const [machineTroubleOccurred, setMachineTroubleOccurred] = useState(0);
  const [troubleRemarks, setTroubleRemarks] = useState("");
  const [additionalRemarks, setAdditionalRemarks] = useState("");
  const [selectedFryers, setSelectedFryers] = useState<string[]>(["Fryer 1"]);
  const [site, setSite] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  // ======================
  // CHECKBOX STATE
  // ======================
  const isAllSelected = selectedFryers.length === allFryers.length;
  const isIndeterminate =
    selectedFryers.length > 0 && selectedFryers.length < allFryers.length;

  // ======================
  // SUBMIT
  // ======================
  async function submitOverview(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    if (!prodDate || !shift || !site) {
      toast.danger("Please complete all required field metrics.");
      return;
    }

    setLoading(true);

    try {
      // 1. Database Payload Matching Supabase Specifications
      const dbPayload = {
        uid: `SF-${prodDate}-${shift}`,
        prod_date: prodDate,
        shift: shift,
        op_type: opType,
        machine_trouble: machineTroubleOccurred,
        trouble_remarks: troubleRemarks,
        additional_remarks: additionalRemarks,
        fryers_running: selectedFryers, // Keeps native array structure for Postgres column
        is_new_building: site === "sf2",
      };

      const { error: dbError } = await supabase
        .from("sf_overview")
        .insert([dbPayload]);

      if (dbError) throw dbError;

      try {
        const tgResult = await telegram.submitProductionOverview({
          ...dbPayload,
          dept: "SNACKFOOD",
        } as any);

        if (tgResult.success) {
          toast.success(
            "Overview submitted and broadcasted to Telegram successfully!",
          );
        } else {
          toast.warning(
            "Saved to DB, but Telegram notification failed to broadcast.",
          );
        }

        toast.success("Canton report submitted and broadcasted to Telegram!");
      } catch (tgError) {
        console.error("Telegram Transmission Error:", tgError);
        toast.warning(
          "Saved to DB, but Telegram notification dispatch failed.",
        );
      }

      // ======================
      // RESET FORM
      // ======================
      setProdDate("");
      setShift(null);
      setOpType(null);
      setMachineTroubleOccurred(0);
      setTroubleRemarks("");
      setAdditionalRemarks("");
      setSelectedFryers(["Fryer 1"]);
      setSite(null);
    } catch (error: any) {
      toast.danger(
        error.message || "An unexpected error occurred during execution.",
      );
    } finally {
      setLoading(false);
    }
  }

  return (
    <form className="space-y-6 max-w-2xl" onSubmit={submitOverview}>
      {/* HEADER */}
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
          min={new Date(Date.now() - 86400000).toLocaleDateString("sv-SE")}
          max={new Date().toLocaleDateString("sv-SE")}
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

      {/* MACHINE TROUBLE */}
      <h2 className="text-xl font-semibold">Machine Trouble</h2>

      {/* MACHINE TROUBLE OCCURRED */}
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

      {/* TROUBLE REMARKS */}
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

      {/* SELECT ALL */}
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

      {/* FRYERS */}
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

      {/* SUBMIT */}
      <Button type="submit" className="w-full md:w-auto" isPending={loading}>
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
