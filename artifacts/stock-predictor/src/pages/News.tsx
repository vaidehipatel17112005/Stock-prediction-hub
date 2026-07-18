import { useGetStockNews } from "@workspace/api-client-react";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ExternalLink, Clock, Newspaper } from "lucide-react";
import { useState } from "react";
import { Button } from "@/components/ui/button";

export default function News() {
  const [filter, setFilter] = useState("");
  const { data, isLoading } = useGetStockNews({ limit: 50, symbol: filter || undefined });

  const categories = ["All", "AAPL", "MSFT", "TSLA", "NVDA", "Crypto"];

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6 mb-8">
        <div>
          <h1 className="text-3xl font-bold flex items-center gap-3">
            <Newspaper className="text-primary w-8 h-8" /> Market Intelligence
          </h1>
          <p className="text-muted-foreground mt-1">Real-time news aggregated and analyzed for sentiment.</p>
        </div>
        
        <div className="flex gap-2 overflow-x-auto pb-2 w-full md:w-auto">
          {categories.map(cat => (
            <Button
              key={cat}
              variant={filter === (cat === "All" ? "" : cat) ? "default" : "outline"}
              className={filter === (cat === "All" ? "" : cat) ? "bg-primary text-black" : "border-white/10"}
              onClick={() => setFilter(cat === "All" ? "" : cat)}
              size="sm"
            >
              {cat}
            </Button>
          ))}
        </div>
      </div>

      {isLoading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {[...Array(6)].map((_, i) => (
            <Card key={i} className="h-[200px] animate-pulse bg-white/5 border-white/5" />
          ))}
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {data?.articles.map((article, i) => (
            <a key={i} href={article.url} target="_blank" rel="noopener noreferrer" className="block group">
              <Card className="glass-card border-white/5 h-full hover:border-primary/30 transition-all hover:shadow-[0_0_20px_rgba(0,212,255,0.1)] hover:-translate-y-1 duration-300">
                <CardContent className="p-6 flex flex-col h-full">
                  <div className="flex justify-between items-start mb-4">
                    <span className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                      {article.source}
                    </span>
                    {article.sentiment && (
                      <Badge variant="outline" className={`
                        ${article.sentiment === 'positive' ? 'text-accent border-accent/20 bg-accent/10' : 
                          article.sentiment === 'negative' ? 'text-destructive border-destructive/20 bg-destructive/10' : 
                          'text-muted-foreground border-white/10'}
                      `}>
                        {article.sentiment}
                      </Badge>
                    )}
                  </div>
                  
                  <h3 className="text-lg font-semibold mb-3 group-hover:text-primary transition-colors line-clamp-3">
                    {article.title}
                  </h3>
                  
                  <p className="text-sm text-muted-foreground line-clamp-3 mb-6 flex-1">
                    {article.summary}
                  </p>
                  
                  <div className="flex items-center justify-between text-xs text-muted-foreground mt-auto pt-4 border-t border-white/5">
                    <span className="flex items-center gap-1">
                      <Clock className="w-3 h-3" /> {new Date(article.publishedAt).toLocaleDateString()}
                    </span>
                    <span className="flex items-center gap-1 group-hover:text-primary transition-colors">
                      Read full <ExternalLink className="w-3 h-3" />
                    </span>
                  </div>
                </CardContent>
              </Card>
            </a>
          ))}
        </div>
      )}
    </div>
  );
}
