import { motion } from 'framer-motion';
import { ChevronDown } from 'lucide-react';

export type PremiumFilterType = 'all' | 'my-tasks' | 'in-progress' | 'done';

interface FilterOption {
  id: PremiumFilterType;
  label: string;
  icon?: string;
  count: number;
}

interface PremiumFilterBarProps {
  filters: FilterOption[];
  activeFilter: PremiumFilterType;
  onFilterChange: (filterId: PremiumFilterType) => void;
}

export default function PremiumFilterBar({ filters, activeFilter, onFilterChange }: PremiumFilterBarProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, delay: 0.4 }}
      className="mb-8 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4"
    >
      <div className="flex items-center gap-2 p-1.5 bg-gray-100 rounded-2xl overflow-x-auto w-full sm:w-auto">
        {filters.map((filter) => (
          <button
            key={filter.id}
            onClick={() => onFilterChange(filter.id)}
            className={`
              relative px-6 py-2.5 rounded-xl
              font-medium text-sm whitespace-nowrap
              transition-all duration-200 ease-out
              ${activeFilter === filter.id
                ? 'text-white'
                : 'text-gray-600 hover:text-gray-900'
              }
            `}
          >
            {activeFilter === filter.id && (
              <motion.div
                layoutId="activeFilterBackground"
                className="absolute inset-0 bg-gradient-to-r from-[#2D5016] to-[#6FA84C] rounded-xl shadow-md"
                transition={{
                  type: 'spring',
                  stiffness: 300,
                  damping: 30
                }}
              />
            )}
            <span className="relative z-10 flex items-center gap-2">
              {filter.icon && <span>{filter.icon}</span>}
              {filter.label}
              {filter.count > 0 && (
                <span
                  className={`
                    px-2 py-0.5 rounded-full text-xs font-semibold
                    ${activeFilter === filter.id
                      ? 'bg-white/20 text-white'
                      : 'bg-gray-200 text-gray-700'
                    }
                  `}
                >
                  {filter.count}
                </span>
              )}
            </span>
          </button>
        ))}
      </div>

      <div className="flex items-center gap-2">
        <span className="text-sm text-gray-600">Sort by:</span>
        <button className="
          flex items-center gap-2 px-4 py-2
          bg-white rounded-xl border border-gray-200
          text-sm font-medium text-gray-700
          hover:border-gray-300 hover:bg-gray-50
          transition-all duration-200
        ">
          <span>Deadline</span>
          <ChevronDown className="w-4 h-4" />
        </button>
      </div>
    </motion.div>
  );
}
