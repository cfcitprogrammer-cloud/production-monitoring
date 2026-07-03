import { useState, useEffect, useCallback } from "react";
import { Button, ButtonGroup } from "@heroui/react";
import Page from "../ui/_page";
import { supabase } from "../utils/supabase";

// --- Strict TypeScript Typings for Supabase RPC Returns ---
interface YieldItem {
  production_period: string;
  bihon_fg_qty: number;
  canton_fg_qty: number;
  sf_fg_qty: number;
}

interface WasteItem {
  data_period: string;
  bihon_waste: number;
  canton_waste: number;
}

interface DowntimeItem {
  data_period: string;
  sf_downtime_mins: number;
  canton_downtime_mins: number;
}

export default function Dashboard() {
  // View states toggling between 'day' and 'month'
  const [yieldView, setYieldView] = useState<"day" | "month">("day");
  const [wasteView, setWasteView] = useState<"day" | "month">("day");
  const [downtimeView, setDowntimeView] = useState<"day" | "month">("day");

  // Typed Data states to prevent TypeScript compiler 'never[]' array traps
  const [yieldData, setYieldData] = useState<YieldItem[]>([]);
  const [wasteData, setWasteData] = useState<WasteItem[]>([]);
  const [downtimeData, setDowntimeData] = useState<DowntimeItem[]>([]);

  const [loading, setLoading] = useState({
    yield: false,
    waste: false,
    downtime: false,
  });

  // --- API / RPC Callers wrapped in useCallback to stabilize dependencies ---

  const fetchYieldData = useCallback(async () => {
    setLoading((prev) => ({ ...prev, yield: true }));
    const { data, error } = await supabase.rpc(
      yieldView === "day"
        ? "calculate_yield_per_day"
        : "calculate_yield_per_month",
    );
    if (!error && data) setYieldData(data as YieldItem[]);
    setLoading((prev) => ({ ...prev, yield: false }));
  }, [yieldView]);

  const fetchWasteData = useCallback(async () => {
    setLoading((prev) => ({ ...prev, waste: true }));
    const { data, error } = await supabase.rpc(
      wasteView === "day"
        ? "calculate_waste_per_day"
        : "calculate_waste_per_month",
    );
    if (!error && data) setWasteData(data as WasteItem[]);
    setLoading((prev) => ({ ...prev, waste: false }));
  }, [wasteView]);

  const fetchDowntimeData = useCallback(async () => {
    setLoading((prev) => ({ ...prev, downtime: true }));
    const { data, error } = await supabase.rpc(
      downtimeView === "day"
        ? "calculate_downtime_per_day"
        : "calculate_downtime_per_month",
    );
    if (!error && data) setDowntimeData(data as DowntimeItem[]);
    setLoading((prev) => ({ ...prev, downtime: false }));
  }, [downtimeView]);

  // Clean, warning-free effect loops
  useEffect(() => {
    fetchYieldData();
  }, [fetchYieldData]);

  useEffect(() => {
    fetchWasteData();
  }, [fetchWasteData]);

  useEffect(() => {
    fetchDowntimeData();
  }, [fetchDowntimeData]);

  return (
    <Page>
      <section className="mb-8">
        <h1 className="text-3xl font-bold tracking-tight">Overview</h1>
        <p className="text-gray-500">
          Explore live production metrics across Bihon, Canton, SF, and KF
          lines.
        </p>
      </section>

      {/* --- Yield Section --- */}
      <section className="mb-12 p-6 bg-white rounded-xl shadow-sm border border-gray-100">
        <div className="flex justify-between items-center mb-6">
          <div>
            <h2 className="text-xl font-semibold">Yield Report</h2>
            <p className="text-sm text-gray-500">
              Output efficiency quantities vs input materials
            </p>
          </div>
          <ButtonGroup color="primary">
            <Button
              onClick={() => setYieldView("day")}
              className={
                yieldView === "day" ? "font-bold bg-primary text-white" : ""
              }
            >
              Day
            </Button>
            <Button
              onClick={() => setYieldView("month")}
              className={
                yieldView === "month" ? "font-bold bg-primary text-white" : ""
              }
            >
              Month
            </Button>
          </ButtonGroup>
        </div>

        {loading.yield ? (
          <div className="h-32 flex items-center justify-center bg-gray-50 rounded-lg">
            <p className="text-sm text-gray-400">Loading data...</p>
          </div>
        ) : yieldData.length === 0 ? (
          <div className="h-32 flex items-center justify-center bg-gray-50 rounded-lg">
            <p className="text-sm text-gray-400">No yield data available</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="p-4 bg-blue-50/50 border border-blue-100 rounded-xl">
              <span className="text-xs font-semibold text-blue-600 uppercase tracking-wider">
                Bihon Finished Goods
              </span>
              <div className="text-2xl font-bold text-blue-900 mt-1">
                {yieldData[
                  yieldData.length - 1
                ]?.bihon_fg_qty.toLocaleString() ?? 0}{" "}
                <span className="text-sm font-normal text-blue-600">units</span>
              </div>
              <p className="text-xs text-gray-400 mt-2">
                Latest period:{" "}
                {yieldData[yieldData.length - 1]?.production_period}
              </p>
            </div>
            <div className="p-4 bg-green-50/50 border border-green-100 rounded-xl">
              <span className="text-xs font-semibold text-green-600 uppercase tracking-wider">
                Canton Finished Goods
              </span>
              <div className="text-2xl font-bold text-green-900 mt-1">
                {yieldData[
                  yieldData.length - 1
                ]?.canton_fg_qty.toLocaleString() ?? 0}{" "}
                <span className="text-sm font-normal text-green-600">
                  units
                </span>
              </div>
              <p className="text-xs text-gray-400 mt-2">
                Latest period:{" "}
                {yieldData[yieldData.length - 1]?.production_period}
              </p>
            </div>
            <div className="p-4 bg-orange-50/50 border border-orange-100 rounded-xl">
              <span className="text-xs font-semibold text-orange-600 uppercase tracking-wider">
                SF Finished Goods
              </span>
              <div className="text-2xl font-bold text-orange-900 mt-1">
                {yieldData[yieldData.length - 1]?.sf_fg_qty.toLocaleString() ??
                  0}{" "}
                <span className="text-sm font-normal text-orange-600">
                  units
                </span>
              </div>
              <p className="text-xs text-gray-400 mt-2">
                Latest period:{" "}
                {yieldData[yieldData.length - 1]?.production_period}
              </p>
            </div>
          </div>
        )}
      </section>

      {/* --- Waste Tracking Section --- */}
      <section className="mb-12 p-6 bg-white rounded-xl shadow-sm border border-gray-100">
        <div className="flex justify-between items-center mb-6">
          <div>
            <h2 className="text-xl font-semibold">Waste Tracking</h2>
            <p className="text-sm text-gray-500">
              Tracking of process discards, trimmings, and sweepings (kg/lbs)
            </p>
          </div>
          <ButtonGroup color="primary">
            <Button
              onClick={() => setWasteView("day")}
              className={
                wasteView === "day" ? "font-bold bg-primary text-white" : ""
              }
            >
              Day
            </Button>
            <Button
              onClick={() => setWasteView("month")}
              className={
                wasteView === "month" ? "font-bold bg-primary text-white" : ""
              }
            >
              Month
            </Button>
          </ButtonGroup>
        </div>

        {loading.waste ? (
          <div className="h-32 flex items-center justify-center bg-gray-50 rounded-lg">
            <p className="text-sm text-gray-400">Loading data...</p>
          </div>
        ) : wasteData.length === 0 ? (
          <div className="h-32 flex items-center justify-center bg-gray-50 rounded-lg">
            <p className="text-sm text-gray-400">No waste data available</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="p-4 bg-red-50/50 border border-red-100 rounded-xl">
              <span className="text-xs font-semibold text-red-600 uppercase tracking-wider">
                Bihon Total Waste
              </span>
              <div className="text-2xl font-bold text-red-900 mt-1">
                {wasteData[
                  wasteData.length - 1
                ]?.bihon_waste.toLocaleString() ?? 0}{" "}
                <span className="text-sm font-normal text-red-600">kg</span>
              </div>
              <p className="text-xs text-gray-400 mt-2">
                Latest period: {wasteData[wasteData.length - 1]?.data_period}
              </p>
            </div>
            <div className="p-4 bg-yellow-50/50 border border-yellow-100 rounded-xl">
              <span className="text-xs font-semibold text-yellow-700 uppercase tracking-wider">
                Canton Total Waste
              </span>
              <div className="text-2xl font-bold text-yellow-900 mt-1">
                {wasteData[
                  wasteData.length - 1
                ]?.canton_waste.toLocaleString() ?? 0}{" "}
                <span className="text-sm font-normal text-yellow-700">kg</span>
              </div>
              <p className="text-xs text-gray-400 mt-2">
                Latest period: {wasteData[wasteData.length - 1]?.data_period}
              </p>
            </div>
          </div>
        )}
      </section>

      {/* --- Downtime Analysis Section --- */}
      <section className="mb-6 p-6 bg-white rounded-xl shadow-sm border border-gray-100">
        <div className="flex justify-between items-center mb-6">
          <div>
            <h2 className="text-xl font-semibold">Downtime Analysis</h2>
            <p className="text-sm text-gray-500">
              Total duration of mechanical delays and troubles across lines
            </p>
          </div>
          <ButtonGroup color="primary">
            <Button
              onClick={() => setDowntimeView("day")}
              className={
                downtimeView === "day" ? "font-bold bg-primary text-white" : ""
              }
            >
              Day
            </Button>
            <Button
              onClick={() => setDowntimeView("month")}
              className={
                downtimeView === "month"
                  ? "font-bold bg-primary text-white"
                  : ""
              }
            >
              Month
            </Button>
          </ButtonGroup>
        </div>

        {loading.downtime ? (
          <div className="h-32 flex items-center justify-center bg-gray-50 rounded-lg">
            <p className="text-sm text-gray-400">Loading data...</p>
          </div>
        ) : downtimeData.length === 0 ? (
          <div className="h-32 flex items-center justify-center bg-gray-50 rounded-lg">
            <p className="text-sm text-gray-400">No downtime data available</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="p-4 bg-purple-50/50 border border-purple-100 rounded-xl">
              <span className="text-xs font-semibold text-purple-600 uppercase tracking-wider">
                SF Line Downtime
              </span>
              <div className="text-2xl font-bold text-purple-900 mt-1">
                {downtimeData[
                  downtimeData.length - 1
                ]?.sf_downtime_mins.toLocaleString() ?? 0}{" "}
                <span className="text-sm font-normal text-purple-600">
                  mins
                </span>
              </div>
              <p className="text-xs text-gray-400 mt-2">
                Latest period:{" "}
                {downtimeData[downtimeData.length - 1]?.data_period}
              </p>
            </div>
            <div className="p-4 bg-pink-50/50 border border-pink-100 rounded-xl">
              <span className="text-xs font-semibold text-pink-600 uppercase tracking-wider">
                Canton Line Downtime
              </span>
              <div className="text-2xl font-bold text-pink-900 mt-1">
                {downtimeData[
                  downtimeData.length - 1
                ]?.canton_downtime_mins.toLocaleString() ?? 0}{" "}
                <span className="text-sm font-normal text-pink-600">mins</span>
              </div>
              <p className="text-xs text-gray-400 mt-2">
                Latest period:{" "}
                {downtimeData[downtimeData.length - 1]?.data_period}
              </p>
            </div>
          </div>
        )}
      </section>
    </Page>
  );
}
