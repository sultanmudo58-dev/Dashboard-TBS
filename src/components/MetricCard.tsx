import React from 'react';
import { motion } from 'motion/react';
import { LucideIcon } from 'lucide-react';

interface MetricCardProps {
  title: string;
  value: string | number;
  subValue?: string;
  icon: LucideIcon;
  iconColor: string;
  bgColor: string;
  progress?: number;
  progressColor?: string;
}

export default function MetricCard({
  title,
  value,
  subValue,
  icon: Icon,
  iconColor,
  bgColor,
  progress,
  progressColor = 'bg-indigo-600',
}: MetricCardProps) {
  return (
    <motion.div
      whileHover={{ y: -2 }}
      transition={{ duration: 0.15 }}
      className="p-5 bg-white rounded-2xl border border-slate-200 shadow-xs flex flex-col justify-between hover:shadow-md transition-all duration-200"
    >
      <div className="flex justify-between items-center">
        <div>
          <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">{title}</span>
          <h3 className="text-2xl font-bold text-slate-900 mt-1 leading-none">{value}</h3>
          {subValue && <span className="text-xs font-normal text-slate-500 mt-1.5 block">{subValue}</span>}
        </div>
        <div className={`w-11 h-11 rounded-xl flex items-center justify-center shrink-0 ${bgColor} border border-slate-100/10`}>
          <Icon className={`w-5 h-5 ${iconColor}`} />
        </div>
      </div>

      {progress !== undefined && (
        <div className="mt-4 pt-3 border-t border-slate-50">
          <div className="flex justify-between text-[11px] font-bold text-slate-500 mb-1">
            <span className="uppercase tracking-wider">Rata-Rata Pencapaian</span>
            <span className="text-slate-800 font-mono font-bold">{progress.toFixed(1)}%</span>
          </div>
          <div className="w-full bg-slate-100 h-1.5 rounded-full overflow-hidden">
            <div
              className={`h-full rounded-full transition-all duration-500 ${progressColor}`}
              style={{ width: `${Math.min(100, Math.max(0, progress))}%` }}
            />
          </div>
        </div>
      )}
    </motion.div>
  );
}
