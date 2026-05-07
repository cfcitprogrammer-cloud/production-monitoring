import { Tabs } from "@heroui/react";
import Page from "../ui/_page";

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
          <p>Track your metrics and analyze performance data.</p>
        </Tabs.Panel>
        <Tabs.Panel className="pt-4" id="sfg2">
          <p>Generate and download detailed reports.</p>
        </Tabs.Panel>
        <Tabs.Panel className="pt-4" id="sfg3">
          <p>Generate and download detailed reports.</p>
        </Tabs.Panel>
        <Tabs.Panel className="pt-4" id="sfg4">
          <p>Generate and download detailed reports.</p>
        </Tabs.Panel>
        <Tabs.Panel className="pt-4" id="sfg5">
          <p>Generate and download detailed reports.</p>
        </Tabs.Panel>
        <Tabs.Panel className="pt-4" id="fg">
          <p>Generate and download detailed reports.</p>
        </Tabs.Panel>
      </Tabs>
    </Page>
  );
}
