// import { Card, CardContent, CardHeader } from '@mui/material';
// import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell } from 'recharts';

// const funnelData = [
//   { stage: 'Visitors', count: 12450, percentage: 100 },
//   { stage: 'Leads', count: 3720, percentage: 30 },
//   { stage: 'Qualified', count: 1860, percentage: 15 },
//   { stage: 'Opportunities', count: 930, percentage: 7.5 },
//   { stage: 'Customers', count: 280, percentage: 2.2 },
// ];

// const COLORS = ['#3b82f6', '#06b6d4', '#10b981', '#f59e0b', '#ef4444'];

// export function FunnelChart() {
//   return (
//     <Card className="bg-card">
//       <CardHeader>
//         <h3>Conversion Funnel</h3>
//         <p className="text-muted-foreground">Lead progression through sales stages</p>
//       </CardHeader>
//       <CardContent>
//         <ResponsiveContainer width="100%" height={300}>
//           <BarChart data={funnelData} layout="vertical">
//             <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" />
//             <XAxis type="number" stroke="var(--muted-foreground)" />
//             <YAxis dataKey="stage" type="category" width={100} stroke="var(--muted-foreground)" />
//             <Tooltip
//               contentStyle={{
//                 backgroundColor: 'var(--card)',
//                 border: '1px solid var(--border)',
//                 borderRadius: '8px'
//               }}
//               formatter={(value: number, name: string, props: any) => [
//                 `${value.toLocaleString()} (${props.payload.percentage}%)`,
//                 'Count'
//               ]}
//             />
//             <Bar dataKey="count" radius={[0, 8, 8, 0]}>
//               {funnelData.map((entry, index) => (
//                 <Cell key={`cell-${index}`} fill={COLORS[index]} />
//               ))}
//             </Bar>
//           </BarChart>
//         </ResponsiveContainer>
//       </CardContent>
//     </Card>
//   );
// }
