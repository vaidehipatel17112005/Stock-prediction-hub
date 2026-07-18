import { useState, useEffect } from "react";
import { useLocation } from "wouter";
import { 
  useGetStockInfo, 
  useTrainModel, 
  useGetTrainStatus, 
  useMakePrediction,
  TrainInputModelType
} from "@workspace/api-client-react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Slider } from "@/components/ui/slider";
import { Switch } from "@/components/ui/switch";
import { Progress } from "@/components/ui/progress";
import { Search, Upload, Brain, ChevronRight, CheckCircle2, AlertCircle, BarChart2, TrendingUp, AlertTriangle, Badge, FileText } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, AreaChart, Area } from 'recharts';

const models = [
  { id: 'linear_regression', name: 'Linear Regression', icon: TrendingUp, desc: 'Simple, fast, highly interpretable baseline model.' },
  { id: 'random_forest', name: 'Random Forest', icon: Brain, desc: 'Ensemble learning method resistant to overfitting.' },
  { id: 'xgboost', name: 'XGBoost', icon: BarChart2, desc: 'Gradient boosting, state-of-the-art for tabular data.' },
  { id: 'lstm', name: 'LSTM Neural Net', icon: Activity, desc: 'Deep learning for complex long-term time patterns.', slow: true },
];

import { Activity } from "lucide-react";

export default function Predict() {
  const [location] = useLocation();
  const searchParams = new URLSearchParams(window.location.search);
  const initialSymbol = searchParams.get('symbol') || '';
  
  const { toast } = useToast();
  
  // Step 1: Data Selection
  const [symbol, setSymbol] = useState(initialSymbol);
  const [searchQuery, setSearchQuery] = useState(initialSymbol);
  const [days, setDays] = useState("30");
  
  // Step 2: Model Config
  const [selectedModel, setSelectedModel] = useState<TrainInputModelType>('random_forest');
  const [testSplit, setTestSplit] = useState([80]);
  const [normalize, setNormalize] = useState(true);
  
  // Step 3: Training State
  const [jobId, setJobId] = useState<string | null>(null);
  const [step, setStep] = useState(1);
  
  // Queries & Mutations
  const { data: stockInfo, isLoading: isStockLoading, refetch: fetchStock } = useGetStockInfo(
    { symbol: searchQuery },
    { query: { enabled: false } }
  );

  const trainMutation = useTrainModel();
  const predictMutation = useMakePrediction();

  const { data: trainStatus } = useGetTrainStatus(jobId || '', {
    query: {
      enabled: !!jobId,
      refetchInterval: (data) => (data?.status === 'completed' || data?.status === 'failed') ? false : 1500
    }
  });

  // Handle Search
  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (!symbol) return;
    setSearchQuery(symbol.toUpperCase());
    fetchStock().then(({ data }) => {
      if (!data) {
        toast({ title: "Stock not found", variant: "destructive" });
      } else {
        setStep(2);
      }
    });
  };

  // Handle Train
  const handleTrain = () => {
    trainMutation.mutate({
      data: {
        symbol: searchQuery,
        modelType: selectedModel,
        predictionDays: parseInt(days),
        testSplitRatio: testSplit[0] / 100,
        normalize
      }
    }, {
      onSuccess: (data) => {
        setJobId(data.jobId);
        setStep(3);
      },
      onError: (err) => {
        toast({ title: "Training Failed", description: err.message, variant: "destructive" });
      }
    });
  };

  // Watch training status
  useEffect(() => {
    if (trainStatus?.status === 'completed' && trainStatus.modelId) {
      // Auto predict
      predictMutation.mutate({
        data: {
          modelId: trainStatus.modelId,
          symbol: searchQuery,
          days: parseInt(days)
        }
      }, {
        onSuccess: () => setStep(4),
        onError: () => toast({ title: "Prediction Failed", variant: "destructive" })
      });
    } else if (trainStatus?.status === 'failed') {
      toast({ title: "Training Failed", description: trainStatus.message, variant: "destructive" });
      setStep(2);
      setJobId(null);
    }
  }, [trainStatus?.status]);

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-2">Prediction Workflow</h1>
        <div className="flex items-center gap-4 text-sm text-muted-foreground">
          <span className={step >= 1 ? "text-primary font-medium" : ""}>1. Data Selection</span>
          <ChevronRight className="w-4 h-4" />
          <span className={step >= 2 ? "text-primary font-medium" : ""}>2. Model Config</span>
          <ChevronRight className="w-4 h-4" />
          <span className={step >= 3 ? "text-primary font-medium" : ""}>3. Training</span>
          <ChevronRight className="w-4 h-4" />
          <span className={step >= 4 ? "text-primary font-medium" : ""}>4. Results</span>
        </div>
      </div>

      {step === 1 && (
        <div className="grid md:grid-cols-2 gap-8 animate-in fade-in slide-in-from-bottom-4">
          <Card className="glass-card border-white/5">
            <CardHeader>
              <CardTitle>Select Asset</CardTitle>
              <CardDescription>Search for a stock symbol or upload historical data.</CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSearch} className="space-y-6">
                <div className="space-y-2">
                  <Label>Stock Symbol</Label>
                  <div className="relative">
                    <Search className="absolute left-3 top-3 w-4 h-4 text-muted-foreground" />
                    <Input 
                      value={symbol}
                      onChange={(e) => setSymbol(e.target.value)}
                      placeholder="e.g. AAPL, MSFT, TSLA" 
                      className="pl-10 h-10 bg-black/20"
                    />
                  </div>
                </div>
                
                <div className="space-y-2">
                  <Label>Prediction Horizon</Label>
                  <Select value={days} onValueChange={setDays}>
                    <SelectTrigger className="bg-black/20">
                      <SelectValue placeholder="Select days" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="1">Next Day (1)</SelectItem>
                      <SelectItem value="7">1 Week (7)</SelectItem>
                      <SelectItem value="30">1 Month (30)</SelectItem>
                      <SelectItem value="90">1 Quarter (90)</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="pt-4 flex gap-4">
                  <Button type="submit" className="w-full bg-primary hover:bg-primary/90 text-black" disabled={isStockLoading || !symbol}>
                    {isStockLoading ? "Loading..." : "Load Data"}
                  </Button>
                </div>
              </form>
            </CardContent>
          </Card>

          <Card className="glass-card border-white/5 border-dashed border-2 flex flex-col items-center justify-center p-8 text-center hover:bg-white/5 transition-colors cursor-pointer">
            <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center mb-4">
              <Upload className="w-8 h-8 text-primary" />
            </div>
            <h3 className="font-medium text-lg mb-2">Upload Custom Dataset</h3>
            <p className="text-sm text-muted-foreground mb-4">
              Upload a CSV with OHLCV data to train a model on custom historical data.
            </p>
            <Button variant="outline" className="border-white/10">Select CSV File</Button>
          </Card>
        </div>
      )}

      {step === 2 && stockInfo && (
        <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4">
          <div className="flex items-center justify-between bg-card p-4 rounded-xl border border-white/5">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-lg bg-primary/20 flex items-center justify-center">
                <Activity className="w-6 h-6 text-primary" />
              </div>
              <div>
                <h2 className="text-xl font-bold">{stockInfo.symbol} <span className="text-muted-foreground text-sm font-normal">{stockInfo.name}</span></h2>
                <p className="text-sm text-muted-foreground">Current Price: ${stockInfo.currentPrice}</p>
              </div>
            </div>
            <Button variant="ghost" onClick={() => setStep(1)}>Change Asset</Button>
          </div>

          <div className="grid lg:grid-cols-3 gap-8">
            <div className="lg:col-span-2 space-y-6">
              <h3 className="text-lg font-semibold">Select Algorithm</h3>
              <div className="grid sm:grid-cols-2 gap-4">
                {models.map(model => {
                  const Icon = model.icon;
                  const isSelected = selectedModel === model.id;
                  return (
                    <div 
                      key={model.id}
                      onClick={() => setSelectedModel(model.id as TrainInputModelType)}
                      className={`p-4 rounded-xl border cursor-pointer transition-all ${
                        isSelected 
                          ? 'border-primary bg-primary/10 shadow-[0_0_15px_rgba(0,212,255,0.2)] glow-border' 
                          : 'border-white/10 bg-card hover:bg-white/5'
                      }`}
                    >
                      <div className="flex items-center gap-3 mb-2">
                        <Icon className={`w-5 h-5 ${isSelected ? 'text-primary' : 'text-muted-foreground'}`} />
                        <span className="font-semibold">{model.name}</span>
                        {model.slow && <Badge variant="secondary" className="ml-auto text-[10px]">Slower</Badge>}
                      </div>
                      <p className="text-xs text-muted-foreground">{model.desc}</p>
                    </div>
                  )
                })}
              </div>
            </div>

            <div className="space-y-6">
              <Card className="glass-card border-white/5">
                <CardHeader>
                  <CardTitle className="text-lg">Preprocessing</CardTitle>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div className="space-y-3">
                    <div className="flex justify-between">
                      <Label>Train/Test Split</Label>
                      <span className="text-xs text-muted-foreground">{testSplit[0]}% / {100 - testSplit[0]}%</span>
                    </div>
                    <Slider 
                      value={testSplit} 
                      onValueChange={setTestSplit} 
                      min={60} max={95} step={5} 
                      className="[&>span:first-child]:bg-primary/30 [&_[role=slider]]:bg-primary [&_[role=slider]]:border-primary"
                    />
                  </div>
                  
                  <div className="flex items-center justify-between">
                    <div className="space-y-0.5">
                      <Label>Normalize Data</Label>
                      <p className="text-xs text-muted-foreground">Scale features to [0,1]</p>
                    </div>
                    <Switch checked={normalize} onCheckedChange={setNormalize} className="data-[state=checked]:bg-primary" />
                  </div>

                  <Button 
                    className="w-full bg-primary hover:bg-primary/90 text-primary-foreground font-bold h-12 mt-4"
                    onClick={handleTrain}
                    disabled={trainMutation.isPending}
                  >
                    {trainMutation.isPending ? "Starting Job..." : "Start Training Pipeline"}
                  </Button>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      )}

      {step === 3 && trainStatus && (
        <div className="max-w-2xl mx-auto mt-12 animate-in fade-in zoom-in-95">
          <Card className="glass-card border-white/10 glow-border">
            <CardContent className="p-10 text-center space-y-6">
              <div className="relative w-24 h-24 mx-auto">
                <div className="absolute inset-0 rounded-full border-t-2 border-primary animate-spin"></div>
                <div className="absolute inset-2 rounded-full border-r-2 border-accent animate-spin" style={{ animationDirection: 'reverse', animationDuration: '1.5s' }}></div>
                <Brain className="absolute inset-0 m-auto w-8 h-8 text-primary animate-pulse" />
              </div>
              
              <div>
                <h2 className="text-2xl font-bold mb-2">Training {selectedModel.replace('_', ' ').toUpperCase()} Model</h2>
                <p className="text-muted-foreground">{trainStatus.message}</p>
              </div>

              <div className="space-y-2 text-left">
                <div className="flex justify-between text-sm">
                  <span>Progress</span>
                  <span className="font-mono text-primary">{Math.round(trainStatus.progress)}%</span>
                </div>
                <Progress value={trainStatus.progress} className="h-2 bg-white/10 [&>div]:bg-gradient-to-r [&>div]:from-primary [&>div]:to-accent" />
              </div>
              
              {trainStatus.datasetStats && (
                <div className="grid grid-cols-2 gap-4 mt-8 pt-6 border-t border-white/5 text-left text-sm">
                  <div>
                    <span className="text-muted-foreground">Training Rows</span>
                    <p className="font-mono">{trainStatus.datasetStats.trainingRows}</p>
                  </div>
                  <div>
                    <span className="text-muted-foreground">Test Rows</span>
                    <p className="font-mono">{trainStatus.datasetStats.testingRows}</p>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      )}

      {step === 4 && predictMutation.data && (
        <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4">
          {/* Header Stats */}
          <div className="flex flex-col md:flex-row gap-6 items-start md:items-center justify-between">
            <div>
              <h2 className="text-3xl font-bold flex items-center gap-3">
                {searchQuery} Forecast
                <Badge className={
                  predictMutation.data.recommendation === 'BUY' ? 'bg-accent/20 text-accent hover:bg-accent/30' :
                  predictMutation.data.recommendation === 'SELL' ? 'bg-destructive/20 text-destructive hover:bg-destructive/30' :
                  'bg-white/10 text-white hover:bg-white/20'
                }>
                  {predictMutation.data.recommendation} ({(predictMutation.data.confidenceScore * 100).toFixed(0)}% Conf)
                </Badge>
              </h2>
              <p className="text-muted-foreground mt-1">Based on {selectedModel.replace('_', ' ').toUpperCase()} model trained just now.</p>
            </div>
            
            <div className="flex gap-3">
              <Button variant="outline" className="border-white/10"><FileText className="w-4 h-4 mr-2" /> Export Report</Button>
              <Button onClick={() => setStep(1)} className="bg-primary/20 text-primary hover:bg-primary/30">New Prediction</Button>
            </div>
          </div>

          {/* Metric Cards */}
          <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
            <Card className="bg-card border-white/5"><CardContent className="p-4"><p className="text-xs text-muted-foreground mb-1">R² Score</p><p className="text-2xl font-mono">{predictMutation.data.metrics.r2Score.toFixed(4)}</p></CardContent></Card>
            <Card className="bg-card border-white/5"><CardContent className="p-4"><p className="text-xs text-muted-foreground mb-1">MAE</p><p className="text-2xl font-mono">${predictMutation.data.metrics.mae.toFixed(2)}</p></CardContent></Card>
            <Card className="bg-card border-white/5"><CardContent className="p-4"><p className="text-xs text-muted-foreground mb-1">RMSE</p><p className="text-2xl font-mono">${predictMutation.data.metrics.rmse.toFixed(2)}</p></CardContent></Card>
            <Card className="bg-card border-white/5"><CardContent className="p-4"><p className="text-xs text-muted-foreground mb-1">Direction Acc.</p><p className="text-2xl font-mono text-accent">{predictMutation.data.metrics.accuracy.toFixed(1)}%</p></CardContent></Card>
            <Card className="bg-card border-white/5"><CardContent className="p-4"><p className="text-xs text-muted-foreground mb-1">Next Day Target</p><p className="text-2xl font-mono font-bold">${predictMutation.data.nextDayPrice.toFixed(2)}</p></CardContent></Card>
          </div>

          {/* Main Chart */}
          <Card className="glass-card border-white/5 glow-border">
            <CardHeader>
              <CardTitle>Forecast vs Historical</CardTitle>
            </CardHeader>
            <CardContent className="h-[400px]">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={[...predictMutation.data.historicalVsPredicted.slice(-60), ...predictMutation.data.predictions]}>
                  <defs>
                    <linearGradient id="colorPredicted" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#00d4ff" stopOpacity={0.3}/>
                      <stop offset="95%" stopColor="#00d4ff" stopOpacity={0}/>
                    </linearGradient>
                    <linearGradient id="colorActual" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#94a3b8" stopOpacity={0.1}/>
                      <stop offset="95%" stopColor="#94a3b8" stopOpacity={0}/>
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="#ffffff10" vertical={false} />
                  <XAxis dataKey="date" stroke="#ffffff50" tickFormatter={(v) => v.split('T')[0]} minTickGap={30} />
                  <YAxis domain={['auto', 'auto']} stroke="#ffffff50" tickFormatter={(v) => `$${v}`} />
                  <Tooltip 
                    contentStyle={{ backgroundColor: '#0f1629', borderColor: '#1e293b', borderRadius: '8px' }}
                    itemStyle={{ fontFamily: 'monospace' }}
                  />
                  <Area type="monotone" dataKey="actualPrice" stroke="#94a3b8" fillOpacity={1} fill="url(#colorActual)" name="Actual Price" />
                  <Area type="monotone" dataKey="predictedPrice" stroke="#00d4ff" strokeWidth={2} fillOpacity={1} fill="url(#colorPredicted)" name="Predicted" />
                  {/* Highlight future predictions part somehow, Recharts is tricky here but simple continuous line works */}
                </AreaChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
}
