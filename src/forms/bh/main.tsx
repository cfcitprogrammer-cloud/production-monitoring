"use client";

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

export default function BHMainForm() {
  const allLines = ["Line 1", "Line 2", "Line 3", "Line 4", "Line 5"];
  const [selectedLines, setSelectedLines] = useState(["Line 1"]);

  const isAllSelected = selectedLines.length === allLines.length;
  const isIndeterminate =
    selectedLines.length > 0 && selectedLines.length < allLines.length;

  return (
    <form className="space-y-6">
      {/* HEADER */}
      <header>
        <h1>Overview</h1>
        <p></p>
      </header>

      {/* PRODUCTION DETAILS */}
      <h2>Production Details</h2>

      <Label className="block">Date</Label>
      <Input type="date" />

      {/* SHIFT */}
      <Select className="w-[256px]" placeholder="Select Shift">
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

      {/* OPERATION TYPE */}
      <Select className="w-[256px]" placeholder="Operation Type">
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

      {/* RAW MATERIALS */}
      <h2>Raw Materials</h2>

      <Label className="block">Cornstarch Used (kgs)</Label>
      <Input type="number" />

      <Label className="block">Reworks Used (kgs)</Label>
      <Input type="number" />

      {/* OUTPUT */}
      <h2>Production Output</h2>

      <Label className="block">Local Output (kgs)</Label>
      <Input type="number" />

      <Label className="block">Export Output (kgs)</Label>
      <Input type="number" />

      {/* DOWNTIME */}
      <h2>Downtime Monitoring</h2>

      <div>
        <p>Inverting Plate</p>
        <Label className="block">Hours</Label>
        <Input type="number" />
        <Label className="block">Minutes</Label>
        <Input type="number" />
      </div>

      <div>
        <p>Changing Plate</p>
        <Label className="block">Hours</Label>
        <Input type="number" />
        <Label className="block">Minutes</Label>
        <Input type="number" />
      </div>

      <div>
        <p>Machine Trouble</p>
        <Label className="block">Hours</Label>
        <Input type="number" />
        <Label className="block">Minutes</Label>
        <Input type="number" />
      </div>

      <Label className="block">Trouble Remarks</Label>
      <TextArea />

      {/* WASTE */}
      <h2>Waste Monitoring</h2>

      <Label className="block">Trimmings</Label>
      <Input type="number" />

      <Label className="block">Rejects</Label>
      <Input type="number" />

      <Label className="block">Sweepings</Label>
      <Input type="number" />

      {/* ========================= */}
      {/* LINES RUNNING (INSERTED) */}
      {/* ========================= */}

      <h2>Lines Running</h2>

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
        <CheckboxGroup value={selectedLines} onChange={setSelectedLines}>
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

      {/* REMARKS */}
      <h2>Additional Remarks</h2>
      <TextArea />

      <Button>Submit Overview</Button>
    </form>
  );
}
