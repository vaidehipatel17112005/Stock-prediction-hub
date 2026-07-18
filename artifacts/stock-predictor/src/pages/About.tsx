import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Brain, TrendingUp, Network, BarChart2, CheckCircle2, XCircle } from "lucide-react";

export default function About() {
  const models = [
    {
      id: "linear_regression",
      name: "Linear Regression",
      icon: TrendingUp,
      color: "text-blue-400",
      bg: "bg-blue-400/10",
      border: "border-blue-400/20",
      desc: "Models the relationship between the target price and historical features by fitting a linear equation to observed data.",
      bestFor: "Establishing a baseline, highly trended data without wild volatility.",
      pros: ["Extremely fast training", "Perfectly interpretable weights", "No risk of complex overfitting"],
      cons: ["Cannot capture non-linear market dynamics", "Poor performance in volatile regimes"]
    },
    {
      id: "random_forest",
      name: "Random Forest Regressor",
      icon: Brain,
      color: "text-green-400",
      bg: "bg-green-400/10",
      border: "border-green-400/20",
      desc: "An ensemble method that operates by constructing a multitude of decision trees at training time and outputting the mean prediction of individual trees.",
      bestFor: "Tabular financial data with many technical indicators as features.",
      pros: ["Highly resistant to overfitting", "Provides feature importance scores", "Handles non-linear relationships well"],
      cons: ["Can be memory intensive", "Predictions cannot extrapolate beyond training data range"]
    },
    {
      id: "xgboost",
      name: "XGBoost",
      icon: BarChart2,
      color: "text-orange-400",
      bg: "bg-orange-400/10",
      border: "border-orange-400/20",
      desc: "Optimized distributed gradient boosting library designed to be highly efficient, flexible and portable. It builds trees sequentially to minimize errors.",
      bestFor: "Winning Kaggle competitions; state-of-the-art for structured tabular stock data.",
      pros: ["Exceptional accuracy on structured data", "Built-in regularization", "Handles missing values implicitly"],
      cons: ["Prone to overfitting if hyperparameters aren't tuned", "Black-box nature"]
    },
    {
      id: "lstm",
      name: "LSTM Deep Neural Network",
      icon: Network,
      color: "text-purple-400",
      bg: "bg-purple-400/10",
      border: "border-purple-400/20",
      desc: "Long Short-Term Memory networks are a special kind of RNN, capable of learning long-term dependencies in sequence data.",
      bestFor: "Complex, high-frequency time-series forecasting where sequence matters more than independent features.",
      pros: ["State-of-the-art for sequence data", "Captures long-term temporal dependencies", "Can model highly complex non-linear systems"],
      cons: ["Very slow to train", "Requires massive amounts of data", "Highly sensitive to hyperparameters"]
    }
  ];

  return (
    <div className="container mx-auto px-4 py-12 max-w-5xl">
      <div className="text-center mb-16">
        <h1 className="text-4xl font-bold mb-4">Under the Hood: Our ML Models</h1>
        <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
          StockAI utilizes a diverse portfolio of algorithms to forecast market movements. Understand the strengths and limitations of each.
        </p>
      </div>

      <div className="space-y-12">
        {models.map((model) => (
          <div key={model.id} className={`p-[1px] rounded-2xl bg-gradient-to-br from-white/10 to-transparent`}>
            <div className={`glass-card rounded-2xl p-8 border-l-4 ${model.border.replace('border-', 'border-l-')}`}>
              <div className="flex items-start gap-6">
                <div className={`w-16 h-16 rounded-xl flex items-center justify-center shrink-0 ${model.bg}`}>
                  <model.icon className={`w-8 h-8 ${model.color}`} />
                </div>
                
                <div className="flex-1">
                  <h2 className="text-2xl font-bold mb-2">{model.name}</h2>
                  <p className="text-muted-foreground text-lg mb-6 leading-relaxed">
                    {model.desc}
                  </p>
                  
                  <div className="grid md:grid-cols-2 gap-8 mb-6">
                    <div>
                      <h4 className="font-semibold flex items-center gap-2 mb-3 text-green-400">
                        <CheckCircle2 className="w-4 h-4" /> Strengths
                      </h4>
                      <ul className="space-y-2">
                        {model.pros.map((pro, i) => (
                          <li key={i} className="flex items-start gap-2 text-sm text-muted-foreground">
                            <span className="w-1.5 h-1.5 rounded-full bg-green-400/50 mt-1.5 shrink-0" />
                            {pro}
                          </li>
                        ))}
                      </ul>
                    </div>
                    <div>
                      <h4 className="font-semibold flex items-center gap-2 mb-3 text-red-400">
                        <XCircle className="w-4 h-4" /> Limitations
                      </h4>
                      <ul className="space-y-2">
                        {model.cons.map((con, i) => (
                          <li key={i} className="flex items-start gap-2 text-sm text-muted-foreground">
                            <span className="w-1.5 h-1.5 rounded-full bg-red-400/50 mt-1.5 shrink-0" />
                            {con}
                          </li>
                        ))}
                      </ul>
                    </div>
                  </div>
                  
                  <div className="bg-black/30 rounded-lg p-4 text-sm">
                    <span className="font-semibold text-foreground mr-2">Best used for:</span>
                    <span className="text-muted-foreground">{model.bestFor}</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>
      
      <div className="mt-20 p-8 glass-card border-white/5 rounded-2xl text-center">
        <h3 className="text-2xl font-bold mb-4">The StockAI Data Pipeline</h3>
        <p className="text-muted-foreground max-w-3xl mx-auto mb-8">
          All our models go through a rigorous preprocessing pipeline before training. We fetch OHLCV data, compute 15+ technical indicators (RSI, MACD, Bollinger Bands), remove anomalies, and scale features using MinMax normalization to ensure optimal convergence.
        </p>
        <div className="flex flex-col md:flex-row items-center justify-center gap-4 text-sm font-mono text-primary">
          <div className="px-4 py-2 border border-primary/20 bg-primary/5 rounded-lg">Raw Data Fetch</div>
          <span className="text-muted-foreground">→</span>
          <div className="px-4 py-2 border border-primary/20 bg-primary/5 rounded-lg">Feature Eng.</div>
          <span className="text-muted-foreground">→</span>
          <div className="px-4 py-2 border border-primary/20 bg-primary/5 rounded-lg">Normalization</div>
          <span className="text-muted-foreground">→</span>
          <div className="px-4 py-2 border border-accent/20 bg-accent/5 text-accent rounded-lg">Model Training</div>
        </div>
      </div>
    </div>
  );
}
