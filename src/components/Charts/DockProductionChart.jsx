import React from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Cell, ResponsiveContainer } from 'recharts';

const COLORS = ['#3498db', '#e74c3c', '#f39c12', '#27ae60', '#9b59b6'];

const DockProductionChart = ({ data }) => {
  return (
    <div className="chart-card">
      <h3 className="chart-card__title">📊 Sản Lượng: Tổng Số Xe Đã Xử Lý</h3>
      <ResponsiveContainer width="100%" height={250}>
        <BarChart layout="vertical" data={data}>
          <CartesianGrid strokeDasharray="3 3" />
          <XAxis type="number" />
          <YAxis dataKey="dock" type="category" />
          <Tooltip />
          <Bar dataKey="count" name="Số xe">
            {data.map((entry, index) => (
              <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
            ))}
          </Bar>
        </BarChart>
      </ResponsiveContainer>
      <div className="chart-card__note">Tổng hợp số liệu trên toàn thành phố (Daily Performance)</div>
    </div>
  );
};

export default DockProductionChart;
