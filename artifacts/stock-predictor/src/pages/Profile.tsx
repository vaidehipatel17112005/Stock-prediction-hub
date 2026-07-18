import { useAuth } from "@/lib/auth-context";
import { useGetPredictionHistory, useListModels, useDeleteModel } from "@workspace/api-client-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { User, Activity, Trash2, Brain, History } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { useQueryClient } from "@tanstack/react-query";

export default function Profile() {
  const { user } = useAuth();
  const { data: historyData } = useGetPredictionHistory();
  const { data: modelsData, refetch: refetchModels } = useListModels();
  const deleteModelMutation = useDeleteModel();
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const handleDeleteModel = (id: string) => {
    if (confirm("Are you sure you want to delete this trained model?")) {
      deleteModelMutation.mutate(
        { modelId: id },
        {
          onSuccess: () => {
            toast({ title: "Model deleted" });
            refetchModels();
          },
          onError: () => {
            toast({ title: "Failed to delete model", variant: "destructive" });
          }
        }
      );
    }
  };

  if (!user) return null;

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold flex items-center gap-3">
          <User className="text-primary w-8 h-8" /> User Profile
        </h1>
      </div>

      <div className="grid lg:grid-cols-3 gap-8">
        <div className="lg:col-span-1 space-y-6">
          <Card className="glass-card border-white/5 glow-border">
            <CardContent className="p-6 flex flex-col items-center text-center">
              <div className="w-24 h-24 rounded-full bg-primary/20 flex items-center justify-center mb-4 border border-primary/50">
                <span className="text-3xl font-bold text-primary">{user.username.charAt(0).toUpperCase()}</span>
              </div>
              <h2 className="text-xl font-bold">{user.fullName || user.username}</h2>
              <p className="text-muted-foreground">{user.email}</p>
              <Badge variant="outline" className="mt-4 border-primary/30 text-primary">
                {user.role.toUpperCase()}
              </Badge>
              
              <div className="w-full grid grid-cols-2 gap-4 mt-8 pt-6 border-t border-white/5">
                <div>
                  <p className="text-2xl font-bold">{user.predictionsCount}</p>
                  <p className="text-xs text-muted-foreground">Predictions</p>
                </div>
                <div>
                  <p className="text-2xl font-bold">{modelsData?.models.length || 0}</p>
                  <p className="text-xs text-muted-foreground">Saved Models</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        <div className="lg:col-span-2 space-y-8">
          <Card className="glass-card border-white/5">
            <CardHeader className="border-b border-white/5 pb-4">
              <CardTitle className="flex items-center gap-2 text-lg">
                <Brain className="text-primary w-5 h-5" /> Saved Models
              </CardTitle>
            </CardHeader>
            <CardContent className="p-0">
              <div className="divide-y divide-white/5 max-h-[300px] overflow-y-auto">
                {modelsData?.models.length ? modelsData.models.map(model => (
                  <div key={model.id} className="p-4 flex items-center justify-between hover:bg-white/5">
                    <div>
                      <div className="font-semibold flex items-center gap-2">
                        {model.symbol} <Badge variant="secondary" className="text-[10px]">{model.modelType.replace('_', ' ')}</Badge>
                      </div>
                      <div className="text-xs text-muted-foreground mt-1 flex gap-4">
                        <span>Created: {new Date(model.createdAt).toLocaleDateString()}</span>
                        {model.metrics && <span>R²: {model.metrics.r2Score.toFixed(3)}</span>}
                      </div>
                    </div>
                    <Button variant="ghost" size="icon" onClick={() => handleDeleteModel(model.id)} className="text-destructive hover:bg-destructive/20">
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </div>
                )) : (
                  <div className="p-8 text-center text-muted-foreground text-sm">No saved models yet.</div>
                )}
              </div>
            </CardContent>
          </Card>

          <Card className="glass-card border-white/5">
            <CardHeader className="border-b border-white/5 pb-4">
              <CardTitle className="flex items-center gap-2 text-lg">
                <History className="text-primary w-5 h-5" /> Prediction History
              </CardTitle>
            </CardHeader>
            <CardContent className="p-0">
              <div className="divide-y divide-white/5 max-h-[400px] overflow-y-auto">
                {historyData?.history.length ? historyData.history.map(item => (
                  <div key={item.id} className="p-4 flex items-center justify-between hover:bg-white/5">
                    <div>
                      <div className="font-bold text-lg">{item.symbol}</div>
                      <div className="text-xs text-muted-foreground">{new Date(item.createdAt).toLocaleString()}</div>
                    </div>
                    <div className="text-right">
                      <Badge className={
                        item.recommendation === 'BUY' ? 'bg-accent/20 text-accent border-accent/20' :
                        item.recommendation === 'SELL' ? 'bg-destructive/20 text-destructive border-destructive/20' :
                        'bg-white/10 text-white'
                      }>
                        {item.recommendation}
                      </Badge>
                      <div className="text-xs text-muted-foreground mt-1">Conf: {(item.confidenceScore * 100).toFixed(0)}%</div>
                    </div>
                  </div>
                )) : (
                  <div className="p-8 text-center text-muted-foreground text-sm">No prediction history yet.</div>
                )}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
