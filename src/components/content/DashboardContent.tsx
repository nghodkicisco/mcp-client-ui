
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { parseChartData } from '@/utils/responseHandlers';
import { DashboardData } from '@/types';
import { 
  LineChart, Line, BarChart, Bar, AreaChart, Area, 
  PieChart, Pie, Cell, XAxis, YAxis, CartesianGrid, 
  Tooltip, Legend, ResponsiveContainer 
} from 'recharts';

interface DashboardContentProps {
  content: DashboardData | string;
}

const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884d8'];

const DashboardContent: React.FC<DashboardContentProps> = ({ content }) => {
  let dashboardTitle = "Dashboard";
  let dashboardDescription = "";
  let charts = [];
  
  if (typeof content === 'string') {
    try {
      const parsed = JSON.parse(content);
      dashboardTitle = parsed.title || "Dashboard";
      dashboardDescription = parsed.description || "";
      charts = parseChartData(parsed);
    } catch (e) {
      charts = [];
    }
  } else {
    dashboardTitle = content.title || "Dashboard";
    dashboardDescription = content.description || "";
    charts = content.charts || [];
  }
  
  const renderChart = (chartData: any, index: number) => {
    const { type, title, data } = chartData;
    
    switch (type) {
      case 'line':
        return (
          <Card key={index} className="col-span-1 md:col-span-2">
            <CardHeader>
              <CardTitle>{title}</CardTitle>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={300}>
                <LineChart data={data}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="name" />
                  <YAxis />
                  <Tooltip />
                  <Legend />
                  {Object.keys(data[0] || {})
                    .filter(key => key !== 'name')
                    .map((key, i) => (
                      <Line key={key} type="monotone" dataKey={key} stroke={COLORS[i % COLORS.length]} />
                    ))}
                </LineChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        );
        
      case 'bar':
        return (
          <Card key={index} className="col-span-1 md:col-span-2">
            <CardHeader>
              <CardTitle>{title}</CardTitle>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={data}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="name" />
                  <YAxis />
                  <Tooltip />
                  <Legend />
                  {Object.keys(data[0] || {})
                    .filter(key => key !== 'name')
                    .map((key, i) => (
                      <Bar key={key} dataKey={key} fill={COLORS[i % COLORS.length]} />
                    ))}
                </BarChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        );
        
      case 'area':
        return (
          <Card key={index} className="col-span-1 md:col-span-2">
            <CardHeader>
              <CardTitle>{title}</CardTitle>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={300}>
                <AreaChart data={data}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="name" />
                  <YAxis />
                  <Tooltip />
                  <Legend />
                  {Object.keys(data[0] || {})
                    .filter(key => key !== 'name')
                    .map((key, i) => (
                      <Area key={key} type="monotone" dataKey={key} fill={COLORS[i % COLORS.length]} stroke={COLORS[i % COLORS.length]} />
                    ))}
                </AreaChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        );
        
      case 'pie':
        return (
          <Card key={index} className="col-span-1 md:col-span-1">
            <CardHeader>
              <CardTitle>{title}</CardTitle>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={300}>
                <PieChart>
                  <Pie
                    data={data}
                    dataKey="value"
                    nameKey="name"
                    cx="50%"
                    cy="50%"
                    outerRadius={80}
                    label
                  >
                    {data.map((_: any, i: number) => (
                      <Cell key={`cell-${i}`} fill={COLORS[i % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip />
                  <Legend />
                </PieChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        );
        
      default:
        return null;
    }
  };
  
  return (
    <div className="w-full">
      <Card className="mb-4">
        <CardHeader>
          <CardTitle>{dashboardTitle}</CardTitle>
          {dashboardDescription && (
            <CardDescription>{dashboardDescription}</CardDescription>
          )}
        </CardHeader>
      </Card>
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        {charts.map((chart, index) => renderChart(chart, index))}
      </div>
    </div>
  );
};

export default DashboardContent;
