import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ArrowUpRight, ArrowDownRight, Activity, Clock, FileText, Search } from "lucide-react";
import { useGetMarketOverview, useGetStockNews, useGetWatchlist } from "@workspace/api-client-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Link, useLocation } from "wouter";
import { useState } from "react";

export default function Dashboard() {
  const [search, setSearch] = useState("");
  const [, setLocation] = useLocation();

  const { data: marketData, isLoading: marketLoading } = useGetMarketOverview();
  const { data: newsData, isLoading: newsLoading } = useGetStockNews({ limit: 5 });
  const { data: watchlistData } = useGetWatchlist();

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (search.trim()) {
      setLocation(`/predict?symbol=${search.toUpperCase()}`);
    }
  };

  return (
    <div className="container mx-auto px-4 py-8 space-y-8">
      {/* Top Search Bar */}
      <div className="max-w-2xl mx-auto w-full">
        <form onSubmit={handleSearch} className="relative group">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground group-focus-within:text-primary transition-colors" />
          <Input 
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search symbol to predict (e.g., AAPL, NVDA, BTC)..." 
            className="w-full h-14 pl-12 pr-4 text-lg bg-card/50 backdrop-blur-sm border-white/10 focus-visible:ring-primary rounded-2xl shadow-lg"
          />
          <Button type="submit" size="sm" className="absolute right-2 top-1/2 -translate-y-1/2 bg-primary/20 text-primary hover:bg-primary hover:text-primary-foreground transition-colors rounded-xl h-10">
            Predict
          </Button>
        </form>
      </div>

      {/* Market Overview Grid */}
      <div>
        <h2 className="text-2xl font-bold mb-4 flex items-center gap-2">
          <Activity className="text-primary" /> Market Overview
        </h2>
        
        {marketLoading ? (
          <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-5 gap-4">
            {[...Array(5)].map((_, i) => (
              <Card key={i} className="glass-card animate-pulse border-white/5 h-24" />
            ))}
          </div>
        ) : (
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4">
            {marketData?.items.slice(0, 10).map((item) => {
              const isPositive = item.change >= 0;
              return (
                <Card key={item.symbol} className="glass-card border-white/5 hover:border-white/10 transition-colors">
                  <CardContent className="p-4">
                    <div className="flex justify-between items-start mb-2">
                      <span className="font-semibold text-sm">{item.symbol}</span>
                      {isPositive ? (
                        <ArrowUpRight className="w-4 h-4 text-accent" />
                      ) : (
                        <ArrowDownRight className="w-4 h-4 text-destructive" />
                      )}
                    </div>
                    <div className="text-xl font-bold mb-1">${item.price.toFixed(2)}</div>
                    <div className={`text-xs font-medium ${isPositive ? 'text-accent' : 'text-destructive'}`}>
                      {isPositive ? '+' : ''}{item.change.toFixed(2)} ({isPositive ? '+' : ''}{item.changePercent.toFixed(2)}%)
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        )}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Watchlist & Quick Actions */}
        <div className="lg:col-span-1 space-y-8">
          <Card className="glass-card border-white/5">
            <CardHeader className="pb-3 border-b border-white/5">
              <CardTitle className="text-lg flex items-center justify-between">
                <span>Watchlist</span>
                <Badge variant="outline" className="bg-primary/10 text-primary border-primary/20">
                  {watchlistData?.items.length || 0} Items
                </Badge>
              </CardTitle>
            </CardHeader>
            <CardContent className="p-0">
              <div className="divide-y divide-white/5">
                {watchlistData?.items.length ? (
                  watchlistData.items.map(item => (
                    <div key={item.id} className="p-4 flex items-center justify-between hover:bg-white/5 transition-colors cursor-pointer" onClick={() => setLocation(`/predict?symbol=${item.symbol}`)}>
                      <div>
                        <div className="font-semibold">{item.symbol}</div>
                        <div className="text-xs text-muted-foreground">{item.name}</div>
                      </div>
                      <div className="text-right">
                        <div className="font-medium">${item.currentPrice?.toFixed(2) || '---'}</div>
                        {item.percentChange && (
                          <div className={`text-xs ${item.percentChange >= 0 ? 'text-accent' : 'text-destructive'}`}>
                            {item.percentChange >= 0 ? '+' : ''}{item.percentChange.toFixed(2)}%
                          </div>
                        )}
                      </div>
                    </div>
                  ))
                ) : (
                  <div className="p-8 text-center text-muted-foreground text-sm">
                    No items in watchlist. Search a stock to add.
                  </div>
                )}
              </div>
            </CardContent>
          </Card>

          <div className="grid grid-cols-2 gap-4">
            <Button asChild className="h-16 flex-col gap-1 bg-card border border-white/10 hover:bg-primary/20 hover:border-primary/50 text-foreground transition-all">
              <Link href="/indicators">
                <Activity className="w-5 h-5 text-primary" />
                <span className="text-xs font-medium">Indicators</span>
              </Link>
            </Button>
            <Button asChild className="h-16 flex-col gap-1 bg-card border border-white/10 hover:bg-primary/20 hover:border-primary/50 text-foreground transition-all">
              <Link href="/compare">
                <Clock className="w-5 h-5 text-primary" />
                <span className="text-xs font-medium">Compare Models</span>
              </Link>
            </Button>
          </div>
        </div>

        {/* News Feed */}
        <div className="lg:col-span-2">
          <Card className="glass-card border-white/5 h-full">
            <CardHeader className="pb-3 border-b border-white/5">
              <CardTitle className="text-lg flex items-center justify-between">
                <span className="flex items-center gap-2"><FileText className="w-5 h-5 text-primary" /> Market News</span>
                <Button variant="ghost" size="sm" asChild className="text-xs text-muted-foreground">
                  <Link href="/news">View All</Link>
                </Button>
              </CardTitle>
            </CardHeader>
            <CardContent className="p-0">
              <div className="divide-y divide-white/5">
                {newsLoading ? (
                  [...Array(4)].map((_, i) => (
                    <div key={i} className="p-4 space-y-2 animate-pulse">
                      <div className="h-4 bg-white/10 rounded w-3/4"></div>
                      <div className="h-3 bg-white/5 rounded w-1/2"></div>
                    </div>
                  ))
                ) : newsData?.articles.map((item, i) => (
                  <a key={i} href={item.url} target="_blank" rel="noopener noreferrer" className="block p-5 hover:bg-white/5 transition-colors group">
                    <div className="flex justify-between items-start gap-4">
                      <div>
                        <h4 className="font-medium mb-2 group-hover:text-primary transition-colors line-clamp-2">
                          {item.title}
                        </h4>
                        <p className="text-sm text-muted-foreground line-clamp-2 mb-3">
                          {item.summary}
                        </p>
                        <div className="flex items-center gap-3 text-xs text-muted-foreground">
                          <span className="text-foreground/70 font-medium">{item.source}</span>
                          <span>{new Date(item.publishedAt).toLocaleDateString()}</span>
                          {item.sentiment && (
                            <Badge variant="outline" className={`
                              ${item.sentiment === 'positive' ? 'text-accent border-accent/20 bg-accent/10' : 
                                item.sentiment === 'negative' ? 'text-destructive border-destructive/20 bg-destructive/10' : 
                                'text-muted-foreground'}
                            `}>
                              {item.sentiment}
                            </Badge>
                          )}
                        </div>
                      </div>
                    </div>
                  </a>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
