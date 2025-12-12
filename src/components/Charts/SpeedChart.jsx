import React from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

const SpeedChart = ({ data }) => {
  return (
    <div className="chart-card">
      <h3 className="chart-card__title">⚡ Tốc Độ: Hiệu Suất Xử Lý (Avg)</h3>
      <ResponsiveContainer width="100%" height={250}>
        <BarChart layout="vertical" data={data}>
          <CartesianGrid strokeDasharray="3 3" />
          <XAxis type="number" />
          <YAxis dataKey="dock" type="category" />
          <Tooltip />
          <Bar dataKey="avg" fill="#e67e22" name="Phút" />
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
};

export default SpeedChart;
