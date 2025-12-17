import { Fragment } from 'react';
import { Listbox, Transition } from '@headlessui/react';
import { Check, ChevronDown } from 'lucide-react';

export interface SelectOption {
    value: string;
    label: string;
    icon?: React.ReactNode;
}

interface SelectProps {
    value: string;
    onChange: (value: string) => void;
    options: SelectOption[];
    label?: string;
    placeholder?: string;
    className?: string;
    disabled?: boolean;
}

export default function Select({
    value,
    onChange,
    options,
    label,
    placeholder = 'Select option',
    className = '',
    disabled = false
}: SelectProps) {
    const selectedOption = options.find(opt => opt.value === value);

    return (
        <div className={className}>
            {label && (
                <label className="block text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-2">
                    {label}
                </label>
            )}
            <Listbox value={value} onChange={onChange} disabled={disabled}>
                <div className="relative">
                    <Listbox.Button className="
            relative w-full cursor-pointer
            bg-white hover:bg-gray-50
            dark:bg-ios-card-dark dark:hover:bg-ios-surface-dark
            border border-gray-200 dark:border-ios-separator-dark rounded-xl
            pl-3 pr-10 py-3
            text-left text-sm font-medium text-gray-900 dark:text-ios-label-primary-dark
            focus:outline-none focus:ring-2 focus:ring-[#6FA84C] focus:border-transparent
            transition-all duration-200
            disabled:opacity-50 disabled:cursor-not-allowed
          ">
                        <span className="flex items-center gap-2 truncate">
                            {selectedOption ? (
                                <>
                                    {selectedOption.icon && <span className="text-lg">{selectedOption.icon}</span>}
                                    <span>{selectedOption.label}</span>
                                </>
                            ) : (
                                <span className="text-gray-400">{placeholder}</span>
                            )}
                        </span>
                        <span className="pointer-events-none absolute inset-y-0 right-0 flex items-center pr-3">
                            <ChevronDown className="h-4 w-4 text-gray-400" aria-hidden="true" />
                        </span>
                    </Listbox.Button>

                    <Transition
                        as={Fragment}
                        leave="transition ease-in duration-100"
                        leaveFrom="opacity-100"
                        leaveTo="opacity-0"
                    >
                        <Listbox.Options className="
              absolute z-50 mt-1 max-h-60 w-full overflow-auto
              rounded-xl bg-white dark:bg-ios-card-dark py-1 text-base shadow-lg
              border border-gray-100 dark:border-ios-separator-dark
              focus:outline-none sm:text-sm
            ">
                            {options.map((option) => (
                                <Listbox.Option
                                    key={option.value}
                                    className={({ active }) =>
                                        `relative cursor-default select-none py-3 pl-10 pr-4 ${active
                                            ? 'bg-green-50 text-green-900 dark:bg-green-900/30 dark:text-green-300'
                                            : 'text-gray-900 dark:text-ios-label-primary-dark'
                                        }`
                                    }
                                    value={option.value}
                                >
                                    {({ selected }) => (
                                        <>
                                            <span className={`flex items-center gap-2 truncate ${selected ? 'font-medium' : 'font-normal'}`}>
                                                {option.icon && <span className="text-lg">{option.icon}</span>}
                                                {option.label}
                                            </span>
                                            {selected ? (
                                                <span className="absolute inset-y-0 left-0 flex items-center pl-3 text-[#6FA84C]">
                                                    <Check className="h-4 w-4" aria-hidden="true" />
                                                </span>
                                            ) : null}
                                        </>
                                    )}
                                </Listbox.Option>
                            ))}
                        </Listbox.Options>
                    </Transition>
                </div>
            </Listbox>
        </div>
    );
}
