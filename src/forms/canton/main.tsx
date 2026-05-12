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
} from "@heroui/react";
import { supabase } from "../../utils/supabase";

export default function CantonMainForm() {
  const allLines = ["Line 1", "Line 2", "Line 3", "Line 4", "Line 5"];

  // ======================
  // FORM STATE
  // ======================
  const [prodDate, setProdDate] = useState("");
  const [shift, setShift] = useState<string | null>(null); // Added for UID generation
  const [flourUsed, setFlourUsed] = useState(0);
  const [totalInput, setTotalInput] = useState(0);
  const [scrap, setScrap] = useState(0);
  const [sweepings, setSweepings] = useState(0);

  // Machine Trouble (Count)
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
  // SUBMIT
  // ======================
  async function submitCantonForm(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setLoading(true);

    try {
      const { data, error } = await supabase.from("canton_overview").insert([
        {
          // UID Generation: PROD-YYYY-MM-DD-SHIFT
          uid: `PROD-${prodDate}-${shift}`,
          prod_date: prodDate,
          shift: shift,
          flour_used: flourUsed,
          total_input: totalInput,
          scrap: scrap,
          sweepings: sweepings,
          machine_troubles: machineTroublesCount,
          trouble_remarks: troubleRemarks,
          lines_running: selectedLines,
          additional_remarks: additionalRemarks,
        },
      ]);

      if (error) throw error;

      alert("Canton report submitted successfully!");

      // Reset Form
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
      console.error(error);
      alert(error.message);
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
                <ListBox.Item id="regular">Regular Shift</ListBox.Item>

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

      <Button type="submit" className="w-full md:w-auto">
        Submit Canton Report
      </Button>
    </form>
  );
}
