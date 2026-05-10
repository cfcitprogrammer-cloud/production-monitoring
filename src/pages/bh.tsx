import { Tabs } from "@heroui/react";
import Page from "../ui/_page";
import BHMainForm from "../forms/bh/main";
import BHCookingForm from "../forms/bh/cooking";
import BHPackingForm from "../forms/bh/packing";
import BHfgForm from "../forms/bh/fg";

export default function BihonPage() {
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
              Cooking / Mixing
              <Tabs.Indicator />
            </Tabs.Tab>
            <Tabs.Tab id="packing">
              Packing
              <Tabs.Indicator />
            </Tabs.Tab>
            <Tabs.Tab id="fg">
              Finished Goods
              <Tabs.Indicator />
            </Tabs.Tab>
          </Tabs.List>
        </Tabs.ListContainer>
        <Tabs.Panel className="pt-4" id="overview">
          <BHMainForm />
        </Tabs.Panel>
        <Tabs.Panel className="pt-4" id="cooking">
          <BHCookingForm />
        </Tabs.Panel>
        <Tabs.Panel className="pt-4" id="packing">
          <BHPackingForm />
        </Tabs.Panel>
        <Tabs.Panel className="pt-4" id="fg">
          <BHfgForm />
        </Tabs.Panel>
      </Tabs>
    </Page>
  );
}
