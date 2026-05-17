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
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.15 }}
      className="bg-cine-surface border border-cine-border rounded p-6 shadow-xl"
    >
      <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-cine-accent mb-1">Fluency Progress</p>
      <h3 className="text-sm font-bold uppercase tracking-wider text-cine-text-primary mb-6">Score Trends</h3>
      
      <ResponsiveContainer width="100%" height={300}>
        <LineChart data={chartData}>
          <CartesianGrid strokeDasharray="3 3" stroke="#27272A" />
          <XAxis dataKey="name" tick={{ fill: '#A1A1AA', fontSize: 10 }} />
          <YAxis domain={[0, 100]} tick={{ fill: '#A1A1AA', fontSize: 10 }} />
          <Tooltip
            contentStyle={{
              backgroundColor: '#18181B',
              border: '1px solid #27272A',
              borderRadius: '4px',
              color: '#F4F4F5',
              fontSize: '11px',
              textTransform: 'uppercase',
              letterSpacing: '0.05em',
            }}
          />
          <Legend wrapperStyle={{ color: '#A1A1AA', fontSize: '11px', textTransform: 'uppercase', letterSpacing: '0.05em' }} />
          <Line type="monotone" dataKey="Fluency" stroke="#F4B942" strokeWidth={2.5} dot={{ r: 4 }} />
          <Line type="monotone" dataKey="Grammar" stroke="#E4E4E7" strokeWidth={2} dot={{ r: 3 }} strokeDasharray="4 4" />
          <Line type="monotone" dataKey="Vocabulary" stroke="#A1A1AA" strokeWidth={2} dot={{ r: 3 }} strokeDasharray="4 4" />
          <Line type="monotone" dataKey="Confidence" stroke="#52525B" strokeWidth={2} dot={{ r: 3 }} strokeDasharray="4 4" />
        </LineChart>
      </ResponsiveContainer>
    </motion.div>
  );
}
