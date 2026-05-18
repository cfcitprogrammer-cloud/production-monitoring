import { Tabs } from "@heroui/react";
import Page from "../ui/_page";
import SotanghonSeasoningForm from "../forms/sotanghon/seasoning";
import SotanghonPackingForm from "../forms/sotanghon/packing";
import SotanghonFGForm from "../forms/sotanghon/fg";

export default function SotanghonPage() {
  return (
    <Page>
      <Tabs orientation="vertical">
        <Tabs.ListContainer>
          <Tabs.List aria-label="Options">
            <Tabs.Tab id="seasoning">
              Seasoning
              <Tabs.Indicator />
            </Tabs.Tab>
            <Tabs.Tab id="packing">
              Packing
              <Tabs.Indicator />
            </Tabs.Tab>
            <Tabs.Tab id="fg">
              FG
              <Tabs.Indicator />
            </Tabs.Tab>
          </Tabs.List>
        </Tabs.ListContainer>
        <Tabs.Panel className="pt-4" id="seasoning">
          <SotanghonSeasoningForm />
        </Tabs.Panel>
        <Tabs.Panel className="pt-4" id="packing">
          <SotanghonPackingForm />
        </Tabs.Panel>
        <Tabs.Panel className="pt-4" id="fg">
          <SotanghonFGForm />
        </Tabs.Panel>
      </Tabs>
    </Page>
  );
}
