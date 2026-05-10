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
  GraphNode,
} from "@gravity-ui/icons";
import { Button, Drawer } from "@heroui/react";

import { Link } from "react-router-dom";

export default function Sidebar() {
  const navItems: {
    icon: ComponentType<SVGProps<SVGSVGElement>>;
    label: string;
    url: string;
  }[] = [
    { icon: ChartColumn, label: "Dashboard", url: "/" },
    { icon: Flame, label: "Bihon", url: "/bihon" },
    { icon: Box, label: "Canton", url: "/canton" },
    { icon: Cup, label: "SF 1", url: "/sf1" },
    { icon: Star, label: "SF 2", url: "/sf2" },
    { icon: GraphNode, label: "Summary", url: "/summary"}
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
                  <Link
                    key={item.label}
                    className="flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm text-foreground transition-colors hover:bg-default"
                    type="button"
                    to={item.url}
                  >
                    <item.icon className="size-5 text-muted" />
                    {item.label}
                  </Link>
                ))}
              </nav>
            </Drawer.Body>
          </Drawer.Dialog>
        </Drawer.Content>
      </Drawer.Backdrop>
    </Drawer>
  );
}
