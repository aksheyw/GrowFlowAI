import { Fragment } from 'react';
import { Menu, Transition } from '@headlessui/react';
import { ChevronDown, Check } from 'lucide-react';
import { Task } from '../../lib/supabase';
import { STATUS_OPTIONS } from '../../utils/premiumHelpers';

interface StatusDropdownProps {
  currentStatus: Task['status'];
  onChange: (newStatus: Task['status']) => void;
}

export default function StatusDropdown({ currentStatus, onChange }: StatusDropdownProps) {
  return (
    <Menu as="div" className="relative">
      {({ open }) => (
        <>
          <Menu.Button
            onClick={(e) => e.stopPropagation()}
            className="
              flex items-center gap-2 px-4 py-2
              bg-gray-50 dark:bg-ios-surface-dark hover:bg-gray-100 dark:hover:bg-ios-card-dark
              rounded-xl border border-gray-200 dark:border-ios-separator-dark
              transition-all duration-200
              text-sm font-medium text-gray-700 dark:text-gray-300
            "
          >
            <div
              className={`
                w-2 h-2 rounded-full
                ${currentStatus === 'Done' ? 'bg-green-500' :
                  currentStatus === 'In Progress' ? 'bg-yellow-500' :
                    'bg-gray-400'}
              `}
            />
            <span>{currentStatus}</span>
            <ChevronDown
              className={`
                w-4 h-4 transition-transform duration-200
                ${open ? 'rotate-180' : ''}
              `}
            />
          </Menu.Button>

          <Transition
            as={Fragment}
            enter="transition ease-out duration-200"
            enterFrom="opacity-0 scale-95"
            enterTo="opacity-100 scale-100"
            leave="transition ease-in duration-150"
            leaveFrom="opacity-100 scale-100"
            leaveTo="opacity-0 scale-95"
          >
            <Menu.Items className="
              absolute right-0 mt-2 w-52
              bg-white dark:bg-ios-card-dark rounded-2xl shadow-xl
              border border-gray-100 dark:border-ios-separator-dark
              overflow-hidden
              focus:outline-none
              z-10
            ">
              {STATUS_OPTIONS.map((option) => (
                <Menu.Item key={option.value}>
                  {({ active }) => (
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        onChange(option.value);
                      }}
                      className={`
                        w-full px-4 py-3 text-left
                        flex items-center gap-3
                        transition-colors duration-150
                        ${active ? 'bg-gray-50 dark:bg-ios-surface-dark' : ''}
                        ${option.value === currentStatus ? 'bg-green-50 dark:bg-green-900/30' : ''}
                      `}
                    >
                      <div className="text-2xl">{option.emoji}</div>
                      <div className="flex-1">
                        <div className="font-medium text-sm text-gray-900 dark:text-white">
                          {option.label}
                        </div>
                        <div className="text-xs text-gray-500 dark:text-gray-400">
                          {option.description}
                        </div>
                      </div>
                      {option.value === currentStatus && (
                        <Check className="w-5 h-5 text-green-600" />
                      )}
                    </button>
                  )}
                </Menu.Item>
              ))}
            </Menu.Items>
          </Transition>
        </>
      )}
    </Menu>
  );
}
