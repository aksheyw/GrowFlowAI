import { useState, useEffect } from 'react';
import { Popover, Transition } from '@headlessui/react';
import { Fragment } from 'react';
import { Calendar as CalendarIcon, ChevronLeft, ChevronRight } from 'lucide-react';
import { clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';

interface DatePickerProps {
    value: string | null;
    onChange: (date: string | null) => void;
    label?: string;
    placeholder?: string;
    className?: string;
}

export default function DatePicker({
    value,
    onChange,
    label,
    placeholder = 'Select date',
    className,
}: DatePickerProps) {
    // Parse initial date or default to today
    const initialDate = value ? new Date(value) : new Date();

    // View state (what month/year we are looking at)
    const [viewDate, setViewDate] = useState(initialDate);

    // Sync view date if value changes externally
    useEffect(() => {
        if (value) {
            setViewDate(new Date(value));
        }
    }, [value]);

    const daysInMonth = (year: number, month: number) => new Date(year, month + 1, 0).getDate();
    const firstDayOfMonth = (year: number, month: number) => new Date(year, month, 1).getDay();

    const monthNames = [
        'January', 'February', 'March', 'April', 'May', 'June',
        'July', 'August', 'September', 'October', 'November', 'December'
    ];

    const handlePrevMonth = () => {
        setViewDate(new Date(viewDate.getFullYear(), viewDate.getMonth() - 1, 1));
    };

    const handleNextMonth = () => {
        setViewDate(new Date(viewDate.getFullYear(), viewDate.getMonth() + 1, 1));
    };

    const handleSelectDate = (day: number) => {
        // Format: YYYY-MM-DD
        // Note: Month is 0-indexed in JS Date, but requires 1-indexed in YYYY-MM-DD
        const year = viewDate.getFullYear();
        const month = viewDate.getMonth() + 1;
        const formattedDate = `${year}-${month.toString().padStart(2, '0')}-${day.toString().padStart(2, '0')}`;
        onChange(formattedDate);
        // Close popover logic is handled by the Button click usually, but Headless UI Popover.Button closes on click inside? 
        // Actually no, we need to close it manually or use the close prop if passed.
        // For now, selecting a date will update the value. The user acts to close it by clicking outside or we can find a way to close.
        // Headless UI Popover panel auto-closes if we click a "Close" button or click outside. 
        // Usually clicking an option should close it. We can use the close() render prop.
    };

    const isToday = (day: number) => {
        const today = new Date();
        return (
            day === today.getDate() &&
            viewDate.getMonth() === today.getMonth() &&
            viewDate.getFullYear() === today.getFullYear()
        );
    };

    const isSelected = (day: number) => {
        if (!value) return false;
        const selected = new Date(value);
        return (
            day === selected.getDate() &&
            viewDate.getMonth() === selected.getMonth() &&
            viewDate.getFullYear() === selected.getFullYear()
        );
    };

    const renderCalendar = (close: () => void) => {
        const year = viewDate.getFullYear();
        const month = viewDate.getMonth();
        const totalDays = daysInMonth(year, month);
        const startDay = firstDayOfMonth(year, month);

        // Generate simple array of days
        const days = [];
        for (let i = 0; i < startDay; i++) {
            days.push(null);
        }
        for (let i = 1; i <= totalDays; i++) {
            days.push(i);
        }

        return (
            <div className="p-4 w-72 bg-white rounded-xl shadow-xl border border-gray-100">
                <div className="flex items-center justify-between mb-4">
                    <button
                        onClick={(e) => { e.preventDefault(); e.stopPropagation(); handlePrevMonth(); }}
                        className="p-1 hover:bg-gray-100 rounded-lg text-gray-600"
                    >
                        <ChevronLeft className="w-5 h-5" />
                    </button>
                    <span className="font-semibold text-gray-900">
                        {monthNames[month]} {year}
                    </span>
                    <button
                        onClick={(e) => { e.preventDefault(); e.stopPropagation(); handleNextMonth(); }}
                        className="p-1 hover:bg-gray-100 rounded-lg text-gray-600"
                    >
                        <ChevronRight className="w-5 h-5" />
                    </button>
                </div>

                <div className="grid grid-cols-7 gap-1 mb-2 text-center">
                    {['Su', 'Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa'].map(d => (
                        <div key={d} className="text-xs font-medium text-gray-400 py-1">{d}</div>
                    ))}
                </div>

                <div className="grid grid-cols-7 gap-1">
                    {days.map((day, idx) => (
                        <div key={idx} className="aspect-square">
                            {day ? (
                                <button
                                    onClick={() => {
                                        handleSelectDate(day);
                                        close();
                                    }}
                                    className={clsx(
                                        "w-full h-full text-sm rounded-lg flex items-center justify-center transition-colors",
                                        isSelected(day) ? "bg-[#6FA84C] text-white font-medium" :
                                            isToday(day) ? "bg-green-50 text-[#6FA84C] font-medium" :
                                                "text-gray-900 hover:bg-gray-100"
                                    )}
                                >
                                    {day}
                                </button>
                            ) : <div />}
                        </div>
                    ))}
                </div>

                <div className="mt-4 pt-3 border-t border-gray-100 flex justify-between">
                    <button
                        onClick={() => { onChange(null); close(); }}
                        className="text-xs font-medium text-red-500 hover:text-red-600 px-2 py-1 hover:bg-red-50 rounded"
                    >
                        Clear
                    </button>
                    <button
                        onClick={() => {
                            const today = new Date();
                            const formatted = `${today.getFullYear()}-${(today.getMonth() + 1).toString().padStart(2, '0')}-${today.getDate().toString().padStart(2, '0')}`;
                            onChange(formatted);
                            close();
                        }}
                        className="text-xs font-medium text-[#6FA84C] hover:text-[#5a8a3d] px-2 py-1 hover:bg-green-50 rounded"
                    >
                        Today
                    </button>
                </div>
            </div>
        );
    };

    return (
        <div className={twMerge("", className)}>
            {label && (
                <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2">
                    {label}
                </label>
            )}
            <Popover className="relative">
                {({ open, close }) => (
                    <>
                        <Popover.Button className={clsx(
                            "w-full flex items-center gap-2 p-3 bg-gray-50 border border-gray-200 rounded-xl font-medium text-gray-900 text-left outline-none transition-all",
                            open ? "ring-2 ring-[#6FA84C] border-transparent" : "focus:ring-2 focus:ring-[#6FA84C] focus:border-transparent"
                        )}>
                            <CalendarIcon className="w-4 h-4 text-gray-500" />
                            <span className={!value ? "text-gray-400" : ""}>
                                {value ? new Date(value).toLocaleDateString(undefined, { dateStyle: 'medium' }) : placeholder}
                            </span>
                        </Popover.Button>

                        <Transition
                            as={Fragment}
                            enter="transition ease-out duration-200"
                            enterFrom="opacity-0 translate-y-1"
                            enterTo="opacity-100 translate-y-0"
                            leave="transition ease-in duration-150"
                            leaveFrom="opacity-100 translate-y-0"
                            leaveTo="opacity-0 translate-y-1"
                        >
                            {/* Use fixed positioning to avoid overflow issues in modals or tight spaces, or stick to absolute z-50 */}
                            <Popover.Panel className="absolute z-50 mt-1 transform -translate-x-0 w-auto">
                                {renderCalendar(close)}
                            </Popover.Panel>
                        </Transition>
                    </>
                )}
            </Popover>
        </div>
    );
}
