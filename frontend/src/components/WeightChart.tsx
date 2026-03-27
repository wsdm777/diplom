import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";
import type { WeightEntry } from "../types";

interface Props {
  entries: WeightEntry[];
}

export default function WeightChart({ entries }: Props) {
  if (entries.length === 0) {
    return <p className="empty">Пока нет записей о весе</p>;
  }

  const data = entries.map((e) => ({
    date: new Date(e.measured_at).toLocaleDateString("ru-RU"),
    weight: e.weight,
  }));

  return (
    <div className="chart-container">
      <h3>Динамика веса</h3>
      <ResponsiveContainer width="100%" height={300}>
        <LineChart data={data}>
          <CartesianGrid strokeDasharray="3 3" />
          <XAxis dataKey="date" />
          <YAxis domain={["dataMin - 2", "dataMax + 2"]} unit=" кг" />
          <Tooltip />
          <Line
            type="monotone"
            dataKey="weight"
            stroke="#4f46e5"
            strokeWidth={2}
            dot={{ r: 4 }}
            name="Вес (кг)"
          />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
}
