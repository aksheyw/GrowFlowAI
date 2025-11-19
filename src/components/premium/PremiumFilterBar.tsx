import { Fragment } from 'react';
import { motion } from 'framer-motion';
import { ChevronDown, Check } from 'lucide-react';
import { Menu, Transition } from '@headlessui/react';

export type PremiumFilterType = 'all' | 'Not Started' | 'In Progress' | 'Done';
export type SortOption = 'deadline' | 'created_at' | 'priority';

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
  sortBy: SortOption;
  onSortChange: (sort: SortOption) => void;
}

const SORT_OPTIONS: { value: SortOption; label: string }[] = [
  { value: 'deadline', label: 'Deadline' },
  { value: 'created_at', label: 'Date Created' },
  { value: 'priority', label: 'Priority' },
];

export default function PremiumFilterBar({
  filters,
  activeFilter,
  onFilterChange,
  sortBy,
  onSortChange
}: PremiumFilterBarProps) {
  const currentSortLabel = SORT_OPTIONS.find(o => o.value === sortBy)?.label;

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
        <Menu as="div" className="relative">
          <Menu.Button className="
            flex items-center gap-2 px-4 py-2
            bg-white rounded-xl border border-gray-200
            text-sm font-medium text-gray-700
            hover:border-gray-300 hover:bg-gray-50
            transition-all duration-200
          ">
            <span>{currentSortLabel}</span>
            <ChevronDown className="w-4 h-4" />
          </Menu.Button>

          <Transition
            as={Fragment}
            enter="transition ease-out duration-100"
            enterFrom="transform opacity-0 scale-95"
            enterTo="transform opacity-100 scale-100"
            leave="transition ease-in duration-75"
            leaveFrom="transform opacity-100 scale-100"
            leaveTo="transform opacity-0 scale-95"
          >
            <Menu.Items className="
              absolute right-0 mt-2 w-40
              bg-white rounded-xl shadow-lg
              border border-gray-100
              focus:outline-none z-20
              overflow-hidden
            ">
              {SORT_OPTIONS.map((option) => (
                <Menu.Item key={option.value}>
                  {({ active }) => (
                    <button
                      onClick={() => onSortChange(option.value)}
                      className={`
                        w-full px-4 py-2.5 text-left text-sm
                        flex items-center justify-between
                        ${active ? 'bg-gray-50 text-gray-900' : 'text-gray-700'}
                        ${sortBy === option.value ? 'bg-green-50 text-green-700 font-medium' : ''}
                      `}
                    >
                      {option.label}
                      {sortBy === option.value && (
                        <Check className="w-4 h-4 text-green-600" />
                      )}
                    </button>
                  )}
                </Menu.Item>
              ))}
            </Menu.Items>
          </Transition>
        </Menu>
      </div>
    </motion.div>
  );
}
