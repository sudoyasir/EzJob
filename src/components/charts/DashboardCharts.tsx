import { Card } from "@/components/ui/card";
import { ChartContainer, ChartTooltip, ChartTooltipContent } from "@/components/ui/chart";
import { BarChart, Bar, XAxis, YAxis, ResponsiveContainer, PieChart, Pie, Cell, LineChart, Line } from "recharts";
import { JobApplication } from "@/services/jobApplications";
import { format, subDays, eachDayOfInterval } from "date-fns";

interface DashboardChartsProps {
  applications: JobApplication[];
}

export const DashboardCharts = ({ applications }: DashboardChartsProps) => {
  // Status distribution data
  const statusData = [
    { 
      status: 'Applied', 
      count: applications.filter(app => app.status === 'Applied').length,
      fill: 'hsl(var(--chart-1))'
    },
    { 
      status: 'Interview', 
      count: applications.filter(app => app.status === 'Interview').length,
      fill: 'hsl(var(--chart-2))'
    },
    { 
      status: 'Offer', 
      count: applications.filter(app => app.status === 'Offer').length,
      fill: 'hsl(var(--chart-3))'
    },
    { 
      status: 'Rejected', 
      count: applications.filter(app => app.status === 'Rejected').length,
      fill: 'hsl(var(--chart-4))'
    },
  ].filter(item => item.count > 0);

  // Applications over time (last 30 days)
  const timelineData = (() => {
    const today = new Date();
    const thirtyDaysAgo = subDays(today, 29);
    const days = eachDayOfInterval({ start: thirtyDaysAgo, end: today });
    
    return days.map(day => {
      const dayStr = format(day, 'yyyy-MM-dd');
      const count = applications.filter(app => 
        format(new Date(app.applied_date), 'yyyy-MM-dd') === dayStr
      ).length;
      
      return {
        date: format(day, 'MMM dd'),
        count,
        fullDate: dayStr
      };
    });
  })();

  // Company applications (top 10)
  const companyData = (() => {
    const companyCounts: Record<string, number> = {};
    applications.forEach(app => {
      companyCounts[app.company_name] = (companyCounts[app.company_name] || 0) + 1;
    });
    
    return Object.entries(companyCounts)
      .map(([company, count]) => ({ company, count }))
      .sort((a, b) => b.count - a.count)
      .slice(0, 10);
  })();

  const chartConfig = {
    applied: { label: "Applied", color: "hsl(var(--chart-1))" },
    interview: { label: "Interview", color: "hsl(var(--chart-2))" },
    offer: { label: "Offer", color: "hsl(var(--chart-3))" },
    rejected: { label: "Rejected", color: "hsl(var(--chart-4))" },
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
      {/* Status Distribution Pie Chart */}
      <Card className="p-6">
        <div className="mb-4">
          <h3 className="text-lg font-semibold">Application Status Distribution</h3>
          <p className="text-sm text-muted-foreground">Overview of your application statuses</p>
        </div>
        <ChartContainer config={chartConfig} className="h-[300px]">
          <PieChart>
            <Pie
              data={statusData}
              cx="50%"
              cy="50%"
              outerRadius={80}
              innerRadius={40}
              paddingAngle={2}
              dataKey="count"
            >
              {statusData.map((entry, index) => (
                <Cell key={`cell-${index}`} fill={entry.fill} />
              ))}
            </Pie>
            <ChartTooltip
              content={
                <ChartTooltipContent 
                  formatter={(value, name) => [
                    `${value} applications`,
                    name
                  ]}
                />
              }
            />
          </PieChart>
        </ChartContainer>
      </Card>

      {/* Applications Timeline */}
      <Card className="p-6">
        <div className="mb-4">
          <h3 className="text-lg font-semibold">Applications Over Time</h3>
          <p className="text-sm text-muted-foreground">Your application activity in the last 30 days</p>
        </div>
        <ChartContainer config={chartConfig} className="h-[300px]">
          <LineChart data={timelineData}>
            <XAxis 
              dataKey="date" 
              tick={{ fontSize: 12 }}
              interval="preserveStartEnd"
            />
            <YAxis tick={{ fontSize: 12 }} />
            <Line 
              type="monotone" 
              dataKey="count" 
              stroke="hsl(var(--primary))" 
              strokeWidth={2}
              dot={{ fill: "hsl(var(--primary))", strokeWidth: 2, r: 4 }}
              activeDot={{ r: 6, fill: "hsl(var(--primary))" }}
            />
            <ChartTooltip
              content={
                <ChartTooltipContent 
                  formatter={(value) => [
                    `${value} applications`,
                    "Applications"
                  ]}
                />
              }
            />
          </LineChart>
        </ChartContainer>
      </Card>

      {/* Top Companies */}
      {companyData.length > 0 && (
        <Card className="p-6 lg:col-span-2">
          <div className="mb-4">
            <h3 className="text-lg font-semibold">Top Companies Applied To</h3>
            <p className="text-sm text-muted-foreground">Companies where you've submitted the most applications</p>
          </div>
          <ChartContainer config={chartConfig} className="h-[300px]">
            <BarChart data={companyData} layout="horizontal">
              <XAxis type="number" tick={{ fontSize: 12 }} />
              <YAxis 
                type="category" 
                dataKey="company" 
                tick={{ fontSize: 12 }}
                width={150}
              />
              <Bar 
                dataKey="count" 
                fill="hsl(var(--primary))"
                radius={[0, 4, 4, 0]}
              />
              <ChartTooltip
                content={
                  <ChartTooltipContent 
                    formatter={(value, name, props) => [
                      `${value} applications`,
                      props.payload?.company
                    ]}
                  />
                }
              />
            </BarChart>
          </ChartContainer>
        </Card>
      )}
    </div>
  );
};
