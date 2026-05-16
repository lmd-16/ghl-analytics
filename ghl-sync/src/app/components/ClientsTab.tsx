import { Card, CardContent, CardHeader } from '@mui/material';
import { Building2, ChevronDown, ChevronRight } from 'lucide-react';
import { useState } from 'react';

const clientsData = [
  {
    name: 'TechStart Solutions',
    industry: 'SaaS',
    campaigns: 3,
    adSpend: 16380,
    totalLeads: 2176,
    costPerLead: 7.53,
    appointmentsBooked: 652,
    costPerAppt: 25.12,
    appointmentsShowed: 489,
    costPerShow: 33.50,
    closedDeals: 161,
    costPerAcquisition: 101.74,
    apptBookingRate: 30.0,
    apptShowRate: 75.0,
    showToCloseRate: 32.9,
    overallConversionRate: 7.4,
    totalRevenue: 40000,
    roas: 2.44,
  },
  {
    name: 'HealthFirst Clinic',
    industry: 'Healthcare',
    campaigns: 2,
    adSpend: 12820,
    totalLeads: 1279,
    costPerLead: 10.02,
    appointmentsBooked: 384,
    costPerAppt: 33.39,
    appointmentsShowed: 307,
    costPerShow: 41.76,
    closedDeals: 90,
    costPerAcquisition: 142.44,
    apptBookingRate: 30.0,
    apptShowRate: 80.0,
    showToCloseRate: 29.3,
    overallConversionRate: 7.0,
    totalRevenue: 21250,
    roas: 1.66,
  },
  {
    name: 'FitLife Gym',
    industry: 'Fitness',
    campaigns: 2,
    adSpend: 2350,
    totalLeads: 452,
    costPerLead: 5.20,
    appointmentsBooked: 181,
    costPerAppt: 12.98,
    appointmentsShowed: 144,
    costPerShow: 16.32,
    closedDeals: 54,
    costPerAcquisition: 43.52,
    apptBookingRate: 40.0,
    apptShowRate: 79.6,
    showToCloseRate: 37.5,
    overallConversionRate: 11.9,
    totalRevenue: 13500,
    roas: 5.74,
  },
  {
    name: 'EcoHome Products',
    industry: 'E-commerce',
    campaigns: 1,
    adSpend: 7800,
    totalLeads: 813,
    costPerLead: 9.59,
    appointmentsBooked: 244,
    costPerAppt: 31.97,
    appointmentsShowed: 183,
    costPerShow: 42.62,
    closedDeals: 56,
    costPerAcquisition: 139.29,
    apptBookingRate: 30.0,
    apptShowRate: 75.0,
    showToCloseRate: 30.6,
    overallConversionRate: 6.9,
    totalRevenue: 15250,
    roas: 1.96,
  },
];

export function ClientsTab() {
  const [expandedClients, setExpandedClients] = useState<Set<number>>(new Set());

  const toggleClient = (index: number) => {
    const newExpanded = new Set(expandedClients);
    if (newExpanded.has(index)) {
      newExpanded.delete(index);
    } else {
      newExpanded.add(index);
    }
    setExpandedClients(newExpanded);
  };

  return (
    <div className="space-y-6">

      {/* Clients List */}
      <Card className="bg-card">
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <h3>Client Performance</h3>
              <p className="text-muted-foreground">Detailed funnel metrics by client</p>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {clientsData.map((client, index) => (
              <div key={index} className="border border-border rounded-lg overflow-hidden">
                {/* Client Header */}
                <button
                  onClick={() => toggleClient(index)}
                  className="w-full p-6 hover:bg-accent/50 transition-colors"
                >
                  <div className="flex items-center gap-4 mb-4">
                    {expandedClients.has(index) ? (
                      <ChevronDown className="w-5 h-5 text-muted-foreground" />
                    ) : (
                      <ChevronRight className="w-5 h-5 text-muted-foreground" />
                    )}
                    <div className="flex items-center gap-3">
                      <div className="w-12 h-12 rounded-lg bg-primary/10 flex items-center justify-center">
                        <Building2 className="w-6 h-6 text-primary" />
                      </div>
                      <div className="text-left">
                        <div className="flex items-center gap-2">
                          <h3>{client.name}</h3>
                          <span className="text-xs px-2 py-1 bg-secondary rounded-full text-muted-foreground">
                            {client.industry}
                          </span>
                        </div>
                        <p className="text-sm text-muted-foreground">{client.campaigns} active campaigns</p>
                      </div>
                    </div>
                  </div>

                  {/* Metrics Grid */}
                  <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-7 gap-4 text-left">
                    <div>
                      <p className="text-xs text-muted-foreground mb-1">Ad Spend</p>
                      <p className="font-medium">${client.adSpend.toLocaleString()}</p>
                    </div>
                    <div>
                      <p className="text-xs text-muted-foreground mb-1">Total Leads</p>
                      <p className="font-medium">{client.totalLeads.toLocaleString()}</p>
                    </div>
                    <div>
                      <p className="text-xs text-muted-foreground mb-1">Cost Per Lead</p>
                      <p className="font-medium">${client.costPerLead.toFixed(2)}</p>
                    </div>
                    <div>
                      <p className="text-xs text-muted-foreground mb-1">Appts Booked</p>
                      <p className="font-medium">{client.appointmentsBooked}</p>
                    </div>
                    <div>
                      <p className="text-xs text-muted-foreground mb-1">Appts Showed</p>
                      <p className="font-medium">{client.appointmentsShowed}</p>
                    </div>
                    <div>
                      <p className="text-xs text-muted-foreground mb-1">Closed Deals</p>
                      <p className="font-medium">{client.closedDeals}</p>
                    </div>
                    <div>
                      <p className="text-xs text-muted-foreground mb-1">ROAS</p>
                      <p className={`font-medium ${client.roas >= 2 ? 'text-green-600' : client.roas >= 1 ? 'text-yellow-600' : 'text-red-600'}`}>
                        {client.roas.toFixed(2)}x
                      </p>
                    </div>
                  </div>
                </button>

                {/* Expanded Details */}
                {expandedClients.has(index) && (
                  <div className="border-t border-border bg-accent/20 p-6">
                    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-6">
                      <div>
                        <p className="text-sm text-muted-foreground mb-1">Cost Per Appt</p>
                        <p className="text-xl font-medium">${client.costPerAppt.toFixed(2)}</p>
                      </div>
                      <div>
                        <p className="text-sm text-muted-foreground mb-1">Cost Per Show</p>
                        <p className="text-xl font-medium">${client.costPerShow.toFixed(2)}</p>
                      </div>
                      <div>
                        <p className="text-sm text-muted-foreground mb-1">Cost Per Acquisition</p>
                        <p className="text-xl font-medium">${client.costPerAcquisition.toFixed(2)}</p>
                      </div>
                      <div>
                        <p className="text-sm text-muted-foreground mb-1">Appt Booking Rate</p>
                        <p className="text-xl font-medium">{client.apptBookingRate.toFixed(1)}%</p>
                      </div>
                      <div>
                        <p className="text-sm text-muted-foreground mb-1">Appt Show Rate</p>
                        <p className="text-xl font-medium">{client.apptShowRate.toFixed(1)}%</p>
                      </div>
                      <div>
                        <p className="text-sm text-muted-foreground mb-1">Show to Close Rate</p>
                        <p className="text-xl font-medium">{client.showToCloseRate.toFixed(1)}%</p>
                      </div>
                      <div>
                        <p className="text-sm text-muted-foreground mb-1">Overall Conversion</p>
                        <p className="text-xl font-medium">{client.overallConversionRate.toFixed(1)}%</p>
                      </div>
                      <div>
                        <p className="text-sm text-muted-foreground mb-1">Total Revenue</p>
                        <p className="text-xl font-medium">${client.totalRevenue.toLocaleString()}</p>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
