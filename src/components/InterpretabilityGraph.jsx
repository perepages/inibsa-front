// src/components/InterpretabilityGraph.jsx
import React from 'react';
import {
  AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, Legend,
  ResponsiveContainer, ReferenceLine, ReferenceDot
} from 'recharts';

export default function InterpretabilityGraph({ data }) {
  if (!data || !data.timeseries || data.timeseries.length === 0) {
    return <div style={{ padding: '20px', textAlign: 'center', color: '#438FC1' }}>Cap dada disponible per a aquest gràfic.</div>;
  }

  // Find marker dates
  const todayPoint = data.timeseries.find(p => p.is_current_date);
  const overduePoint = data.timeseries.find(p => p.is_overdue_date);
  const pastTriggeredPoints = data.timeseries.filter(p => p.is_past_triggered);

  // Format dates for tooltip
  const CustomTooltip = ({ active, payload, label }) => {
    if (active && payload && payload.length) {
      return (
        <div style={{
          backgroundColor: '#FFFFFF',
          border: '1px solid rgba(3, 56, 100, 0.12)',
          padding: '10px 14px',
          borderRadius: '8px',
          color: '#033864',
          fontSize: '0.85rem',
          boxShadow: '0 4px 12px rgba(3, 56, 100, 0.1)'
        }}>
          <p style={{ margin: '0 0 5px 0', fontWeight: 600, color: '#033864' }}>{label}</p>
          {payload.map((entry, index) => (
            <p key={`item-${index}`} style={{ margin: '3px 0', color: entry.color, fontSize: '0.8rem' }}>
              {entry.name}: {entry.value} dies
            </p>
          ))}
        </div>
      );
    }
    return null;
  };

  return (
    <div className="interpretability-graph-container">
      <ResponsiveContainer width="100%" height="100%">
        <AreaChart
          data={data.timeseries}
          margin={{ top: 20, right: 30, left: 0, bottom: 0 }}
        >
          <CartesianGrid strokeDasharray="3 3" stroke="rgba(3, 56, 100, 0.08)" vertical={false} />
          <XAxis 
            dataKey="date" 
            stroke="rgba(3, 56, 100, 0.3)" 
            tick={{ fill: 'rgba(3, 56, 100, 0.5)', fontSize: 11 }} 
            tickFormatter={(tick) => tick.substring(5)} // Show MM-DD
          />
          <YAxis 
            stroke="rgba(3, 56, 100, 0.3)" 
            tick={{ fill: 'rgba(3, 56, 100, 0.5)', fontSize: 11 }}
            label={{ value: 'Dies', angle: -90, position: 'insideLeft', fill: 'rgba(3, 56, 100, 0.4)' }}
          />
          <Tooltip content={<CustomTooltip />} />
          <Legend wrapperStyle={{ fontSize: '0.8rem', paddingTop: '10px', color: '#033864' }} />
          
          <Area 
            type="monotone" 
            dataKey="days_since_purchase" 
            name="Dies des de l'última compra" 
            stroke="#438FC1" 
            fill="#D9F1FA" 
            fillOpacity={0.5} 
            strokeWidth={2}
          />
          <Area 
            type="step" 
            dataKey="moving_threshold" 
            name="Llindar Mòbil (Avís)" 
            stroke="#e08b20" 
            strokeDasharray="5 5" 
            fill="none" 
            strokeWidth={2}
          />
          <Area 
            type="step" 
            dataKey="frozen_threshold" 
            name="Llindar Crític (Endarrerit)" 
            stroke="#FA5E58" 
            fill="none" 
            strokeWidth={2}
          />

          {/* Reference Lines & Dots */}
          {todayPoint && (
             <ReferenceLine x={todayPoint.date} stroke="rgba(3, 56, 100, 0.3)" strokeDasharray="3 3" label={{ position: 'insideTopLeft', value: 'Avui', fill: 'rgba(3, 56, 100, 0.5)', fontSize: 10 }} />
          )}
          {overduePoint && (
             <ReferenceLine x={overduePoint.date} stroke="#FA5E58" strokeDasharray="3 3" label={{ position: 'insideTopLeft', value: 'Endarrerit', fill: '#FA5E58', fontSize: 10 }} />
          )}
          {pastTriggeredPoints.map((p, i) => (
             <ReferenceDot key={`trigger-${i}`} x={p.date} y={p.days_since_purchase} r={5} fill="#e08b20" stroke="white" />
          ))}

        </AreaChart>
      </ResponsiveContainer>
    </div>
  );
}
