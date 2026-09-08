"use client";

import React, { useEffect, useState } from "react";
import dynamic from "next/dynamic";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { useTheme } from "next-themes";

const Chart = dynamic(() => import("react-apexcharts"), { ssr: false });

interface DashboardChartsProps {
  salesTrend?: { day: string; revenue: number }[];
}

export default function DashboardCharts({
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

  // Revenue Timeline (Area)
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

  if (!mounted) {
    return (
      <Card className="w-full">
        <CardHeader>
          <CardTitle className="text-base font-semibold">Weekly Sales Trends</CardTitle>
          <CardDescription>Visual metrics of gross earnings over time</CardDescription>
        </CardHeader>
        <CardContent className="h-[280px] flex items-center justify-center text-sm text-muted-foreground">
          Loading sales trends...
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle className="text-base font-semibold">Weekly Sales Trends</CardTitle>
        <CardDescription>Visual metrics of gross earnings over time</CardDescription>
      </CardHeader>
      <CardContent className="pt-0">
        <Chart
          options={revenueOptions}
          series={revenueSeries}
          type="area"
          height={300}
          width="100%"
        />
      </CardContent>
    </Card>
  );
}
