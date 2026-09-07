"use client";

import React, { useEffect, useState } from "react";
import dynamic from "next/dynamic";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { useTheme } from "next-themes";

const Chart = dynamic(() => import("react-apexcharts"), { ssr: false });

interface DashboardChartsProps {
  redScore: number;
  blueScore: number;
  salesTrend?: { day: string; revenue: number }[];
}

export default function DashboardCharts({
  redScore,
  blueScore,
  salesTrend = [],
}: DashboardChartsProps) {
  const { resolvedTheme } = useTheme();
  const isDark = resolvedTheme === "dark";

  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  const categories = salesTrend.length > 0 ? salesTrend.map((item) => item.day) : ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];
  const revenueData = salesTrend.length > 0 ? salesTrend.map((item) => item.revenue) : [0, 0, 0, 0, 0, 0, 0];

  // Chart 1: Revenue Timeline (Area)
  const revenueSeries = [
    {
      name: "Revenue (EGP)",
      data: revenueData,
    },
  ];

  const revenueOptions: any = {
    chart: {
      type: "area",
      toolbar: { show: false },
      sparkline: { enabled: false },
      animations: { enabled: false },
    },
    dataLabels: { enabled: false },
    stroke: { curve: "smooth", width: 3, colors: ["#2563eb"] },
    fill: {
      type: "gradient",
      gradient: {
        shadeIntensity: 1,
        opacityFrom: 0.45,
        opacityTo: 0.05,
        stops: [0, 90, 100],
      },
    },
    xaxis: {
      categories,
      labels: {
        style: {
          colors: isDark ? "#94a3b8" : "#64748b",
          fontSize: "11px",
        },
      },
      axisBorder: { show: false },
      axisTicks: { show: false },
    },
    yaxis: {
      labels: {
        style: {
          colors: isDark ? "#94a3b8" : "#64748b",
          fontSize: "11px",
        },
        formatter: (val: number) => `EGP ${val.toLocaleString()}`,
      },
    },
    grid: {
      borderColor: isDark ? "#334155" : "#e2e8f0",
      strokeDashArray: 4,
      xaxis: { lines: { show: true } },
      yaxis: { lines: { show: true } },
    },
    tooltip: {
      theme: isDark ? "dark" : "light",
    },
    colors: ["#2563eb"],
  };

  // Chart 2: Faction Points (Bar)
  const factionSeries = [
    {
      name: "Points Tally",
      data: [redScore ?? 0, blueScore ?? 0],
    },
  ];

  const factionOptions: any = {
    chart: {
      type: "bar",
      toolbar: { show: false },
      animations: { enabled: false },
    },
    plotOptions: {
      bar: {
        columnWidth: "45%",
        distributed: true,
        borderRadius: 6,
      },
    },
    dataLabels: { enabled: false },
    legend: { show: false },
    xaxis: {
      categories: ["Team Red", "Team Blue"],
      labels: {
        style: {
          colors: isDark ? "#94a3b8" : "#64748b",
          fontSize: "12px",
          fontWeight: 600,
        },
      },
      axisBorder: { show: false },
      axisTicks: { show: false },
    },
    yaxis: {
      labels: {
        style: {
          colors: isDark ? "#94a3b8" : "#64748b",
          fontSize: "11px",
        },
        formatter: (val: number) => `${val.toLocaleString()} pts`,
      },
    },
    grid: {
      borderColor: isDark ? "#334155" : "#e2e8f0",
      strokeDashArray: 4,
    },
    tooltip: {
      theme: isDark ? "dark" : "light",
    },
    colors: ["#ef4444", "#3b82f6"],
  };

  if (!mounted) {
    return (
      <div className="grid gap-6 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle className="text-base font-semibold">Weekly Sales Trends</CardTitle>
            <CardDescription>Visual metrics of gross earnings over time</CardDescription>
          </CardHeader>
          <CardContent className="h-[280px] flex items-center justify-center text-sm text-muted-foreground">
            Loading sales trends...
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle className="text-base font-semibold">Faction Point Standings</CardTitle>
            <CardDescription>Comparative metrics between Team Red and Team Blue</CardDescription>
          </CardHeader>
          <CardContent className="h-[280px] flex items-center justify-center text-sm text-muted-foreground">
            Loading point standings...
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="grid gap-6 md:grid-cols-2">
      {/* Revenue Area Chart */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base font-semibold">Weekly Sales Trends</CardTitle>
          <CardDescription>Visual metrics of gross earnings over time</CardDescription>
        </CardHeader>
        <CardContent className="pt-0">
          <Chart
            options={revenueOptions}
            series={revenueSeries}
            type="area"
            height={280}
            width="100%"
          />
        </CardContent>
      </Card>

      {/* Faction Score Bar Chart */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base font-semibold">Faction Point Standings</CardTitle>
          <CardDescription>Comparative metrics between Team Red and Team Blue</CardDescription>
        </CardHeader>
        <CardContent className="pt-0">
          <Chart
            options={factionOptions}
            series={factionSeries}
            type="bar"
            height={280}
            width="100%"
          />
        </CardContent>
      </Card>
    </div>
  );
}
