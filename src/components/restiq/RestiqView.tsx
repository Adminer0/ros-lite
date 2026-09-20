import React from 'react';
import {
  Brain,
  Sparkles,
  TrendingUp,
  Clock,
  CheckCircle2,
  AlertTriangle,
  Lightbulb,
  ArrowRight,
  ShieldCheck,
  Zap,
} from 'lucide-react';
import { RestIQInsight } from '../../types';
import { Card, CardHeader, CardTitle, CardContent } from '../ui/Card';
import { Badge } from '../ui/Badge';
import { Button } from '../ui/Button';

interface RestiqViewProps {
  insights: RestIQInsight[];
  onNavigate: (route: string, params?: any) => void;
}

export function RestiqView({ insights, onNavigate }: RestiqViewProps) {
  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'highlight':
        return <Sparkles className="w-4 h-4 text-purple-600" />;
      case 'positive':
        return <TrendingUp className="w-4 h-4 text-emerald-600" />;
      case 'warning':
        return <AlertTriangle className="w-4 h-4 text-amber-600" />;
      default:
        return <Zap className="w-4 h-4 text-blue-600" />;
    }
  };

  const getTypeBadge = (type: string) => {
    switch (type) {
      case 'highlight':
        return <Badge variant="purple">Key Opportunity</Badge>;
      case 'positive':
        return <Badge variant="success">High Performance</Badge>;
      case 'warning':
        return <Badge variant="warning">Attention Required</Badge>;
      default:
        return <Badge variant="secondary">Operational Trend</Badge>;
    }
  };

  return (
    <div className="space-y-4">
      {/* RestIQ Header */}
      <div className="bg-gradient-to-r from-stone-900 via-stone-800 to-emerald-950 rounded-xl p-5 text-white shadow-md flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <div className="w-7 h-7 rounded-lg bg-emerald-500/20 border border-emerald-400/30 flex items-center justify-center">
              <Brain className="w-4 h-4 text-emerald-400" />
            </div>
            <h1 className="text-xl font-extrabold tracking-tight">RestIQ Smart Operational Insights</h1>
          </div>
          <p className="text-xs text-stone-300 max-w-2xl leading-relaxed">
            Automated menu engineering matrix, kitchen bottleneck detection, and margin enhancement derived directly from order telemetry.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <div className="bg-stone-800/80 border border-stone-700/80 px-3 py-1.5 rounded-lg text-xs">
            <span className="text-stone-400 block text-[10px]">Data Confidence</span>
            <span className="font-extrabold text-emerald-400 font-mono text-sm">96.4% Deterministic</span>
          </div>
        </div>
      </div>

      {/* Grid of Insight Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {insights.map((item) => (
          <Card key={item.id} className="border-stone-200 bg-white hover:border-emerald-700 transition-all shadow-xs flex flex-col justify-between">
            <CardHeader className="p-4 pb-2 space-y-2">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 rounded-lg bg-stone-100 flex items-center justify-center">
                    {getTypeIcon(item.type)}
                  </div>
                  <div>
                    <span className="text-[10px] font-bold text-stone-400 uppercase tracking-wider block">
                      Metric: {item.metric}
                    </span>
                    <h3 className="text-sm font-bold text-stone-900 leading-snug">{item.title}</h3>
                  </div>
                </div>
                {getTypeBadge(item.type)}
              </div>
            </CardHeader>

            <CardContent className="p-4 pt-1 space-y-3">
              <p className="text-xs text-stone-600 leading-relaxed">{item.description}</p>

              {/* Action Box */}
              <div className="bg-stone-50 border border-stone-200 rounded-lg p-2.5 space-y-1 text-xs">
                <span className="font-bold text-stone-900 flex items-center gap-1.5">
                  <Lightbulb className="w-3.5 h-3.5 text-amber-600" />
                  Recommended Action:
                </span>
                <p className="text-[11px] text-stone-700 pl-5 leading-relaxed">{item.recommendation}</p>
              </div>

              {/* Metric Callout */}
              <div className="flex items-center justify-between pt-2 border-t border-stone-100 text-xs">
                <span className="text-stone-400 font-mono text-[11px]">Confidence: {item.confidence}</span>
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => {
                    if (item.type === 'highlight') onNavigate('menu');
                    else if (item.type === 'warning') onNavigate('kds');
                    else onNavigate('floor');
                  }}
                  className="h-7 text-xs text-emerald-800 hover:text-emerald-950 gap-1 border-stone-200"
                >
                  <span>Take Action</span>
                  <ArrowRight className="w-3 h-3" />
                </Button>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
