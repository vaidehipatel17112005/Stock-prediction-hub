import { useState } from "react";
import { useSimulatePortfolio } from "@workspace/api-client-react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { format } from "date-fns";
import { Calendar as CalendarIcon, DollarSign, ArrowUpRight, ArrowDownRight, Briefcase } from "lucide-react";
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts";
import { cn } from "@/lib/utils";

export default function Portfolio() {
  const [symbol, setSymbol] = useState("AAPL");
  const [amount, setAmount] = useState("10000");
  const [date, setDate] = useState<Date>(new Date(new Date().setFullYear(new Date().getFullYear() - 1))); // Default 1 year ago

  const simulateMutation = useSimulatePortfolio();

  const handleSimulate = (e: React.FormEvent) => {
    e.preventDefault();
    simulateMutation.mutate({
      data: {
        symbol: symbol.toUpperCase(),
        investmentAmount: parseFloat(amount),
        purchaseDate: date.toISOString()
      }
    });
  };

  const res = simulateMutation.data;
  const isPositive = res && res.profitLoss >= 0;

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold flex items-center gap-3">
          <Briefcase className="text-primary" /> Portfolio Simulator
        </h1>
        <p className="text-muted-foreground mt-1">Backtest "what-if" scenarios for any stock based on historical data.</p>
      </div>

      <div className="grid lg:grid-cols-12 gap-8">
        <Card className="glass-card border-white/5 lg:col-span-4 h-fit">
          <CardHeader>
            <CardTitle>Investment Params</CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSimulate} className="space-y-6">
              <div className="space-y-2">
                <Label>Stock Symbol</Label>
                <Input 
                  value={symbol}
                  onChange={(e) => setSymbol(e.target.value)}
                  placeholder="AAPL" 
                  className="bg-black/20"
                  required
                />
              </div>

              <div className="space-y-2">
                <Label>Initial Amount ($)</Label>
                <div className="relative">
                  <DollarSign className="absolute left-3 top-3 w-4 h-4 text-muted-foreground" />
                  <Input 
                    type="number"
                    value={amount}
                    onChange={(e) => setAmount(e.target.value)}
                    className="pl-9 bg-black/20"
                    min="1"
                    required
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label>Purchase Date</Label>
                <Popover>
                  <PopoverTrigger asChild>
                    <Button
                      variant={"outline"}
                      className={cn(
                        "w-full justify-start text-left font-normal bg-black/20 border-white/10 hover:bg-white/5",
                        !date && "text-muted-foreground"
                      )}
                    >
                      <CalendarIcon className="mr-2 h-4 w-4" />
                      {date ? format(date, "PPP") : <span>Pick a date</span>}
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0 glass-card" align="start">
                    <Calendar
                      mode="single"
                      selected={date}
                      onSelect={(d) => d && setDate(d)}
                      initialFocus
                      disabled={(d) => d > new Date()}
                    />
                  </PopoverContent>
                </Popover>
              </div>

              <Button type="submit" className="w-full bg-primary text-black hover:bg-primary/90" disabled={simulateMutation.isPending}>
                {simulateMutation.isPending ? "Calculating..." : "Run Simulation"}
              </Button>
            </form>
          </CardContent>
        </Card>

        <div className="lg:col-span-8">
          {res ? (
            <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4">
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <Card className="glass-card border-white/5 border-t-4 border-t-primary">
                  <CardContent className="p-6">
                    <p className="text-sm text-muted-foreground font-medium mb-1">Current Value</p>
                    <p className="text-3xl font-bold font-mono">${res.currentValue.toLocaleString(undefined, {minimumFractionDigits: 2, maximumFractionDigits: 2})}</p>
                  </CardContent>
                </Card>
                <Card className={`glass-card border-white/5 border-t-4 ${isPositive ? 'border-t-accent' : 'border-t-destructive'}`}>
                  <CardContent className="p-6">
                    <p className="text-sm text-muted-foreground font-medium mb-1">Total Return</p>
                    <p className={`text-3xl font-bold font-mono flex items-center gap-1 ${isPositive ? 'text-accent' : 'text-destructive'}`}>
                      {isPositive ? <ArrowUpRight className="w-6 h-6" /> : <ArrowDownRight className="w-6 h-6" />}
                      ${Math.abs(res.profitLoss).toLocaleString(undefined, {minimumFractionDigits: 2, maximumFractionDigits: 2})}
                    </p>
                  </CardContent>
                </Card>
                <Card className="glass-card border-white/5">
                  <CardContent className="p-6">
                    <p className="text-sm text-muted-foreground font-medium mb-1">ROI</p>
                    <p className={`text-3xl font-bold font-mono ${isPositive ? 'text-accent' : 'text-destructive'}`}>
                      {isPositive ? '+' : ''}{res.roi.toFixed(2)}%
                    </p>
                  </CardContent>
                </Card>
                <Card className="glass-card border-white/5">
                  <CardContent className="p-6">
                    <p className="text-sm text-muted-foreground font-medium mb-1">Shares Owned</p>
                    <p className="text-3xl font-bold font-mono">{res.shares.toFixed(4)}</p>
                  </CardContent>
                </Card>
              </div>

              <Card className="glass-card border-white/5 glow-border">
                <CardHeader>
                  <CardTitle>Portfolio Growth</CardTitle>
                </CardHeader>
                <CardContent className="h-[400px] pt-4">
                  <ResponsiveContainer width="100%" height="100%">
                    <AreaChart data={res.growthData}>
                      <defs>
                        <linearGradient id="colorValue" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="5%" stopColor={isPositive ? "#00ff88" : "#ff4444"} stopOpacity={0.3}/>
                          <stop offset="95%" stopColor={isPositive ? "#00ff88" : "#ff4444"} stopOpacity={0}/>
                        </linearGradient>
                      </defs>
                      <CartesianGrid strokeDasharray="3 3" stroke="#ffffff10" vertical={false} />
                      <XAxis dataKey="date" stroke="#ffffff50" tickFormatter={(v) => v.split('T')[0]} minTickGap={30} />
                      <YAxis domain={['auto', 'auto']} stroke="#ffffff50" tickFormatter={(v) => `$${v}`} />
                      <Tooltip 
                        contentStyle={{ backgroundColor: '#0f1629', borderColor: '#1e293b', borderRadius: '8px' }}
                        itemStyle={{ color: '#fff', fontFamily: 'monospace' }}
                        formatter={(value: number) => [`$${value.toFixed(2)}`, 'Value']}
                      />
                      <Area 
                        type="monotone" 
                        dataKey="value" 
                        stroke={isPositive ? "#00ff88" : "#ff4444"} 
                        strokeWidth={2}
                        fillOpacity={1} 
                        fill="url(#colorValue)" 
                      />
                    </AreaChart>
                  </ResponsiveContainer>
                </CardContent>
              </Card>
            </div>
          ) : (
            <div className="h-full flex items-center justify-center border border-dashed border-white/10 rounded-xl p-12 text-center text-muted-foreground">
              Enter your investment parameters and run the simulation to view historical returns.
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
