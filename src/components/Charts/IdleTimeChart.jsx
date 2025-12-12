import React from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

const IdleTimeChart = ({ data }) => {
  return (
    <div className="chart-card">
      <h3 className="chart-card__title">⏱️ Khả Dụng: Thời Gian Dock Trống</h3>
      <ResponsiveContainer width="100%" height={250}>
        <BarChart layout="vertical" data={data}>
          <CartesianGrid strokeDasharray="3 3" />
          <XAxis type="number" />
          <YAxis dataKey="dock" type="category" />
          <Tooltip />
          <Bar dataKey="idleTime" fill="#27ae60" name="Phút trống" />
        </BarChart>
      </ResponsiveContainer>
      <div className="chart-card__note">Top 5 dock có thời gian trống nhiều nhất (sẵn sàng)</div>
    </div>
  );
};

export default IdleTimeChart;
