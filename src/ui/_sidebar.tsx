import type { ComponentType, SVGProps } from "react";

import {
  Bars,
  Bell,
  ChartColumn,
  Envelope,
  Gear,
  House,
  Magnifier,
  Person,
  Flame,
  Box,
  Cup,
  Star,
} from "@gravity-ui/icons";
import { Button, Drawer } from "@heroui/react";

export default function Sidebar() {
  const navItems: {
    icon: ComponentType<SVGProps<SVGSVGElement>>;
    label: string;
  }[] = [
    { icon: ChartColumn, label: "Dashboard" },
    { icon: Flame, label: "Bihon" },
    { icon: Box, label: "Canton" },
    { icon: Cup, label: "SF 1" },
    { icon: Star, label: "SF 2" },
  ];

  return (
    <Drawer>
      <Button variant="secondary">
        <Bars />
      </Button>
      <Drawer.Backdrop>
        <Drawer.Content placement="left">
          <Drawer.Dialog>
            <Drawer.CloseTrigger />
            <Drawer.Header>
              <Drawer.Heading>Production Monitoring</Drawer.Heading>
            </Drawer.Header>
            <Drawer.Body>
              <nav className="flex flex-col gap-1">
                {navItems.map((item) => (
                  <button
                    key={item.label}
                    className="flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm text-foreground transition-colors hover:bg-default"
                    type="button"
                  >
                    <item.icon className="size-5 text-muted" />
                    {item.label}
                  </button>
                ))}
              </nav>
            </Drawer.Body>
          </Drawer.Dialog>
        </Drawer.Content>
      </Drawer.Backdrop>
    </Drawer>
  );
}
