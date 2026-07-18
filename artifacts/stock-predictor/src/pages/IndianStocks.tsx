import { useState, useEffect, useCallback, useRef } from "react";
import { useLocation } from "wouter";
import { motion, AnimatePresence } from "framer-motion";
import {
  LineChart, Line, ResponsiveContainer, Tooltip as ReTooltip,
} from "recharts";
import {
  Search, Star, TrendingUp, TrendingDown, RefreshCw, ArrowUpDown,
  ChevronUp, ChevronDown, Flame, Zap, BarChart2, Filter,
  SlidersHorizontal,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";

// ─────────────────────────────────────────────────────────────────────────────
// Static master list of Indian stocks
// ─────────────────────────────────────────────────────────────────────────────

type StockMeta = {
  symbol: string;
  name: string;
  sector: string;
  marketCapCr: number; // approximate, INR crore
};

const STOCKS: StockMeta[] = [
  // Banking & Financial
  { symbol: "HDFCBANK.NS",   name: "HDFC Bank",              sector: "Banking",    marketCapCr: 1180000 },
  { symbol: "ICICIBANK.NS",  name: "ICICI Bank",             sector: "Banking",    marketCapCr: 890000  },
  { symbol: "SBIN.NS",       name: "State Bank of India",    sector: "Banking",    marketCapCr: 720000  },
  { symbol: "AXISBANK.NS",   name: "Axis Bank",              sector: "Banking",    marketCapCr: 400000  },
  { symbol: "KOTAKBANK.NS",  name: "Kotak Mahindra Bank",    sector: "Banking",    marketCapCr: 380000  },
  { symbol: "INDUSINDBK.NS", name: "IndusInd Bank",          sector: "Banking",    marketCapCr: 85000   },
  { symbol: "BAJFINANCE.NS", name: "Bajaj Finance",          sector: "Banking",    marketCapCr: 450000  },
  { symbol: "BAJAJFINSV.NS", name: "Bajaj Finserv",          sector: "Banking",    marketCapCr: 250000  },
  // IT
  { symbol: "TCS.NS",        name: "Tata Consultancy Services", sector: "IT",     marketCapCr: 1450000 },
  { symbol: "INFY.NS",       name: "Infosys",                sector: "IT",         marketCapCr: 700000  },
  { symbol: "WIPRO.NS",      name: "Wipro",                  sector: "IT",         marketCapCr: 270000  },
  { symbol: "HCLTECH.NS",    name: "HCL Technologies",       sector: "IT",         marketCapCr: 430000  },
  { symbol: "TECHM.NS",      name: "Tech Mahindra",          sector: "IT",         marketCapCr: 120000  },
  { symbol: "LTIM.NS",       name: "LTIMindtree",            sector: "IT",         marketCapCr: 150000  },
  { symbol: "PERSISTENT.NS", name: "Persistent Systems",     sector: "IT",         marketCapCr: 90000   },
  // Oil & Energy
  { symbol: "RELIANCE.NS",   name: "Reliance Industries",    sector: "Energy",     marketCapCr: 1950000 },
  { symbol: "ONGC.NS",       name: "ONGC",                   sector: "Energy",     marketCapCr: 380000  },
  { symbol: "BPCL.NS",       name: "BPCL",                   sector: "Energy",     marketCapCr: 145000  },
  { symbol: "IOC.NS",        name: "Indian Oil Corporation", sector: "Energy",     marketCapCr: 200000  },
  { symbol: "GAIL.NS",       name: "GAIL",                   sector: "Energy",     marketCapCr: 120000  },
  { symbol: "NTPC.NS",       name: "NTPC",                   sector: "Energy",     marketCapCr: 370000  },
  { symbol: "POWERGRID.NS",  name: "Power Grid",             sector: "Energy",     marketCapCr: 280000  },
  { symbol: "TATAPOWER.NS",  name: "Tata Power",             sector: "Energy",     marketCapCr: 130000  },
  { symbol: "ADANIGREEN.NS", name: "Adani Green Energy",     sector: "Energy",     marketCapCr: 200000  },
  { symbol: "ADANIPOWER.NS", name: "Adani Power",            sector: "Energy",     marketCapCr: 180000  },
  // Automobile
  { symbol: "MARUTI.NS",     name: "Maruti Suzuki",          sector: "Auto",       marketCapCr: 380000  },
  { symbol: "TATAMOTORS.NS", name: "Tata Motors",            sector: "Auto",       marketCapCr: 330000  },
  { symbol: "M&M.NS",        name: "Mahindra & Mahindra",    sector: "Auto",       marketCapCr: 340000  },
  { symbol: "HEROMOTOCO.NS", name: "Hero MotoCorp",          sector: "Auto",       marketCapCr: 110000  },
  { symbol: "BAJAJ-AUTO.NS", name: "Bajaj Auto",             sector: "Auto",       marketCapCr: 260000  },
  { symbol: "EICHERMOT.NS",  name: "Eicher Motors",          sector: "Auto",       marketCapCr: 120000  },
  // Consumer Goods
  { symbol: "HINDUNILVR.NS", name: "Hindustan Unilever",     sector: "FMCG",       marketCapCr: 560000  },
  { symbol: "ITC.NS",        name: "ITC",                    sector: "FMCG",       marketCapCr: 590000  },
  { symbol: "NESTLEIND.NS",  name: "Nestlé India",           sector: "FMCG",       marketCapCr: 230000  },
  { symbol: "BRITANNIA.NS",  name: "Britannia Industries",   sector: "FMCG",       marketCapCr: 120000  },
  { symbol: "DABUR.NS",      name: "Dabur India",            sector: "FMCG",       marketCapCr: 90000   },
  { symbol: "GODREJCP.NS",   name: "Godrej Consumer Products", sector: "FMCG",     marketCapCr: 110000  },
  { symbol: "TATACONSUM.NS", name: "Tata Consumer Products", sector: "FMCG",       marketCapCr: 100000  },
  // Pharmaceuticals
  { symbol: "SUNPHARMA.NS",  name: "Sun Pharmaceutical",     sector: "Pharma",     marketCapCr: 430000  },
  { symbol: "DRREDDY.NS",    name: "Dr. Reddy's Laboratories", sector: "Pharma",   marketCapCr: 180000  },
  { symbol: "CIPLA.NS",      name: "Cipla",                  sector: "Pharma",     marketCapCr: 170000  },
  { symbol: "DIVISLAB.NS",   name: "Divi's Laboratories",    sector: "Pharma",     marketCapCr: 130000  },
  { symbol: "LUPIN.NS",      name: "Lupin",                  sector: "Pharma",     marketCapCr: 100000  },
  { symbol: "AUROPHARMA.NS", name: "Aurobindo Pharma",       sector: "Pharma",     marketCapCr: 90000   },
  // Infrastructure
  { symbol: "LT.NS",         name: "Larsen & Toubro",        sector: "Infra",      marketCapCr: 520000  },
  { symbol: "SIEMENS.NS",    name: "Siemens India",          sector: "Infra",      marketCapCr: 170000  },
  { symbol: "ABB.NS",        name: "ABB India",              sector: "Infra",      marketCapCr: 95000   },
  { symbol: "CUMMINSIND.NS", name: "Cummins India",          sector: "Infra",      marketCapCr: 60000   },
  // Telecom
  { symbol: "BHARTIARTL.NS", name: "Bharti Airtel",          sector: "Telecom",    marketCapCr: 870000  },
  { symbol: "IDEA.NS",       name: "Vodafone Idea",          sector: "Telecom",    marketCapCr: 18000   },
  // Cement
  { symbol: "ULTRACEMCO.NS", name: "UltraTech Cement",       sector: "Cement",     marketCapCr: 280000  },
  { symbol: "SHREECEM.NS",   name: "Shree Cement",           sector: "Cement",     marketCapCr: 100000  },
  { symbol: "ACC.NS",        name: "ACC",                    sector: "Cement",     marketCapCr: 35000   },
  { symbol: "AMBUJACEM.NS",  name: "Ambuja Cements",         sector: "Cement",     marketCapCr: 110000  },
  // Metals
  { symbol: "TATASTEEL.NS",  name: "Tata Steel",             sector: "Metals",     marketCapCr: 195000  },
  { symbol: "JSWSTEEL.NS",   name: "JSW Steel",              sector: "Metals",     marketCapCr: 240000  },
  { symbol: "HINDALCO.NS",   name: "Hindalco",               sector: "Metals",     marketCapCr: 150000  },
  { symbol: "COALINDIA.NS",  name: "Coal India",             sector: "Metals",     marketCapCr: 290000  },
  { symbol: "VEDL.NS",       name: "Vedanta",                sector: "Metals",     marketCapCr: 170000  },
  // Insurance
  { symbol: "LICI.NS",       name: "LIC of India",           sector: "Insurance",  marketCapCr: 620000  },
  { symbol: "SBILIFE.NS",    name: "SBI Life Insurance",     sector: "Insurance",  marketCapCr: 180000  },
  { symbol: "HDFCLIFE.NS",   name: "HDFC Life Insurance",    sector: "Insurance",  marketCapCr: 145000  },
  { symbol: "ICICIPRULI.NS", name: "ICICI Prudential Life",  sector: "Insurance",  marketCapCr: 100000  },
  // Adani Group
  { symbol: "ADANIENT.NS",   name: "Adani Enterprises",      sector: "Adani",      marketCapCr: 300000  },
  { symbol: "ADANIPORTS.NS", name: "Adani Ports",            sector: "Adani",      marketCapCr: 270000  },
  { symbol: "ADANIENSOL.NS", name: "Adani Energy Solutions", sector: "Adani",      marketCapCr: 90000   },
  { symbol: "ATGL.NS",       name: "Adani Total Gas",        sector: "Adani",      marketCapCr: 100000  },
];

const SECTORS = Array.from(new Set(STOCKS.map((s) => s.sector)));

const SECTOR_COLORS: Record<string, string> = {
  Banking: "from-blue-500/20 to-blue-600/10 border-blue-500/30",
  IT: "from-violet-500/20 to-violet-600/10 border-violet-500/30",
  Energy: "from-orange-500/20 to-orange-600/10 border-orange-500/30",
  Auto: "from-red-500/20 to-red-600/10 border-red-500/30",
  FMCG: "from-yellow-500/20 to-yellow-600/10 border-yellow-500/30",
  Pharma: "from-green-500/20 to-green-600/10 border-green-500/30",
  Infra: "from-stone-500/20 to-stone-600/10 border-stone-500/30",
  Telecom: "from-cyan-500/20 to-cyan-600/10 border-cyan-500/30",
  Cement: "from-amber-500/20 to-amber-600/10 border-amber-500/30",
  Metals: "from-zinc-500/20 to-zinc-600/10 border-zinc-500/30",
  Insurance: "from-teal-500/20 to-teal-600/10 border-teal-500/30",
  Adani: "from-emerald-500/20 to-emerald-600/10 border-emerald-500/30",
};

const SECTOR_BADGE: Record<string, string> = {
  Banking: "bg-blue-500/20 text-blue-300 border-blue-500/30",
  IT: "bg-violet-500/20 text-violet-300 border-violet-500/30",
  Energy: "bg-orange-500/20 text-orange-300 border-orange-500/30",
  Auto: "bg-red-500/20 text-red-300 border-red-500/30",
  FMCG: "bg-yellow-500/20 text-yellow-300 border-yellow-500/30",
  Pharma: "bg-green-500/20 text-green-300 border-green-500/30",
  Infra: "bg-stone-500/20 text-stone-300 border-stone-500/30",
  Telecom: "bg-cyan-500/20 text-cyan-300 border-cyan-500/30",
  Cement: "bg-amber-500/20 text-amber-300 border-amber-500/30",
  Metals: "bg-zinc-500/20 text-zinc-300 border-zinc-500/30",
  Insurance: "bg-teal-500/20 text-teal-300 border-teal-500/30",
  Adani: "bg-emerald-500/20 text-emerald-300 border-emerald-500/30",
};

// ─────────────────────────────────────────────────────────────────────────────
// Types for live data
// ─────────────────────────────────────────────────────────────────────────────

type LiveData = {
  price: number;
  previousClose: number;
  changePercent: number;
  volume: number;
  sparkline: number[];
};

// ─────────────────────────────────────────────────────────────────────────────
// Sparkline micro-chart
// ─────────────────────────────────────────────────────────────────────────────

function Sparkline({ data, positive }: { data: number[]; positive: boolean }) {
  const chartData = data.map((v, i) => ({ i, v }));
  return (
    <ResponsiveContainer width="100%" height={40}>
      <LineChart data={chartData} margin={{ top: 2, right: 2, bottom: 2, left: 2 }}>
        <Line
          type="monotone"
          dataKey="v"
          stroke={positive ? "#00ff88" : "#ff4444"}
          strokeWidth={1.5}
          dot={false}
          isAnimationActive={false}
        />
        <ReTooltip
          content={() => null}
        />
      </LineChart>
    </ResponsiveContainer>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// Company logo / initials avatar
// ─────────────────────────────────────────────────────────────────────────────

function CompanyAvatar({ name, sector }: { name: string; sector: string }) {
  const initials = name
    .split(" ")
    .filter((w) => /^[A-Za-z]/.test(w))
    .slice(0, 2)
    .map((w) => w[0].toUpperCase())
    .join("");

  const colors: Record<string, string> = {
    Banking: "bg-blue-500/30 text-blue-200",
    IT: "bg-violet-500/30 text-violet-200",
    Energy: "bg-orange-500/30 text-orange-200",
    Auto: "bg-red-500/30 text-red-200",
    FMCG: "bg-yellow-500/30 text-yellow-200",
    Pharma: "bg-green-500/30 text-green-200",
    Infra: "bg-stone-400/30 text-stone-200",
    Telecom: "bg-cyan-500/30 text-cyan-200",
    Cement: "bg-amber-500/30 text-amber-200",
    Metals: "bg-zinc-500/30 text-zinc-200",
    Insurance: "bg-teal-500/30 text-teal-200",
    Adani: "bg-emerald-500/30 text-emerald-200",
  };

  return (
    <div
      className={cn(
        "w-10 h-10 rounded-xl flex items-center justify-center font-bold text-sm shrink-0",
        colors[sector] ?? "bg-primary/20 text-primary",
      )}
    >
      {initials}
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// Format helpers
// ─────────────────────────────────────────────────────────────────────────────

function formatPrice(p: number) {
  return new Intl.NumberFormat("en-IN", { maximumFractionDigits: 2, minimumFractionDigits: 2 }).format(p);
}

function formatMCap(cr: number) {
  if (cr >= 100000) return `₹${(cr / 100000).toFixed(2)}L Cr`;
  if (cr >= 1000)   return `₹${(cr / 1000).toFixed(1)}K Cr`;
  return `₹${cr} Cr`;
}

function formatVolume(v: number) {
  if (v >= 1e7) return `${(v / 1e7).toFixed(2)} Cr`;
  if (v >= 1e5) return `${(v / 1e5).toFixed(2)} L`;
  return v.toLocaleString("en-IN");
}

// ─────────────────────────────────────────────────────────────────────────────
// Individual stock card
// ─────────────────────────────────────────────────────────────────────────────

function StockCard({
  stock,
  live,
  isFavorite,
  onToggleFavorite,
  onPredict,
}: {
  stock: StockMeta;
  live: LiveData | null;
  isFavorite: boolean;
  onToggleFavorite: (sym: string) => void;
  onPredict: (sym: string) => void;
}) {
  const positive = live ? live.changePercent >= 0 : null;
  const hasData  = live !== null;

  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -8 }}
      whileHover={{ y: -3 }}
      transition={{ duration: 0.18 }}
      className={cn(
        "relative rounded-2xl border bg-gradient-to-br p-4 flex flex-col gap-3",
        "backdrop-blur-sm hover:shadow-lg transition-shadow duration-200",
        "glass-card",
        SECTOR_COLORS[stock.sector] ?? "border-white/10",
      )}
    >
      {/* Header row */}
      <div className="flex items-start gap-3">
        <CompanyAvatar name={stock.name} sector={stock.sector} />
        <div className="flex-1 min-w-0">
          <p className="text-sm font-semibold leading-tight truncate">{stock.name}</p>
          <div className="flex items-center gap-1.5 mt-0.5">
            <span className="text-xs font-mono text-muted-foreground bg-white/5 px-1.5 py-0.5 rounded">
              {stock.symbol.replace(".NS", "")}
            </span>
            <span className={cn("text-[10px] px-1.5 py-0.5 rounded border font-medium", SECTOR_BADGE[stock.sector])}>
              {stock.sector}
            </span>
          </div>
        </div>
        <button
          onClick={() => onToggleFavorite(stock.symbol)}
          className="shrink-0 text-muted-foreground hover:text-yellow-400 transition-colors"
          aria-label="Toggle favorite"
        >
          <Star
            className={cn("w-4 h-4", isFavorite && "fill-yellow-400 text-yellow-400")}
          />
        </button>
      </div>

      {/* Price row */}
      <div className="flex items-end justify-between">
        <div>
          {hasData ? (
            <>
              <p className="text-xl font-bold font-mono">
                ₹{formatPrice(live!.price)}
              </p>
              <div
                className={cn(
                  "flex items-center gap-1 text-sm font-semibold mt-0.5",
                  positive ? "text-[#00ff88]" : "text-[#ff4444]",
                )}
              >
                {positive ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
                {positive ? "+" : ""}
                {live!.changePercent.toFixed(2)}%
              </div>
            </>
          ) : (
            <div className="space-y-1">
              <div className="h-6 w-24 rounded bg-white/5 animate-pulse" />
              <div className="h-4 w-12 rounded bg-white/5 animate-pulse" />
            </div>
          )}
        </div>
        {/* Sparkline */}
        <div className="w-24 h-10">
          {hasData && live!.sparkline.length > 1 ? (
            <Sparkline data={live!.sparkline} positive={positive!} />
          ) : (
            <div className="h-full w-full rounded bg-white/5 animate-pulse" />
          )}
        </div>
      </div>

      {/* Stats row */}
      <div className="flex justify-between text-[11px] text-muted-foreground border-t border-white/5 pt-2">
        <div>
          <p className="text-[10px] uppercase tracking-wide mb-0.5 opacity-60">Mkt Cap</p>
          <p className="font-medium text-foreground/80">{formatMCap(stock.marketCapCr)}</p>
        </div>
        {hasData && (
          <div className="text-right">
            <p className="text-[10px] uppercase tracking-wide mb-0.5 opacity-60">Volume</p>
            <p className="font-medium text-foreground/80">{formatVolume(live!.volume)}</p>
          </div>
        )}
      </div>

      {/* Predict button */}
      <Button
        size="sm"
        onClick={() => onPredict(stock.symbol)}
        className="w-full h-8 text-xs bg-primary/20 hover:bg-primary/40 text-primary border border-primary/30 font-semibold transition-all"
        variant="outline"
      >
        <TrendingUp className="w-3 h-3 mr-1.5" />
        Predict Price
      </Button>
    </motion.div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// Trending carousel
// ─────────────────────────────────────────────────────────────────────────────

function TrendingCarousel({
  stocks,
  liveMap,
  onPredict,
}: {
  stocks: StockMeta[];
  liveMap: Map<string, LiveData>;
  onPredict: (sym: string) => void;
}) {
  const scrollRef = useRef<HTMLDivElement>(null);

  if (liveMap.size === 0) return null;

  const sorted = [...stocks]
    .filter((s) => liveMap.has(s.symbol))
    .sort((a, b) => Math.abs(liveMap.get(b.symbol)!.changePercent) - Math.abs(liveMap.get(a.symbol)!.changePercent))
    .slice(0, 15);

  return (
    <div className="relative">
      <div
        ref={scrollRef}
        className="flex gap-3 overflow-x-auto pb-2 scrollbar-none"
        style={{ scrollbarWidth: "none" }}
      >
        {sorted.map((stock) => {
          const live = liveMap.get(stock.symbol)!;
          const positive = live.changePercent >= 0;
          return (
            <button
              key={stock.symbol}
              onClick={() => onPredict(stock.symbol)}
              className={cn(
                "shrink-0 rounded-xl border px-4 py-2.5 text-left cursor-pointer",
                "hover:scale-[1.02] transition-transform duration-150 backdrop-blur-sm",
                positive
                  ? "border-[#00ff88]/20 bg-[#00ff88]/5 hover:bg-[#00ff88]/10"
                  : "border-[#ff4444]/20 bg-[#ff4444]/5 hover:bg-[#ff4444]/10",
              )}
            >
              <p className="text-xs font-mono font-semibold text-foreground/80">
                {stock.symbol.replace(".NS", "")}
              </p>
              <p className="text-base font-bold mt-0.5">₹{formatPrice(live.price)}</p>
              <p className={cn("text-xs font-semibold", positive ? "text-[#00ff88]" : "text-[#ff4444]")}>
                {positive ? "+" : ""}{live.changePercent.toFixed(2)}%
              </p>
            </button>
          );
        })}
      </div>
      {/* Fade edges */}
      <div className="absolute left-0 top-0 bottom-2 w-8 bg-gradient-to-r from-background to-transparent pointer-events-none" />
      <div className="absolute right-0 top-0 bottom-2 w-8 bg-gradient-to-l from-background to-transparent pointer-events-none" />
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// Main page
// ─────────────────────────────────────────────────────────────────────────────

type SortKey = "marketCap" | "price" | "change" | "volume" | "name";
type Tab = "all" | "gainers" | "losers" | "mostActive" | "favorites";

export default function IndianStocks() {
  const [, setLocation] = useLocation();

  // Live data
  const [liveMap, setLiveMap]       = useState<Map<string, LiveData>>(new Map());
  const [isLoading, setIsLoading]   = useState(true);
  const [lastUpdated, setLastUpdated] = useState<Date | null>(null);
  const [countdown, setCountdown]   = useState(45);
  const [isRefreshing, setIsRefreshing] = useState(false);

  // UI state
  const [search, setSearch]         = useState("");
  const [sector, setSector]         = useState<string>("All");
  const [sortKey, setSortKey]       = useState<SortKey>("marketCap");
  const [sortAsc, setSortAsc]       = useState(false);
  const [tab, setTab]               = useState<Tab>("all");
  const [favorites, setFavorites]   = useState<Set<string>>(() => {
    try {
      return new Set(JSON.parse(localStorage.getItem("stockai_favorites") || "[]"));
    } catch { return new Set(); }
  });
  const [showSortMenu, setShowSortMenu] = useState(false);

  // Fetch live prices
  const fetchLive = useCallback(async (silent = false) => {
    if (!silent) setIsLoading(true);
    else setIsRefreshing(true);
    try {
      const res = await fetch(`/api/stocks/indian`);
      if (!res.ok) throw new Error("Failed");
      const json = await res.json() as { stocks: Record<string, LiveData>; updatedAt: string };
      const m = new Map<string, LiveData>();
      for (const [sym, d] of Object.entries(json.stocks)) m.set(sym, d);
      setLiveMap(m);
      setLastUpdated(new Date());
    } catch (e) {
      // keep stale data
    } finally {
      setIsLoading(false);
      setIsRefreshing(false);
    }
  }, []);

  // Initial fetch
  useEffect(() => { fetchLive(false); }, [fetchLive]);

  // Auto-refresh countdown
  useEffect(() => {
    const timer = setInterval(() => {
      setCountdown((prev) => {
        if (prev <= 1) {
          fetchLive(true);
          return 45;
        }
        return prev - 1;
      });
    }, 1000);
    return () => clearInterval(timer);
  }, [fetchLive]);

  // Persist favorites
  useEffect(() => {
    localStorage.setItem("stockai_favorites", JSON.stringify([...favorites]));
  }, [favorites]);

  const toggleFavorite = (sym: string) => {
    setFavorites((prev) => {
      const next = new Set(prev);
      next.has(sym) ? next.delete(sym) : next.add(sym);
      return next;
    });
  };

  const handlePredict = (sym: string) => {
    setLocation(`/predict?symbol=${encodeURIComponent(sym)}`);
  };

  // Derived: merged stocks with live data
  const enriched = STOCKS.map((s) => ({ ...s, live: liveMap.get(s.symbol) ?? null }));

  // Apply tab filter
  const byTab = enriched.filter((s) => {
    if (tab === "gainers")    return s.live && s.live.changePercent > 0;
    if (tab === "losers")     return s.live && s.live.changePercent < 0;
    if (tab === "mostActive") return s.live && s.live.volume > 0;
    if (tab === "favorites")  return favorites.has(s.symbol);
    return true;
  });

  // Apply sector
  const bySector = sector === "All" ? byTab : byTab.filter((s) => s.sector === sector);

  // Apply search
  const q = search.toLowerCase();
  const searched = q
    ? bySector.filter(
        (s) =>
          s.name.toLowerCase().includes(q) ||
          s.symbol.toLowerCase().includes(q) ||
          s.sector.toLowerCase().includes(q),
      )
    : bySector;

  // Sort
  const sorted = [...searched].sort((a, b) => {
    let diff = 0;
    if (sortKey === "marketCap") diff = a.marketCapCr - b.marketCapCr;
    else if (sortKey === "price")  diff = (a.live?.price ?? 0) - (b.live?.price ?? 0);
    else if (sortKey === "change") diff = (a.live?.changePercent ?? 0) - (b.live?.changePercent ?? 0);
    else if (sortKey === "volume") diff = (a.live?.volume ?? 0) - (b.live?.volume ?? 0);
    else if (sortKey === "name")   diff = a.name.localeCompare(b.name);
    return sortAsc ? diff : -diff;
  });

  // Stats for summary bar
  const withLive = enriched.filter((s) => s.live);
  const gainers  = withLive.filter((s) => s.live!.changePercent > 0).length;
  const losers   = withLive.filter((s) => s.live!.changePercent < 0).length;
  const topGainer  = [...withLive].sort((a, b) => b.live!.changePercent - a.live!.changePercent)[0];
  const topLoser   = [...withLive].sort((a, b) => a.live!.changePercent - b.live!.changePercent)[0];
  const mostActive = [...withLive].sort((a, b) => b.live!.volume - a.live!.volume)[0];

  const sortLabels: Record<SortKey, string> = {
    marketCap: "Market Cap",
    price: "Price",
    change: "Daily Change",
    volume: "Volume",
    name: "Alphabetical",
  };

  const TABS: { id: Tab; label: string; icon: React.ReactNode }[] = [
    { id: "all",        label: `All (${STOCKS.length})`,  icon: <BarChart2 className="w-3.5 h-3.5" /> },
    { id: "gainers",    label: `Gainers (${gainers})`,    icon: <TrendingUp className="w-3.5 h-3.5 text-[#00ff88]" /> },
    { id: "losers",     label: `Losers (${losers})`,      icon: <TrendingDown className="w-3.5 h-3.5 text-[#ff4444]" /> },
    { id: "mostActive", label: "Most Active",             icon: <Flame className="w-3.5 h-3.5 text-orange-400" /> },
    { id: "favorites",  label: `Favorites (${favorites.size})`, icon: <Star className="w-3.5 h-3.5 text-yellow-400" /> },
  ];

  return (
    <div className="min-h-screen bg-background">
      {/* Hero header */}
      <div className="relative overflow-hidden border-b border-white/5">
        <div className="absolute inset-0 bg-gradient-to-br from-primary/5 via-transparent to-accent/5 pointer-events-none" />
        <div className="container mx-auto px-4 py-10">
          <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
            <div>
              <div className="flex items-center gap-2 mb-2">
                <div className="w-8 h-8 rounded-lg bg-[#FF9933]/20 flex items-center justify-center">
                  <span className="text-base">🇮🇳</span>
                </div>
                <span className="text-xs font-semibold text-muted-foreground uppercase tracking-widest">NSE / BSE Listed</span>
              </div>
              <h1 className="text-3xl md:text-4xl font-bold bg-gradient-to-r from-foreground to-foreground/60 bg-clip-text text-transparent">
                Top Indian Stocks
              </h1>
              <p className="text-muted-foreground mt-1 text-sm">
                {STOCKS.length} stocks across {SECTORS.length} sectors — live NSE prices
              </p>
            </div>

            {/* Search + refresh */}
            <div className="flex items-center gap-3 w-full md:w-auto">
              <div className="relative flex-1 md:w-72">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                <Input
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  placeholder="Search stocks, sectors…"
                  className="pl-9 bg-white/5 border-white/10 focus:border-primary/50"
                />
              </div>
              <Button
                variant="outline"
                size="icon"
                onClick={() => { fetchLive(true); setCountdown(45); }}
                disabled={isRefreshing}
                className="border-white/10 bg-white/5 hover:bg-white/10 shrink-0"
                title="Refresh now"
              >
                <RefreshCw className={cn("w-4 h-4", isRefreshing && "animate-spin")} />
              </Button>
            </div>
          </div>

          {/* Live status bar */}
          <div className="flex flex-wrap items-center gap-x-6 gap-y-2 mt-5 text-xs text-muted-foreground">
            <span className="flex items-center gap-1.5">
              <span className={cn("w-2 h-2 rounded-full", liveMap.size > 0 ? "bg-[#00ff88] animate-pulse" : "bg-yellow-500")} />
              {liveMap.size > 0 ? `${liveMap.size} stocks live` : "Loading prices…"}
            </span>
            {lastUpdated && (
              <span>Updated {lastUpdated.toLocaleTimeString()}</span>
            )}
            <span className="flex items-center gap-1">
              <RefreshCw className="w-3 h-3" />
              Auto-refresh in {countdown}s
            </span>
            {topGainer && (
              <span className="text-[#00ff88] flex items-center gap-1">
                <ChevronUp className="w-3 h-3" />
                Top gainer: {topGainer.symbol.replace(".NS", "")} +{topGainer.live!.changePercent.toFixed(2)}%
              </span>
            )}
            {topLoser && (
              <span className="text-[#ff4444] flex items-center gap-1">
                <ChevronDown className="w-3 h-3" />
                Top loser: {topLoser.symbol.replace(".NS", "")} {topLoser.live!.changePercent.toFixed(2)}%
              </span>
            )}
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 py-6 space-y-6">

        {/* Trending carousel */}
        {liveMap.size > 0 && (
          <div>
            <div className="flex items-center gap-2 mb-3">
              <Flame className="w-4 h-4 text-orange-400" />
              <h2 className="text-sm font-semibold text-muted-foreground uppercase tracking-wider">Trending Now</h2>
            </div>
            <TrendingCarousel stocks={STOCKS} liveMap={liveMap} onPredict={handlePredict} />
          </div>
        )}

        {/* Tabs */}
        <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between">
          <div className="flex flex-wrap gap-1">
            {TABS.map((t) => (
              <button
                key={t.id}
                onClick={() => setTab(t.id)}
                className={cn(
                  "flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition-all",
                  tab === t.id
                    ? "bg-primary/20 text-primary border border-primary/30"
                    : "text-muted-foreground hover:text-foreground hover:bg-white/5 border border-transparent",
                )}
              >
                {t.icon}
                {t.label}
              </button>
            ))}
          </div>

          {/* Sort control */}
          <div className="relative">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setShowSortMenu((p) => !p)}
              className="gap-2 border-white/10 bg-white/5 text-xs"
            >
              <SlidersHorizontal className="w-3.5 h-3.5" />
              Sort: {sortLabels[sortKey]}
              <ArrowUpDown className="w-3 h-3 ml-1" />
            </Button>
            <AnimatePresence>
              {showSortMenu && (
                <motion.div
                  initial={{ opacity: 0, y: -6, scale: 0.97 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  exit={{ opacity: 0, y: -6, scale: 0.97 }}
                  className="absolute right-0 mt-2 w-48 rounded-xl border border-white/10 bg-background/95 backdrop-blur shadow-xl z-20 py-1.5"
                >
                  {(Object.keys(sortLabels) as SortKey[]).map((k) => (
                    <button
                      key={k}
                      className={cn(
                        "w-full text-left px-4 py-2 text-sm hover:bg-white/5 transition-colors",
                        sortKey === k && "text-primary",
                      )}
                      onClick={() => {
                        if (sortKey === k) setSortAsc((p) => !p);
                        else { setSortKey(k); setSortAsc(false); }
                        setShowSortMenu(false);
                      }}
                    >
                      <span className="flex items-center justify-between">
                        {sortLabels[k]}
                        {sortKey === k && (
                          sortAsc ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />
                        )}
                      </span>
                    </button>
                  ))}
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>

        {/* Sector filter chips */}
        <div className="flex flex-wrap gap-2">
          {["All", ...SECTORS].map((s) => (
            <button
              key={s}
              onClick={() => setSector(s)}
              className={cn(
                "px-3 py-1 rounded-full text-xs font-medium border transition-all",
                sector === s
                  ? "bg-primary/20 text-primary border-primary/40"
                  : "text-muted-foreground border-white/10 hover:border-white/20 hover:text-foreground",
              )}
            >
              {s}
            </button>
          ))}
        </div>

        {/* Result count */}
        <div className="flex items-center justify-between text-xs text-muted-foreground">
          <span>
            Showing <span className="text-foreground font-medium">{sorted.length}</span> of{" "}
            <span className="text-foreground font-medium">{STOCKS.length}</span> stocks
          </span>
          {search && (
            <button onClick={() => setSearch("")} className="text-primary hover:underline">
              Clear search
            </button>
          )}
        </div>

        {/* Grid */}
        {isLoading && liveMap.size === 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
            {Array.from({ length: 12 }).map((_, i) => (
              <div key={i} className="h-52 rounded-2xl bg-white/5 animate-pulse border border-white/5" />
            ))}
          </div>
        ) : sorted.length === 0 ? (
          <div className="text-center py-20 text-muted-foreground">
            <Filter className="w-12 h-12 mx-auto mb-3 opacity-30" />
            <p className="text-lg font-medium">No stocks found</p>
            <p className="text-sm mt-1">Try adjusting your search or filter</p>
          </div>
        ) : (
          <motion.div
            layout
            className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4"
          >
            <AnimatePresence mode="popLayout">
              {sorted.map((stock) => (
                <StockCard
                  key={stock.symbol}
                  stock={stock}
                  live={stock.live}
                  isFavorite={favorites.has(stock.symbol)}
                  onToggleFavorite={toggleFavorite}
                  onPredict={handlePredict}
                />
              ))}
            </AnimatePresence>
          </motion.div>
        )}
      </div>
    </div>
  );
}
