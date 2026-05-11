import { Tabs } from "@heroui/react";
import Page from "../ui/_page";
import CantonMainForm from "../forms/canton/main";
import CantonPackingForm from "../forms/canton/packing";

export default function CantonPage() {
  return (
    <Page>
      <Tabs orientation="vertical">
        <Tabs.ListContainer>
          <Tabs.List aria-label="Options">
            <Tabs.Tab id="overview">
              Overview
              <Tabs.Indicator />
            </Tabs.Tab>
            <Tabs.Tab id="cooking">
              Packing
              <Tabs.Indicator />
            </Tabs.Tab>
          </Tabs.List>
        </Tabs.ListContainer>
        <Tabs.Panel className="pt-4" id="overview">
          <CantonMainForm />
        </Tabs.Panel>
        <Tabs.Panel className="pt-4" id="cooking">
          <CantonPackingForm />
        </Tabs.Panel>
      </Tabs>
    </Page>
  );
}
