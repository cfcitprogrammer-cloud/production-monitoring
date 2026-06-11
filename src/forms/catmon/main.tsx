import { useState } from "react";
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
} from "@heroui/react";
import { supabase } from "../../utils/supabase";
import * as telegram from "../../utils/telegram";

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

    // Transforms Array ["Line 1", "Line 3"] to clean string layout "Line 1, Line 3"
    const formattedLinesString = selectedLines.join(", ");

    try {
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

      // 1. Commit to Supabase DB
      const { error: dbError } = await supabase
        .from("canton_overview")
        .insert([completePayload]);

      if (dbError) throw dbError;

      try {
        // 3. Fire the structured Telegram Notification payload down to Google Apps Script
        const tgResult = await telegram.submitProductionOverview({
          ...completePayload,
          dept: "CANTON",
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
        toast.warning("Saved to DB, but Telegram broadcast failed.");
      }

      // ======================
      // RESET FORM FIELDS
      // ======================
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
