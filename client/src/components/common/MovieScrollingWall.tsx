const POSTERS_COL_1 = [
  'https://image.tmdb.org/t/p/w500/8Gxv2Z7HqD6hwg5YjGcK07j7631.jpg',
  'https://image.tmdb.org/t/p/w500/gEU2QniE6E7vNIvHG8JZbgDc2jC.jpg',
  'https://image.tmdb.org/t/p/w500/o0xl6j3NKgOI4l2sy4aOIgfPM4C.jpg',
  'https://image.tmdb.org/t/p/w500/qJ2tWw75eXHG2j2586TMJsScwbi.jpg',
  'https://image.tmdb.org/t/p/w500/t6z2Zk0nQCoYhy43XImm5UGJ5R3.jpg',
  'https://image.tmdb.org/t/p/w500/czemb4hm1Yj42uQD2vK158X3lhv.jpg',
];

const POSTERS_COL_2 = [
  'https://image.tmdb.org/t/p/w500/ii8Q1mNwbAFTSt4N4g244qoHN7g.jpg',
  'https://image.tmdb.org/t/p/w500/8VtBz775m8l78G34n3q73o9y56M.jpg',
  'https://image.tmdb.org/t/p/w500/w34XT53D86676tCR5fN5nUvK4vA.jpg',
  'https://image.tmdb.org/t/p/w500/7fn624j5ljx5nL89467j6756M.jpg',
  'https://image.tmdb.org/t/p/w500/uDO8zWDhf6O1zsN5ICetQb7vILt.jpg',
  'https://image.tmdb.org/t/p/w500/d5iil4xe79g0HSCSRcy59H4UHGt.jpg',
];

export default function MovieScrollingWall() {
  const col1 = [...POSTERS_COL_1, ...POSTERS_COL_1];
  const col2 = [...POSTERS_COL_2, ...POSTERS_COL_2];

  return (
    <div className="relative w-full h-full overflow-hidden flex gap-4 p-4 bg-slate-950">
      <style>{`
        @keyframes scrollUp {
          0% { transform: translateY(0); }
          100% { transform: translateY(-50%); }
        }
        @keyframes scrollDown {
          0% { transform: translateY(-50%); }
          100% { transform: translateY(0); }
        }
        .animate-scroll-up {
          animation: scrollUp 35s linear infinite;
        }
        .animate-scroll-down {
          animation: scrollDown 35s linear infinite;
        }
      `}</style>

      {/* Decorative gradient overlay */}
      <div className="absolute inset-0 bg-gradient-to-r from-slate-950/90 via-transparent to-slate-950/90 z-10 pointer-events-none" />
      <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-transparent to-slate-950 z-10 pointer-events-none" />

      {/* Column 1 - Scrolling UP */}
      <div className="flex-1 flex flex-col gap-4 animate-scroll-up">
        {col1.map((url, index) => (
          <div
            key={`col1-${index}`}
            className="w-full aspect-[2/3] rounded-xl overflow-hidden shadow-2xl border border-slate-800/80 hover:border-purple-500/30 transition-colors duration-300"
          >
            <img src={url} alt="Movie poster" className="w-full h-full object-cover" loading="lazy" />
          </div>
        ))}
      </div>

      {/* Column 2 - Scrolling DOWN */}
      <div className="flex-1 flex flex-col gap-4 animate-scroll-down">
        {col2.map((url, index) => (
          <div
            key={`col2-${index}`}
            className="w-full aspect-[2/3] rounded-xl overflow-hidden shadow-2xl border border-slate-800/80 hover:border-cyan-500/30 transition-colors duration-300"
          >
            <img src={url} alt="Movie poster" className="w-full h-full object-cover" loading="lazy" />
          </div>
        ))}
      </div>
    </div>
  );
}
