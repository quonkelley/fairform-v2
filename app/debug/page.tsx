'use client';

import { CaseCreationDebug } from '@/components/debug/case-creation-debug';
import { MonitoringDashboard } from '@/components/debug/monitoring-dashboard';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';

export default function DebugPage() {
  return (
    <div className="container mx-auto py-8">
      <div className="max-w-6xl mx-auto">
        <div className="mb-8">
          <h1 className="text-3xl font-bold">Debug Tools</h1>
          <p className="text-muted-foreground mt-2">
            Tools for debugging case creation and monitoring system health
          </p>
        </div>
        
        <Tabs defaultValue="monitoring" className="space-y-6">
          <TabsList>
            <TabsTrigger value="monitoring">System Monitoring</TabsTrigger>
            <TabsTrigger value="debug">Case Creation Debug</TabsTrigger>
          </TabsList>
          
          <TabsContent value="monitoring">
            <MonitoringDashboard />
          </TabsContent>
          
          <TabsContent value="debug">
            <CaseCreationDebug />
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}
