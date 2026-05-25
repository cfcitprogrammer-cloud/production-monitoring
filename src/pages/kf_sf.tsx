import { Tabs } from "@heroui/react";
import Page from "../ui/_page";
import KFSFPackingForm from "../forms/kf_sf/packing";
import KFSFFGForm from "../forms/kf_sf/fg";

export default function KFSFPage() {
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
          <KFSFPackingForm />
        </Tabs.Panel>
        <Tabs.Panel className="pt-4" id="fg">
          <KFSFFGForm />
        </Tabs.Panel>
      </Tabs>
    </Page>
  );
}
