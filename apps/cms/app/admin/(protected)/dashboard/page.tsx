import {
  getUserStats,
  getProductStats,
  getSalesStats,
  getWeeklySalesTrend,
  getOfficialBrands,
  getAllCategories,
  getActiveDeliveryZones,
  getAllCaseStudies,
} from "@genie-light/queries";
import { getAdminDataLocal } from "@/lib/auth-server";
import { Card, CardHeader, CardTitle, CardContent, CardDescription } from "@/components/ui/card";
import { formatCurrency } from "@/lib/utils";
import {
  Lightbulb,
  Users,
  Coins,
  ShoppingCart,
  Layers,
  Building2,
  Truck,
  CheckCircle2,
  FolderOpen,
  Award,
} from "lucide-react";
import DashboardCharts from "@/components/dashboard-charts";

export const dynamic = "force-dynamic";

export default async function DashboardPage() {
  const user = await getAdminDataLocal();
  const isDataEntry = user?.role === "DATA_ENTRY";

  const [users, products, sales, salesTrend, brands, categories, zones, projects] =
    await Promise.all([
      getUserStats(),
      getProductStats(),
      getSalesStats(),
      getWeeklySalesTrend(),
      getOfficialBrands(),
      getAllCategories(),
      getActiveDeliveryZones(),
      getAllCaseStudies(),
    ]);

  const stats = isDataEntry
    ? [
        {
          title: "Catalog Luminaires",
          value: products.totalProducts.toString(),
          description: `${products.totalSubProducts} child variant SKUs in catalog`,
          icon: Lightbulb,
          color: "text-amber-600 dark:text-amber-400 bg-amber-500/10",
        },
        {
          title: "Lighting Categories",
          value: categories.length.toString(),
          description: "Active taxonomy tiers and subcategories",
          icon: FolderOpen,
          color: "text-blue-600 dark:text-blue-400 bg-blue-500/10",
        },
        {
          title: "Partner Brands",
          value: brands.length.toString(),
          description: "Official lighting distribution portfolio",
          icon: Building2,
          color: "text-emerald-600 dark:text-emerald-400 bg-emerald-500/10",
        },
        {
          title: "Case Studies",
          value: projects.length.toString(),
          description: "Verified national infrastructure projects",
          icon: Award,
          color: "text-purple-600 dark:text-purple-400 bg-purple-500/10",
        },
      ]
    : [
        {
          title: "Total Sales Revenue",
          value: formatCurrency(sales.totalRevenue),
          description: "Gross storefront commercial orders",
          icon: Coins,
          color: "text-emerald-600 dark:text-emerald-400 bg-emerald-500/10",
        },
        {
          title: "Customer Orders",
          value: sales.totalOrders.toString(),
          description: `${sales.pendingOrders} pending confirmation, ${sales.shippingOrders} in transit`,
          icon: ShoppingCart,
          color: "text-blue-600 dark:text-blue-400 bg-blue-500/10",
        },
        {
          title: "Catalog Luminaires",
          value: products.totalProducts.toString(),
          description: `${products.totalSubProducts} child variant SKUs across ${categories.length} categories`,
          icon: Lightbulb,
          color: "text-amber-600 dark:text-amber-400 bg-amber-500/10",
        },
        {
          title: "Active Accounts",
          value: users.totalUsers.toString(),
          description: `${users.totalAdmins} HQ admins, ${users.totalDataEntry} catalog specialists`,
          icon: Users,
          color: "text-zinc-600 dark:text-zinc-400 bg-zinc-500/10",
        },
      ];

  const currentBatch = products.totalSubProducts % 30;
  const completedBatches = Math.floor(products.totalSubProducts / 30);
  const milestonePercent = Math.min(100, Math.round((currentBatch / 30) * 100));

  return (
    <div className="space-y-8">
      {/* Welcome Title */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="text-3xl font-bold tracking-tight text-foreground">
            Genie Light Operations Dashboard
          </h2>
          <p className="text-muted-foreground mt-1">
            Centralized management console for architectural luminaires, photometric specs, and fulfillment.
          </p>
        </div>

        {/* Milestone Badge in header */}
        <div className="p-3 bg-card border rounded-xl shadow-xs flex items-center gap-3">
          <div className="p-2 bg-primary/10 rounded-lg text-primary">
            <Layers className="w-5 h-5" />
          </div>
          <div>
            <div className="text-xs text-muted-foreground font-medium">Data Entry Milestone</div>
            <div className="text-sm font-bold text-foreground">
              Batch: {currentBatch} / 30 <span className="text-xs text-muted-foreground font-normal">({milestonePercent}%)</span>
            </div>
          </div>
        </div>
      </div>

      {/* Grid Stats cards */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        {stats.map((stat, idx) => {
          const Icon = stat.icon;
          return (
            <Card key={idx} className="border bg-card">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">{stat.title}</CardTitle>
                <div className={`p-2 rounded-full ${stat.color}`}>
                  <Icon className="h-4 w-4" />
                </div>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{stat.value}</div>
                <CardDescription className="text-xs mt-1">{stat.description}</CardDescription>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {/* Operations Quick Overview */}
      <div className="grid gap-4 md:grid-cols-3">
        <Card className="border bg-card">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <div>
              <CardTitle className="text-base font-bold">Partner Brands</CardTitle>
              <CardDescription>Official distribution portfolio</CardDescription>
            </div>
            <Building2 className="h-5 w-5 text-primary" />
          </CardHeader>
          <CardContent className="pt-2">
            <div className="text-3xl font-extrabold text-foreground">{brands.length}</div>
            <div className="flex flex-wrap gap-1.5 mt-3">
              {brands.slice(0, 5).map((b) => (
                <span
                  key={b.id}
                  className="text-[11px] px-2 py-0.5 rounded-md bg-muted text-muted-foreground"
                >
                  {b.name}
                </span>
              ))}
              {brands.length > 5 && (
                <span className="text-[11px] px-2 py-0.5 rounded-md bg-muted text-muted-foreground">
                  +{brands.length - 5} more
                </span>
              )}
            </div>
          </CardContent>
        </Card>

        {!isDataEntry ? (
          <Card className="border bg-card">
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <div>
                <CardTitle className="text-base font-bold">Egyptian Shipping Zones</CardTitle>
                <CardDescription>Governorate rates & delivery days</CardDescription>
              </div>
              <Truck className="h-5 w-5 text-blue-500" />
            </CardHeader>
            <CardContent className="pt-2">
              <div className="text-3xl font-extrabold text-foreground">{zones.length}</div>
              <p className="text-xs text-muted-foreground mt-2">
                Active shipping coverage across Greater Cairo, Delta, Canal, and Upper Egypt.
              </p>
            </CardContent>
          </Card>
        ) : (
          <Card className="border bg-card">
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <div>
                <CardTitle className="text-base font-bold">Milestone Earnings</CardTitle>
                <CardDescription>550 LE per 30 sub-products</CardDescription>
              </div>
              <Layers className="h-5 w-5 text-emerald-500" />
            </CardHeader>
            <CardContent className="pt-2">
              <div className="text-3xl font-extrabold text-foreground">{completedBatches} <span className="text-sm font-medium text-muted-foreground">Batches Completed</span></div>
              <p className="text-xs text-muted-foreground mt-2">
                Total milestone bonuses achieved: <strong className="text-emerald-600 dark:text-emerald-400">{completedBatches * 550} EGP</strong>. {30 - currentBatch} variations left until next 550 EGP milestone!
              </p>
            </CardContent>
          </Card>
        )}

        <Card className="border bg-card">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <div>
              <CardTitle className="text-base font-bold">Infrastructure Showcase</CardTitle>
              <CardDescription>Verified national case studies</CardDescription>
            </div>
            <CheckCircle2 className="h-5 w-5 text-emerald-500" />
          </CardHeader>
          <CardContent className="pt-2">
            <div className="text-3xl font-extrabold text-foreground">{projects.length}</div>
            <p className="text-xs text-muted-foreground mt-2">
              Cairo Airport, Port Said Tunnels, Petrojet, Cairo Metro Line 3, and New Alamein University.
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Visual Analytics Section (Admin only) */}
      {!isDataEntry && (
        <DashboardCharts
          redScore={0}
          blueScore={0}
          salesTrend={salesTrend.map((s) => ({ day: s.day, revenue: s.sales }))}
        />
      )}
    </div>
  );
}
