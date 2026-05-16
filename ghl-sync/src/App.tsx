import { useState } from 'react';
import { Tabs, Tab } from '@mui/material';
import { ClientsTab } from './app/components/ClientsTab';
import { AISearchBar } from './app/components/AISearchBar';
import { OverviewTab } from './app/components/OverviewTab';




export default function App() {
  const [activeTab, setActiveTab] = useState(0);

  const handleTabChange = (_event: React.SyntheticEvent, newValue: number) => {
    setActiveTab(newValue);
  };

  return (
    <div className="min-h-screen bg-background">
      <div className="max-w-[1600px] mx-auto p-6 space-y-6">
        {/* Header */}
        <div>
          <h1>Analytics Dashboard</h1>
          <p className="text-muted-foreground">GoHighLevel Marketing Performance</p>
        </div>

        {/* AI Search Bar */}
        <AISearchBar />

        {/* Tabs */}
        <div className="bg-card rounded-lg">
          <Tabs
            value={activeTab}
            onChange={handleTabChange}
            className="border-b border-border px-4"
            TabIndicatorProps={{
              style: { backgroundColor: 'var(--primary)' }
            }}
          >
            <Tab label="Overview" className="text-foreground" />
            <Tab label="Campaigns" className="text-foreground" />
            <Tab label="Clients" className="text-foreground" />
          </Tabs>

          <div className="p-6">
            {activeTab === 0 && <OverviewTab />}
            {activeTab === 2 && <ClientsTab />}
          </div>
        </div>
      </div>
    </div>
  );
}