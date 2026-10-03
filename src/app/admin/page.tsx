"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useSession, signIn } from "next-auth/react";
import {
  LayoutDashboard,
  Shirt,
  ShoppingBag,
  TicketPercent,
  ShieldAlert,
  Plus,
  Search,
  Filter,
  ArrowUpRight,
  TrendingUp,
  Users,
  AlertTriangle,
  CheckCircle2,
  Clock,
  Truck,
  X,
  ExternalLink,
  Archive,
  RefreshCw,
  Lock,
} from "lucide-react";

type AdminTab = "overview" | "products" | "orders" | "coupons" | "audit";

export default function AdminPage() {
  const router = useRouter();
  const { data: session, status } = useSession();

  const [activeTab, setActiveTab] = useState<AdminTab>("overview");
  const [loading, setLoading] = useState(true);

  // Dashboard Data
  const [metrics, setMetrics] = useState<any>(null);

  // Products Data
  const [products, setProducts] = useState<any[]>([]);
  const [productSearch, setProductSearch] = useState("");
  const [categories, setCategories] = useState<any[]>([]);
  const [productModalOpen, setProductModalOpen] = useState(false);
  const [newProduct, setNewProduct] = useState({
    title: "",
    slug: "",
    description: "",
    categoryId: "",
    basePrice: 4999,
    baseMrp: 6999,
    discountPercent: 28,
    isFeatured: false,
    isNewArrival: true,
    isBestSeller: false,
    imageUrl: "https://images.unsplash.com/photo-1610030469983-98e550d6193c?w=800",
    size: "Free Size",
    color: "Royal Emerald",
    stock: 25,
    sku: `AVN-${Date.now().toString().slice(-6)}`,
  });
  const [productSaving, setProductSaving] = useState(false);

  // Orders Data
  const [orders, setOrders] = useState<any[]>([]);
  const [orderStatusFilter, setOrderStatusFilter] = useState("ALL");
  const [orderSearch, setOrderSearch] = useState("");
  const [statusModalOrder, setStatusModalOrder] = useState<any | null>(null);
  const [selectedNextStatus, setSelectedNextStatus] = useState("");
  const [statusNote, setStatusNote] = useState("");
  const [courierName, setCourierName] = useState("BlueDart Priority Express");
  const [trackingNumber, setTrackingNumber] = useState("");
  const [statusUpdating, setStatusUpdating] = useState(false);

  // Coupons Data
  const [coupons, setCoupons] = useState<any[]>([]);
  const [couponModalOpen, setCouponModalOpen] = useState(false);
  const [newCoupon, setNewCoupon] = useState({
    code: "",
    description: "",
    discountType: "PERCENTAGE",
    discountValue: 15,
    minOrderAmount: 2499,
    maxDiscountAmount: 1500,
    usageLimit: 500,
    perUserLimit: 1,
  });
  const [couponSaving, setCouponSaving] = useState(false);

  // Audit Logs Data
  const [auditLogs, setAuditLogs] = useState<any[]>([]);

  const isAuthorized =
    status === "authenticated" &&
    (session?.user?.role === "ADMIN" || session?.user?.role === "STAFF");

  useEffect(() => {
    if (status === "authenticated" && isAuthorized) {
      loadInitialAdminData();
    } else if (status === "authenticated" && !isAuthorized) {
      setLoading(false);
    } else if (status === "unauthenticated") {
      setLoading(false);
    }
  }, [status, isAuthorized]);

  const loadInitialAdminData = async () => {
    setLoading(true);
    try {
      const [dashRes, prodRes, ordRes, cpnRes, catRes, auditRes] = await Promise.all([
        fetch("/api/v1/admin/dashboard"),
        fetch("/api/v1/admin/products?limit=50"),
        fetch("/api/v1/admin/orders?limit=50"),
        fetch("/api/v1/admin/coupons"),
        fetch("/api/v1/categories"),
        fetch("/api/v1/admin/audit-logs?limit=50"),
      ]);

      const [dash, prods, ords, cpns, cats, logs] = await Promise.all([
        dashRes.json(),
        prodRes.json(),
        ordRes.json(),
        cpnRes.json(),
        catRes.json(),
        auditRes.json(),
      ]);

      if (dash.success) setMetrics(dash.data);
      if (prods.success) setProducts(prods.data.products);
      if (ords.success) setOrders(ords.data.orders);
      if (cpns.success) setCoupons(cpns.data);
      if (cats.success) {
        setCategories(cats.data);
        if (cats.data.length > 0 && !newProduct.categoryId) {
          setNewProduct((prev) => ({ ...prev, categoryId: cats.data[0].id }));
        }
      }
      if (logs.success) setAuditLogs(logs.data.logs);
    } catch (err) {
      console.error("Admin data fetch error:", err);
    } finally {
      setLoading(false);
    }
  };

  // Product Actions
  const handleCreateProduct = async (e: React.FormEvent) => {
    e.preventDefault();
    setProductSaving(true);
    try {
      const payload = {
        title: newProduct.title,
        slug: newProduct.slug || newProduct.title.toLowerCase().replace(/[^a-z0-9]+/g, "-"),
        description: newProduct.description,
        categoryId: newProduct.categoryId || categories[0]?.id,
        basePrice: Number(newProduct.basePrice),
        baseMrp: Number(newProduct.baseMrp),
        discountPercent: Number(newProduct.discountPercent),
        isFeatured: newProduct.isFeatured,
        isNewArrival: newProduct.isNewArrival,
        isBestSeller: newProduct.isBestSeller,
        images: [{ url: newProduct.imageUrl, alt: newProduct.title, isPrimary: true }],
        variants: [
          {
            sku: newProduct.sku,
            size: newProduct.size,
            color: newProduct.color,
            colorHex: "#0B5D4B",
            price: Number(newProduct.basePrice),
            mrp: Number(newProduct.baseMrp),
            stock: Number(newProduct.stock),
          },
        ],
      };

      const res = await fetch("/api/v1/admin/products", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      const data = await res.json();
      if (data.success) {
        setProductModalOpen(false);
        // Refresh product list
        const updated = await fetch("/api/v1/admin/products?limit=50").then((r) => r.json());
        if (updated.success) setProducts(updated.data.products);
      } else {
        alert(data.error || "Failed to create product");
      }
    } catch (err: any) {
      alert(err.message || "Failed to create product");
    } finally {
      setProductSaving(false);
    }
  };

  const handleArchiveProduct = async (productId: string, currentlyArchived: boolean) => {
    try {
      const res = await fetch(`/api/v1/admin/products/${productId}`, {
        method: currentlyArchived ? "PUT" : "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ isArchived: !currentlyArchived }),
      });
      const data = await res.json();
      if (data.success) {
        setProducts((prev) =>
          prev.map((p) => (p.id === productId ? { ...p, isArchived: !currentlyArchived } : p))
        );
      }
    } catch (e) {
      console.error(e);
    }
  };

  // Order Status Actions
  const openStatusModal = (order: any) => {
    setStatusModalOrder(order);
    setSelectedNextStatus("");
    setStatusNote("");
    setTrackingNumber(order.trackingNumber || `BLUEDART-${Date.now().toString().slice(-8)}`);
  };

  const handleUpdateOrderStatus = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!statusModalOrder || !selectedNextStatus) return;

    setStatusUpdating(true);
    try {
      const res = await fetch(`/api/v1/admin/orders/${statusModalOrder.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          toStatus: selectedNextStatus,
          note: statusNote || undefined,
          courierName: selectedNextStatus === "SHIPPED" ? courierName : undefined,
          trackingNumber: selectedNextStatus === "SHIPPED" ? trackingNumber : undefined,
        }),
      });

      const data = await res.json();
      if (data.success) {
        setStatusModalOrder(null);
        // Refresh orders & dashboard
        const ords = await fetch("/api/v1/admin/orders?limit=50").then((r) => r.json());
        if (ords.success) setOrders(ords.data.orders);
        const dash = await fetch("/api/v1/admin/dashboard").then((r) => r.json());
        if (dash.success) setMetrics(dash.data);
      } else {
        alert(data.error || "Failed to update order status");
      }
    } catch (err: any) {
      alert(err.message || "Failed to update order status");
    } finally {
      setStatusUpdating(false);
    }
  };

  // Coupon Actions
  const handleCreateCoupon = async (e: React.FormEvent) => {
    e.preventDefault();
    setCouponSaving(true);
    try {
      const res = await fetch("/api/v1/admin/coupons", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(newCoupon),
      });

      const data = await res.json();
      if (data.success) {
        setCouponModalOpen(false);
        const cpns = await fetch("/api/v1/admin/coupons").then((r) => r.json());
        if (cpns.success) setCoupons(cpns.data);
      } else {
        alert(data.error || "Failed to create coupon");
      }
    } catch (err: any) {
      alert(err.message || "Failed to create coupon");
    } finally {
      setCouponSaving(false);
    }
  };

  const handleToggleCoupon = async (couponId: string, currentActive: boolean) => {
    try {
      const res = await fetch(`/api/v1/admin/coupons/${couponId}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ isActive: !currentActive }),
      });
      const data = await res.json();
      if (data.success) {
        setCoupons((prev) =>
          prev.map((c) => (c.id === couponId ? { ...c, isActive: !currentActive } : c))
        );
      }
    } catch (e) {
      console.error(e);
    }
  };

  // RBAC Access Guard View
  if (!loading && (!session || !isAuthorized)) {
    return (
      <div className="min-h-[85vh] flex items-center justify-center p-4 bg-surface">
        <div className="max-w-md w-full bg-surface-card p-8 rounded-2xl border border-[#E5E0D8] text-center space-y-5 shadow-sm">
          <div className="w-12 h-12 rounded-full bg-red-50 text-red-700 flex items-center justify-center mx-auto">
            <Lock className="w-6 h-6" />
          </div>
          <div>
            <h1 className="text-2xl font-serif text-ink">Restricted Atelier Access</h1>
            <p className="text-sm text-ink-muted mt-1">
              You must be authenticated with Staff or Administrator credentials to view the AVANYA management studio.
            </p>
          </div>

          <div className="p-3 bg-surface-warm rounded-xl text-xs text-ink-muted text-left space-y-1">
            <div className="font-semibold text-ink">Admin Credentials (Seed):</div>
            <div>Email: <strong className="text-ink">admin@avanya.in</strong></div>
            <div>Password: <strong className="text-ink">Password@123</strong></div>
          </div>

          <button
            onClick={() => router.push("/auth/login?callbackUrl=/admin")}
            className="w-full py-2.5 bg-ink text-surface rounded-xl text-xs uppercase tracking-wider font-semibold hover:bg-black transition-colors"
          >
            Sign In with Admin Account
          </button>
        </div>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="min-h-[75vh] flex items-center justify-center">
        <div className="text-center space-y-3">
          <div className="w-8 h-8 border-2 border-emerald-800 border-t-transparent rounded-full animate-spin mx-auto" />
          <p className="text-xs uppercase tracking-widest text-ink-muted">Loading Atelier Studio...</p>
        </div>
      </div>
    );
  }

  // Filtered lists
  const filteredProducts = products.filter(
    (p) =>
      p.title.toLowerCase().includes(productSearch.toLowerCase()) ||
      p.slug.toLowerCase().includes(productSearch.toLowerCase())
  );

  const filteredOrders = orders.filter((o) => {
    const matchesStatus = orderStatusFilter === "ALL" || o.status === orderStatusFilter;
    const matchesSearch =
      !orderSearch ||
      o.orderNumber.toLowerCase().includes(orderSearch.toLowerCase()) ||
      o.user?.name?.toLowerCase().includes(orderSearch.toLowerCase()) ||
      o.user?.email?.toLowerCase().includes(orderSearch.toLowerCase());
    return matchesStatus && matchesSearch;
  });

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Studio Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-[#E5E0D8] pb-6 mb-8">
        <div>
          <div className="flex items-center gap-2">
            <span className="text-xs uppercase tracking-[0.25em] text-emerald-800 font-semibold">
              Atelier Backoffice
            </span>
            <span className="text-[10px] bg-emerald-100 text-emerald-800 font-semibold px-2 py-0.5 rounded-full">
              LIVE ATELIER v1.0
            </span>
          </div>
          <h1 className="text-3xl font-serif text-ink mt-1">Management Studio</h1>
          <p className="text-xs text-ink-muted">
            Executive oversight, product creation, order dispatch fulfillment, and security logs.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={loadInitialAdminData}
            className="p-2 text-ink-muted hover:text-ink rounded-lg border border-[#E5E0D8] bg-surface hover:bg-surface-warm transition-colors"
            title="Refresh Studio Data"
          >
            <RefreshCw className="w-4 h-4" />
          </button>
          <Link
            href="/"
            target="_blank"
            className="px-3.5 py-2 text-xs font-semibold uppercase tracking-wider text-ink rounded-lg border border-[#E5E0D8] hover:bg-surface-warm flex items-center gap-1.5 transition-colors"
          >
            <span>View Storefront</span>
            <ExternalLink className="w-3.5 h-3.5" />
          </Link>
        </div>
      </div>

      {/* Admin Tabs - Mobile Horizontally Scrollable */}
      <div className="flex overflow-x-auto gap-2 border-b border-[#E5E0D8] pb-4 mb-8 scrollbar-none snap-x">
        {[
          { id: "overview", label: "Overview", icon: LayoutDashboard },
          { id: "products", label: "Haute Products", icon: Shirt, badge: products.length },
          { id: "orders", label: "Orders & Fulfillment", icon: ShoppingBag, badge: orders.length },
          { id: "coupons", label: "Coupons & Offers", icon: TicketPercent, badge: coupons.length },
          { id: "audit", label: "Security Audit Logs", icon: ShieldAlert, badge: auditLogs.length },
        ].map((tab) => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as AdminTab)}
              className={`shrink-0 snap-start flex items-center gap-2 px-3.5 sm:px-4 py-2 sm:py-2.5 rounded-xl text-xs font-semibold uppercase tracking-wider whitespace-nowrap transition-all ${
                isActive
                  ? "bg-ink text-surface shadow-sm"
                  : "bg-surface-card border border-[#E5E0D8] text-ink-muted hover:text-ink hover:bg-surface-warm"
              }`}
            >
              <Icon className="w-4 h-4" />
              <span>{tab.label}</span>
              {tab.badge !== undefined && (
                <span
                  className={`text-[10px] px-1.5 py-0.5 rounded-full ${
                    isActive ? "bg-white/20 text-white" : "bg-surface-warm text-ink-muted"
                  }`}
                >
                  {tab.badge}
                </span>
              )}
            </button>
          );
        })}
      </div>

      {/* 1. OVERVIEW TAB */}
      {activeTab === "overview" && (
        <div className="space-y-8">
          {/* Executive KPI Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="bg-surface-card p-5 rounded-2xl border border-[#E5E0D8] space-y-2">
              <div className="flex items-center justify-between text-xs text-ink-muted font-medium uppercase tracking-wider">
                <span>Gross Revenue</span>
                <TrendingUp className="w-4 h-4 text-emerald-700" />
              </div>
              <div className="text-2xl font-serif text-emerald-900 font-normal">
                ₹{metrics?.kpis?.totalRevenue?.toLocaleString("en-IN") || "0"}
              </div>
              <div className="text-[11px] text-ink-muted">From confirmed & delivered orders</div>
            </div>

            <div className="bg-surface-card p-5 rounded-2xl border border-[#E5E0D8] space-y-2">
              <div className="flex items-center justify-between text-xs text-ink-muted font-medium uppercase tracking-wider">
                <span>Total Orders</span>
                <ShoppingBag className="w-4 h-4 text-ink-muted" />
              </div>
              <div className="text-2xl font-serif text-ink font-normal">
                {metrics?.kpis?.totalOrders || 0}
              </div>
              <div className="text-[11px] text-ink-muted">Across all payment gateways</div>
            </div>

            <div className="bg-surface-card p-5 rounded-2xl border border-[#E5E0D8] space-y-2">
              <div className="flex items-center justify-between text-xs text-ink-muted font-medium uppercase tracking-wider">
                <span>Registered Patrons</span>
                <Users className="w-4 h-4 text-ink-muted" />
              </div>
              <div className="text-2xl font-serif text-ink font-normal">
                {metrics?.kpis?.totalCustomers || 0}
              </div>
              <div className="text-[11px] text-ink-muted">Verified customer accounts</div>
            </div>

            <div className="bg-surface-card p-5 rounded-2xl border border-[#E5E0D8] space-y-2">
              <div className="flex items-center justify-between text-xs text-ink-muted font-medium uppercase tracking-wider">
                <span>Inventory Alerts</span>
                <AlertTriangle className="w-4 h-4 text-amber-600" />
              </div>
              <div className="text-2xl font-serif text-amber-700 font-normal">
                {metrics?.kpis?.lowStockCount || 0}
              </div>
              <div className="text-[11px] text-ink-muted">Variants below 5 units stock</div>
            </div>
          </div>

          {/* Low Stock Alerts & Recent Orders */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
            {/* Low Stock List */}
            <div className="lg:col-span-5 bg-surface-card p-6 rounded-2xl border border-[#E5E0D8] space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="font-serif text-base text-ink">Low Stock Alerts</h3>
                <span className="text-xs text-amber-800 bg-amber-50 px-2 py-0.5 rounded font-medium">
                  Needs Replenishment
                </span>
              </div>

              {metrics?.lowStockVariants?.length === 0 ? (
                <div className="text-center py-8 text-xs text-ink-muted">
                  All inventory stocks are healthy.
                </div>
              ) : (
                <div className="divide-y divide-[#E5E0D8]/60 text-xs">
                  {metrics?.lowStockVariants?.map((v: any) => (
                    <div key={v.id} className="py-2.5 flex items-center justify-between gap-3">
                      <div className="min-w-0">
                        <div className="font-medium text-ink truncate">{v.product?.title}</div>
                        <div className="text-ink-muted text-[11px]">
                          SKU: <span className="font-mono">{v.sku}</span> • Size: {v.size} • {v.color}
                        </div>
                      </div>
                      <div className="text-right shrink-0">
                        <span className="font-bold text-red-700 bg-red-50 px-2 py-0.5 rounded-full">
                          {v.stock} left
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Recent Orders Overview */}
            <div className="lg:col-span-7 bg-surface-card p-6 rounded-2xl border border-[#E5E0D8] space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="font-serif text-base text-ink">Recent Atelier Orders</h3>
                <button
                  onClick={() => setActiveTab("orders")}
                  className="text-xs text-emerald-800 hover:text-emerald-900 font-semibold"
                >
                  View All Orders →
                </button>
              </div>

              <div className="divide-y divide-[#E5E0D8]/60 text-xs">
                {metrics?.recentOrders?.map((ord: any) => (
                  <div key={ord.id} className="py-3 flex items-center justify-between gap-4">
                    <div>
                      <div className="font-mono font-semibold text-ink">{ord.orderNumber}</div>
                      <div className="text-ink-muted text-[11px]">
                        {ord.user?.name || ord.shippingAddress?.name || "Client"} • {ord.shippingAddress?.city}
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="font-semibold text-ink">
                        ₹{ord.totalAmount.toLocaleString("en-IN")}
                      </div>
                      <span className="text-[10px] uppercase font-semibold px-2 py-0.5 rounded bg-surface-warm text-ink">
                        {ord.status}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* 2. PRODUCTS TAB */}
      {activeTab === "products" && (
        <div className="space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div className="relative flex-1 max-w-md">
              <Search className="w-4 h-4 text-ink-muted absolute left-3 top-3" />
              <input
                type="text"
                value={productSearch}
                onChange={(e) => setProductSearch(e.target.value)}
                placeholder="Search products by title or slug..."
                className="w-full pl-9 pr-4 py-2 bg-surface-card border border-[#E5E0D8] rounded-xl text-xs text-ink focus:outline-none focus:ring-1 focus:ring-emerald-700"
              />
            </div>

            <button
              onClick={() => setProductModalOpen(true)}
              className="px-4 py-2 bg-ink text-surface rounded-xl text-xs uppercase tracking-wider font-semibold hover:bg-black transition-colors flex items-center gap-1.5 self-start sm:self-auto shadow-sm"
            >
              <Plus className="w-4 h-4" /> Add Haute Product
            </button>
          </div>

          {/* Products Table */}
          <div className="bg-surface-card rounded-2xl border border-[#E5E0D8] overflow-hidden shadow-sm">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-surface-warm/80 border-b border-[#E5E0D8] text-ink-muted uppercase tracking-wider font-medium text-[11px]">
                  <tr>
                    <th className="py-3 px-4">Product</th>
                    <th className="py-3 px-4">Category</th>
                    <th className="py-3 px-4">Price / MRP</th>
                    <th className="py-3 px-4">Stock</th>
                    <th className="py-3 px-4">Status</th>
                    <th className="py-3 px-4 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#E5E0D8]/60">
                  {filteredProducts.map((p) => {
                    const totalStock = p.variants?.reduce((sum: number, v: any) => sum + v.stock, 0) ?? 0;
                    const primaryImg = p.images?.[0]?.url || "https://images.unsplash.com/photo-1610030469983-98e550d6193c?w=200";

                    return (
                      <tr key={p.id} className="hover:bg-surface-warm/40 transition-colors">
                        <td className="py-3 px-4">
                          <div className="flex items-center gap-3">
                            <div className="relative w-12 h-14 rounded-lg overflow-hidden bg-surface-warm border border-[#E5E0D8] shrink-0">
                              <img
                                src={primaryImg}
                                alt={p.title}
                                className="w-full h-full object-cover"
                                onError={(e) => {
                                  (e.target as HTMLImageElement).src =
                                    "https://images.unsplash.com/photo-1610030469983-98e550d6193c?w=200";
                                }}
                              />
                            </div>
                            <div className="min-w-0">
                              <div className="font-medium text-ink truncate max-w-xs">{p.title}</div>
                              <div className="text-[11px] text-ink-muted font-mono">{p.slug}</div>
                              <div className="flex items-center gap-1 mt-0.5">
                                {p.isFeatured && (
                                  <span className="text-[9px] bg-amber-50 text-amber-800 px-1.5 py-0.2 rounded font-semibold">
                                    FEATURED
                                  </span>
                                )}
                                {p.isNewArrival && (
                                  <span className="text-[9px] bg-emerald-50 text-emerald-800 px-1.5 py-0.2 rounded font-semibold">
                                    NEW
                                  </span>
                                )}
                              </div>
                            </div>
                          </div>
                        </td>
                        <td className="py-3 px-4">
                          <span className="px-2 py-0.5 rounded bg-surface-warm text-ink">
                            {p.category?.name || "Apparel"}
                          </span>
                        </td>
                        <td className="py-3 px-4">
                          <div className="font-semibold text-ink">₹{p.basePrice.toLocaleString("en-IN")}</div>
                          <div className="text-ink-muted line-through text-[11px]">
                            ₹{p.baseMrp.toLocaleString("en-IN")}
                          </div>
                        </td>
                        <td className="py-3 px-4">
                          <span
                            className={`font-semibold ${
                              totalStock < 10 ? "text-red-700" : "text-emerald-800"
                            }`}
                          >
                            {totalStock} units
                          </span>
                          <div className="text-[10px] text-ink-muted">{p.variants?.length || 1} variants</div>
                        </td>
                        <td className="py-3 px-4">
                          {p.isArchived ? (
                            <span className="text-[10px] font-semibold px-2 py-0.5 rounded bg-gray-100 text-gray-700">
                              ARCHIVED
                            </span>
                          ) : (
                            <span className="text-[10px] font-semibold px-2 py-0.5 rounded bg-emerald-50 text-emerald-800">
                              ACTIVE
                            </span>
                          )}
                        </td>
                        <td className="py-3 px-4 text-right space-x-2">
                          <Link
                            href={`/product/${p.slug}`}
                            target="_blank"
                            className="inline-block p-1 text-ink-muted hover:text-ink"
                            title="View on Storefront"
                          >
                            <ExternalLink className="w-3.5 h-3.5" />
                          </Link>
                          <button
                            onClick={() => handleArchiveProduct(p.id, p.isArchived)}
                            className={`p-1 rounded ${
                              p.isArchived
                                ? "text-emerald-700 hover:bg-emerald-50"
                                : "text-ink-muted hover:text-amber-800 hover:bg-amber-50"
                            }`}
                            title={p.isArchived ? "Restore Product" : "Archive Product"}
                          >
                            <Archive className="w-3.5 h-3.5" />
                          </button>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* 3. ORDERS TAB */}
      {activeTab === "orders" && (
        <div className="space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div className="flex flex-wrap items-center gap-2">
              {["ALL", "PLACED", "PAID", "PACKED", "SHIPPED", "DELIVERED", "CANCELLED"].map(
                (status) => (
                  <button
                    key={status}
                    onClick={() => setOrderStatusFilter(status)}
                    className={`px-3 py-1.5 rounded-lg text-xs font-semibold uppercase tracking-wider transition-colors ${
                      orderStatusFilter === status
                        ? "bg-ink text-surface"
                        : "bg-surface-card border border-[#E5E0D8] text-ink-muted hover:text-ink"
                    }`}
                  >
                    {status}
                  </button>
                )
              )}
            </div>

            <div className="relative">
              <Search className="w-4 h-4 text-ink-muted absolute left-3 top-3" />
              <input
                type="text"
                value={orderSearch}
                onChange={(e) => setOrderSearch(e.target.value)}
                placeholder="Search order number or client..."
                className="pl-9 pr-4 py-2 bg-surface-card border border-[#E5E0D8] rounded-xl text-xs text-ink focus:outline-none focus:ring-1 focus:ring-emerald-700"
              />
            </div>
          </div>

          {/* Orders Table */}
          <div className="bg-surface-card rounded-2xl border border-[#E5E0D8] overflow-hidden shadow-sm">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-surface-warm/80 border-b border-[#E5E0D8] text-ink-muted uppercase tracking-wider font-medium text-[11px]">
                  <tr>
                    <th className="py-3 px-4">Order Number</th>
                    <th className="py-3 px-4">Client</th>
                    <th className="py-3 px-4">Date</th>
                    <th className="py-3 px-4">Total (₹)</th>
                    <th className="py-3 px-4">Payment</th>
                    <th className="py-3 px-4">Current Status</th>
                    <th className="py-3 px-4 text-right">Update Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#E5E0D8]/60">
                  {filteredOrders.map((ord) => {
                    const statusColors: Record<string, string> = {
                      PLACED: "bg-amber-50 text-amber-800 border-amber-200",
                      PAID: "bg-blue-50 text-blue-800 border-blue-200",
                      PACKED: "bg-indigo-50 text-indigo-800 border-indigo-200",
                      SHIPPED: "bg-purple-50 text-purple-800 border-purple-200",
                      DELIVERED: "bg-emerald-50 text-emerald-800 border-emerald-200",
                      CANCELLED: "bg-red-50 text-red-800 border-red-200",
                    };

                    return (
                      <tr key={ord.id} className="hover:bg-surface-warm/40 transition-colors">
                        <td className="py-3 px-4 font-mono font-semibold text-ink">
                          {ord.orderNumber}
                        </td>
                        <td className="py-3 px-4">
                          <div className="font-medium text-ink">
                            {ord.user?.name || ord.shippingAddress?.name || "Guest Client"}
                          </div>
                          <div className="text-[11px] text-ink-muted">
                            {ord.user?.email || ord.shippingAddress?.phone}
                          </div>
                        </td>
                        <td className="py-3 px-4 text-ink-muted">
                          {new Date(ord.createdAt).toLocaleDateString("en-IN", {
                            day: "numeric",
                            month: "short",
                            year: "numeric",
                          })}
                        </td>
                        <td className="py-3 px-4 font-semibold text-emerald-900">
                          ₹{ord.totalAmount.toLocaleString("en-IN")}
                        </td>
                        <td className="py-3 px-4">
                          <span className="text-[10px] uppercase font-semibold px-2 py-0.5 rounded bg-surface-warm text-ink">
                            {ord.paymentMethod} ({ord.paymentStatus})
                          </span>
                        </td>
                        <td className="py-3 px-4">
                          <span
                            className={`text-[10px] uppercase font-semibold px-2.5 py-0.5 rounded-full border ${
                              statusColors[ord.status] || "bg-surface-warm text-ink"
                            }`}
                          >
                            {ord.status}
                          </span>
                        </td>
                        <td className="py-3 px-4 text-right">
                          <button
                            onClick={() => openStatusModal(ord)}
                            className="px-3 py-1 bg-surface-warm hover:bg-ink hover:text-surface border border-[#E5E0D8] rounded-lg text-xs font-medium transition-colors"
                          >
                            Advance State
                          </button>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* 4. COUPONS TAB */}
      {activeTab === "coupons" && (
        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-xl font-serif text-ink">Campaign Coupons & Promotions</h2>
              <p className="text-xs text-ink-muted">Create percentage or flat discount incentives with cart abuse controls.</p>
            </div>

            <button
              onClick={() => setCouponModalOpen(true)}
              className="px-4 py-2 bg-ink text-surface rounded-xl text-xs uppercase tracking-wider font-semibold hover:bg-black transition-colors flex items-center gap-1.5 shadow-sm"
            >
              <Plus className="w-4 h-4" /> Create Coupon
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {coupons.map((c) => (
              <div
                key={c.id}
                className="bg-surface-card p-5 rounded-2xl border border-[#E5E0D8] space-y-3 relative overflow-hidden"
              >
                <div className="flex items-center justify-between">
                  <span className="font-mono text-base font-bold text-emerald-900 bg-emerald-50 px-2.5 py-0.5 rounded border border-emerald-200">
                    {c.code}
                  </span>
                  <button
                    onClick={() => handleToggleCoupon(c.id, c.isActive)}
                    className={`text-[10px] font-semibold px-2 py-0.5 rounded-full uppercase tracking-wider cursor-pointer ${
                      c.isActive ? "bg-emerald-100 text-emerald-800" : "bg-gray-100 text-gray-600"
                    }`}
                  >
                    {c.isActive ? "ACTIVE" : "PAUSED"}
                  </button>
                </div>

                <p className="text-xs text-ink-muted leading-relaxed">{c.description}</p>

                <div className="text-xs space-y-1 pt-2 border-t border-[#E5E0D8]/60 text-ink">
                  <div>
                    Benefit:{" "}
                    <strong>
                      {c.discountType === "PERCENTAGE" ? `${c.discountValue}% OFF` : `₹${c.discountValue} FLAT`}
                    </strong>
                  </div>
                  <div>Min Spend: <strong>₹{c.minOrderAmount}</strong></div>
                  <div>Redemptions: <strong>{c._count?.usages || 0} / {c.usageLimit || "∞"}</strong></div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* 5. AUDIT LOG TAB */}
      {activeTab === "audit" && (
        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-xl font-serif text-ink">Security & Administrative Audit Logs</h2>
              <p className="text-xs text-ink-muted">
                Immutable chronological log of all sensitive user authentications, admin mutations, and DPDP actions.
              </p>
            </div>
            <span className="text-xs text-ink-muted">{auditLogs.length} events captured</span>
          </div>

          <div className="bg-surface-card rounded-2xl border border-[#E5E0D8] overflow-hidden shadow-sm">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-surface-warm/80 border-b border-[#E5E0D8] text-ink-muted uppercase tracking-wider font-medium text-[11px]">
                  <tr>
                    <th className="py-3 px-4">Action</th>
                    <th className="py-3 px-4">User</th>
                    <th className="py-3 px-4">Entity</th>
                    <th className="py-3 px-4">Details</th>
                    <th className="py-3 px-4">IP / Agent</th>
                    <th className="py-3 px-4 text-right">Timestamp</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#E5E0D8]/60">
                  {auditLogs.map((log) => (
                    <tr key={log.id} className="hover:bg-surface-warm/30 transition-colors">
                      <td className="py-3 px-4">
                        <span className="font-mono text-[10px] font-semibold px-2 py-0.5 rounded bg-surface-warm text-ink">
                          {log.action}
                        </span>
                      </td>
                      <td className="py-3 px-4">
                        <div className="font-medium text-ink">{log.user?.name || "System"}</div>
                        <div className="text-[10px] text-ink-muted">{log.user?.email || "internal"}</div>
                      </td>
                      <td className="py-3 px-4 text-ink-muted">
                        {log.entity} <span className="font-mono text-[10px]">({log.entityId?.slice(0, 8)})</span>
                      </td>
                      <td className="py-3 px-4 max-w-xs truncate text-[11px] text-ink-muted font-mono">
                        {log.details || "—"}
                      </td>
                      <td className="py-3 px-4 text-[10px] text-ink-muted font-mono">
                        {log.ipAddress || "127.0.0.1"}
                      </td>
                      <td className="py-3 px-4 text-right text-[11px] text-ink-muted">
                        {new Date(log.createdAt).toLocaleString("en-IN", {
                          day: "numeric",
                          month: "short",
                          hour: "2-digit",
                          minute: "2-digit",
                        })}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* MODAL: ADD PRODUCT */}
      {productModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-surface-card max-w-xl w-full rounded-2xl border border-[#E5E0D8] p-6 sm:p-8 space-y-4 shadow-2xl my-8">
            <div className="flex items-center justify-between border-b border-[#E5E0D8]/60 pb-3">
              <h3 className="font-serif text-lg text-ink">Add Haute Couture Product</h3>
              <button onClick={() => setProductModalOpen(false)} className="p-1 rounded text-ink-muted hover:text-ink">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleCreateProduct} className="space-y-4 text-xs">
              <div>
                <label className="block uppercase tracking-wider text-ink-muted mb-1 font-medium">Title *</label>
                <input
                  type="text"
                  required
                  value={newProduct.title}
                  onChange={(e) =>
                    setNewProduct({
                      ...newProduct,
                      title: e.target.value,
                      slug: e.target.value.toLowerCase().replace(/[^a-z0-9]+/g, "-"),
                    })
                  }
                  placeholder="e.g. Royal Organza Hand-Embroidered Saree"
                  className="w-full px-3.5 py-2 bg-surface border border-[#E5E0D8] rounded-xl text-ink text-sm focus:outline-none focus:ring-1 focus:ring-emerald-700"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block uppercase tracking-wider text-ink-muted mb-1 font-medium">Slug *</label>
                  <input
                    type="text"
                    required
                    value={newProduct.slug}
                    onChange={(e) => setNewProduct({ ...newProduct, slug: e.target.value })}
                    className="w-full px-3 py-2 bg-surface border border-[#E5E0D8] rounded-xl text-ink font-mono focus:outline-none focus:ring-1 focus:ring-emerald-700"
                  />
                </div>

                <div>
                  <label className="block uppercase tracking-wider text-ink-muted mb-1 font-medium">Category *</label>
                  <select
                    value={newProduct.categoryId}
                    onChange={(e) => setNewProduct({ ...newProduct, categoryId: e.target.value })}
                    className="w-full px-3 py-2 bg-surface border border-[#E5E0D8] rounded-xl text-ink focus:outline-none focus:ring-1 focus:ring-emerald-700"
                  >
                    {categories.map((c) => (
                      <option key={c.id} value={c.id}>
                        {c.name} ({c.gender})
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div>
                <label className="block uppercase tracking-wider text-ink-muted mb-1 font-medium">Description *</label>
                <textarea
                  rows={3}
                  required
                  value={newProduct.description}
                  onChange={(e) => setNewProduct({ ...newProduct, description: e.target.value })}
                  placeholder="Detailed artisanal craftsmanship and heritage fabric story..."
                  className="w-full px-3 py-2 bg-surface border border-[#E5E0D8] rounded-xl text-ink focus:outline-none focus:ring-1 focus:ring-emerald-700"
                />
              </div>

              <div className="grid grid-cols-3 gap-3">
                <div>
                  <label className="block uppercase tracking-wider text-ink-muted mb-1 font-medium">Base Price (₹) *</label>
                  <input
                    type="number"
                    required
                    value={newProduct.basePrice}
                    onChange={(e) => setNewProduct({ ...newProduct, basePrice: Number(e.target.value) })}
                    className="w-full px-3 py-2 bg-surface border border-[#E5E0D8] rounded-xl text-ink focus:outline-none focus:ring-1 focus:ring-emerald-700"
                  />
                </div>

                <div>
                  <label className="block uppercase tracking-wider text-ink-muted mb-1 font-medium">MRP (₹) *</label>
                  <input
                    type="number"
                    required
                    value={newProduct.baseMrp}
                    onChange={(e) => setNewProduct({ ...newProduct, baseMrp: Number(e.target.value) })}
                    className="w-full px-3 py-2 bg-surface border border-[#E5E0D8] rounded-xl text-ink focus:outline-none focus:ring-1 focus:ring-emerald-700"
                  />
                </div>

                <div>
                  <label className="block uppercase tracking-wider text-ink-muted mb-1 font-medium">Initial Stock *</label>
                  <input
                    type="number"
                    required
                    value={newProduct.stock}
                    onChange={(e) => setNewProduct({ ...newProduct, stock: Number(e.target.value) })}
                    className="w-full px-3 py-2 bg-surface border border-[#E5E0D8] rounded-xl text-ink focus:outline-none focus:ring-1 focus:ring-emerald-700"
                  />
                </div>
              </div>

              <div>
                <label className="block uppercase tracking-wider text-ink-muted mb-1 font-medium">Primary Image URL *</label>
                <input
                  type="url"
                  required
                  value={newProduct.imageUrl}
                  onChange={(e) => setNewProduct({ ...newProduct, imageUrl: e.target.value })}
                  className="w-full px-3 py-2 bg-surface border border-[#E5E0D8] rounded-xl text-ink focus:outline-none focus:ring-1 focus:ring-emerald-700"
                />
              </div>

              <div className="flex items-center gap-4 pt-2">
                <label className="flex items-center gap-1.5 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={newProduct.isFeatured}
                    onChange={(e) => setNewProduct({ ...newProduct, isFeatured: e.target.checked })}
                    className="rounded border-[#E5E0D8] text-emerald-800"
                  />
                  <span>Featured</span>
                </label>
                <label className="flex items-center gap-1.5 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={newProduct.isNewArrival}
                    onChange={(e) => setNewProduct({ ...newProduct, isNewArrival: e.target.checked })}
                    className="rounded border-[#E5E0D8] text-emerald-800"
                  />
                  <span>New Arrival</span>
                </label>
              </div>

              <div className="flex justify-end gap-2 pt-4 border-t border-[#E5E0D8]/60">
                <button
                  type="button"
                  onClick={() => setProductModalOpen(false)}
                  className="px-4 py-2 border border-[#E5E0D8] rounded-xl text-ink-muted"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={productSaving}
                  className="px-5 py-2 bg-ink text-surface rounded-xl uppercase tracking-wider font-semibold hover:bg-black"
                >
                  {productSaving ? "Creating..." : "Publish Product"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL: ADVANCE ORDER STATUS */}
      {statusModalOrder && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-surface-card max-w-md w-full rounded-2xl border border-[#E5E0D8] p-6 space-y-4 shadow-2xl">
            <div className="flex items-center justify-between border-b border-[#E5E0D8]/60 pb-3">
              <div>
                <span className="text-xs uppercase tracking-widest text-emerald-800 font-semibold">
                  Order Status Transition
                </span>
                <h3 className="font-mono text-base font-semibold text-ink">
                  {statusModalOrder.orderNumber}
                </h3>
              </div>
              <button onClick={() => setStatusModalOrder(null)} className="p-1 rounded text-ink-muted hover:text-ink">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleUpdateOrderStatus} className="space-y-4 text-xs">
              <div>
                <label className="block uppercase tracking-wider text-ink-muted mb-1 font-medium">
                  Current Status: <strong className="text-ink">{statusModalOrder.status}</strong>
                </label>
                <select
                  required
                  value={selectedNextStatus}
                  onChange={(e) => setSelectedNextStatus(e.target.value)}
                  className="w-full px-3 py-2 bg-surface border border-[#E5E0D8] rounded-xl text-ink text-sm focus:outline-none focus:ring-1 focus:ring-emerald-700"
                >
                  <option value="">Select next state...</option>
                  {statusModalOrder.status === "PLACED" && (
                    <>
                      <option value="PAID">PAID (Confirm Payment)</option>
                      <option value="CANCELLED">CANCELLED (Cancel Order)</option>
                    </>
                  )}
                  {statusModalOrder.status === "PAID" && (
                    <>
                      <option value="PACKED">PACKED (Packed in Atelier)</option>
                      <option value="CANCELLED">CANCELLED (Refund & Cancel)</option>
                    </>
                  )}
                  {statusModalOrder.status === "PACKED" && (
                    <>
                      <option value="SHIPPED">SHIPPED (Handover to Courier)</option>
                      <option value="CANCELLED">CANCELLED (Cancel)</option>
                    </>
                  )}
                  {statusModalOrder.status === "SHIPPED" && (
                    <>
                      <option value="DELIVERED">DELIVERED (Client Received)</option>
                      <option value="RETURNED">RETURNED (Courier Return)</option>
                    </>
                  )}
                  {statusModalOrder.status === "DELIVERED" && (
                    <option value="RETURNED">RETURNED (Customer Return Request)</option>
                  )}
                </select>
              </div>

              {selectedNextStatus === "SHIPPED" && (
                <div className="space-y-3 p-3 bg-surface-warm/60 rounded-xl border border-[#E5E0D8]/60">
                  <div className="font-semibold text-ink flex items-center gap-1.5">
                    <Truck className="w-4 h-4 text-emerald-800" /> Courier Tracking Information
                  </div>
                  <div>
                    <label className="block text-ink-muted mb-1">Courier Partner</label>
                    <input
                      type="text"
                      value={courierName}
                      onChange={(e) => setCourierName(e.target.value)}
                      className="w-full px-3 py-1.5 bg-surface border border-[#E5E0D8] rounded-lg"
                    />
                  </div>
                  <div>
                    <label className="block text-ink-muted mb-1">AWB Tracking Number</label>
                    <input
                      type="text"
                      value={trackingNumber}
                      onChange={(e) => setTrackingNumber(e.target.value)}
                      className="w-full px-3 py-1.5 bg-surface border border-[#E5E0D8] rounded-lg font-mono"
                    />
                  </div>
                </div>
              )}

              <div>
                <label className="block uppercase tracking-wider text-ink-muted mb-1 font-medium">Audit Note (Optional)</label>
                <input
                  type="text"
                  value={statusNote}
                  onChange={(e) => setStatusNote(e.target.value)}
                  placeholder="e.g. Dispatched via express courier flight 104"
                  className="w-full px-3 py-2 bg-surface border border-[#E5E0D8] rounded-xl text-ink"
                />
              </div>

              <div className="flex justify-end gap-2 pt-2 border-t border-[#E5E0D8]/60">
                <button
                  type="button"
                  onClick={() => setStatusModalOrder(null)}
                  className="px-4 py-2 border border-[#E5E0D8] rounded-xl text-ink-muted"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={statusUpdating || !selectedNextStatus}
                  className="px-5 py-2 bg-ink text-surface rounded-xl uppercase tracking-wider font-semibold hover:bg-black disabled:opacity-50"
                >
                  {statusUpdating ? "Updating..." : "Commit Status Change"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL: CREATE COUPON */}
      {couponModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-surface-card max-w-md w-full rounded-2xl border border-[#E5E0D8] p-6 space-y-4 shadow-2xl">
            <div className="flex items-center justify-between border-b border-[#E5E0D8]/60 pb-3">
              <h3 className="font-serif text-base text-ink">Create Promotional Campaign Coupon</h3>
              <button onClick={() => setCouponModalOpen(false)} className="p-1 rounded text-ink-muted hover:text-ink">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleCreateCoupon} className="space-y-3 text-xs">
              <div>
                <label className="block uppercase tracking-wider text-ink-muted mb-1 font-medium">Coupon Code *</label>
                <input
                  type="text"
                  required
                  value={newCoupon.code}
                  onChange={(e) => setNewCoupon({ ...newCoupon, code: e.target.value.toUpperCase() })}
                  placeholder="e.g. DIWALI20"
                  className="w-full px-3 py-2 bg-surface border border-[#E5E0D8] rounded-xl font-mono text-sm font-bold uppercase text-ink"
                />
              </div>

              <div>
                <label className="block uppercase tracking-wider text-ink-muted mb-1 font-medium">Description *</label>
                <input
                  type="text"
                  required
                  value={newCoupon.description}
                  onChange={(e) => setNewCoupon({ ...newCoupon, description: e.target.value })}
                  placeholder="e.g. Festive 20% savings on purchases above ₹2499"
                  className="w-full px-3 py-2 bg-surface border border-[#E5E0D8] rounded-xl text-ink"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block uppercase tracking-wider text-ink-muted mb-1 font-medium">Discount Type</label>
                  <select
                    value={newCoupon.discountType}
                    onChange={(e) => setNewCoupon({ ...newCoupon, discountType: e.target.value })}
                    className="w-full px-3 py-2 bg-surface border border-[#E5E0D8] rounded-xl text-ink"
                  >
                    <option value="PERCENTAGE">PERCENTAGE (%)</option>
                    <option value="FLAT">FLAT AMOUNT (₹)</option>
                  </select>
                </div>

                <div>
                  <label className="block uppercase tracking-wider text-ink-muted mb-1 font-medium">Value *</label>
                  <input
                    type="number"
                    required
                    value={newCoupon.discountValue}
                    onChange={(e) => setNewCoupon({ ...newCoupon, discountValue: Number(e.target.value) })}
                    className="w-full px-3 py-2 bg-surface border border-[#E5E0D8] rounded-xl text-ink"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block uppercase tracking-wider text-ink-muted mb-1 font-medium">Min Spend (₹)</label>
                  <input
                    type="number"
                    value={newCoupon.minOrderAmount}
                    onChange={(e) => setNewCoupon({ ...newCoupon, minOrderAmount: Number(e.target.value) })}
                    className="w-full px-3 py-2 bg-surface border border-[#E5E0D8] rounded-xl text-ink"
                  />
                </div>

                <div>
                  <label className="block uppercase tracking-wider text-ink-muted mb-1 font-medium">Max Cap (₹)</label>
                  <input
                    type="number"
                    value={newCoupon.maxDiscountAmount}
                    onChange={(e) => setNewCoupon({ ...newCoupon, maxDiscountAmount: Number(e.target.value) })}
                    className="w-full px-3 py-2 bg-surface border border-[#E5E0D8] rounded-xl text-ink"
                  />
                </div>
              </div>

              <div className="flex justify-end gap-2 pt-3 border-t border-[#E5E0D8]/60">
                <button
                  type="button"
                  onClick={() => setCouponModalOpen(false)}
                  className="px-4 py-2 border border-[#E5E0D8] rounded-xl text-ink-muted"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={couponSaving}
                  className="px-5 py-2 bg-ink text-surface rounded-xl uppercase tracking-wider font-semibold hover:bg-black"
                >
                  {couponSaving ? "Creating..." : "Save Coupon"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
