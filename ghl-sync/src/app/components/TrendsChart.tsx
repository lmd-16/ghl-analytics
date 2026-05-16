import { Card, CardContent, CardHeader } from '@mui/material';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from 'recharts';

const trendsData = [
  { month: 'Jan', leads: 2400, conversions: 180, revenue: 45000 },
  { month: 'Feb', leads: 2800, conversions: 210, revenue: 52500 },
  { month: 'Mar', leads: 3200, conversions: 245, revenue: 61250 },
  { month: 'Apr', leads: 2900, conversions: 220, revenue: 55000 },
  { month: 'May', leads: 3500, conversions: 275, revenue: 68750 },
  { month: 'Jun', leads: 3720, conversions: 280, revenue: 70000 },
];

export function TrendsChart() {
  return (
    <Card className="bg-card">
      <CardHeader>
        <h3>Performance Trends</h3>
        <p className="text-muted-foreground">6-month overview of key metrics</p>
      </CardHeader>
      <CardContent>
        <ResponsiveContainer width="100%" height={300}>
          <LineChart data={trendsData}>
            <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" />
            <XAxis dataKey="month" stroke="var(--muted-foreground)" />
            <YAxis stroke="var(--muted-foreground)" />
            <Tooltip
              contentStyle={{
                backgroundColor: 'var(--card)',
                border: '1px solid var(--border)',
                borderRadius: '8px'
              }}
            />
            <Legend />
            <Line
              type="monotone"
              dataKey="leads"
              stroke="#3b82f6"
              strokeWidth={2}
              dot={{ fill: '#3b82f6' }}
            />
            <Line
              type="monotone"
              dataKey="conversions"
              stroke="#10b981"
              strokeWidth={2}
              dot={{ fill: '#10b981' }}
            />
          </LineChart>
        </ResponsiveContainer>
      </CardContent>
    </Card>
  );
}
