// src/components/InterpretabilityGraph.jsx
import React from 'react';
import {
  AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, Legend,
  ResponsiveContainer, ReferenceLine, ReferenceDot
} from 'recharts';

export default function InterpretabilityGraph({ data }) {
  if (!data || !data.timeseries || data.timeseries.length === 0) {
    return <div style={{ padding: '20px', textAlign: 'center' }}>Cap dada disponible per a aquest gràfic.</div>;
  }

  // Find marker dates
  const todayPoint = data.timeseries.find(p => p.is_current_date);
  const overduePoint = data.timeseries.find(p => p.is_overdue_date);
  const pastTriggeredPoints = data.timeseries.filter(p => p.is_past_triggered);

  // Format dates for tooltip
  const CustomTooltip = ({ active, payload, label }) => {
    if (active && payload && payload.length) {
      return (
        <div style={{ backgroundColor: 'rgba(25, 25, 25, 0.95)', border: '1px solid #333', padding: '10px', borderRadius: '4px', color: '#fff', fontSize: '0.85rem' }}>
          <p style={{ margin: '0 0 5px 0', fontWeight: 'bold' }}>{label}</p>
          {payload.map((entry, index) => (
            <p key={`item-${index}`} style={{ margin: '3px 0', color: entry.color }}>
              {entry.name}: {entry.value} dies
            </p>
          ))}
        </div>
      );
    }
    return null;
  };

  return (
    <div className="interpretability-graph-container" style={{ width: '100%', height: 300, marginTop: '1rem', backgroundColor: '#1E1E1E', padding: '10px', borderRadius: '8px' }}>
      <ResponsiveContainer width="100%" height="100%">
        <AreaChart
          data={data.timeseries}
          margin={{ top: 20, right: 30, left: 0, bottom: 0 }}
        >
          <CartesianGrid strokeDasharray="3 3" stroke="#333" vertical={false} />
          <XAxis 
            dataKey="date" 
            stroke="#888" 
            tick={{ fill: '#888', fontSize: 12 }} 
            tickFormatter={(tick) => tick.substring(5)} // Show MM-DD
          />
          <YAxis 
            stroke="#888" 
            tick={{ fill: '#888', fontSize: 12 }}
            label={{ value: 'Dies', angle: -90, position: 'insideLeft', fill: '#888' }}
          />
          <Tooltip content={<CustomTooltip />} />
          <Legend wrapperStyle={{ fontSize: '0.8rem', paddingTop: '10px' }} />
          
          <Area 
            type="monotone" 
            dataKey="days_since_purchase" 
            name="Dies des de l'última compra" 
            stroke="#0F9ED5" 
            fill="#0F9ED5" 
            fillOpacity={0.3} 
            strokeWidth={2}
          />
          <Area 
            type="step" 
            dataKey="moving_threshold" 
            name="Llindar Mòbil (Avís)" 
            stroke="#F97316" 
            strokeDasharray="5 5" 
            fill="none" 
            strokeWidth={2}
          />
          <Area 
            type="step" 
            dataKey="frozen_threshold" 
            name="Llindar Crític (Endarrerit)" 
            stroke="#EF4444" 
            fill="none" 
            strokeWidth={2}
          />

          {/* Reference Lines & Dots */}
          {todayPoint && (
             <ReferenceLine x={todayPoint.date} stroke="#888" strokeDasharray="3 3" label={{ position: 'insideTopLeft', value: 'Avui', fill: '#888', fontSize: 10 }} />
          )}
          {overduePoint && (
             <ReferenceLine x={overduePoint.date} stroke="#EF4444" strokeDasharray="3 3" label={{ position: 'insideTopLeft', value: 'Endarrerit', fill: '#EF4444', fontSize: 10 }} />
          )}
          {pastTriggeredPoints.map((p, i) => (
             <ReferenceDot key={`trigger-${i}`} x={p.date} y={p.days_since_purchase} r={5} fill="#F97316" stroke="white" />
          ))}

        </AreaChart>
      </ResponsiveContainer>
    </div>
  );
}
