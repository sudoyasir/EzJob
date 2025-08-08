import { Card } from "@/components/ui/card";
import { ChartContainer, ChartTooltip, ChartTooltipContent, ChartLegend, ChartLegendContent } from "@/components/ui/chart";
import { BarChart, Bar, XAxis, YAxis, PieChart, Pie, Cell, LineChart, Line } from "recharts";
import { JobApplication } from "@/services/jobApplications";
import { format, subDays, eachDayOfInterval } from "date-fns";

interface DashboardChartsProps {
  applications: JobApplication[];
}

export const DashboardCharts = ({ applications }: DashboardChartsProps) => {
  // Status distribution data
  const statusData = [
    { 
      name: 'Applied', 
      value: applications.filter(app => app.status === 'Applied').length,
      fill: 'hsl(var(--chart-1))'
    },
    { 
      name: 'Interview', 
      value: applications.filter(app => app.status === 'Interview').length,
      fill: 'hsl(var(--chart-2))'
    },
    { 
      name: 'Offer', 
      value: applications.filter(app => app.status === 'Offer').length,
      fill: 'hsl(var(--chart-3))'
    },
    { 
      name: 'Rejected', 
      value: applications.filter(app => app.status === 'Rejected').length,
      fill: 'hsl(var(--chart-4))'
    },
  ].filter(item => item.value > 0);

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
    Applied: { 
      label: "Applied", 
      color: "hsl(var(--chart-1))" 
    },
    Interview: { 
      label: "Interview", 
      color: "hsl(var(--chart-2))" 
    },
    Offer: { 
      label: "Offer", 
      color: "hsl(var(--chart-3))" 
    },
    Rejected: { 
      label: "Rejected", 
      color: "hsl(var(--chart-4))" 
    },
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6 mb-6 sm:mb-8">
      {/* Status Distribution Pie Chart */}
      <Card className="p-3 sm:p-4 lg:p-6 overflow-hidden">
        <div className="mb-3 sm:mb-4">
          <h3 className="text-sm sm:text-base lg:text-lg font-semibold">Application Status Distribution</h3>
          <p className="text-xs sm:text-sm text-muted-foreground">Overview of your application statuses</p>
        </div>
        <ChartContainer config={chartConfig} className="h-[200px] sm:h-[250px] lg:h-[300px] w-full">
          <PieChart>
            <Pie
              data={statusData}
              cx="50%"
              cy="50%"
              outerRadius="60%"
              innerRadius="30%"
              paddingAngle={2}
              dataKey="value"
              nameKey="name"
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
                  className="bg-background border-border shadow-lg text-xs sm:text-sm"
                />
              }
            />
            <ChartLegend 
              content={<ChartLegendContent className="text-xs sm:text-sm" />}
              verticalAlign="bottom"
              height={36}
            />
          </PieChart>
        </ChartContainer>
      </Card>

      {/* Applications Timeline */}
      <Card className="p-3 sm:p-4 lg:p-6 overflow-hidden">
        <div className="mb-3 sm:mb-4">
          <h3 className="text-sm sm:text-base lg:text-lg font-semibold">Applications Over Time</h3>
          <p className="text-xs sm:text-sm text-muted-foreground">Your application activity in the last 30 days</p>
        </div>
        <ChartContainer config={chartConfig} className="h-[200px] sm:h-[250px] lg:h-[300px] w-full">
          <LineChart 
            data={timelineData} 
            margin={{ top: 5, right: 10, left: 5, bottom: 5 }}
          >
            <XAxis 
              dataKey="date" 
              tick={{ fontSize: 10 }}
              interval="preserveStartEnd"
              axisLine={false}
              tickLine={false}
            />
            <YAxis 
              tick={{ fontSize: 10 }}
              axisLine={false}
              tickLine={false}
              width={30}
            />
            <Line 
              type="monotone" 
              dataKey="count" 
              stroke="hsl(var(--primary))" 
              strokeWidth={2}
              dot={{ fill: "hsl(var(--primary))", strokeWidth: 2, r: 3 }}
              activeDot={{ r: 5, fill: "hsl(var(--primary))" }}
            />
            <ChartTooltip
              content={
                <ChartTooltipContent 
                  formatter={(value) => [
                    `${value} applications`,
                    "Applications"
                  ]}
                  className="bg-background border-border shadow-lg text-xs sm:text-sm"
                />
              }
            />
          </LineChart>
        </ChartContainer>
      </Card>

      {/* Top Companies */}
      {companyData.length > 0 && (
        <Card className="p-3 sm:p-4 lg:p-6 lg:col-span-2 overflow-hidden">
          <div className="mb-3 sm:mb-4">
            <h3 className="text-sm sm:text-base lg:text-lg font-semibold">Top Companies Applied To</h3>
            <p className="text-xs sm:text-sm text-muted-foreground">Companies where you've submitted the most applications</p>
          </div>
          <ChartContainer config={chartConfig} className="h-[250px] sm:h-[300px] lg:h-[400px] w-full">
            <BarChart 
              data={companyData} 
              margin={{ top: 20, right: 10, left: 5, bottom: 60 }}
            >
              <XAxis 
                dataKey="company" 
                tick={{ fontSize: 9 }}
                height={60}
                interval={0}
                angle={-45}
                textAnchor="end"
                axisLine={false}
                tickLine={false}
              />
              <YAxis 
                tick={{ fontSize: 10 }}
                axisLine={false}
                tickLine={false}
                width={30}
              />
              <Bar 
                dataKey="count" 
                fill="hsl(var(--primary))"
                radius={[4, 4, 0, 0]}
                maxBarSize={60}
              />
              <ChartTooltip
                content={
                  <ChartTooltipContent 
                    formatter={(value, name, props) => [
                      `${value} applications`,
                      props.payload?.company || "Company"
                    ]}
                    className="bg-background border-border shadow-lg text-xs sm:text-sm"
                  />
                }
                cursor={false}
              />
            </BarChart>
          </ChartContainer>
        </Card>
      )}
    </div>
  );
};
