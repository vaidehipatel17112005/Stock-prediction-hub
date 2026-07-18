import { useState } from "react";
import { useCompareModels } from "@workspace/api-client-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { Badge } from "@/components/ui/badge";
import { Search, Loader2 } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { ResponsiveContainer, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Cell, LineChart, Line, Legend } from "recharts";

const MODEL_OPTIONS = [
  { id: "linear_regression", label: "Linear Regression" },
  { id: "random_forest", label: "Random Forest" },
  { id: "xgboost", label: "XGBoost" },
  { id: "svr", label: "Support Vector Reg" },
  { id: "knn", label: "KNN" },
];

export default function Compare() {
  const [symbol, setSymbol] = useState("");
  const [selectedModels, setSelectedModels] = useState<string[]>(["random_forest", "xgboost", "linear_regression"]);
  const { toast } = useToast();
  
  const compareMutation = useCompareModels();

  const handleCompare = (e: React.FormEvent) => {
    e.preventDefault();
    if (!symbol || selectedModels.length < 2) {
      toast({ title: "Validation Error", description: "Select a symbol and at least 2 models.", variant: "destructive" });
      return;
    }

    compareMutation.mutate({
      data: {
        symbol: symbol.toUpperCase(),
        models: selectedModels,
        predictionDays: 30
      }
    });
  };

  const results = compareMutation.data?.results || [];
  
  // Chart colors mapping
  const colors = ['#00d4ff', '#00ff88', '#ff4444', '#f59e0b', '#c084fc'];

  // Prepare chart data for accuracy comparison
  const metricsData = results.map(r => ({
    name: r.modelType.replace('_', ' ').toUpperCase(),
    r2: parseFloat(r.metrics.r2Score.toFixed(3)),
    accuracy: parseFloat(r.metrics.accuracy.toFixed(1)),
    mae: parseFloat(r.metrics.mae.toFixed(2))
  }));

  // Find best model based on R2
  const bestModel = results.length > 0 ? results.reduce((prev, current) => 
    (prev.metrics.r2Score > current.metrics.r2Score) ? prev : current
  ) : null;

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold">Model Comparison Engine</h1>
        <p className="text-muted-foreground mt-1">Run algorithms head-to-head to find the most accurate predictor.</p>
      </div>

      <div className="grid lg:grid-cols-4 gap-8">
        <Card className="glass-card border-white/5 lg:col-span-1 h-fit">
          <CardHeader>
            <CardTitle>Configuration</CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleCompare} className="space-y-6">
              <div className="space-y-2">
                <Label>Stock Symbol</Label>
                <div className="relative">
                  <Search className="absolute left-3 top-3 w-4 h-4 text-muted-foreground" />
                  <Input 
                    value={symbol}
                    onChange={(e) => setSymbol(e.target.value)}
                    placeholder="e.g. MSFT" 
                    className="pl-10 bg-black/20"
                  />
                </div>
              </div>

              <div className="space-y-3">
                <Label>Select Models to Compare</Label>
                <div className="space-y-2 border border-white/5 bg-black/20 p-4 rounded-xl">
                  {MODEL_OPTIONS.map(model => (
                    <div key={model.id} className="flex items-center space-x-2">
                      <Checkbox 
                        id={model.id} 
                        checked={selectedModels.includes(model.id)}
                        onCheckedChange={(checked) => {
                          if (checked) setSelectedModels([...selectedModels, model.id]);
                          else setSelectedModels(selectedModels.filter(m => m !== model.id));
                        }}
                      />
                      <label htmlFor={model.id} className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70">
                        {model.label}
                      </label>
                    </div>
                  ))}
                </div>
              </div>

              <Button type="submit" className="w-full bg-primary text-black hover:bg-primary/90" disabled={compareMutation.isPending}>
                {compareMutation.isPending ? <><Loader2 className="mr-2 h-4 w-4 animate-spin" /> Running...</> : "Start Comparison"}
              </Button>
            </form>
          </CardContent>
        </Card>

        <div className="lg:col-span-3 space-y-6">
          {!compareMutation.data && !compareMutation.isPending && (
            <div className="h-full flex items-center justify-center border border-dashed border-white/10 rounded-xl p-12 text-center text-muted-foreground">
              Configure parameters and start comparison to see performance metrics here.
            </div>
          )}

          {compareMutation.isPending && (
            <div className="h-[400px] flex flex-col items-center justify-center bg-card/20 rounded-xl border border-white/5">
              <Loader2 className="h-12 w-12 text-primary animate-spin mb-4" />
              <p className="text-lg font-medium">Training and evaluating {selectedModels.length} models simultaneously...</p>
              <p className="text-sm text-muted-foreground">This may take up to a minute depending on data size.</p>
            </div>
          )}

          {results.length > 0 && (
            <div className="animate-in fade-in slide-in-from-bottom-4 space-y-6">
              {bestModel && (
                <div className="bg-primary/10 border border-primary/30 rounded-xl p-6 glow-border">
                  <h3 className="text-primary font-bold mb-1 uppercase text-sm tracking-wider">Winner Declared</h3>
                  <div className="text-2xl font-bold flex items-center gap-3">
                    {bestModel.modelType.replace('_', ' ').toUpperCase()} 
                    <Badge variant="outline" className="border-primary/50 text-primary bg-primary/10">R²: {bestModel.metrics.r2Score.toFixed(4)}</Badge>
                  </div>
                  <p className="text-muted-foreground text-sm mt-2">
                    This model explained {Math.round(bestModel.metrics.r2Score * 100)}% of the variance in the test set, making it the most reliable choice for predicting {symbol}.
                  </p>
                </div>
              )}

              <div className="grid md:grid-cols-2 gap-6">
                <Card className="glass-card border-white/5">
                  <CardHeader><CardTitle className="text-sm">R² Score Comparison (Higher is Better)</CardTitle></CardHeader>
                  <CardContent className="h-[250px]">
                    <ResponsiveContainer width="100%" height="100%">
                      <BarChart data={metricsData} layout="vertical" margin={{ left: 40 }}>
                        <CartesianGrid strokeDasharray="3 3" stroke="#ffffff10" horizontal={false} />
                        <XAxis type="number" stroke="#ffffff50" domain={[-1, 1]} />
                        <YAxis dataKey="name" type="category" stroke="#ffffff50" fontSize={11} width={80} />
                        <Tooltip contentStyle={{ backgroundColor: '#0f1629', borderColor: '#1e293b' }} cursor={{fill: '#ffffff10'}}/>
                        <Bar dataKey="r2" radius={[0, 4, 4, 0]}>
                          {metricsData.map((entry, index) => (
                            <Cell key={`cell-${index}`} fill={colors[index % colors.length]} />
                          ))}
                        </Bar>
                      </BarChart>
                    </ResponsiveContainer>
                  </CardContent>
                </Card>

                <Card className="glass-card border-white/5">
                  <CardHeader><CardTitle className="text-sm">Directional Accuracy (%)</CardTitle></CardHeader>
                  <CardContent className="h-[250px]">
                    <ResponsiveContainer width="100%" height="100%">
                      <BarChart data={metricsData} margin={{ top: 20 }}>
                        <CartesianGrid strokeDasharray="3 3" stroke="#ffffff10" vertical={false} />
                        <XAxis dataKey="name" stroke="#ffffff50" fontSize={11} />
                        <YAxis stroke="#ffffff50" domain={[0, 100]} />
                        <Tooltip contentStyle={{ backgroundColor: '#0f1629', borderColor: '#1e293b' }} cursor={{fill: '#ffffff10'}}/>
                        <Bar dataKey="accuracy" radius={[4, 4, 0, 0]}>
                          {metricsData.map((entry, index) => (
                            <Cell key={`cell-${index}`} fill={colors[index % colors.length]} />
                          ))}
                        </Bar>
                      </BarChart>
                    </ResponsiveContainer>
                  </CardContent>
                </Card>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
