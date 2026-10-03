"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useSession, signOut } from "next-auth/react";
import {
  Package,
  MapPin,
  User,
  Shield,
  LogOut,
  Plus,
  Trash2,
  Edit2,
  Download,
  AlertTriangle,
  CheckCircle2,
  Clock,
  Truck,
  Check,
  X,
  Lock,
  ChevronRight,
  RotateCcw,
  LayoutDashboard,
} from "lucide-react";

type TabType = "orders" | "addresses" | "profile" | "privacy";

export default function AccountPage() {
  const router = useRouter();
  const { data: session, status } = useSession();

  const [activeTab, setActiveTab] = useState<TabType>("orders");
  const [loading, setLoading] = useState(true);

  // Profile data
  const [profile, setProfile] = useState<any>(null);
  const [profileName, setProfileName] = useState("");
  const [profilePhone, setProfilePhone] = useState("");
  const [profileSaving, setProfileSaving] = useState(false);
  const [profileMessage, setProfileMessage] = useState<{ text: string; type: "success" | "error" } | null>(null);

  // Password change
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmNewPassword, setConfirmNewPassword] = useState("");
  const [passwordSaving, setPasswordSaving] = useState(false);
  const [passwordMessage, setPasswordMessage] = useState<{ text: string; type: "success" | "error" } | null>(null);

  // Addresses
  const [addresses, setAddresses] = useState<any[]>([]);
  const [addressModalOpen, setAddressModalOpen] = useState(false);
  const [editingAddress, setEditingAddress] = useState<any | null>(null);
  const [addressForm, setAddressForm] = useState({
    name: "",
    phone: "",
    alternatePhone: "",
    addressLine1: "",
    addressLine2: "",
    landmark: "",
    city: "",
    state: "",
    postalCode: "",
    addressType: "HOME",
    isDefault: false,
  });
  const [addressSaving, setAddressSaving] = useState(false);

  // Orders
  const [orders, setOrders] = useState<any[]>([]);
  const [selectedOrderTracking, setSelectedOrderTracking] = useState<any | null>(null);
  const [returnModalOrder, setReturnModalOrder] = useState<any | null>(null);
  const [returnReason, setReturnReason] = useState("");

  // DPDP & Deletion
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [deletePassword, setDeletePassword] = useState("");
  const [deleteConfirmText, setDeleteConfirmText] = useState("");
  const [deleteReason, setDeleteReason] = useState("");
  const [deleteLoading, setDeleteLoading] = useState(false);
  const [deleteError, setDeleteError] = useState("");

  useEffect(() => {
    if (status === "unauthenticated") {
      router.push("/auth/login?callbackUrl=/account");
    } else if (status === "authenticated") {
      loadAccountData();
    }
  }, [status, router]);

  const loadAccountData = async () => {
    setLoading(true);
    try {
      const [profileRes, addrRes, ordersRes] = await Promise.all([
        fetch("/api/v1/user/profile"),
        fetch("/api/v1/user/addresses"),
        fetch("/api/v1/user/orders?limit=20"),
      ]);

      const [profileData, addrData, ordersData] = await Promise.all([
        profileRes.json(),
        addrRes.json(),
        ordersRes.json(),
      ]);

      if (profileData.success) {
        setProfile(profileData.data);
        setProfileName(profileData.data.name || "");
        setProfilePhone(profileData.data.phone || "");
      }
      if (addrData.success) {
        setAddresses(addrData.data);
      }
      if (ordersData.success) {
        setOrders(ordersData.data.orders);
      }
    } catch (e) {
      console.error("Failed to load account data", e);
    } finally {
      setLoading(false);
    }
  };

  // Profile update
  const handleUpdateProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    setProfileSaving(true);
    setProfileMessage(null);
    try {
      const res = await fetch("/api/v1/user/profile", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name: profileName, phone: profilePhone }),
      });
      const data = await res.json();
      if (data.success) {
        setProfile(data.data);
        setProfileMessage({ text: "Profile updated successfully.", type: "success" });
      } else {
        setProfileMessage({ text: data.error || "Failed to update profile.", type: "error" });
      }
    } catch (err: any) {
      setProfileMessage({ text: err.message || "Network error.", type: "error" });
    } finally {
      setProfileSaving(false);
    }
  };

  // Password change
  const handleChangePassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setPasswordSaving(true);
    setPasswordMessage(null);

    if (newPassword !== confirmNewPassword) {
      setPasswordMessage({ text: "New passwords do not match.", type: "error" });
      setPasswordSaving(false);
      return;
    }

    try {
      const res = await fetch("/api/v1/auth/change-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ currentPassword, newPassword, confirmNewPassword }),
      });
      const data = await res.json();
      if (data.success) {
        setPasswordMessage({
          text: "Password updated successfully. Active sessions revoked.",
          type: "success",
        });
        setCurrentPassword("");
        setNewPassword("");
        setConfirmNewPassword("");
      } else {
        setPasswordMessage({ text: data.error || "Failed to update password.", type: "error" });
      }
    } catch (err: any) {
      setPasswordMessage({ text: err.message || "Network error.", type: "error" });
    } finally {
      setPasswordSaving(false);
    }
  };

  // Logout all devices
  const handleLogoutAllDevices = async () => {
    if (!confirm("Are you sure you want to log out from all devices? You will be signed out immediately.")) {
      return;
    }
    try {
      await fetch("/api/v1/auth/logout-all", { method: "POST" });
      signOut({ callbackUrl: "/auth/login" });
    } catch (e) {
      console.error(e);
    }
  };

  // Address CRUD
  const openNewAddressModal = () => {
    setEditingAddress(null);
    setAddressForm({
      name: profile?.name || "",
      phone: profile?.phone || "",
      alternatePhone: "",
      addressLine1: "",
      addressLine2: "",
      landmark: "",
      city: "",
      state: "",
      postalCode: "",
      addressType: "HOME",
      isDefault: addresses.length === 0,
    });
    setAddressModalOpen(true);
  };

  const openEditAddressModal = (addr: any) => {
    setEditingAddress(addr);
    setAddressForm({
      name: addr.name,
      phone: addr.phone,
      alternatePhone: addr.alternatePhone || "",
      addressLine1: addr.addressLine1,
      addressLine2: addr.addressLine2 || "",
      landmark: addr.landmark || "",
      city: addr.city,
      state: addr.state,
      postalCode: addr.postalCode,
      addressType: addr.addressType,
      isDefault: addr.isDefault,
    });
    setAddressModalOpen(true);
  };

  const handleSaveAddress = async (e: React.FormEvent) => {
    e.preventDefault();
    setAddressSaving(true);
    try {
      const url = editingAddress
        ? `/api/v1/user/addresses/${editingAddress.id}`
        : "/api/v1/user/addresses";
      const method = editingAddress ? "PUT" : "POST";

      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(addressForm),
      });
      const data = await res.json();
      if (data.success) {
        setAddressModalOpen(false);
        // Refresh address list
        const refreshed = await fetch("/api/v1/user/addresses").then((r) => r.json());
        if (refreshed.success) setAddresses(refreshed.data);
      } else {
        alert(data.error || "Failed to save address");
      }
    } catch (err: any) {
      alert(err.message || "Failed to save address");
    } finally {
      setAddressSaving(false);
    }
  };

  const handleDeleteAddress = async (id: string) => {
    if (!confirm("Are you sure you want to delete this address?")) return;
    try {
      const res = await fetch(`/api/v1/user/addresses/${id}`, { method: "DELETE" });
      const data = await res.json();
      if (data.success) {
        setAddresses(addresses.filter((a) => a.id !== id));
      } else {
        alert(data.error || "Failed to delete address");
      }
    } catch (e: any) {
      alert(e.message || "Error deleting address");
    }
  };

  // DPDP Export Data
  const handleExportData = () => {
    window.location.href = "/api/v1/user/export-data";
  };

  // Delete Account
  const handleDeleteAccount = async (e: React.FormEvent) => {
    e.preventDefault();
    setDeleteError("");
    setDeleteLoading(true);

    try {
      const res = await fetch("/api/v1/user/delete-account", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          password: deletePassword,
          confirmationText: deleteConfirmText,
          reason: deleteReason,
        }),
      });

      const data = await res.json();
      if (data.success) {
        alert("Your account has been deleted and anonymized. You will now be signed out.");
        signOut({ callbackUrl: "/" });
      } else {
        setDeleteError(data.error || "Account deletion failed.");
      }
    } catch (err: any) {
      setDeleteError(err.message || "Failed to delete account");
    } finally {
      setDeleteLoading(false);
    }
  };

  if (status === "loading" || loading) {
    return (
      <div className="min-h-[70vh] flex items-center justify-center">
        <div className="text-center space-y-3">
          <div className="w-8 h-8 border-2 border-emerald-800 border-t-transparent rounded-full animate-spin mx-auto" />
          <p className="text-xs uppercase tracking-widest text-ink-muted">Loading Atelier Dashboard...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
      {/* Header */}
      <div className="border-b border-[#E5E0D8] pb-6 mb-8 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <span className="text-xs uppercase tracking-[0.25em] text-emerald-800 font-semibold">
            Client Concierge
          </span>
          <h1 className="text-3xl font-serif text-ink font-normal tracking-tight mt-1">
            {profile?.name ? `Namaste, ${profile.name}` : "My Account"}
          </h1>
          <p className="text-sm text-ink-muted mt-0.5">
            Manage your bespoke wardrobe orders, saved delivery addresses, and account security.
          </p>
        </div>

        <div className="flex items-center gap-2 self-start md:self-auto">
          {(session?.user?.role === "ADMIN" || profile?.role === "ADMIN" || profile?.role === "STAFF") && (
            <Link
              href="/admin"
              className="inline-flex items-center gap-1.5 px-3.5 py-2 text-xs uppercase tracking-wider font-semibold text-emerald-950 bg-emerald-100 hover:bg-emerald-200 rounded-lg border border-emerald-300 transition-colors"
            >
              <LayoutDashboard className="w-4 h-4 text-emerald-800" /> Admin Studio
            </Link>
          )}

          <button
            onClick={() => signOut({ callbackUrl: "/" })}
            className="inline-flex items-center gap-2 px-4 py-2 text-xs uppercase tracking-wider text-ink-muted hover:text-red-700 hover:bg-red-50 rounded-lg border border-[#E5E0D8] transition-colors"
          >
            <LogOut className="w-4 h-4" /> Sign Out
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Navigation Sidebar & Mobile Segmented Control */}
        <aside className="lg:col-span-3">
          <nav className="flex lg:flex-col overflow-x-auto gap-2 lg:gap-1 bg-surface-card p-2 sm:p-3 rounded-2xl border border-[#E5E0D8] scrollbar-none snap-x">
            {(session?.user?.role === "ADMIN" || profile?.role === "ADMIN" || profile?.role === "STAFF") && (
              <Link
                href="/admin"
                className="shrink-0 snap-start flex items-center justify-between gap-3 px-4 py-2.5 sm:py-3 text-xs sm:text-sm rounded-xl font-medium bg-emerald-950 text-emerald-300 hover:bg-black transition-colors shadow-sm mb-1"
              >
                <span className="flex items-center gap-2 sm:gap-3 whitespace-nowrap font-semibold text-white">
                  <LayoutDashboard className="w-4 h-4 text-emerald-400" /> Admin Studio
                </span>
                <span className="text-[10px] px-2 py-0.5 rounded-full bg-emerald-800 text-emerald-100 font-bold uppercase tracking-wider">
                  Owner
                </span>
              </Link>
            )}

            <button
              onClick={() => setActiveTab("orders")}
              className={`shrink-0 snap-start flex items-center justify-between gap-3 px-4 py-2.5 sm:py-3 text-xs sm:text-sm rounded-xl font-medium transition-colors ${
                activeTab === "orders"
                  ? "bg-emerald-900 text-white shadow-sm"
                  : "text-ink hover:bg-surface-warm"
              }`}
            >
              <span className="flex items-center gap-2 sm:gap-3 whitespace-nowrap">
                <Package className="w-4 h-4" /> My Orders
              </span>
              <span className={`text-[10px] sm:text-xs px-2 py-0.5 rounded-full ${activeTab === "orders" ? "bg-white/20 text-white" : "bg-surface-warm text-ink-muted"}`}>
                {orders.length}
              </span>
            </button>

            <button
              onClick={() => setActiveTab("addresses")}
              className={`shrink-0 snap-start flex items-center justify-between gap-3 px-4 py-2.5 sm:py-3 text-xs sm:text-sm rounded-xl font-medium transition-colors ${
                activeTab === "addresses"
                  ? "bg-emerald-900 text-white shadow-sm"
                  : "text-ink hover:bg-surface-warm"
              }`}
            >
              <span className="flex items-center gap-2 sm:gap-3 whitespace-nowrap">
                <MapPin className="w-4 h-4" /> Saved Addresses
              </span>
              <span className={`text-[10px] sm:text-xs px-2 py-0.5 rounded-full ${activeTab === "addresses" ? "bg-white/20 text-white" : "bg-surface-warm text-ink-muted"}`}>
                {addresses.length}
              </span>
            </button>

            <button
              onClick={() => setActiveTab("profile")}
              className={`shrink-0 snap-start flex items-center gap-2 sm:gap-3 px-4 py-2.5 sm:py-3 text-xs sm:text-sm rounded-xl font-medium whitespace-nowrap transition-colors ${
                activeTab === "profile"
                  ? "bg-emerald-900 text-white shadow-sm"
                  : "text-ink hover:bg-surface-warm"
              }`}
            >
              <User className="w-4 h-4" /> Profile & Security
            </button>

            <button
              onClick={() => setActiveTab("privacy")}
              className={`shrink-0 snap-start flex items-center gap-2 sm:gap-3 px-4 py-2.5 sm:py-3 text-xs sm:text-sm rounded-xl font-medium whitespace-nowrap transition-colors ${
                activeTab === "privacy"
                  ? "bg-emerald-900 text-white shadow-sm"
                  : "text-ink hover:bg-surface-warm"
              }`}
            >
              <Shield className="w-4 h-4" /> Privacy & DPDP Data
            </button>
          </nav>
        </aside>

        {/* Content Area */}
        <main className="lg:col-span-9">
          {/* TAB 1: ORDERS */}
          {activeTab === "orders" && (
            <div className="space-y-6">
              <div className="flex items-center justify-between">
                <h2 className="text-xl font-serif text-ink">Order History</h2>
                <span className="text-xs text-ink-muted">{orders.length} orders placed</span>
              </div>

              {orders.length === 0 ? (
                <div className="bg-surface-card p-12 text-center rounded-2xl border border-[#E5E0D8] space-y-4">
                  <Package className="w-12 h-12 text-ink-faint mx-auto stroke-[1.2]" />
                  <h3 className="font-serif text-lg text-ink">No orders discovered</h3>
                  <p className="text-sm text-ink-muted max-w-sm mx-auto">
                    You have not placed any orders yet. Discover our latest couture collections.
                  </p>
                  <Link
                    href="/women"
                    className="inline-block mt-2 px-6 py-2.5 bg-ink text-surface rounded-xl text-xs uppercase tracking-wider font-medium hover:bg-black transition-colors"
                  >
                    Explore Atelier Collections
                  </Link>
                </div>
              ) : (
                <div className="space-y-4">
                  {orders.map((order) => {
                    const statusColors: Record<string, string> = {
                      PLACED: "bg-amber-50 text-amber-800 border-amber-200",
                      PAID: "bg-blue-50 text-blue-800 border-blue-200",
                      PACKED: "bg-indigo-50 text-indigo-800 border-indigo-200",
                      SHIPPED: "bg-purple-50 text-purple-800 border-purple-200",
                      DELIVERED: "bg-emerald-50 text-emerald-800 border-emerald-200",
                      CANCELLED: "bg-red-50 text-red-800 border-red-200",
                      REFUNDED: "bg-gray-50 text-gray-800 border-gray-200",
                    };

                    return (
                      <div
                        key={order.id}
                        className="bg-surface-card rounded-2xl border border-[#E5E0D8] p-5 sm:p-6 space-y-5 shadow-sm"
                      >
                        {/* Order Meta Header */}
                        <div className="flex flex-wrap items-center justify-between gap-4 border-b border-[#E5E0D8]/60 pb-4">
                          <div>
                            <span className="text-xs text-ink-muted">Order Number</span>
                            <div className="font-mono text-sm font-semibold text-ink">
                              {order.orderNumber}
                            </div>
                          </div>

                          <div>
                            <span className="text-xs text-ink-muted">Placed Date</span>
                            <div className="text-sm text-ink">
                              {new Date(order.createdAt).toLocaleDateString("en-IN", {
                                day: "numeric",
                                month: "short",
                                year: "numeric",
                              })}
                            </div>
                          </div>

                          <div>
                            <span className="text-xs text-ink-muted">Total Amount</span>
                            <div className="text-sm font-semibold text-emerald-900">
                              ₹{order.totalAmount.toLocaleString("en-IN")}
                            </div>
                          </div>

                          <div>
                            <span
                              className={`px-3 py-1 rounded-full text-xs font-semibold uppercase tracking-wider border ${
                                statusColors[order.status] || "bg-surface-warm text-ink border-[#E5E0D8]"
                              }`}
                            >
                              {order.status}
                            </span>
                          </div>
                        </div>

                        {/* Order Items List */}
                        <div className="divide-y divide-[#E5E0D8]/50">
                          {order.items.map((item: any) => {
                            const imgUrl = item.product?.images?.[0]?.url || "https://images.unsplash.com/photo-1610030469983-98e550d6193c?w=400";
                            return (
                              <div key={item.id} className="py-3 flex items-center gap-4">
                                <div className="relative w-16 h-20 rounded-lg overflow-hidden bg-surface-warm shrink-0 border border-[#E5E0D8]">
                                  <img
                                    src={imgUrl}
                                    alt={item.title}
                                    className="w-full h-full object-cover"
                                    onError={(e) => {
                                      (e.target as HTMLImageElement).src =
                                        "https://images.unsplash.com/photo-1610030469983-98e550d6193c?w=400";
                                    }}
                                  />
                                </div>
                                <div className="flex-1 min-w-0">
                                  <h4 className="text-sm font-medium text-ink truncate">{item.title}</h4>
                                  <div className="text-xs text-ink-muted mt-0.5 space-x-2">
                                    <span>Size: <strong className="text-ink">{item.size}</strong></span>
                                    <span>•</span>
                                    <span>Color: <strong className="text-ink">{item.color}</strong></span>
                                    <span>•</span>
                                    <span>Qty: <strong className="text-ink">{item.quantity}</strong></span>
                                  </div>
                                  <div className="text-xs font-semibold text-ink mt-1">
                                    ₹{item.totalPrice.toLocaleString("en-IN")}
                                  </div>
                                </div>
                              </div>
                            );
                          })}
                        </div>

                        {/* Order Actions */}
                        <div className="flex flex-wrap items-center justify-between gap-3 pt-2 border-t border-[#E5E0D8]/50 text-xs">
                          <div className="text-ink-muted">
                            Delivery to: <span className="font-medium text-ink">{order.shippingAddress?.name}, {order.shippingAddress?.city} ({order.shippingAddress?.postalCode})</span>
                          </div>

                          <div className="flex items-center gap-2">
                            <button
                              onClick={() => setSelectedOrderTracking(order)}
                              className="px-3.5 py-1.5 rounded-lg border border-[#E5E0D8] bg-surface hover:bg-surface-warm font-medium flex items-center gap-1.5 transition-colors"
                            >
                              <Truck className="w-3.5 h-3.5 text-emerald-800" /> Track Order
                            </button>

                            {order.status === "DELIVERED" && (
                              <button
                                onClick={() => setReturnModalOrder(order)}
                                className="px-3.5 py-1.5 rounded-lg border border-[#E5E0D8] bg-surface hover:bg-surface-warm font-medium flex items-center gap-1.5 transition-colors"
                              >
                                <RotateCcw className="w-3.5 h-3.5" /> Return / Exchange
                              </button>
                            )}
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          )}

          {/* TAB 2: SAVED ADDRESSES */}
          {activeTab === "addresses" && (
            <div className="space-y-6">
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="text-xl font-serif text-ink">Saved Addresses</h2>
                  <p className="text-xs text-ink-muted">Manage your shipping and billing destinations across India.</p>
                </div>

                <button
                  onClick={openNewAddressModal}
                  className="px-4 py-2 bg-ink text-surface rounded-xl text-xs uppercase tracking-wider font-medium hover:bg-black transition-colors flex items-center gap-1.5 shadow-sm"
                >
                  <Plus className="w-4 h-4" /> Add Address
                </button>
              </div>

              {addresses.length === 0 ? (
                <div className="bg-surface-card p-10 text-center rounded-2xl border border-[#E5E0D8] space-y-3">
                  <MapPin className="w-10 h-10 text-ink-faint mx-auto stroke-[1.2]" />
                  <h3 className="font-serif text-base text-ink">No addresses saved</h3>
                  <p className="text-xs text-ink-muted max-w-xs mx-auto">
                    Save your delivery addresses for quick one-tap checkout.
                  </p>
                  <button
                    onClick={openNewAddressModal}
                    className="px-4 py-2 bg-ink text-surface rounded-xl text-xs uppercase tracking-wider font-medium hover:bg-black transition-colors"
                  >
                    Add Address
                  </button>
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {addresses.map((addr) => (
                    <div
                      key={addr.id}
                      className={`p-5 rounded-2xl border transition-all ${
                        addr.isDefault
                          ? "bg-surface-card border-emerald-800/40 ring-1 ring-emerald-800/20"
                          : "bg-surface-card border-[#E5E0D8]"
                      }`}
                    >
                      <div className="flex items-center justify-between mb-3">
                        <div className="flex items-center gap-2">
                          <span className="text-xs font-semibold px-2 py-0.5 rounded bg-surface-warm text-ink">
                            {addr.addressType}
                          </span>
                          {addr.isDefault && (
                            <span className="text-[11px] font-semibold px-2 py-0.5 rounded bg-emerald-100 text-emerald-800">
                              DEFAULT
                            </span>
                          )}
                        </div>

                        <div className="flex items-center gap-2">
                          <button
                            onClick={() => openEditAddressModal(addr)}
                            className="p-1.5 text-ink-muted hover:text-ink rounded-md hover:bg-surface-warm"
                            aria-label="Edit address"
                          >
                            <Edit2 className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => handleDeleteAddress(addr.id)}
                            className="p-1.5 text-ink-muted hover:text-red-700 rounded-md hover:bg-red-50"
                            aria-label="Delete address"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </div>

                      <div className="text-sm font-semibold text-ink">{addr.name}</div>
                      <div className="text-xs text-ink-muted mt-1 leading-relaxed">
                        {addr.addressLine1}
                        {addr.addressLine2 ? `, ${addr.addressLine2}` : ""}
                        {addr.landmark ? `, Near ${addr.landmark}` : ""}
                        <br />
                        {addr.city}, {addr.state} - <strong>{addr.postalCode}</strong>
                      </div>
                      <div className="text-xs text-ink mt-2">
                        Mobile: <strong>+91 {addr.phone}</strong>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* TAB 3: PROFILE & SECURITY */}
          {activeTab === "profile" && (
            <div className="space-y-8">
              {/* Profile Details */}
              <div className="bg-surface-card p-6 sm:p-8 rounded-2xl border border-[#E5E0D8] space-y-6">
                <div>
                  <h2 className="text-lg font-serif text-ink">Personal Information</h2>
                  <p className="text-xs text-ink-muted">Update your contact identity and shipping communications.</p>
                </div>

                {profileMessage && (
                  <div
                    className={`p-3 rounded-lg text-xs leading-relaxed border ${
                      profileMessage.type === "success"
                        ? "bg-emerald-50 text-emerald-800 border-emerald-200"
                        : "bg-red-50 text-red-800 border-red-200"
                    }`}
                  >
                    {profileMessage.text}
                  </div>
                )}

                <form onSubmit={handleUpdateProfile} className="space-y-4">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs uppercase tracking-wider text-ink-muted mb-1.5 font-medium">
                        Full Name
                      </label>
                      <input
                        type="text"
                        required
                        value={profileName}
                        onChange={(e) => setProfileName(e.target.value)}
                        className="w-full px-4 py-2.5 bg-surface border border-[#E5E0D8] rounded-xl text-sm text-ink focus:outline-none focus:ring-1 focus:ring-emerald-700"
                      />
                    </div>

                    <div>
                      <label className="block text-xs uppercase tracking-wider text-ink-muted mb-1.5 font-medium">
                        Email Address
                      </label>
                      <input
                        type="email"
                        disabled
                        value={profile?.email || ""}
                        className="w-full px-4 py-2.5 bg-surface-warm/60 border border-[#E5E0D8] rounded-xl text-sm text-ink-muted cursor-not-allowed"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs uppercase tracking-wider text-ink-muted mb-1.5 font-medium">
                      Mobile Number (+91)
                    </label>
                    <input
                      type="tel"
                      maxLength={10}
                      value={profilePhone}
                      onChange={(e) => setProfilePhone(e.target.value.replace(/\D/g, ""))}
                      placeholder="10-digit mobile"
                      className="w-full sm:w-1/2 px-4 py-2.5 bg-surface border border-[#E5E0D8] rounded-xl text-sm text-ink focus:outline-none focus:ring-1 focus:ring-emerald-700"
                    />
                  </div>

                  <button
                    type="submit"
                    disabled={profileSaving}
                    className="px-6 py-2.5 bg-ink text-surface rounded-xl text-xs uppercase tracking-wider font-medium hover:bg-black transition-colors disabled:opacity-60"
                  >
                    {profileSaving ? "Saving..." : "Save Changes"}
                  </button>
                </form>
              </div>

              {/* Password Change */}
              <div className="bg-surface-card p-6 sm:p-8 rounded-2xl border border-[#E5E0D8] space-y-6">
                <div>
                  <h2 className="text-lg font-serif text-ink">Change Password</h2>
                  <p className="text-xs text-ink-muted">
                    Updating your password will automatically sign out all other active sessions across devices.
                  </p>
                </div>

                {passwordMessage && (
                  <div
                    className={`p-3 rounded-lg text-xs leading-relaxed border ${
                      passwordMessage.type === "success"
                        ? "bg-emerald-50 text-emerald-800 border-emerald-200"
                        : "bg-red-50 text-red-800 border-red-200"
                    }`}
                  >
                    {passwordMessage.text}
                  </div>
                )}

                <form onSubmit={handleChangePassword} className="space-y-4 max-w-md">
                  <div>
                    <label className="block text-xs uppercase tracking-wider text-ink-muted mb-1.5 font-medium">
                      Current Password
                    </label>
                    <input
                      type="password"
                      required
                      value={currentPassword}
                      onChange={(e) => setCurrentPassword(e.target.value)}
                      className="w-full px-4 py-2.5 bg-surface border border-[#E5E0D8] rounded-xl text-sm text-ink focus:outline-none focus:ring-1 focus:ring-emerald-700"
                    />
                  </div>

                  <div>
                    <label className="block text-xs uppercase tracking-wider text-ink-muted mb-1.5 font-medium">
                      New Password
                    </label>
                    <input
                      type="password"
                      required
                      value={newPassword}
                      onChange={(e) => setNewPassword(e.target.value)}
                      placeholder="Min 8 chars, uppercase, number, symbol"
                      className="w-full px-4 py-2.5 bg-surface border border-[#E5E0D8] rounded-xl text-sm text-ink focus:outline-none focus:ring-1 focus:ring-emerald-700"
                    />
                  </div>

                  <div>
                    <label className="block text-xs uppercase tracking-wider text-ink-muted mb-1.5 font-medium">
                      Confirm New Password
                    </label>
                    <input
                      type="password"
                      required
                      value={confirmNewPassword}
                      onChange={(e) => setConfirmNewPassword(e.target.value)}
                      className="w-full px-4 py-2.5 bg-surface border border-[#E5E0D8] rounded-xl text-sm text-ink focus:outline-none focus:ring-1 focus:ring-emerald-700"
                    />
                  </div>

                  <button
                    type="submit"
                    disabled={passwordSaving}
                    className="px-6 py-2.5 bg-ink text-surface rounded-xl text-xs uppercase tracking-wider font-medium hover:bg-black transition-colors disabled:opacity-60"
                  >
                    {passwordSaving ? "Updating..." : "Update Password"}
                  </button>
                </form>
              </div>

              {/* Session Security */}
              <div className="bg-surface-card p-6 sm:p-8 rounded-2xl border border-[#E5E0D8] space-y-4">
                <div>
                  <h2 className="text-lg font-serif text-ink">Active Device Sessions</h2>
                  <p className="text-xs text-ink-muted">
                    If you suspect unauthorized access or used a shared terminal, revoke all active sessions.
                  </p>
                </div>

                <button
                  type="button"
                  onClick={handleLogoutAllDevices}
                  className="px-4 py-2.5 bg-surface border border-red-200 text-red-700 hover:bg-red-50 rounded-xl text-xs font-semibold uppercase tracking-wider transition-colors flex items-center gap-2"
                >
                  <Lock className="w-4 h-4" /> Revoke All Active Sessions (Logout Everywhere)
                </button>
              </div>
            </div>
          )}

          {/* TAB 4: PRIVACY & DPDP ACT */}
          {activeTab === "privacy" && (
            <div className="space-y-8">
              {/* DPDP Information */}
              <div className="bg-surface-card p-6 sm:p-8 rounded-2xl border border-[#E5E0D8] space-y-4">
                <div className="flex items-center gap-3">
                  <div className="p-2.5 bg-emerald-50 text-emerald-800 rounded-xl">
                    <Shield className="w-6 h-6" />
                  </div>
                  <div>
                    <h2 className="text-lg font-serif text-ink">Digital Personal Data Protection (DPDP)</h2>
                    <p className="text-xs text-ink-muted">India DPDP Act Compliance & Data Rights</p>
                  </div>
                </div>

                <div className="text-xs text-ink-muted leading-relaxed space-y-2 pt-2">
                  <p>
                    Under India&apos;s Digital Personal Data Protection (DPDP) Act, you have explicit rights regarding your personal information:
                  </p>
                  <ul className="list-disc pl-5 space-y-1">
                    <li><strong>Right to Access:</strong> You can download a complete copy of all personal data we process.</li>
                    <li><strong>Right to Correction:</strong> You can update and amend contact numbers and delivery addresses at any time.</li>
                    <li><strong>Right to Erasure:</strong> You can request permanent anonymization and deletion of your profile.</li>
                  </ul>
                </div>

                <div className="pt-4 border-t border-[#E5E0D8]/60 flex flex-wrap items-center justify-between gap-4">
                  <div>
                    <div className="text-sm font-semibold text-ink">Export All My Data</div>
                    <div className="text-xs text-ink-muted">Download orders, addresses, and account metadata as JSON</div>
                  </div>

                  <button
                    onClick={handleExportData}
                    className="px-4 py-2.5 bg-emerald-900 text-white rounded-xl text-xs uppercase tracking-wider font-medium hover:bg-emerald-950 transition-colors flex items-center gap-2 shadow-sm"
                  >
                    <Download className="w-4 h-4" /> Export Data (JSON)
                  </button>
                </div>
              </div>

              {/* Danger Zone: Account Deletion */}
              <div className="bg-red-50/50 p-6 sm:p-8 rounded-2xl border border-red-200 space-y-4">
                <div className="flex items-center gap-2 text-red-800 font-semibold text-sm">
                  <AlertTriangle className="w-5 h-5 text-red-600" />
                  <span>Danger Zone: Account Deletion</span>
                </div>
                <p className="text-xs text-red-900/80 leading-relaxed">
                  Requesting deletion will permanently purge active login sessions, delete saved addresses, and anonymize your personal identifiers.
                  In accordance with Indian tax and financial compliance regulations (Companies Act & GST), historic transaction invoices will be preserved with anonymized identifiers.
                </p>

                <button
                  type="button"
                  onClick={() => setDeleteModalOpen(true)}
                  className="px-4 py-2.5 bg-red-700 text-white rounded-xl text-xs uppercase tracking-wider font-semibold hover:bg-red-800 transition-colors"
                >
                  Delete Account & Anonymize Data
                </button>
              </div>
            </div>
          )}
        </main>
      </div>

      {/* ADDRESS MODAL */}
      {addressModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-surface-card max-w-lg w-full rounded-2xl border border-[#E5E0D8] p-6 sm:p-8 space-y-5 shadow-2xl my-8">
            <div className="flex items-center justify-between border-b border-[#E5E0D8]/60 pb-3">
              <h3 className="font-serif text-lg text-ink">
                {editingAddress ? "Edit Address" : "Add Delivery Address"}
              </h3>
              <button
                onClick={() => setAddressModalOpen(false)}
                className="p-1 rounded text-ink-muted hover:text-ink"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSaveAddress} className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs uppercase tracking-wider text-ink-muted mb-1 font-medium">
                    Receiver Name *
                  </label>
                  <input
                    type="text"
                    required
                    value={addressForm.name}
                    onChange={(e) => setAddressForm({ ...addressForm, name: e.target.value })}
                    className="w-full px-3.5 py-2 bg-surface border border-[#E5E0D8] rounded-xl text-sm text-ink focus:outline-none focus:ring-1 focus:ring-emerald-700"
                  />
                </div>

                <div>
                  <label className="block text-xs uppercase tracking-wider text-ink-muted mb-1 font-medium">
                    10-Digit Mobile *
                  </label>
                  <input
                    type="tel"
                    required
                    maxLength={10}
                    value={addressForm.phone}
                    onChange={(e) =>
                      setAddressForm({ ...addressForm, phone: e.target.value.replace(/\D/g, "") })
                    }
                    className="w-full px-3.5 py-2 bg-surface border border-[#E5E0D8] rounded-xl text-sm text-ink focus:outline-none focus:ring-1 focus:ring-emerald-700"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs uppercase tracking-wider text-ink-muted mb-1 font-medium">
                  Flat, House No., Building, Apartment *
                </label>
                <input
                  type="text"
                  required
                  value={addressForm.addressLine1}
                  onChange={(e) => setAddressForm({ ...addressForm, addressLine1: e.target.value })}
                  placeholder="e.g. Flat 402, Lotus Towers"
                  className="w-full px-3.5 py-2 bg-surface border border-[#E5E0D8] rounded-xl text-sm text-ink focus:outline-none focus:ring-1 focus:ring-emerald-700"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs uppercase tracking-wider text-ink-muted mb-1 font-medium">
                    Area, Street, Sector
                  </label>
                  <input
                    type="text"
                    value={addressForm.addressLine2}
                    onChange={(e) => setAddressForm({ ...addressForm, addressLine2: e.target.value })}
                    placeholder="e.g. Indiranagar 100ft Road"
                    className="w-full px-3.5 py-2 bg-surface border border-[#E5E0D8] rounded-xl text-sm text-ink focus:outline-none focus:ring-1 focus:ring-emerald-700"
                  />
                </div>

                <div>
                  <label className="block text-xs uppercase tracking-wider text-ink-muted mb-1 font-medium">
                    Landmark (Optional)
                  </label>
                  <input
                    type="text"
                    value={addressForm.landmark}
                    onChange={(e) => setAddressForm({ ...addressForm, landmark: e.target.value })}
                    placeholder="e.g. Near Metro Station"
                    className="w-full px-3.5 py-2 bg-surface border border-[#E5E0D8] rounded-xl text-sm text-ink focus:outline-none focus:ring-1 focus:ring-emerald-700"
                  />
                </div>
              </div>

              <div className="grid grid-cols-3 gap-3">
                <div>
                  <label className="block text-xs uppercase tracking-wider text-ink-muted mb-1 font-medium">
                    PIN Code *
                  </label>
                  <input
                    type="text"
                    required
                    maxLength={6}
                    value={addressForm.postalCode}
                    onChange={(e) =>
                      setAddressForm({ ...addressForm, postalCode: e.target.value.replace(/\D/g, "") })
                    }
                    placeholder="6 digits"
                    className="w-full px-3.5 py-2 bg-surface border border-[#E5E0D8] rounded-xl text-sm text-ink focus:outline-none focus:ring-1 focus:ring-emerald-700"
                  />
                </div>

                <div>
                  <label className="block text-xs uppercase tracking-wider text-ink-muted mb-1 font-medium">
                    City *
                  </label>
                  <input
                    type="text"
                    required
                    value={addressForm.city}
                    onChange={(e) => setAddressForm({ ...addressForm, city: e.target.value })}
                    className="w-full px-3.5 py-2 bg-surface border border-[#E5E0D8] rounded-xl text-sm text-ink focus:outline-none focus:ring-1 focus:ring-emerald-700"
                  />
                </div>

                <div>
                  <label className="block text-xs uppercase tracking-wider text-ink-muted mb-1 font-medium">
                    State *
                  </label>
                  <input
                    type="text"
                    required
                    value={addressForm.state}
                    onChange={(e) => setAddressForm({ ...addressForm, state: e.target.value })}
                    className="w-full px-3.5 py-2 bg-surface border border-[#E5E0D8] rounded-xl text-sm text-ink focus:outline-none focus:ring-1 focus:ring-emerald-700"
                  />
                </div>
              </div>

              <div className="flex items-center justify-between pt-2">
                <div className="flex items-center gap-3">
                  {(["HOME", "WORK", "OTHER"] as const).map((type) => (
                    <label key={type} className="flex items-center gap-1.5 cursor-pointer text-xs font-medium">
                      <input
                        type="radio"
                        name="addressType"
                        value={type}
                        checked={addressForm.addressType === type}
                        onChange={(e) => setAddressForm({ ...addressForm, addressType: e.target.value })}
                        className="text-emerald-800 focus:ring-emerald-700"
                      />
                      <span>{type}</span>
                    </label>
                  ))}
                </div>

                <label className="flex items-center gap-2 cursor-pointer text-xs text-ink-muted">
                  <input
                    type="checkbox"
                    checked={addressForm.isDefault}
                    onChange={(e) => setAddressForm({ ...addressForm, isDefault: e.target.checked })}
                    className="rounded border-[#E5E0D8] text-emerald-800 focus:ring-emerald-700"
                  />
                  <span>Default</span>
                </label>
              </div>

              <div className="flex items-center justify-end gap-3 pt-4 border-t border-[#E5E0D8]/60">
                <button
                  type="button"
                  onClick={() => setAddressModalOpen(false)}
                  className="px-4 py-2 border border-[#E5E0D8] rounded-xl text-xs uppercase tracking-wider text-ink-muted hover:text-ink"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={addressSaving}
                  className="px-6 py-2 bg-ink text-surface rounded-xl text-xs uppercase tracking-wider font-semibold hover:bg-black transition-colors"
                >
                  {addressSaving ? "Saving..." : "Save Address"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* TRACKING TIMELINE MODAL */}
      {selectedOrderTracking && (
        <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-surface-card max-w-md w-full rounded-2xl border border-[#E5E0D8] p-6 space-y-6 shadow-2xl">
            <div className="flex items-center justify-between border-b border-[#E5E0D8]/60 pb-3">
              <div>
                <span className="text-xs uppercase tracking-widest text-emerald-800 font-semibold">
                  Shipment Tracking
                </span>
                <h3 className="font-mono text-base font-semibold text-ink">
                  {selectedOrderTracking.orderNumber}
                </h3>
              </div>
              <button
                onClick={() => setSelectedOrderTracking(null)}
                className="p-1 rounded text-ink-muted hover:text-ink"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Tracking Milestones */}
            <div className="space-y-4">
              {[
                { title: "Order Placed", desc: "Order details recorded at Atelier", done: true },
                {
                  title: "Payment Confirmed",
                  desc: "Transaction verified successfully",
                  done: ["PAID", "PACKED", "SHIPPED", "DELIVERED"].includes(selectedOrderTracking.status),
                },
                {
                  title: "Packed with Care",
                  desc: "Hand-wrapped in bespoke AVANYA luxury packaging",
                  done: ["PACKED", "SHIPPED", "DELIVERED"].includes(selectedOrderTracking.status),
                },
                {
                  title: "In Transit",
                  desc: "Handed over to priority logistics courier",
                  done: ["SHIPPED", "DELIVERED"].includes(selectedOrderTracking.status),
                },
                {
                  title: "Delivered",
                  desc: "Delivered to verified delivery address",
                  done: selectedOrderTracking.status === "DELIVERED",
                },
              ].map((step, idx) => (
                <div key={idx} className="flex items-start gap-3">
                  <div
                    className={`w-6 h-6 rounded-full flex items-center justify-center shrink-0 mt-0.5 ${
                      step.done ? "bg-emerald-800 text-white" : "bg-surface-warm text-ink-faint border border-[#E5E0D8]"
                    }`}
                  >
                    {step.done ? <Check className="w-3.5 h-3.5" /> : <Clock className="w-3 h-3" />}
                  </div>
                  <div>
                    <div className={`text-sm font-medium ${step.done ? "text-ink" : "text-ink-muted"}`}>
                      {step.title}
                    </div>
                    <div className="text-xs text-ink-muted">{step.desc}</div>
                  </div>
                </div>
              ))}
            </div>

            <div className="p-3 bg-surface-warm rounded-xl text-xs text-ink-muted">
              Standard delivery across major Indian metros takes 2-4 business days. Need assistance? Contact our concierge at <span className="text-emerald-800 font-medium">care@avanya.in</span>.
            </div>
          </div>
        </div>
      )}

      {/* RETURN / EXCHANGE MODAL */}
      {returnModalOrder && (
        <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-surface-card max-w-md w-full rounded-2xl border border-[#E5E0D8] p-6 space-y-4 shadow-2xl">
            <div className="flex items-center justify-between border-b border-[#E5E0D8]/60 pb-3">
              <h3 className="font-serif text-base text-ink">Request Return or Exchange</h3>
              <button
                onClick={() => setReturnModalOrder(null)}
                className="p-1 rounded text-ink-muted hover:text-ink"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <p className="text-xs text-ink-muted leading-relaxed">
              We offer complimentary 7-day pickup and size exchange for unworn garments with original security tags attached.
            </p>

            <div>
              <label className="block text-xs uppercase tracking-wider text-ink-muted mb-1 font-medium">
                Reason for Return / Exchange
              </label>
              <textarea
                rows={3}
                required
                value={returnReason}
                onChange={(e) => setReturnReason(e.target.value)}
                placeholder="e.g. Need a smaller size (M to S) or defective embellishment..."
                className="w-full px-3 py-2 bg-surface border border-[#E5E0D8] rounded-xl text-xs text-ink focus:outline-none focus:ring-1 focus:ring-emerald-700"
              />
            </div>

            <div className="flex justify-end gap-2 pt-2">
              <button
                onClick={() => setReturnModalOrder(null)}
                className="px-4 py-2 border border-[#E5E0D8] rounded-xl text-xs uppercase tracking-wider text-ink-muted"
              >
                Cancel
              </button>
              <button
                onClick={() => {
                  alert("Your return/exchange request has been lodged. Our concierge team will reach out via WhatsApp/Phone within 4 hours.");
                  setReturnModalOrder(null);
                }}
                className="px-4 py-2 bg-ink text-surface rounded-xl text-xs uppercase tracking-wider font-semibold hover:bg-black"
              >
                Submit Request
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ACCOUNT DELETION MODAL */}
      {deleteModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-surface-card max-w-md w-full rounded-2xl border border-red-300 p-6 sm:p-8 space-y-4 shadow-2xl">
            <div className="flex items-center justify-between border-b border-[#E5E0D8]/60 pb-3">
              <div className="flex items-center gap-2 text-red-700 font-semibold text-sm">
                <AlertTriangle className="w-5 h-5 text-red-600" />
                <span>Confirm Account Deletion</span>
              </div>
              <button
                onClick={() => setDeleteModalOpen(false)}
                className="p-1 rounded text-ink-muted hover:text-ink"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <p className="text-xs text-ink-muted leading-relaxed">
              This action is permanent and irreversible. To proceed under DPDP Act provisions, please confirm your credentials:
            </p>

            {deleteError && (
              <div className="p-2.5 bg-red-50 border border-red-200 text-red-800 rounded-lg text-xs">
                {deleteError}
              </div>
            )}

            <form onSubmit={handleDeleteAccount} className="space-y-3">
              <div>
                <label className="block text-xs uppercase tracking-wider text-ink-muted mb-1 font-medium">
                  Enter Password
                </label>
                <input
                  type="password"
                  required
                  value={deletePassword}
                  onChange={(e) => setDeletePassword(e.target.value)}
                  className="w-full px-3.5 py-2 bg-surface border border-[#E5E0D8] rounded-xl text-sm text-ink focus:outline-none focus:ring-1 focus:ring-red-600"
                />
              </div>

              <div>
                <label className="block text-xs uppercase tracking-wider text-ink-muted mb-1 font-medium">
                  Type <span className="font-mono text-red-700">DELETE MY ACCOUNT</span> to confirm
                </label>
                <input
                  type="text"
                  required
                  value={deleteConfirmText}
                  onChange={(e) => setDeleteConfirmText(e.target.value)}
                  placeholder="DELETE MY ACCOUNT"
                  className="w-full px-3.5 py-2 bg-surface border border-[#E5E0D8] rounded-xl text-sm text-ink focus:outline-none focus:ring-1 focus:ring-red-600 font-mono"
                />
              </div>

              <div>
                <label className="block text-xs uppercase tracking-wider text-ink-muted mb-1 font-medium">
                  Reason for Leaving (Optional)
                </label>
                <textarea
                  rows={2}
                  value={deleteReason}
                  onChange={(e) => setDeleteReason(e.target.value)}
                  className="w-full px-3.5 py-2 bg-surface border border-[#E5E0D8] rounded-xl text-xs text-ink focus:outline-none focus:ring-1 focus:ring-red-600"
                />
              </div>

              <div className="flex items-center justify-end gap-3 pt-3 border-t border-[#E5E0D8]/60">
                <button
                  type="button"
                  onClick={() => setDeleteModalOpen(false)}
                  className="px-4 py-2 border border-[#E5E0D8] rounded-xl text-xs uppercase tracking-wider text-ink-muted"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={deleteLoading || deleteConfirmText !== "DELETE MY ACCOUNT"}
                  className="px-5 py-2 bg-red-700 text-white rounded-xl text-xs uppercase tracking-wider font-semibold hover:bg-red-800 disabled:opacity-50 transition-colors"
                >
                  {deleteLoading ? "Deleting..." : "Permanently Delete"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
