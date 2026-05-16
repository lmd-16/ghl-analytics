import { ClientSnapshotCard } from './ClientSnapshotCard';

const clientSnapshots = [
  {
    clientName: 'TechStart Solutions',
    industry: 'SaaS',
    adSpend: 16380,
    costPerLead: 7.53,
    roas: 2.44,
    trend: 12
  },
  {
    clientName: 'HealthFirst Clinic',
    industry: 'Healthcare',
    adSpend: 12820,
    costPerLead: 10.02,
    roas: 1.66,
    trend: -3
  },
  {
    clientName: 'FitLife Gym',
    industry: 'Fitness',
    adSpend: 2350,
    costPerLead: 5.20,
    roas: 5.74,
    trend: 18
  },
  {
    clientName: 'EcoHome Products',
    industry: 'E-commerce',
    adSpend: 7800,
    costPerLead: 9.59,
    roas: 1.96,
    trend: 7
  },
];

export function OverviewTab() {
  return (
    <div className="space-y-6">
      <div>
        <h2>Client Overview</h2>
        <p className="text-muted-foreground">Quick snapshot of all active clients</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
        {clientSnapshots.map((client, index) => (
          <ClientSnapshotCard key={index} {...client} />
        ))}
      </div>
    </div>
  );
}
