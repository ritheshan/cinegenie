import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';

interface ActorCardProps {
  actor: any;
  index?: number;
}

export default function ActorCard({ actor, index = 0 }: ActorCardProps) {
  const navigate = useNavigate();
  const name = actor.name || 'Unknown';
  const knownFor = actor.known_for_department || 'Acting';

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: Math.min(index * 0.04, 0.5) }}
      onClick={() => navigate(`/actors/${actor.id}`)}
      className="group cursor-pointer flex-shrink-0"
    >
      {/* Profile image */}
      <div className="relative w-full aspect-square rounded-full overflow-hidden bg-slate-800 border-2 border-slate-700 group-hover:border-purple-500 transition-all shadow-lg">
        {actor.profile_path ? (
          <img
            src={`https://image.tmdb.org/t/p/w185${actor.profile_path}`}
            alt={name}
            className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-300"
            loading="lazy"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center text-3xl text-slate-600">
            👤
          </div>
        )}
        {/* Glow ring on hover */}
        <div className="absolute inset-0 rounded-full ring-0 group-hover:ring-2 ring-purple-500/60 transition-all" />
      </div>

      <div className="mt-2 text-center">
        <p className="text-sm font-semibold text-white truncate">{name}</p>
        <p className="text-xs text-slate-500">{knownFor}</p>
      </div>
    </motion.div>
  );
}
