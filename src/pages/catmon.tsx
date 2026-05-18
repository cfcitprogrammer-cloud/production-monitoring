import { Tabs } from "@heroui/react";
import Page from "../ui/_page";
import CatmonPackingForm from "../forms/catmon/packing";
import CatmonMixingForm from "../forms/catmon/mixing";
import CatmonFryingDryingForm from "../forms/catmon/fryingdrying";
import CatmonFGForm from "../forms/catmon/fg";

export default function CatmonPage() {
  return (
    <Page>
      <Tabs orientation="vertical">
        <Tabs.ListContainer>
          <Tabs.List aria-label="Options">
            <Tabs.Tab id="mixing">
              Mixing
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
        <Tabs.Panel className="pt-4" id="mixing">
          <CatmonMixingForm />
        </Tabs.Panel>
        <Tabs.Panel className="pt-4" id="packing">
          <CatmonPackingForm />
        </Tabs.Panel>
        <Tabs.Panel className="pt-4" id="fg">
          <CatmonFGForm />
        </Tabs.Panel>
      </Tabs>
    </Page>
  );
}
