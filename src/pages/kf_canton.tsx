import { Tabs } from "@heroui/react";
import Page from "../ui/_page";
import KFCantonPackingForm from "../forms/kf_canton/packing";
import KFCantonFGForm from "../forms/kf_canton/fg";

export default function KFCantonPage() {
  return (
    <Page>
      <Tabs orientation="vertical">
        <Tabs.ListContainer>
          <Tabs.List aria-label="Options">
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
        <Tabs.Panel className="pt-4" id="packing">
          <KFCantonPackingForm />
        </Tabs.Panel>
        <Tabs.Panel className="pt-4" id="fg">
          <KFCantonFGForm />
        </Tabs.Panel>
      </Tabs>
    </Page>
  );
}
