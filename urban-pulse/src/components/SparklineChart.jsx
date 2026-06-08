import { ResponsiveContainer, LineChart, Line, Tooltip } from "recharts";

export function SparklineChart({ data, color = "#3b82f6" }) {
  const chartData = data.map((v, i) => ({ v, i }));
  return (
    <ResponsiveContainer width="100%" height={40}>
      <LineChart data={chartData}>
        <Line
          type="monotone"
          dataKey="v"
          stroke={color}
          strokeWidth={1.5}
          dot={false}
          isAnimationActive={false}
        />
        <Tooltip
          contentStyle={{ background: "#1e293b", border: "none", borderRadius: 6, fontSize: 11, padding: "4px 8px" }}
          labelFormatter={() => ""}
          formatter={(v) => [v, ""]}
        />
      </LineChart>
    </ResponsiveContainer>
  );
}
