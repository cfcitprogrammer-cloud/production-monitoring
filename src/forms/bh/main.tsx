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

export default function BHMainForm() {
  const allLines = ["Line 1", "Line 2", "Line 3", "Line 4", "Line 5"];

  // ======================
  // FORM STATE
  // ======================
  const [prodDate, setProdDate] = useState("");
  const [shift, setShift] = useState<string | null>(null);
  const [opType, setOpType] = useState<string | null>(null);
  const [cornstarchUsed, setCornstarchUsed] = useState(0);
  const [reworksUsed, setReworksUsed] = useState(0);
  const [localOutput, setLocalOutput] = useState(0);
  const [exportOutput, setExportOutput] = useState(0);

  const [ipHh, setIpHh] = useState(0);
  const [ipMm, setIpMm] = useState(0);

  const [cpHh, setCpHh] = useState(0);
  const [cpMm, setCpMm] = useState(0);

  const [mtHh, setMtHh] = useState(0);
  const [mtMm, setMtMm] = useState(0);

  const [troubleRemarks, setTroubleRemarks] = useState("");
  const [trimmings, setTrimmings] = useState(0);
  const [rejects, setRejects] = useState(0);
  const [sweepings, setSweepings] = useState(0);
  const [selectedLines, setSelectedLines] = useState<string[]>(["Line 1"]);
  const [additionalRemarks, setAdditionalRemarks] = useState("");
  const [loading, setLoading] = useState(false);

  // ======================
  // CHECKBOX STATE
  // ======================
  const isAllSelected = selectedLines.length === allLines.length;
  const isIndeterminate =
    selectedLines.length > 0 && selectedLines.length < allLines.length;

  // ======================
  // SUBMIT HANDLER
  // ======================
  async function submitOverview(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setLoading(true);

    // Turn the checked lines array into a clean string layout: "Line 1, Line 2"
    const formattedLinesString = selectedLines.join(", ");

    try {
      // 1. Prepare the exact object mapping to your DB table keys and Telegram dynamic layout parser
      const completePayload = {
        dept: "BIHON",
        uid: `PROD-${prodDate}-${shift}`,
        prod_date: prodDate,
        shift: shift || "Unknown Shift",
        op_type: opType || "",
        cornstarch_used: cornstarchUsed,
        reworks_used: reworksUsed,
        local_output: localOutput,
        export_output: exportOutput,
        trimmings: trimmings,
        rejects: rejects,
        sweepings: sweepings,
        trouble_remarks: troubleRemarks,
        additional_remarks: additionalRemarks,
        ip_hh: ipHh,
        ip_mm: ipMm,
        cp_hh: cpHh,
        cp_mm: cpMm,
        mt_hh: mtHh,
        mt_mm: mtMm,
        lines_running: formattedLinesString,
      };

      // 2. Commit transaction data directly to Supabase
      const { error } = await supabase
        .from("bh_overview")
        .insert([completePayload])
        .select();

      if (error) {
        toast.danger(error.message);
        return;
      }

      // 3. Fire the structured Telegram Notification payload down to Google Apps Script
      const tgResult = await telegram.submitProductionOverview(
        completePayload as any,
      );

      if (tgResult.success) {
        toast.success(
          "Overview submitted and broadcasted to Telegram successfully!",
        );
      } else {
        toast.warning(
          "Saved to DB, but Telegram notification failed to broadcast.",
        );
      }

      // ======================
      // RESET FORM
      // ======================
      setProdDate("");
      setShift(null);
      setOpType(null);
      setCornstarchUsed(0);
      setReworksUsed(0);
      setLocalOutput(0);
      setExportOutput(0);
      setIpHh(0);
      setIpMm(0);
      setCpHh(0);
      setCpMm(0);
      setMtHh(0);
      setMtMm(0);
      setTroubleRemarks("");
      setTrimmings(0);
      setRejects(0);
      setSweepings(0);
      setSelectedLines(["Line 1"]);
      setAdditionalRemarks("");
    } catch (error) {
      console.error(error);
      toast.danger("An error occurred during transaction processing.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <form className="space-y-6" onSubmit={submitOverview}>
      {/* HEADER */}
      <header>
        <h1 className="text-2xl font-bold">Overview</h1>
        <p className="text-default-500">Production monitoring form</p>
      </header>

      {/* PRODUCTION DETAILS */}
      <h2 className="text-xl font-semibold">Production Details</h2>

      {/* DATE */}
      <div>
        <Label className="block mb-2">Date</Label>
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
              <ListBox.Item id="lastprod">Last Prod</ListBox.Item>
            </ListBox>
          </Select.Popover>
        </Select>
      </div>

      {/* RAW MATERIALS */}
      <h2 className="text-xl font-semibold">Raw Materials</h2>
      <div>
        <Label className="block mb-2">Cornstarch Used (kgs)</Label>
        <Input
          type="number"
          value={String(cornstarchUsed)}
          onChange={(e) => setCornstarchUsed(Number(e.target.value))}
        />
      </div>
      <div>
        <Label className="block mb-2">Reworks Used (kgs)</Label>
        <Input
          type="number"
          value={String(reworksUsed)}
          onChange={(e) => setReworksUsed(Number(e.target.value))}
        />
      </div>

      {/* PRODUCTION OUTPUT */}
      <h2 className="text-xl font-semibold">Production Output</h2>
      <div>
        <Label className="block mb-2">Local Output (kgs)</Label>
        <Input
          type="number"
          value={String(localOutput)}
          onChange={(e) => setLocalOutput(Number(e.target.value))}
        />
      </div>
      <div>
        <Label className="block mb-2">Export Output (kgs)</Label>
        <Input
          type="number"
          value={String(exportOutput)}
          onChange={(e) => setExportOutput(Number(e.target.value))}
        />
      </div>

      {/* DOWNTIME */}
      <h2 className="text-xl font-semibold">Downtime Monitoring</h2>
      <div className="space-y-2">
        <p className="font-medium">Inverting Plate</p>
        <Label>Hours</Label>
        <Input
          type="number"
          value={String(ipHh)}
          onChange={(e) => setIpHh(Number(e.target.value))}
        />
        <Label>Minutes</Label>
        <Input
          type="number"
          value={String(ipMm)}
          onChange={(e) => setIpMm(Number(e.target.value))}
        />
      </div>

      <div className="space-y-2">
        <p className="font-medium">Changing Plate</p>
        <Label>Hours</Label>
        <Input
          type="number"
          value={String(cpHh)}
          onChange={(e) => setCpHh(Number(e.target.value))}
        />
        <Label>Minutes</Label>
        <Input
          type="number"
          value={String(cpMm)}
          onChange={(e) => setCpMm(Number(e.target.value))}
        />
      </div>

      <div className="space-y-2">
        <p className="font-medium">Machine Trouble</p>
        <Label>Hours</Label>
        <Input
          type="number"
          value={String(mtHh)}
          onChange={(e) => setMtHh(Number(e.target.value))}
        />
        <Label>Minutes</Label>
        <Input
          type="number"
          value={String(mtMm)}
          onChange={(e) => setMtMm(Number(e.target.value))}
        />
      </div>

      <div>
        <Label className="block mb-2">Trouble Remarks</Label>
        <TextArea
          value={troubleRemarks}
          onChange={(e) => setTroubleRemarks(e.target.value)}
        />
      </div>

      {/* WASTE MONITORING */}
      <h2 className="text-xl font-semibold">Waste Monitoring</h2>
      <div>
        <Label className="block mb-2">Trimmings</Label>
        <Input
          type="number"
          value={String(trimmings)}
          onChange={(e) => setTrimmings(Number(e.target.value))}
        />
      </div>
      <div>
        <Label className="block mb-2">Rejects</Label>
        <Input
          type="number"
          value={String(rejects)}
          onChange={(e) => setRejects(Number(e.target.value))}
        />
      </div>
      <div>
        <Label className="block mb-2">Sweepings</Label>
        <Input
          type="number"
          value={String(sweepings)}
          onChange={(e) => setSweepings(Number(e.target.value))}
        />
      </div>

      {/* LINES RUNNING */}
      <h2 className="text-xl font-semibold">Lines Running</h2>
      <Checkbox
        isIndeterminate={isIndeterminate}
        isSelected={isAllSelected}
        onChange={(checked) => {
          setSelectedLines(checked ? allLines : []);
        }}
      >
        <Checkbox.Control>
          <Checkbox.Indicator />
        </Checkbox.Control>
        <Checkbox.Content>
          <Label>Select All Lines</Label>
        </Checkbox.Content>
      </Checkbox>

      <div className="ml-6 flex flex-col gap-2">
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

      {/* ADDITIONAL REMARKS */}
      <div>
        <h2 className="text-xl font-semibold mb-2">Additional Remarks</h2>
        <TextArea
          value={additionalRemarks}
          onChange={(e) => setAdditionalRemarks(e.target.value)}
        />
      </div>

      {/* SUBMIT BUTTON */}
      <Button type="submit" isPending={loading}>
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
