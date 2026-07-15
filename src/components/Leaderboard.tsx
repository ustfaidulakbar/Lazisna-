import React from "react";
import { Trophy } from "lucide-react";

interface LeaderboardProps {
  currentAgentName: string;
}

export default function Leaderboard({ currentAgentName }: LeaderboardProps) {
  const leaderboardData = [
    { rank: 1, name: "Budi Santoso", totalPoints: 12500 },
    { rank: 2, name: "Ahmad Dahlan", totalPoints: 9800 },
    { rank: 3, name: "Siti Aminah", totalPoints: 7600 },
    { rank: 4, name: "Ust. Faidul Akbar", totalPoints: 4850 }, 
    { rank: 5, name: "Reza Rahadian", totalPoints: 1500 }
  ];

  return (
    <div className="bg-white rounded-2xl p-5 shadow-sm border border-slate-100 space-y-4">
      <div className="flex items-center gap-3 mb-2">
        <div className="w-8 h-8 rounded-full bg-yellow-100 text-yellow-600 flex items-center justify-center">
          <Trophy className="w-4 h-4" />
        </div>
        <div>
          <h3 className="font-bold text-slate-800">Top Rijal Lazisna</h3>
          <p className="text-[10px] text-slate-500">Peringkat agen berdasarkan komisi</p>
        </div>
      </div>
      
      <div className="space-y-3 mt-4">
        {leaderboardData.map((agent) => (
          <div 
            key={agent.rank} 
            className={`flex items-center gap-3 p-3 rounded-xl border ${agent.name === currentAgentName ? 'border-emerald-200 bg-emerald-50' : 'border-slate-100 bg-slate-50/50'}`}
          >
            <div className={`w-8 h-8 rounded-full flex items-center justify-center shrink-0 font-bold text-xs ${
              agent.rank === 1 ? 'bg-yellow-400 text-yellow-900 shadow-sm' : 
              agent.rank === 2 ? 'bg-slate-300 text-slate-700 shadow-sm' : 
              agent.rank === 3 ? 'bg-amber-600/30 text-amber-900 shadow-sm' : 
              'bg-slate-100 text-slate-500'
            }`}>
              #{agent.rank}
            </div>
            <div className="flex-1 min-w-0">
              <p className={`text-sm font-bold truncate ${agent.name === currentAgentName ? 'text-emerald-800' : 'text-slate-800'}`}>
                {agent.name} {agent.name === currentAgentName && "(Anda)"}
              </p>
              <p className="text-[10px] text-slate-500">Poin: <span className="font-semibold text-slate-700">{new Intl.NumberFormat("id-ID").format(agent.totalPoints)} Pts</span></p>
            </div>
            {agent.rank <= 3 && (
              <Trophy className={`w-4 h-4 ${
                agent.rank === 1 ? 'text-yellow-500' : 
                agent.rank === 2 ? 'text-slate-400' : 
                'text-amber-600'
              }`} />
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
