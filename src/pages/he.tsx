import { Tabs } from "@heroui/react";
import Page from "../ui/_page";
import KFHEPackingForm from "../forms/kf_he/packing";
import KFHEFGForm from "../forms/kf_he/fg";

export default function HEPage() {
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
          <KFHEPackingForm />
        </Tabs.Panel>
        <Tabs.Panel className="pt-4" id="fg">
          <KFHEFGForm />
        </Tabs.Panel>
      </Tabs>
    </Page>
  );
}
