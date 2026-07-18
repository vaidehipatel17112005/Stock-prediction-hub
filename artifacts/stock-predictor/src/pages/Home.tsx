import { Button } from "@/components/ui/button";
import { Link } from "wouter";
import { motion } from "framer-motion";
import { ArrowRight, Brain, TrendingUp, BarChart3, Database, LineChart, FileDown, ShieldCheck } from "lucide-react";
import { useEffect, useRef } from "react";

const BackgroundChart = () => {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;

    const points: { x: number, y: number, vy: number }[] = [];
    const numPoints = 50;
    const spacing = canvas.width / (numPoints - 1);

    let startY = canvas.height * 0.6;
    for (let i = 0; i < numPoints; i++) {
      points.push({
        x: i * spacing,
        y: startY + (Math.random() - 0.5) * 200,
        vy: (Math.random() - 0.5) * 2
      });
      startY = points[i].y;
    }

    let animationFrameId: number;

    const draw = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      
      // Update points
      for (let i = 0; i < numPoints; i++) {
        points[i].y += points[i].vy;
        if (points[i].y > canvas.height || points[i].y < 0) {
          points[i].vy *= -1;
        }
      }

      // Draw grid
      ctx.strokeStyle = 'rgba(255, 255, 255, 0.03)';
      ctx.lineWidth = 1;
      for(let i=0; i<canvas.width; i+=50) {
        ctx.beginPath(); ctx.moveTo(i, 0); ctx.lineTo(i, canvas.height); ctx.stroke();
      }
      for(let i=0; i<canvas.height; i+=50) {
        ctx.beginPath(); ctx.moveTo(0, i); ctx.lineTo(canvas.width, i); ctx.stroke();
      }

      // Draw line
      ctx.beginPath();
      ctx.moveTo(points[0].x, points[0].y);
      for (let i = 1; i < numPoints; i++) {
        const xc = (points[i].x + points[i - 1].x) / 2;
        const yc = (points[i].y + points[i - 1].y) / 2;
        ctx.quadraticCurveTo(points[i - 1].x, points[i - 1].y, xc, yc);
      }
      ctx.lineTo(canvas.width, canvas.height);
      ctx.lineTo(0, canvas.height);
      
      // Gradient fill
      const gradient = ctx.createLinearGradient(0, 0, 0, canvas.height);
      gradient.addColorStop(0, 'rgba(0, 212, 255, 0.1)');
      gradient.addColorStop(1, 'rgba(0, 212, 255, 0)');
      ctx.fillStyle = gradient;
      ctx.fill();

      // Stroke line
      ctx.beginPath();
      ctx.moveTo(points[0].x, points[0].y);
      for (let i = 1; i < numPoints; i++) {
        const xc = (points[i].x + points[i - 1].x) / 2;
        const yc = (points[i].y + points[i - 1].y) / 2;
        ctx.quadraticCurveTo(points[i - 1].x, points[i - 1].y, xc, yc);
      }
      
      ctx.strokeStyle = '#00d4ff';
      ctx.lineWidth = 3;
      ctx.stroke();

      // Draw dots
      points.forEach(p => {
        ctx.beginPath();
        ctx.arc(p.x, p.y, 2, 0, Math.PI * 2);
        ctx.fillStyle = '#00ff88';
        ctx.fill();
        ctx.shadowBlur = 10;
        ctx.shadowColor = '#00ff88';
      });
      ctx.shadowBlur = 0;

      animationFrameId = requestAnimationFrame(draw);
    };

    draw();

    return () => cancelAnimationFrame(animationFrameId);
  }, []);

  return (
    <canvas 
      ref={canvasRef} 
      className="absolute inset-0 pointer-events-none opacity-40 dark:opacity-30 mix-blend-screen"
    />
  );
};

export default function Home() {
  return (
    <div className="relative min-h-screen overflow-hidden flex flex-col items-center">
      {/* Hero Section */}
      <section className="relative w-full min-h-[90vh] flex items-center justify-center overflow-hidden">
        <BackgroundChart />
        
        <div className="absolute inset-0 bg-gradient-to-b from-background/0 via-background/50 to-background z-0" />
        
        <div className="container relative z-10 px-4 text-center">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            className="inline-flex items-center gap-2 px-3 py-1 rounded-full border border-primary/30 bg-primary/10 text-primary mb-8"
          >
            <span className="w-2 h-2 rounded-full bg-primary animate-pulse" />
            <span className="text-sm font-medium">v2.0 Models Now Live</span>
          </motion.div>
          
          <motion.h1 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.1 }}
            className="text-5xl md:text-7xl lg:text-8xl font-extrabold tracking-tight mb-6"
          >
            Predict the Future.<br />
            <span className="bg-gradient-to-r from-primary via-accent to-primary bg-clip-text text-transparent">
              Outperform the Market.
            </span>
          </motion.h1>
          
          <motion.p 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.2 }}
            className="text-lg md:text-2xl text-muted-foreground max-w-3xl mx-auto mb-10"
          >
            Institutional-grade machine learning models for retail investors. 
            Forecast prices using LSTM, XGBoost, Random Forest, and SVR algorithms.
          </motion.p>
          
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.3 }}
            className="flex flex-col sm:flex-row items-center justify-center gap-4"
          >
            <Button size="lg" className="h-14 px-8 text-lg bg-primary hover:bg-primary/90 text-primary-foreground shadow-[0_0_20px_rgba(0,212,255,0.4)]" asChild>
              <Link href="/predict">
                Start Predicting <ArrowRight className="ml-2 w-5 h-5" />
              </Link>
            </Button>
            <Button size="lg" variant="outline" className="h-14 px-8 text-lg border-white/10 hover:bg-white/5 backdrop-blur-md" asChild>
              <Link href="/dashboard">View Market Dashboard</Link>
            </Button>
          </motion.div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="w-full py-12 relative z-10 border-y border-white/5 bg-white/5 dark:bg-black/20 backdrop-blur-md">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
            {[
              { label: "Active Users", value: "24.5k+" },
              { label: "Predictions Made", value: "1.2M+" },
              { label: "Avg. Accuracy", value: "87.4%" },
              { label: "Supported Assets", value: "8,500+" }
            ].map((stat, i) => (
              <motion.div 
                key={i}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: i * 0.1 }}
                className="text-center"
              >
                <div className="text-3xl md:text-5xl font-bold text-foreground mb-2">{stat.value}</div>
                <div className="text-sm md:text-base text-muted-foreground">{stat.label}</div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="w-full py-24 container mx-auto px-4 relative z-10">
        <div className="text-center mb-16">
          <h2 className="text-3xl md:text-5xl font-bold mb-4">Wall Street Tech.<br/>Retail Access.</h2>
          <p className="text-muted-foreground max-w-2xl mx-auto">
            We've democratized access to the same quantitative models used by top hedge funds.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {[
            { icon: Brain, title: "6 ML Models", desc: "Choose from Linear Regression to Deep LSTM Networks for your forecasts." },
            { icon: TrendingUp, title: "Technical Indicators", desc: "Automated calculation of RSI, MACD, Bollinger Bands, and Moving Averages." },
            { icon: Database, title: "Real-time Data", desc: "Sub-second latency market data across global exchanges and crypto." },
            { icon: BarChart3, title: "Portfolio Sim", desc: "Backtest trading strategies and simulate future portfolio growth." },
            { icon: ShieldCheck, title: "Model Comparison", desc: "Run multiple algorithms simultaneously and compare their R² and MAE scores." },
            { icon: FileDown, title: "Export Reports", desc: "Download comprehensive PDF and CSV reports of your predictive analysis." },
          ].map((feature, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, scale: 0.95 }}
              whileInView={{ opacity: 1, scale: 1 }}
              viewport={{ once: true }}
              transition={{ duration: 0.4, delay: i * 0.05 }}
              className="glass-card p-6 rounded-2xl hover:border-primary/50 transition-colors group cursor-default glow-border"
            >
              <div className="w-12 h-12 rounded-lg bg-primary/10 flex items-center justify-center mb-4 group-hover:bg-primary/20 transition-colors">
                <feature.icon className="w-6 h-6 text-primary" />
              </div>
              <h3 className="text-xl font-semibold mb-2">{feature.title}</h3>
              <p className="text-muted-foreground">{feature.desc}</p>
            </motion.div>
          ))}
        </div>
      </section>

      {/* Live Ticker Strip */}
      <div className="w-full bg-card border-y border-white/5 py-3 overflow-hidden flex whitespace-nowrap z-10">
        <motion.div 
          animate={{ x: ["0%", "-50%"] }}
          transition={{ ease: "linear", duration: 20, repeat: Infinity }}
          className="flex gap-12 text-sm font-medium"
        >
          {Array(20).fill(0).map((_, i) => (
            <div key={i} className="flex items-center gap-2">
              <span className="text-foreground">
                {["AAPL", "TSLA", "MSFT", "NVDA", "BTC"][i % 5]}
              </span>
              <span className={i % 2 === 0 ? "text-accent" : "text-destructive"}>
                {i % 2 === 0 ? "+" : "-"}{(Math.random() * 5).toFixed(2)}%
              </span>
            </div>
          ))}
        </motion.div>
      </div>
      
    </div>
  );
}
