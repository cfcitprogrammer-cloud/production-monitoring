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
} from "@heroui/react";

import { supabase } from "../../utils/supabase";

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

  const [_, setLoading] = useState(false);

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

    setLoading(true);

    try {
      const { data, error } = await supabase
        .from("sf_overview")
        .insert([
          {
            uid: `SF-${prodDate}-${shift}`,

            prod_date: prodDate,

            shift: shift,

            op_type: opType,

            machine_trouble: machineTroubleOccurred,

            trouble_remarks: troubleRemarks,

            additional_remarks: additionalRemarks,

            fryers_running: selectedFryers,
          },
        ])
        .select();

      if (error) {
        console.error(error);

        alert(error.message);

        return;
      }

      console.log(data);

      alert("Overview submitted successfully!");

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
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  }

  return (
    <form className="space-y-6" onSubmit={submitOverview}>
      {/* HEADER */}

      <header>
        <h1 className="text-2xl font-bold">SF Overview</h1>

        <p className="text-default-500">
          Snack Factory production monitoring form
        </p>
      </header>

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
              <ListBox.Item id="regular">Regular Shift</ListBox.Item>

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

              <ListBox.Item id="regular">Regular Operation</ListBox.Item>

              <ListBox.Item id="last-prod">Last Production</ListBox.Item>
            </ListBox>
          </Select.Popover>
        </Select>
      </div>

      {/* ====================== */}
      {/* MACHINE TROUBLE */}
      {/* ====================== */}

      <h2 className="text-xl font-semibold">Machine Trouble</h2>

      {/* MACHINE TROUBLE OCCURRED */}

      <div>
        <Label className="block mb-2">Machine Trouble Occurred (Count)</Label>

        <Input
          type="number"
          value={String(machineTroubleOccurred)}
          onChange={(e) => setMachineTroubleOccurred(Number(e.target.value))}
        />
      </div>

      {/* TROUBLE REMARKS */}

      <div>
        <Label className="block mb-2">Trouble Remarks</Label>

        <TextArea
          value={troubleRemarks}
          onChange={(e) => setTroubleRemarks(e.target.value)}
        />
      </div>

      {/* ====================== */}
      {/* FRYERS RUNNING */}
      {/* ====================== */}

      <h2 className="text-xl font-semibold">Fryers Running</h2>

      {/* SELECT ALL */}

      <Checkbox
        isIndeterminate={isIndeterminate}
        isSelected={isAllSelected}
        onChange={(checked) => {
          setSelectedFryers(checked ? allFryers : []);
        }}
      >
        <Checkbox.Control>
          <Checkbox.Indicator />
        </Checkbox.Control>

        <Checkbox.Content>
          <Label>Select All Fryers</Label>
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

      {/* ====================== */}
      {/* ADDITIONAL REMARKS */}
      {/* ====================== */}

      <div>
        <h2 className="text-xl font-semibold mb-2">Additional Remarks</h2>

        <TextArea
          value={additionalRemarks}
          onChange={(e) => setAdditionalRemarks(e.target.value)}
        />
      </div>

      {/* SUBMIT */}

      <Button type="submit">Submit Overview</Button>
    </form>
  );
}
