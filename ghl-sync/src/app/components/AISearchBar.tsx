import { Search, Sparkles } from 'lucide-react';
import { Card } from '@mui/material';
import { useState } from 'react';

export function AISearchBar() {
  const [query, setQuery] = useState('');

  return (
    <Card className="bg-card p-4">
      <div className="flex items-center gap-3">
        <div className="flex items-center gap-2 flex-1 bg-input-background rounded-lg px-4 py-3">
          <Sparkles className="w-5 h-5 text-primary" />
          <input
            type="text"
            placeholder="Ask AI about your data... (e.g., 'Which campaigns have the best ROAS?' or 'Show me ad spend trends')"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            className="flex-1 bg-transparent border-none outline-none text-foreground placeholder:text-muted-foreground"
          />
          <Search className="w-5 h-5 text-muted-foreground" />
        </div>
      </div>
    </Card>
  );
}
