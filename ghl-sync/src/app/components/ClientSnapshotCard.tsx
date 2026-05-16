import { Card, CardContent } from '@mui/material';
import { Building2, TrendingUp, TrendingDown } from 'lucide-react';

interface ClientSnapshotCardProps {
  clientName: string;
  industry: string;
  adSpend: number;
  costPerLead: number;
  roas: number;
  trend: number;
}

export function ClientSnapshotCard({ clientName, industry, adSpend, costPerLead, roas, trend }: ClientSnapshotCardProps) {
  const isPositiveTrend = trend >= 0;

  return (
    <Card className="bg-card hover:shadow-lg transition-shadow cursor-pointer">
      <CardContent className="p-6">
        <div className="flex items-start gap-3 mb-4">
          <div className="w-12 h-12 rounded-lg bg-primary/10 flex items-center justify-center flex-shrink-0">
            <Building2 className="w-6 h-6 text-primary" />
          </div>
          <div className="flex-1 min-w-0">
            <h3 className="truncate">{clientName}</h3>
            <p className="text-sm text-muted-foreground">{industry}</p>
          </div>
        </div>

        <div className="space-y-3">
          <div className="flex justify-between items-center">
            <span className="text-sm text-muted-foreground">Ad Spend</span>
            <span className="font-medium">${adSpend.toLocaleString()}</span>
          </div>
          <div className="flex justify-between items-center">
            <span className="text-sm text-muted-foreground">Cost Per Lead</span>
            <span className="font-medium">${costPerLead.toFixed(2)}</span>
          </div>
          <div className="flex justify-between items-center">
            <span className="text-sm text-muted-foreground">ROAS</span>
            <span className={`font-medium ${roas >= 2 ? 'text-green-600' : roas >= 1 ? 'text-yellow-600' : 'text-red-600'}`}>
              {roas.toFixed(2)}x
            </span>
          </div>
        </div>

        <div className="mt-4 pt-4 border-t border-border flex items-center justify-between">
          <span className="text-sm text-muted-foreground">Performance</span>
          <div className="flex items-center gap-1">
            {isPositiveTrend ? (
              <TrendingUp className="w-4 h-4 text-green-600" />
            ) : (
              <TrendingDown className="w-4 h-4 text-red-600" />
            )}
            <span className={`text-sm ${isPositiveTrend ? 'text-green-600' : 'text-red-600'}`}>
              {isPositiveTrend ? '+' : ''}{trend}%
            </span>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
