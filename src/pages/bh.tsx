import { Tabs } from "@heroui/react";
import Page from "../ui/_page";
import BHMainForm from "../forms/bh/main";

export default function BihonPage() {
  return (
    <Page>
      <Tabs>
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
          <p>cooking</p>
        </Tabs.Panel>
        <Tabs.Panel className="pt-4" id="packing">
          <p>packing</p>
        </Tabs.Panel>
        <Tabs.Panel className="pt-4" id="fg">
          <p>fg</p>
        </Tabs.Panel>
      </Tabs>
    </Page>
  );
}
