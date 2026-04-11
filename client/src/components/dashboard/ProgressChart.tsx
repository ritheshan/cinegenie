import { motion } from 'framer-motion';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from 'recharts';

interface ScoreEntry {
  title: string;
  date: string;
  grammar: number;
  fluency: number;
  vocabulary: number;
  confidence: number;
}

interface ProgressChartProps {
  data: ScoreEntry[];
}

export default function ProgressChart({ data }: ProgressChartProps) {
  if (data.length === 0) {
    return null;
  }

  const chartData = data.map((d) => ({
    name: d.title.length > 12 ? d.title.substring(0, 12) + '…' : d.title,
    Grammar: d.grammar,
    Fluency: d.fluency,
    Vocabulary: d.vocabulary,
    Confidence: d.confidence,
  }));

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.3 }}
      className="bg-slate-800/50 backdrop-blur-sm border border-slate-700/50 rounded-xl p-6"
    >
      <h3 className="text-lg font-bold text-white mb-6">Score Trends</h3>
      <ResponsiveContainer width="100%" height={300}>
        <LineChart data={chartData}>
          <CartesianGrid strokeDasharray="3 3" stroke="#334155" />
          <XAxis dataKey="name" tick={{ fill: '#94a3b8', fontSize: 11 }} />
          <YAxis domain={[0, 100]} tick={{ fill: '#94a3b8', fontSize: 11 }} />
          <Tooltip
            contentStyle={{
              backgroundColor: '#1e293b',
              border: '1px solid #475569',
              borderRadius: '8px',
              color: '#f1f5f9',
            }}
          />
          <Legend wrapperStyle={{ color: '#94a3b8' }} />
          <Line type="monotone" dataKey="Grammar" stroke="#a78bfa" strokeWidth={2} dot={{ r: 4 }} />
          <Line type="monotone" dataKey="Fluency" stroke="#22d3ee" strokeWidth={2} dot={{ r: 4 }} />
          <Line type="monotone" dataKey="Vocabulary" stroke="#f472b6" strokeWidth={2} dot={{ r: 4 }} />
          <Line type="monotone" dataKey="Confidence" stroke="#34d399" strokeWidth={2} dot={{ r: 4 }} />
        </LineChart>
      </ResponsiveContainer>
    </motion.div>
  );
}
