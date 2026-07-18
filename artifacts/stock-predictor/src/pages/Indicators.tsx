import { useState } from "react";
import { useGetTechnicalIndicators } from "@workspace/api-client-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Search, Activity } from "lucide-react";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, BarChart, Bar, ReferenceLine } from 'recharts';

export default function Indicators() {
  const [symbol, setSymbol] = useState("AAPL");
  const [querySymbol, setQuerySymbol] = useState("AAPL");

  const { data, isLoading } = useGetTechnicalIndicators(
    { symbol: querySymbol },
    { query: { enabled: !!querySymbol } }
  );

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (symbol.trim()) {
      setQuerySymbol(symbol.toUpperCase());
    }
  };

  // Format data for charts
  const chartData = data?.dates.map((date, i) => ({
    date: date.split('T')[0],
    close: data.close[i],
    rsi: data.rsi?.[i],
    macd: data.macd?.[i],
    macdSignal: data.macdSignal?.[i],
    macdHist: data.macdHistogram?.[i],
    sma20: data.sma20?.[i],
    sma50: data.sma50?.[i],
    upper: data.bollingerUpper?.[i],
    lower: data.bollingerLower?.[i]
  })).slice(-100) || []; // Last 100 days

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-8">
        <div>
          <h1 className="text-3xl font-bold">Technical Analysis</h1>
          <p className="text-muted-foreground mt-1">Real-time indicators and oscillators</p>
        </div>
        
        <form onSubmit={handleSearch} className="flex gap-2 w-full md:w-auto">
          <Input 
            value={symbol}
            onChange={(e) => setSymbol(e.target.value)}
            placeholder="Symbol..." 
            className="w-full md:w-32 bg-card border-white/10"
          />
          <Button type="submit" variant="secondary" className="bg-primary/20 text-primary hover:bg-primary/30">
            <Search className="w-4 h-4 mr-2" /> Load
          </Button>
        </form>
      </div>

      {isLoading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {[1,2,3,4].map(i => <Card key={i} className="h-[350px] animate-pulse bg-white/5 border-white/5" />)}
        </div>
      ) : chartData.length > 0 ? (
        <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
          {/* Price with SMA & Bollinger */}
          <Card className="glass-card border-white/5 xl:col-span-2">
            <CardHeader className="pb-2 border-b border-white/5">
              <CardTitle className="text-base flex items-center gap-2">
                Price & Moving Averages (20, 50) + Bollinger Bands
              </CardTitle>
            </CardHeader>
            <CardContent className="h-[400px] pt-4">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={chartData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#ffffff10" vertical={false} />
                  <XAxis dataKey="date" stroke="#ffffff50" minTickGap={30} />
                  <YAxis domain={['auto', 'auto']} stroke="#ffffff50" />
                  <Tooltip contentStyle={{ backgroundColor: '#0f1629', borderColor: '#1e293b' }} />
                  <Line type="monotone" dataKey="close" stroke="#ffffff" dot={false} strokeWidth={2} name="Price" />
                  <Line type="monotone" dataKey="sma20" stroke="#00d4ff" dot={false} name="SMA 20" />
                  <Line type="monotone" dataKey="sma50" stroke="#00ff88" dot={false} name="SMA 50" />
                  <Line type="monotone" dataKey="upper" stroke="#ff4444" strokeDasharray="5 5" dot={false} name="Upper BB" />
                  <Line type="monotone" dataKey="lower" stroke="#ff4444" strokeDasharray="5 5" dot={false} name="Lower BB" />
                </LineChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>

          {/* RSI */}
          <Card className="glass-card border-white/5">
            <CardHeader className="pb-2 border-b border-white/5">
              <CardTitle className="text-base flex justify-between items-center">
                <span>Relative Strength Index (14)</span>
                <span className="text-xs font-normal text-muted-foreground">Overbought {'>'} 70 | Oversold {'<'} 30</span>
              </CardTitle>
            </CardHeader>
            <CardContent className="h-[250px] pt-4">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={chartData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#ffffff10" vertical={false} />
                  <XAxis dataKey="date" stroke="#ffffff50" minTickGap={30} hide />
                  <YAxis domain={[0, 100]} stroke="#ffffff50" ticks={[0, 30, 50, 70, 100]} />
                  <Tooltip contentStyle={{ backgroundColor: '#0f1629', borderColor: '#1e293b' }} />
                  <ReferenceLine y={70} stroke="#ff4444" strokeDasharray="3 3" />
                  <ReferenceLine y={30} stroke="#00ff88" strokeDasharray="3 3" />
                  <Line type="monotone" dataKey="rsi" stroke="#00b4d8" dot={false} strokeWidth={2} name="RSI" />
                </LineChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>

          {/* MACD */}
          <Card className="glass-card border-white/5">
            <CardHeader className="pb-2 border-b border-white/5">
              <CardTitle className="text-base">MACD (12, 26, 9)</CardTitle>
            </CardHeader>
            <CardContent className="h-[250px] pt-4">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={chartData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#ffffff10" vertical={false} />
                  <XAxis dataKey="date" stroke="#ffffff50" minTickGap={30} hide />
                  <YAxis domain={['auto', 'auto']} stroke="#ffffff50" />
                  <Tooltip contentStyle={{ backgroundColor: '#0f1629', borderColor: '#1e293b' }} />
                  <Bar dataKey="macdHist" fill="#ffffff20" name="Histogram" />
                  <Line type="monotone" dataKey="macd" stroke="#00d4ff" dot={false} strokeWidth={2} name="MACD" />
                  <Line type="monotone" dataKey="macdSignal" stroke="#ff4444" dot={false} name="Signal" />
                </LineChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </div>
      ) : (
        <div className="text-center py-20 text-muted-foreground border border-dashed border-white/10 rounded-2xl">
          Enter a symbol to view technical analysis.
        </div>
      )}
    </div>
  );
}
