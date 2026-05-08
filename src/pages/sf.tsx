import { Tabs } from "@heroui/react";
import Page from "../ui/_page";
import SFBlendingForm from "../forms/sf/sfg1";
import SFPremixForm from "../forms/sf/sfg2";
import SFMixForm from "../forms/sf/mix";
import SFFryingForm from "../forms/sf/sfg3";
import SFFlavoringForm from "../forms/sf/sfg4";
import SFPieceForm from "../forms/sf/sfg5";
import SFFGForm from "../forms/sf/fg";

export default function Snackfood() {
  return (
    <Page>
      <Tabs>
        <Tabs.ListContainer>
          <Tabs.List aria-label="Options">
            <Tabs.Tab id="overview">
              Overview
              <Tabs.Indicator />
            </Tabs.Tab>
            <Tabs.Tab id="sfg1">
              Blending
              <Tabs.Indicator />
            </Tabs.Tab>
            <Tabs.Tab id="sfg2">
              Premix
              <Tabs.Indicator />
            </Tabs.Tab>
            <Tabs.Tab id="sfg3">
              Frying
              <Tabs.Indicator />
            </Tabs.Tab>
            <Tabs.Tab id="sfg4">
              Flavoring
              <Tabs.Indicator />
            </Tabs.Tab>
            <Tabs.Tab id="sfg5">
              Piece
              <Tabs.Indicator />
            </Tabs.Tab>
            <Tabs.Tab id="fg">
              Finished Goods
              <Tabs.Indicator />
            </Tabs.Tab>
          </Tabs.List>
        </Tabs.ListContainer>
        <Tabs.Panel className="pt-4" id="overview">
          <p>View your project overview and recent activity.</p>
        </Tabs.Panel>
        <Tabs.Panel className="pt-4" id="sfg1">
          <SFBlendingForm />
        </Tabs.Panel>
        <Tabs.Panel className="pt-4" id="sfg2">
          <SFPremixForm />
        </Tabs.Panel>
        <Tabs.Panel className="pt-4" id="mix">
          <SFMixForm />
        </Tabs.Panel>
        <Tabs.Panel className="pt-4" id="sfg3">
          <SFFryingForm />
        </Tabs.Panel>
        <Tabs.Panel className="pt-4" id="sfg4">
          <SFFlavoringForm />
        </Tabs.Panel>
        <Tabs.Panel className="pt-4" id="sfg5">
          <SFPieceForm />
        </Tabs.Panel>
        <Tabs.Panel className="pt-4" id="fg">
          <SFFGForm />
        </Tabs.Panel>
      </Tabs>
    </Page>
  );
}
