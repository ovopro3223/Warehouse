"use client";

import { useEffect, useMemo, useState } from "react";

type Item = {
  id: string;
  code: string;
  name: string;
  category: string;
  stock: number;
  cost: number;
  price: number;
  image?: string;
};

type TransactionItem = {
  id: string;
  transactionId: string;
  itemId: string;
  itemName: string;
  qty: number;
  unitCost: number;
  unitPrice: number;
  subtotalRevenue: number;
  subtotalProfit: number;
};

type Transaction = {
  id: string;
  receiptName?: string;
  totalRevenue: number;
  totalProfit: number;
  createdAt: string;
  items: TransactionItem[];
};

type StockMovement = {
  id: string;
  itemId: string;
  userId: string;
  type: "addition" | "removal" | "audit_match";
  quantity: number;
  reason: string;
  timestamp: string;
};

type SettingsState = {
  businessName: string;
  businessLogo?: string;
  isCompact: boolean;
  activeLanguage: "en" | "ar";
  themeMode: "light" | "dark";
  customThemeColors: {
    primary: string;
    secondary: string;
    background: string;
  };
  currencyRates: {
    usd: number;
    syp_new: number;
    syp_old: number;
    try: number;
  };
};

const defaultSettings: SettingsState = {
  businessName: "Warehouse Pro",
  businessLogo: "",
  isCompact: false,
  activeLanguage: "ar",
  themeMode: "dark",
  customThemeColors: {
    primary: "#0ea5e9",
    secondary: "#10b981",
    background: "#020617",
  },
  currencyRates: {
    usd: 1,
    syp_new: 6000,
    syp_old: 2500,
    try: 31,
  },
};

const initialItems: Item[] = [
  {
    id: "item-001",
    code: "WP-1001",
    name: "مجموعة صناديق تخزين",
    category: "General",
    stock: 58,
    cost: 12.5,
    price: 22.5,
    image: "https://images.unsplash.com/photo-1596495577886-d920f1fb6a46?auto=format&fit=crop&w=800&q=60",
  },
  {
    id: "item-002",
    code: "WP-1002",
    name: "قارئ باركود محمول",
    category: "Electronics",
    stock: 18,
    cost: 88,
    price: 149.99,
    image: "https://images.unsplash.com/photo-1527430253228-e93688616381?auto=format&fit=crop&w=800&q=60",
  },
  {
    id: "item-003",
    code: "WP-1003",
    name: "ملصقات سعرية أملس",
    category: "Supplies",
    stock: 240,
    cost: 0.3,
    price: 0.75,
    image: "https://images.unsplash.com/photo-1588072432836-e10032774350?auto=format&fit=crop&w=800&q=60",
  },
];

const tabs = [
  { id: "inventory", label: "المخزون", icon: "📦" },
  { id: "sales", label: "نقطة البيع", icon: "💳" },
  { id: "reports", label: "التقارير", icon: "📈" },
  { id: "calculator", label: "حسابات", icon: "🧮" },
  { id: "settings", label: "الإعدادات", icon: "⚙️" },
];

const initialBasket = {
  name: "POS 1",
  items: [] as TransactionItem[],
};

export default function Home() {
  const [activeTab, setActiveTab] = useState<string>("inventory");
  const [settings, setSettings] = useState<SettingsState>(defaultSettings);
  const [items, setItems] = useState<Item[]>(initialItems);
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [stockMovements, setStockMovements] = useState<StockMovement[]>([]);
  const [activeBasket, setActiveBasket] = useState<number>(0);
  const [baskets, setBaskets] = useState([{
    ...initialBasket,
    id: "pos-1",
  }, {
    ...initialBasket,
    id: "pos-2",
    name: "POS 2",
  }]);
  const [inventorySearch, setInventorySearch] = useState("");
  const [salesSearch, setSalesSearch] = useState("");
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [draftItem, setDraftItem] = useState<Partial<Item>>({
    code: "",
    name: "",
    category: "General",
    stock: 1,
    cost: 0,
    price: 0,
  });
  const [cameraActive, setCameraActive] = useState(false);
  const [calculatorExpression, setCalculatorExpression] = useState("0");
  const [converterValues, setConverterValues] = useState({ usd: 0, try: 0, syp_new: 0, syp_old: 0 });

  useEffect(() => {
    const saved = localStorage.getItem("warehouse-pro-state");
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        setSettings(parsed.settings ?? defaultSettings);
        setItems(parsed.items ?? initialItems);
        setTransactions(parsed.transactions ?? []);
        setStockMovements(parsed.stockMovements ?? []);
        setBaskets(parsed.baskets ?? baskets);
      } catch {
        return;
      }
    }
  }, []);

  useEffect(() => {
    document.documentElement.lang = settings.activeLanguage;
    document.documentElement.dir = settings.activeLanguage === "ar" ? "rtl" : "ltr";
    document.body.classList.toggle("dark", settings.themeMode === "dark");
    const payload = {
      settings,
      items,
      transactions,
      stockMovements,
      baskets,
    };
    localStorage.setItem("warehouse-pro-state", JSON.stringify(payload));
  }, [settings, items, transactions, stockMovements, baskets]);

  const filteredInventory = useMemo(() => {
    const query = inventorySearch.trim().toLowerCase();
    if (!query) return items;
    return items.filter(
      (item) =>
        item.name.toLowerCase().includes(query) ||
        item.code.toLowerCase().includes(query) ||
        item.category.toLowerCase().includes(query)
    );
  }, [inventorySearch, items]);

  const filteredSalesItems = useMemo(() => {
    const query = salesSearch.trim().toLowerCase();
    if (!query) return items;
    return items.filter((item) => item.name.toLowerCase().includes(query) || item.code.toLowerCase().includes(query));
  }, [salesSearch, items]);

  const activeBasketState = baskets[activeBasket];

  const formatMoney = (value: number, currency: "usd" | "try" | "syp_new" | "syp_old") => {
    if (currency === "usd") {
      return new Intl.NumberFormat(settings.activeLanguage === "ar" ? "ar-EG" : "en-US", {
        style: "currency",
        currency: "USD",
      }).format(value);
    }
    if (currency === "try") {
      return new Intl.NumberFormat(settings.activeLanguage === "ar" ? "ar-EG" : "en-US", {
        style: "currency",
        currency: "TRY",
      }).format(value);
    }
    const suffix = currency === "syp_new" ? "SYP (New)" : "SYP (Old)";
    return `${(value * settings.currencyRates[currency]).toLocaleString(settings.activeLanguage === "ar" ? "ar-EG" : "en-US", {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    })} ${suffix}`;
  };

  const totalStockValuation = items.reduce((sum, item) => sum + item.stock * item.cost, 0);
  const totalSalesRevenue = transactions.reduce((sum, tx) => sum + tx.totalRevenue, 0);
  const totalProfit = transactions.reduce((sum, tx) => sum + tx.totalProfit, 0);
  const historicalSalesCount = transactions.length;

  const handleOpenDrawer = (item?: Item) => {
    if (item) {
      setEditingId(item.id);
      setDraftItem({ ...item });
    } else {
      setEditingId(null);
      setDraftItem({ code: "", name: "", category: "General", stock: 1, cost: 0, price: 0, image: "" });
    }
    setDrawerOpen(true);
  };

  const handleSaveItem = () => {
    if (!draftItem.name || !draftItem.code) return;
    if (editingId) {
      setItems((current) =>
        current.map((item) =>
          item.id === editingId
            ? {
                ...(item as Item),
                code: draftItem.code ?? item.code,
                name: draftItem.name ?? item.name,
                category: draftItem.category ?? item.category,
                cost: Number(draftItem.cost ?? item.cost),
                price: Number(draftItem.price ?? item.price),
                stock: Number(draftItem.stock ?? item.stock),
                image: draftItem.image ?? item.image,
              }
            : item
        )
      );
    } else {
      setItems((current) => [
        {
          id: `item-${Date.now()}`,
          code: draftItem.code ?? "",
          name: draftItem.name ?? "",
          category: draftItem.category ?? "General",
          cost: Number(draftItem.cost ?? 0),
          price: Number(draftItem.price ?? 0),
          stock: Number(draftItem.stock ?? 0),
          image: draftItem.image,
        },
        ...current,
      ]);
      setStockMovements((curr) => [
        {
          id: `move-${Date.now()}`,
          itemId: `item-${Date.now()}`,
          userId: "system",
          type: "addition",
          quantity: Number(draftItem.stock ?? 0),
          reason: "Initial stock added",
          timestamp: new Date().toISOString(),
        },
        ...curr,
      ]);
    }
    setDrawerOpen(false);
    setDraftItem({ code: "", name: "", category: "General", stock: 1, cost: 0, price: 0, image: "" });
  };

  const handleDeleteItem = (id: string) => {
    setItems((current) => current.filter((item) => item.id !== id));
    setStockMovements((curr) => [
      {
        id: `move-${Date.now()}`,
        itemId: id,
        userId: "system",
        type: "removal",
        quantity: 0,
        reason: "Item deleted",
        timestamp: new Date().toISOString(),
      },
      ...curr,
    ]);
  };

  const handleAddToBasket = (item: Item) => {
    if (item.stock <= 0) return;
    const basket = baskets[activeBasket];
    const existing = basket.items.find((line) => line.itemId === item.id);
    const updatedItem: TransactionItem = {
      id: `${item.id}-${Date.now()}`,
      transactionId: "pending",
      itemId: item.id,
      itemName: item.name,
      qty: 1,
      unitCost: item.cost,
      unitPrice: item.price,
      subtotalRevenue: item.price,
      subtotalProfit: item.price - item.cost,
    };
    const updatedItems = existing
      ? basket.items.map((line) =>
          line.itemId === item.id
            ? {
                ...line,
                qty: line.qty + 1,
                subtotalRevenue: (line.qty + 1) * line.unitPrice,
                subtotalProfit: (line.qty + 1) * (line.unitPrice - line.unitCost),
              }
            : line
        )
      : [...basket.items, updatedItem];
    setBaskets((current) =>
      current.map((b, index) => (index === activeBasket ? { ...b, items: updatedItems } : b))
    );
    setItems((current) =>
      current.map((product) =>
        product.id === item.id ? { ...product, stock: Math.max(product.stock - 1, 0) } : product
      )
    );
    setStockMovements((curr) => [
      {
        id: `move-${Date.now()}`,
        itemId: item.id,
        userId: "system",
        type: "removal",
        quantity: 1,
        reason: "POS sale prep",
        timestamp: new Date().toISOString(),
      },
      ...curr,
    ]);
  };

  const basketTotals = useMemo(() => {
    const total = activeBasketState.items.reduce((sum, line) => sum + line.subtotalRevenue, 0);
    const profit = activeBasketState.items.reduce((sum, line) => sum + line.subtotalProfit, 0);
    return { total, profit };
  }, [activeBasketState]);

  const handleCheckout = () => {
    if (!activeBasketState.items.length) return;
    const tx: Transaction = {
      id: `TX-${Date.now()}`,
      receiptName: activeBasketState.name,
      totalRevenue: basketTotals.total,
      totalProfit: basketTotals.profit,
      createdAt: new Date().toISOString(),
      items: activeBasketState.items,
    };
    setTransactions((current) => [tx, ...current]);
    setBaskets((current) =>
      current.map((b, index) => (index === activeBasket ? { ...b, items: [] } : b))
    );
    window.alert(settings.activeLanguage === "ar" ? "تمت عملية البيع بنجاح" : "Sale completed successfully");
  };

  const statTimeFrame = "All Time";

  const activeCardClass = (id: string) =>
    `min-w-[70px] flex-shrink-0 rounded-2xl border px-4 py-3 text-sm font-semibold transition ${
      activeTab === id
        ? "border-primary bg-primary/10 text-primary"
        : "border-slate-200 bg-white text-slate-800 dark:border-slate-700 dark:bg-slate-950 dark:text-slate-200"
    }`;

  const themeClasses = settings.themeMode === "dark" ? "bg-slate-950 text-slate-100" : "bg-slate-50 text-slate-900";

  return (
    <div className={`${themeClasses} min-h-screen font-sans transition-colors duration-300`}>
      <div className="mx-auto flex min-h-screen max-w-[1700px] flex-col md:flex-row">
        <aside className="z-20 flex h-full w-full flex-col border-b border-slate-200 bg-gradient-to-b from-slate-900 via-slate-950 to-slate-900 px-4 py-5 text-slate-100 shadow-xl md:w-[280px] md:border-r md:border-b-0 md:px-5 md:pt-8">
          <div className="flex items-center justify-between gap-3">
            <div>
              <div className="rounded-3xl border border-white/10 bg-white/5 p-3 text-lg font-black uppercase tracking-[0.2em] text-cyan-200 shadow-lg shadow-cyan-500/10">
                WP
              </div>
              <p className="mt-5 text-sm text-slate-400">Warehouse Pro</p>
              <h1 className="mt-2 text-2xl font-semibold tracking-tight text-white">
                {settings.businessName}
              </h1>
            </div>
            <div className="hidden md:block">
              <button
                onClick={() => setSettings((s) => ({ ...s, activeLanguage: s.activeLanguage === "ar" ? "en" : "ar" }))}
                className="rounded-2xl border border-white/15 bg-white/10 px-4 py-2 text-sm text-white transition hover:bg-white/15"
              >
                {settings.activeLanguage === "ar" ? "EN" : "AR"}
              </button>
            </div>
          </div>

          <nav className="mt-10 flex w-full flex-col gap-2 overflow-x-auto pb-4 md:block">
            <div className="hidden md:block text-xs uppercase tracking-[0.25em] text-slate-500">Navigation</div>
            <div className="flex flex-row gap-2 md:flex-col md:gap-3">
              {tabs.map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={activeCardClass(tab.id)}
                >
                  <span className="mr-2 text-lg">{tab.icon}</span>
                  <span>{tab.label}</span>
                </button>
              ))}
            </div>
          </nav>

          <div className="mt-auto hidden space-y-3 rounded-3xl border border-white/10 bg-white/5 p-4 text-sm text-slate-200 md:block">
            <p className="font-semibold text-slate-100">Live Status</p>
            <p className="text-slate-400">Realtime updates active for devices in the same browser.</p>
            <div className="grid grid-cols-3 gap-2 text-center text-xs">
              <span className="rounded-2xl bg-white/5 px-2 py-1">اللغة: {settings.activeLanguage}</span>
              <span className="rounded-2xl bg-white/5 px-2 py-1">الوضع: {settings.themeMode}</span>
              <span className="rounded-2xl bg-white/5 px-2 py-1">POS: {activeBasket + 1}</span>
            </div>
          </div>
        </aside>

        <main className="flex-1 p-4 md:p-6">
          <header className="mb-6 flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
            <div>
              <p className="text-sm uppercase tracking-[0.3em] text-slate-500">{settings.activeLanguage === "ar" ? "لوحة التحكم" : "Dashboard"}</p>
              <h2 className="mt-3 text-3xl font-bold text-slate-900 dark:text-slate-100">
                {tabs.find((tab) => tab.id === activeTab)?.label}
              </h2>
            </div>
            <div className="flex flex-wrap items-center gap-3">
              <button
                onClick={() => setSettings((s) => ({ ...s, themeMode: s.themeMode === "dark" ? "light" : "dark" }))}
                className="rounded-2xl border border-slate-300 bg-white px-4 py-2 text-sm text-slate-700 transition hover:border-slate-400 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-100"
              >
                {settings.themeMode === "dark" ? "Light Mode" : "Dark Mode"}
              </button>
              <button
                onClick={() => setSettings((s) => ({ ...s, activeLanguage: s.activeLanguage === "ar" ? "en" : "ar" }))}
                className="rounded-2xl border border-slate-300 bg-white px-4 py-2 text-sm text-slate-700 transition hover:border-slate-400 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-100"
              >
                {settings.activeLanguage === "ar" ? "English" : "عربي"}
              </button>
            </div>
          </header>

          {activeTab === "inventory" && (
            <section className="space-y-6">
              <div className="flex flex-col gap-4 xl:flex-row xl:items-end xl:justify-between">
                <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
                  <div className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm dark:border-slate-800 dark:bg-slate-950">
                    <p className="text-sm text-slate-500">{settings.activeLanguage === "ar" ? "قيمة المخزون" : "Stock Value"}</p>
                    <p className="mt-3 text-2xl font-semibold text-slate-900 dark:text-white">{formatMoney(totalStockValuation, "usd")}</p>
                  </div>
                  <div className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm dark:border-slate-800 dark:bg-slate-950">
                    <p className="text-sm text-slate-500">{settings.activeLanguage === "ar" ? "إجمالي المبيعات" : "Sales Revenue"}</p>
                    <p className="mt-3 text-2xl font-semibold text-slate-900 dark:text-white">{formatMoney(totalSalesRevenue, "usd")}</p>
                  </div>
                  <div className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm dark:border-slate-800 dark:bg-slate-950">
                    <p className="text-sm text-slate-500">{settings.activeLanguage === "ar" ? "صافي الربح" : "Net Margin"}</p>
                    <p className="mt-3 text-2xl font-semibold text-emerald-500">{formatMoney(totalProfit, "usd")}</p>
                  </div>
                  <div className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm dark:border-slate-800 dark:bg-slate-950">
                    <p className="text-sm text-slate-500">{settings.activeLanguage === "ar" ? "عدد الفواتير" : "Sales Count"}</p>
                    <p className="mt-3 text-2xl font-semibold text-slate-900 dark:text-white">{historicalSalesCount}</p>
                  </div>
                </div>
                <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
                  <button
                    onClick={() => handleOpenDrawer()}
                    className="inline-flex items-center justify-center rounded-3xl bg-cyan-600 px-5 py-3 text-sm font-semibold text-white transition hover:bg-cyan-500"
                  >
                    {settings.activeLanguage === "ar" ? "إضافة منتج جديد" : "Add Product"}
                  </button>
                  <div className="grid gap-2 sm:grid-cols-2">
                    <input
                      value={inventorySearch}
                      onChange={(e) => setInventorySearch(e.target.value)}
                      placeholder={settings.activeLanguage === "ar" ? "ابحث في المنتجات" : "Search products"}
                      className="rounded-3xl border border-slate-300 bg-slate-50 px-4 py-3 text-sm text-slate-900 outline-none transition focus:border-cyan-500 focus:ring-2 focus:ring-cyan-200 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-100"
                    />
                    <div className="rounded-3xl border border-slate-300 bg-slate-50 p-3 text-sm dark:border-slate-700 dark:bg-slate-900">
                      <p className="text-slate-500">{settings.activeLanguage === "ar" ? "تحكم الكاميرا" : "Camera Simulator"}</p>
                      <button
                        onClick={() => setCameraActive((prev) => !prev)}
                        className="mt-3 w-full rounded-2xl bg-slate-900 px-3 py-2 text-white transition hover:bg-slate-800"
                      >
                        {cameraActive ? (settings.activeLanguage === "ar" ? "إيقاف المحاكاة" : "Stop") : (settings.activeLanguage === "ar" ? "تشغيل المحاكاة" : "Start")}
                      </button>
                    </div>
                  </div>
                </div>
              </div>

              <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
                {filteredInventory.map((item) => (
                  <div key={item.id} className="group rounded-[32px] border border-slate-200 bg-white p-5 shadow-sm transition hover:-translate-y-0.5 hover:shadow-xl dark:border-slate-800 dark:bg-slate-950">
                    <div className="relative aspect-[4/3] overflow-hidden rounded-3xl bg-slate-100">
                      {item.image ? (
                        <img src={item.image} alt={item.name} className="h-full w-full object-cover" />
                      ) : (
                        <div className="flex h-full items-center justify-center text-slate-400">No Image</div>
                      )}
                    </div>
                    <div className="mt-4 flex items-center justify-between gap-3">
                      <div>
                        <p className="text-sm text-slate-500">{item.category}</p>
                        <h3 className="mt-2 text-xl font-semibold text-slate-900 dark:text-slate-100">{item.name}</h3>
                      </div>
                      <div className="rounded-3xl bg-cyan-600 px-3 py-2 text-sm font-semibold text-white">{item.code}</div>
                    </div>
                    <div className="mt-4 grid gap-2 text-sm text-slate-500 sm:grid-cols-2">
                      <div>{settings.activeLanguage === "ar" ? "الكمية" : "Stock"}: {item.stock}</div>
                      <div>{settings.activeLanguage === "ar" ? "سعر التكلفة" : "Cost"}: {formatMoney(item.cost, "usd")}</div>
                      <div>{settings.activeLanguage === "ar" ? "سعر البيع" : "Price"}: {formatMoney(item.price, "usd")}</div>
                      <div>{settings.activeLanguage === "ar" ? "التقييم" : "Valuation"}: {formatMoney(item.stock * item.cost, "usd")}</div>
                    </div>
                    <div className="mt-5 flex flex-wrap items-center gap-3">
                      <button
                        onClick={() => handleOpenDrawer(item)}
                        className="rounded-3xl border border-slate-200 px-4 py-3 text-sm font-semibold text-slate-700 transition hover:bg-slate-50 dark:border-slate-700 dark:text-slate-100 dark:hover:bg-slate-800"
                      >
                        {settings.activeLanguage === "ar" ? "تعديل" : "Edit"}
                      </button>
                      <button
                        onClick={() => handleDeleteItem(item.id)}
                        className="rounded-3xl bg-rose-500 px-4 py-3 text-sm font-semibold text-white transition hover:bg-rose-400"
                      >
                        {settings.activeLanguage === "ar" ? "حذف" : "Delete"}
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </section>
          )}

          {activeTab === "sales" && (
            <section className="space-y-6">
              <div className="flex flex-col gap-4 xl:flex-row xl:items-end xl:justify-between">
                <div className="space-y-3">
                  <p className="text-sm uppercase tracking-[0.25em] text-slate-500">{settings.activeLanguage === "ar" ? "مسارات نقاط البيع" : "POS Buffers"}</p>
                  <div className="flex flex-wrap gap-3">
                    {baskets.map((basket, index) => (
                      <button
                        key={basket.id}
                        onClick={() => setActiveBasket(index)}
                        className={`rounded-3xl px-4 py-3 text-sm font-semibold transition ${activeBasket === index ? "bg-cyan-600 text-white" : "border border-slate-300 bg-white text-slate-800 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-100"}`}
                      >
                        {basket.name}
                      </button>
                    ))}
                  </div>
                </div>
                <div className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm dark:border-slate-800 dark:bg-slate-950">
                  <p className="text-sm text-slate-500">{settings.activeLanguage === "ar" ? "إجمالي الإجمالي" : "Basket Total"}</p>
                  <p className="mt-3 text-3xl font-semibold text-slate-900 dark:text-white">{formatMoney(basketTotals.total, "usd")}</p>
                  <p className="mt-2 text-sm text-emerald-500">{settings.activeLanguage === "ar" ? "الربح المحتمل" : "Profit"}: {formatMoney(basketTotals.profit, "usd")}</p>
                </div>
              </div>

              <div className="grid gap-6 xl:grid-cols-[1.5fr_1fr]">
                <div className="space-y-4 rounded-3xl border border-slate-200 bg-white p-5 shadow-sm dark:border-slate-800 dark:bg-slate-950">
                  <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                    <div>
                      <h3 className="text-lg font-semibold text-slate-900 dark:text-slate-100">{settings.activeLanguage === "ar" ? "بحث المنتج" : "Product Lookup"}</h3>
                      <p className="text-sm text-slate-500">{settings.activeLanguage === "ar" ? "اضغط لإضافة المنتج إلى السلة" : "Click any item to add it to the basket."}</p>
                    </div>
                    <input
                      value={salesSearch}
                      onChange={(e) => setSalesSearch(e.target.value)}
                      placeholder={settings.activeLanguage === "ar" ? "ابحث عن منتج" : "Search item"}
                      className="rounded-3xl border border-slate-300 bg-slate-50 px-4 py-3 text-sm text-slate-900 outline-none transition focus:border-cyan-500 focus:ring-2 focus:ring-cyan-200 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-100"
                    />
                  </div>

                  <div className="grid gap-3 sm:grid-cols-2">
                    {filteredSalesItems.map((item) => (
                      <button
                        key={item.id}
                        onClick={() => handleAddToBasket(item)}
                        className="rounded-3xl border border-slate-200 bg-slate-50 p-4 text-left transition hover:border-cyan-500 hover:bg-cyan-50 dark:border-slate-700 dark:bg-slate-900 dark:hover:border-cyan-500 dark:hover:bg-cyan-950"
                      >
                        <div className="flex items-center justify-between gap-3">
                          <div>
                            <p className="text-sm text-slate-500">{item.code}</p>
                            <h4 className="mt-2 text-base font-semibold text-slate-900 dark:text-slate-100">{item.name}</h4>
                          </div>
                          <span className="rounded-2xl bg-slate-200 px-3 py-2 text-xs font-semibold text-slate-700 dark:bg-slate-800 dark:text-slate-200">{item.stock} {settings.activeLanguage === "ar" ? "بالكمية" : "in stock"}</span>
                        </div>
                        <div className="mt-3 flex items-center justify-between text-sm text-slate-500">
                          <span>{settings.activeLanguage === "ar" ? "سعر" : "Price"}: {formatMoney(item.price, "usd")}</span>
                          <span>{settings.activeLanguage === "ar" ? "التكلفة" : "Cost"}: {formatMoney(item.cost, "usd")}</span>
                        </div>
                      </button>
                    ))}
                  </div>
                </div>

                <div className="space-y-4 rounded-3xl border border-slate-200 bg-white p-5 shadow-sm dark:border-slate-800 dark:bg-slate-950">
                  <div className="flex items-center justify-between gap-3">
                    <h3 className="text-lg font-semibold text-slate-900 dark:text-slate-100">{settings.activeLanguage === "ar" ? "سلة المشتريات" : "Checkout Basket"}</h3>
                    <button
                      onClick={handleCheckout}
                      className="rounded-3xl bg-cyan-600 px-4 py-3 text-sm font-semibold text-white transition hover:bg-cyan-500"
                    >
                      {settings.activeLanguage === "ar" ? "إتمام البيع" : "Complete Sale"}
                    </button>
                  </div>
                  <div className="space-y-3">
                    {activeBasketState.items.length ? (
                      activeBasketState.items.map((line) => (
                        <div key={line.id} className="rounded-3xl border border-slate-200 bg-slate-50 p-4 dark:border-slate-700 dark:bg-slate-900">
                          <div className="flex items-center justify-between gap-3">
                            <div>
                              <p className="text-sm text-slate-500">{line.itemName}</p>
                              <p className="mt-2 text-base font-semibold text-slate-900 dark:text-slate-100">{line.qty} x {formatMoney(line.unitPrice, "usd")}</p>
                            </div>
                            <p className="text-sm text-slate-500">{formatMoney(line.subtotalRevenue, "usd")}</p>
                          </div>
                        </div>
                      ))
                    ) : (
                      <div className="rounded-3xl border border-dashed border-slate-300 p-6 text-center text-slate-500 dark:border-slate-700">
                        {settings.activeLanguage === "ar" ? "السلة فارغة" : "Basket is empty"}
                      </div>
                    )}
                  </div>
                  <div className="rounded-3xl border border-slate-200 bg-slate-50 p-4 dark:border-slate-700 dark:bg-slate-900">
                    <p className="text-sm text-slate-500">{settings.activeLanguage === "ar" ? "المبالغ حسب العملات" : "Register Exchange Rates"}</p>
                    <div className="mt-3 grid gap-3 text-sm sm:grid-cols-2">
                      <div>{formatMoney(basketTotals.total, "usd")}</div>
                      <div>{formatMoney(basketTotals.total, "try")}</div>
                      <div>{formatMoney(basketTotals.total, "syp_new")}</div>
                      <div>{formatMoney(basketTotals.total, "syp_old")}</div>
                    </div>
                  </div>
                </div>
              </div>
            </section>
          )}

          {activeTab === "reports" && (
            <section className="space-y-6">
              <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
                <div className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm dark:border-slate-800 dark:bg-slate-950">
                  <p className="text-sm text-slate-500">{settings.activeLanguage === "ar" ? "قيمة المخزون" : "Stock Value"}</p>
                  <p className="mt-3 text-2xl font-semibold text-slate-900 dark:text-white">{formatMoney(totalStockValuation, "usd")}</p>
                </div>
                <div className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm dark:border-slate-800 dark:bg-slate-950">
                  <p className="text-sm text-slate-500">{settings.activeLanguage === "ar" ? "المبيعات" : "Revenue"}</p>
                  <p className="mt-3 text-2xl font-semibold text-slate-900 dark:text-white">{formatMoney(totalSalesRevenue, "usd")}</p>
                </div>
                <div className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm dark:border-slate-800 dark:bg-slate-950">
                  <p className="text-sm text-slate-500">{settings.activeLanguage === "ar" ? "الربح الصافي" : "Net Profit"}</p>
                  <p className="mt-3 text-2xl font-semibold text-emerald-500">{formatMoney(totalProfit, "usd")}</p>
                </div>
                <div className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm dark:border-slate-800 dark:bg-slate-950">
                  <p className="text-sm text-slate-500">{settings.activeLanguage === "ar" ? "عدد الفواتير" : "Invoice Count"}</p>
                  <p className="mt-3 text-2xl font-semibold text-slate-900 dark:text-white">{transactions.length}</p>
                </div>
              </div>

              <div className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm dark:border-slate-800 dark:bg-slate-950">
                <div className="flex flex-col gap-4 xl:flex-row xl:items-center xl:justify-between">
                  <div>
                    <h3 className="text-lg font-semibold text-slate-900 dark:text-slate-100">{settings.activeLanguage === "ar" ? "سجل الفواتير" : "Receipts Log"}</h3>
                    <p className="text-sm text-slate-500">{settings.activeLanguage === "ar" ? "تاريخ المبيعات والخيارات" : "Recent sales and actions."}</p>
                  </div>
                  <button className="rounded-3xl bg-cyan-600 px-4 py-3 text-sm font-semibold text-white transition hover:bg-cyan-500">
                    {settings.activeLanguage === "ar" ? "تنزيل كشف PDF" : "Download PDF"}
                  </button>
                </div>

                <div className="mt-5 overflow-x-auto">
                  <table className="min-w-full text-left text-sm text-slate-600 dark:text-slate-300">
                    <thead className="border-b border-slate-200 text-slate-500 dark:border-slate-700 dark:text-slate-400">
                      <tr>
                        <th className="px-4 py-3">{settings.activeLanguage === "ar" ? "التاريخ" : "Date"}</th>
                        <th className="px-4 py-3">TX ID</th>
                        <th className="px-4 py-3">{settings.activeLanguage === "ar" ? "الإجمالي" : "Revenue"}</th>
                        <th className="px-4 py-3">{settings.activeLanguage === "ar" ? "الربح" : "Profit"}</th>
                        <th className="px-4 py-3">{settings.activeLanguage === "ar" ? "إجراءات" : "Actions"}</th>
                      </tr>
                    </thead>
                    <tbody>
                      {transactions.map((tx) => (
                        <tr key={tx.id} className="border-b border-slate-200 dark:border-slate-700">
                          <td className="px-4 py-4">{new Date(tx.createdAt).toLocaleDateString(settings.activeLanguage === "ar" ? "ar-EG" : "en-US")}</td>
                          <td className="px-4 py-4 font-medium text-slate-900 dark:text-slate-100">{tx.id}</td>
                          <td className="px-4 py-4">{formatMoney(tx.totalRevenue, "usd")}</td>
                          <td className="px-4 py-4 text-emerald-500">{formatMoney(tx.totalProfit, "usd")}</td>
                          <td className="px-4 py-4 space-x-2 rtl:space-x-reverse rtl:space-x-0">
                            <button className="rounded-2xl bg-slate-100 px-3 py-2 text-xs font-semibold text-slate-700 transition hover:bg-slate-200 dark:bg-slate-800 dark:text-slate-200">PDF</button>
                            <button className="rounded-2xl bg-slate-100 px-3 py-2 text-xs font-semibold text-slate-700 transition hover:bg-slate-200 dark:bg-slate-800 dark:text-slate-200">View</button>
                            <button className="rounded-2xl bg-rose-500 px-3 py-2 text-xs font-semibold text-white transition hover:bg-rose-400">Delete</button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>

              <div className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm dark:border-slate-800 dark:bg-slate-950">
                <h3 className="text-lg font-semibold text-slate-900 dark:text-slate-100">{settings.activeLanguage === "ar" ? "تقرير الربح" : "Profit Statement"}</h3>
                <div className="mt-4 overflow-x-auto">
                  <table className="min-w-full text-left text-sm text-slate-600 dark:text-slate-300">
                    <thead className="border-b border-slate-200 text-slate-500 dark:border-slate-700 dark:text-slate-400">
                      <tr>
                        <th className="px-4 py-3">{settings.activeLanguage === "ar" ? "التاريخ" : "Date"}</th>
                        <th className="px-4 py-3">{settings.activeLanguage === "ar" ? "الفاتورة" : "Invoice"}</th>
                        <th className="px-4 py-3">{settings.activeLanguage === "ar" ? "التكلفة" : "Cost"}</th>
                        <th className="px-4 py-3">{settings.activeLanguage === "ar" ? "الإيراد" : "Revenue"}</th>
                        <th className="px-4 py-3">{settings.activeLanguage === "ar" ? "الربح" : "Profit"}</th>
                      </tr>
                    </thead>
                    <tbody>
                      {transactions.map((tx) => (
                        <tr key={`profit-${tx.id}`} className="border-b border-slate-200 dark:border-slate-700">
                          <td className="px-4 py-4">{new Date(tx.createdAt).toLocaleDateString(settings.activeLanguage === "ar" ? "ar-EG" : "en-US")}</td>
                          <td className="px-4 py-4">{tx.id}</td>
                          <td className="px-4 py-4">{formatMoney(tx.totalRevenue - tx.totalProfit, "usd")}</td>
                          <td className="px-4 py-4">{formatMoney(tx.totalRevenue, "usd")}</td>
                          <td className="px-4 py-4 text-emerald-500">{formatMoney(tx.totalProfit, "usd")}</td>
                        </tr>
                      ))}
                    </tbody>
                    <tfoot className="border-t border-slate-200 text-slate-700 dark:border-slate-700 dark:text-slate-200">
                      <tr>
                        <td colSpan={2} className="px-4 py-4 font-semibold">{settings.activeLanguage === "ar" ? "الإجمالي" : "Totals"}</td>
                        <td className="px-4 py-4 font-semibold">{formatMoney(transactions.reduce((sum, tx) => sum + tx.totalRevenue - tx.totalProfit, 0), "usd")}</td>
                        <td className="px-4 py-4 font-semibold">{formatMoney(totalSalesRevenue, "usd")}</td>
                        <td className="px-4 py-4 font-semibold text-emerald-500">{formatMoney(totalProfit, "usd")}</td>
                      </tr>
                    </tfoot>
                  </table>
                </div>
              </div>
            </section>
          )}

          {activeTab === "calculator" && (
            <section className="space-y-6">
              <div className="grid gap-6 xl:grid-cols-[1fr_0.8fr]">
                <div className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm dark:border-slate-800 dark:bg-slate-950">
                  <div className="rounded-3xl border border-slate-200 bg-slate-50 p-5 text-right text-4xl font-semibold text-slate-900 dark:border-slate-700 dark:bg-slate-900 dark:text-white">
                    {calculatorExpression}
                  </div>
                  <div className="mt-5 grid grid-cols-4 gap-3">
                    {[
                      "7",
                      "8",
                      "9",
                      "/",
                      "4",
                      "5",
                      "6",
                      "*",
                      "1",
                      "2",
                      "3",
                      "-",
                      "0",
                      ".",
                      "=",
                      "+",
                    ].map((key) => (
                      <button
                        key={key}
                        onClick={() => {
                          if (key === "=") {
                            try {
                              setCalculatorExpression(String(eval(calculatorExpression) ?? 0));
                            } catch {
                              setCalculatorExpression("Error");
                            }
                          } else {
                            setCalculatorExpression((prev) => (prev === "0" || prev === "Error" ? key : prev + key));
                          }
                        }}
                        className="rounded-3xl bg-slate-100 px-4 py-5 text-xl font-semibold text-slate-800 transition hover:bg-slate-200 dark:bg-slate-800 dark:text-slate-100 dark:hover:bg-slate-700"
                      >
                        {key}
                      </button>
                    ))}
                    <button
                      onClick={() => setCalculatorExpression("0")}
                      className="col-span-2 rounded-3xl bg-rose-500 px-4 py-5 text-xl font-semibold text-white transition hover:bg-rose-400"
                    >
                      {settings.activeLanguage === "ar" ? "مسح" : "Clear"}
                    </button>
                  </div>
                </div>
                <div className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm dark:border-slate-800 dark:bg-slate-950">
                  <h3 className="text-lg font-semibold text-slate-900 dark:text-slate-100">{settings.activeLanguage === "ar" ? "محول العملات" : "Currency Converter"}</h3>
                  <div className="mt-4 grid gap-4">
                    {(["usd", "try", "syp_new", "syp_old"] as Array<keyof typeof converterValues>).map((currency) => (
                      <div key={currency} className="rounded-3xl border border-slate-200 bg-slate-50 p-4 dark:border-slate-700 dark:bg-slate-900">
                        <label className="text-xs uppercase tracking-[0.25em] text-slate-500">{currency.toUpperCase()}</label>
                        <input
                          type="number"
                          value={converterValues[currency]}
                          onChange={(e) => {
                            const value = Number(e.target.value || 0);
                            const ux = currency === "usd" ? value : value / settings.currencyRates[currency];
                            setConverterValues({
                              usd: Number(ux.toFixed(2)),
                              try: Number((ux * settings.currencyRates.try).toFixed(2)),
                              syp_new: Number((ux * settings.currencyRates.syp_new).toFixed(2)),
                              syp_old: Number((ux * settings.currencyRates.syp_old).toFixed(2)),
                            });
                          }}
                          className="mt-2 w-full rounded-3xl border border-slate-300 bg-white px-4 py-3 text-sm text-slate-900 outline-none dark:border-slate-700 dark:bg-slate-950 dark:text-slate-100"
                        />
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </section>
          )}

          {activeTab === "settings" && (
            <section className="space-y-6">
              <div className="grid gap-6 xl:grid-cols-2">
                <div className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm dark:border-slate-800 dark:bg-slate-950">
                  <h3 className="text-lg font-semibold text-slate-900 dark:text-slate-100">{settings.activeLanguage === "ar" ? "تخصيص العمل" : "Business Customization"}</h3>
                  <div className="mt-5 space-y-4">
                    <div>
                      <label className="text-sm font-medium text-slate-700 dark:text-slate-200">{settings.activeLanguage === "ar" ? "اسم النشاط" : "Business Name"}</label>
                      <input
                        value={settings.businessName}
                        onChange={(e) => setSettings((s) => ({ ...s, businessName: e.target.value }))}
                        className="mt-2 w-full rounded-3xl border border-slate-300 bg-slate-50 px-4 py-3 text-sm text-slate-900 outline-none dark:border-slate-700 dark:bg-slate-900 dark:text-slate-100"
                      />
                    </div>
                    <div>
                      <label className="text-sm font-medium text-slate-700 dark:text-slate-200">{settings.activeLanguage === "ar" ? "شعار النشاط" : "Business Logo"}</label>
                      <input
                        type="file"
                        accept="image/*"
                        onChange={(e) => {
                          const file = e.target.files?.[0];
                          if (!file) return;
                          const reader = new FileReader();
                          reader.onload = () => setSettings((s) => ({ ...s, businessLogo: reader.result as string }));
                          reader.readAsDataURL(file);
                        }}
                        className="mt-2 w-full rounded-3xl border border-slate-300 bg-slate-50 px-4 py-3 text-sm text-slate-900 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-100"
                      />
                      {settings.businessLogo && (
                        <img src={settings.businessLogo} alt="logo" className="mt-3 h-20 w-20 rounded-3xl object-cover" />
                      )}
                    </div>
                  </div>
                </div>

                <div className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm dark:border-slate-800 dark:bg-slate-950">
                  <h3 className="text-lg font-semibold text-slate-900 dark:text-slate-100">{settings.activeLanguage === "ar" ? "المظهر والعملة" : "Theme & Currency"}</h3>
                  <div className="mt-5 space-y-4">
                    <div className="grid gap-4 sm:grid-cols-2">
                      <label className="rounded-3xl border border-slate-300 bg-slate-50 p-4 text-sm dark:border-slate-700 dark:bg-slate-900">
                        <span className="block text-slate-500">{settings.activeLanguage === "ar" ? "الوضع" : "Theme"}</span>
                        <select
                          value={settings.themeMode}
                          onChange={(e) => setSettings((s) => ({ ...s, themeMode: e.target.value as "light" | "dark" }))}
                          className="mt-3 w-full rounded-2xl border border-slate-300 bg-white px-4 py-3 text-sm dark:border-slate-700 dark:bg-slate-950"
                        >
                          <option value="light">Light</option>
                          <option value="dark">Dark</option>
                        </select>
                      </label>
                      <label className="rounded-3xl border border-slate-300 bg-slate-50 p-4 text-sm dark:border-slate-700 dark:bg-slate-900">
                        <span className="block text-slate-500">{settings.activeLanguage === "ar" ? "عرض مدمج" : "Compact View"}</span>
                        <input
                          type="checkbox"
                          checked={settings.isCompact}
                          onChange={(e) => setSettings((s) => ({ ...s, isCompact: e.target.checked }))}
                          className="mt-3 h-5 w-5 rounded border-slate-300 text-cyan-600 focus:ring-cyan-500"
                        />
                      </label>
                    </div>
                    <div className="grid gap-3 sm:grid-cols-3">
                      {(["primary", "secondary", "background"] as const).map((colorKey) => (
                        <label key={colorKey} className="rounded-3xl border border-slate-300 bg-slate-50 p-4 text-sm dark:border-slate-700 dark:bg-slate-900">
                          <span className="block text-slate-500">{colorKey}</span>
                          <input
                            type="color"
                            value={settings.customThemeColors[colorKey]}
                            onChange={(e) =>
                              setSettings((s) => ({
                                ...s,
                                customThemeColors: { ...s.customThemeColors, [colorKey]: e.target.value },
                              }))
                            }
                            className="mt-3 h-12 w-full cursor-pointer rounded-2xl border border-slate-200 bg-white"
                          />
                        </label>
                      ))}
                    </div>
                    <div className="grid gap-4 sm:grid-cols-2">
                      {(["usd", "try", "syp_new", "syp_old"] as const).map((rateKey) => (
                        <label key={rateKey} className="rounded-3xl border border-slate-300 bg-slate-50 p-4 text-sm dark:border-slate-700 dark:bg-slate-900">
                          <span className="block text-slate-500">{rateKey.toUpperCase()}</span>
                          <input
                            type="number"
                            value={settings.currencyRates[rateKey]}
                            onChange={(e) =>
                              setSettings((s) => ({
                                ...s,
                                currencyRates: { ...s.currencyRates, [rateKey]: Number(e.target.value) },
                              }))
                            }
                            className="mt-3 w-full rounded-3xl border border-slate-300 bg-white px-4 py-3 text-sm dark:border-slate-700 dark:bg-slate-950"
                          />
                        </label>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            </section>
          )}
        </main>
      </div>

      {drawerOpen && (
        <div className="fixed inset-0 z-50 flex items-end justify-center bg-slate-950/60 p-4 backdrop-blur-sm md:items-center">
          <div className="w-full max-w-3xl rounded-[32px] bg-white p-6 shadow-2xl dark:bg-slate-950">
            <div className="flex items-center justify-between gap-4">
              <div>
                <p className="text-sm uppercase tracking-[0.25em] text-slate-500">{settings.activeLanguage === "ar" ? "نافذة المنتج" : "Product Panel"}</p>
                <h3 className="mt-2 text-2xl font-semibold text-slate-900 dark:text-slate-100">
                  {editingId ? (settings.activeLanguage === "ar" ? "تحديث المنتج" : "Update Item") : (settings.activeLanguage === "ar" ? "إضافة منتج" : "Add Product")}
                </h3>
              </div>
              <button onClick={() => setDrawerOpen(false)} className="rounded-3xl px-4 py-3 text-sm text-slate-700 transition hover:bg-slate-100 dark:text-slate-200 dark:hover:bg-slate-800">
                {settings.activeLanguage === "ar" ? "إغلاق" : "Close"}
              </button>
            </div>
            <div className="mt-6 grid gap-4 sm:grid-cols-2">
              {([
                { label: settings.activeLanguage === "ar" ? "رمز الباركود" : "Barcode Code", field: "code" },
                { label: settings.activeLanguage === "ar" ? "اسم المنتج" : "Item Name", field: "name" },
                { label: settings.activeLanguage === "ar" ? "الفئة" : "Category", field: "category" },
                { label: settings.activeLanguage === "ar" ? "سعر التكلفة" : "Cost", field: "cost" },
                { label: settings.activeLanguage === "ar" ? "سعر البيع" : "Price", field: "price" },
                { label: settings.activeLanguage === "ar" ? "الكمية" : "Stock", field: "stock" },
              ] as const).map(({ label, field }) => (
                <label key={field} className="block text-sm text-slate-600 dark:text-slate-300">
                  <span className="font-medium">{label}</span>
                  <input
                    value={(draftItem as any)[field] ?? ""}
                    onChange={(e) =>
                      setDraftItem((prev) => ({
                        ...prev,
                        [field]: field === "category" ? e.target.value : field === "name" || field === "code" ? e.target.value : Number(e.target.value),
                      }))
                    }
                    className="mt-2 w-full rounded-3xl border border-slate-300 bg-slate-50 px-4 py-3 text-sm text-slate-900 outline-none dark:border-slate-700 dark:bg-slate-900 dark:text-slate-100"
                  />
                </label>
              ))}
              <label className="block text-sm text-slate-600 dark:text-slate-300 sm:col-span-2">
                <span className="font-medium">{settings.activeLanguage === "ar" ? "تحميل صورة" : "Upload Image"}</span>
                <input
                  type="file"
                  accept="image/*"
                  onChange={(e) => {
                    const file = e.target.files?.[0];
                    if (!file) return;
                    const reader = new FileReader();
                    reader.onload = () => setDraftItem((prev) => ({ ...prev, image: reader.result as string }));
                    reader.readAsDataURL(file);
                  }}
                  className="mt-2 w-full rounded-3xl border border-slate-300 bg-slate-50 px-4 py-3 text-sm text-slate-900 outline-none dark:border-slate-700 dark:bg-slate-900 dark:text-slate-100"
                />
              </label>
            </div>
            <div className="mt-6 flex flex-wrap gap-3">
              <button onClick={handleSaveItem} className="rounded-3xl bg-cyan-600 px-6 py-3 text-sm font-semibold text-white transition hover:bg-cyan-500">
                {settings.activeLanguage === "ar" ? "حفظ" : "Save"}
              </button>
              <button onClick={() => setDrawerOpen(false)} className="rounded-3xl border border-slate-300 px-6 py-3 text-sm font-semibold text-slate-700 transition hover:bg-slate-100 dark:border-slate-700 dark:text-slate-200 dark:hover:bg-slate-800">
                {settings.activeLanguage === "ar" ? "إلغاء" : "Cancel"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
