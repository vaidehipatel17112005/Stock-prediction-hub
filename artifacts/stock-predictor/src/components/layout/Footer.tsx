import { LineChart, Github, Twitter, Linkedin } from "lucide-react";
import { Link } from "wouter";

export function Footer() {
  return (
    <footer className="border-t border-white/5 bg-background/80 backdrop-blur-lg mt-auto">
      <div className="container mx-auto px-4 py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          <div className="space-y-4">
            <Link href="/" className="flex items-center gap-2 group">
              <LineChart className="w-6 h-6 text-primary" />
              <span className="font-bold text-lg tracking-tight">StockAI</span>
            </Link>
            <p className="text-sm text-muted-foreground max-w-xs">
              Institutional-grade stock market predictions powered by advanced machine learning algorithms.
            </p>
            <div className="flex gap-4 pt-2">
              <a href="#" className="text-muted-foreground hover:text-primary transition-colors">
                <Twitter className="w-5 h-5" />
              </a>
              <a href="#" className="text-muted-foreground hover:text-primary transition-colors">
                <Github className="w-5 h-5" />
              </a>
              <a href="#" className="text-muted-foreground hover:text-primary transition-colors">
                <Linkedin className="w-5 h-5" />
              </a>
            </div>
          </div>
          
          <div>
            <h3 className="font-semibold mb-4 text-foreground">Platform</h3>
            <ul className="space-y-2 text-sm text-muted-foreground">
              <li><Link href="/predict" className="hover:text-primary transition-colors">AI Predictor</Link></li>
              <li><Link href="/indicators" className="hover:text-primary transition-colors">Technical Analysis</Link></li>
              <li><Link href="/compare" className="hover:text-primary transition-colors">Model Comparison</Link></li>
              <li><Link href="/portfolio" className="hover:text-primary transition-colors">Portfolio Simulator</Link></li>
            </ul>
          </div>
          
          <div>
            <h3 className="font-semibold mb-4 text-foreground">Resources</h3>
            <ul className="space-y-2 text-sm text-muted-foreground">
              <li><Link href="/about" className="hover:text-primary transition-colors">How it Works</Link></li>
              <li><Link href="/news" className="hover:text-primary transition-colors">Market News</Link></li>
              <li><a href="#" className="hover:text-primary transition-colors">API Documentation</a></li>
              <li><a href="#" className="hover:text-primary transition-colors">Help Center</a></li>
            </ul>
          </div>
          
          <div>
            <h3 className="font-semibold mb-4 text-foreground">Legal</h3>
            <ul className="space-y-2 text-sm text-muted-foreground">
              <li><a href="#" className="hover:text-primary transition-colors">Privacy Policy</a></li>
              <li><a href="#" className="hover:text-primary transition-colors">Terms of Service</a></li>
              <li><a href="#" className="hover:text-primary transition-colors">Disclaimer</a></li>
              <li><a href="#" className="hover:text-primary transition-colors">Contact Us</a></li>
            </ul>
          </div>
        </div>
        
        <div className="border-t border-white/5 mt-12 pt-8 flex flex-col md:flex-row justify-between items-center gap-4 text-sm text-muted-foreground">
          <p>© {new Date().getFullYear()} StockAI. All rights reserved.</p>
          <p>
            Disclaimer: Predictions are for informational purposes only. Do not trade solely based on AI forecasts.
          </p>
        </div>
      </div>
    </footer>
  );
}
