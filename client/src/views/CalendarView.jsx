import React, { useState, useEffect } from 'react';
import { getCalendar } from '../api';
import { formatDate, getStatusMeta, getDaysRemaining, CATEGORY_META, formatCurrency } from '../utils/formatters';
import { ChevronLeft, ChevronRight, Calendar as CalendarIcon, Clock } from 'lucide-react';

export default function CalendarView({ onSelectItem, onRenew }) {
  const [currentDate, setCurrentDate] = useState(new Date());
  const [calendarData, setCalendarData] = useState([]);
  const [selectedDayEvents, setSelectedDayEvents] = useState([]);
  const [selectedDayNumber, setSelectedDayNumber] = useState(new Date().getDate());
  const [loading, setLoading] = useState(false);

  const month = currentDate.getMonth() + 1; // 1-12
  const year = currentDate.getFullYear();

  useEffect(() => {
    fetchEvents(month, year);
  }, [month, year]);

  const fetchEvents = async (m, y) => {
    setLoading(true);
    try {
      const res = await getCalendar(m, y);
      if (res.success) {
        setCalendarData(res.items);
        // Default select today if in current month
        updateSelectedDay(selectedDayNumber, res.items);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const updateSelectedDay = (dayNum, items) => {
    setSelectedDayNumber(dayNum);
    const dayItems = items.filter((item) => {
      const d = new Date(item.expiryDate);
      return d.getDate() === dayNum && d.getMonth() + 1 === month && d.getFullYear() === year;
    });
    setSelectedDayEvents(dayItems);
  };

  const handlePrevMonth = () => {
    setCurrentDate(new Date(year, month - 2, 1));
  };

  const handleNextMonth = () => {
    setCurrentDate(new Date(year, month, 1));
  };

  // Calendar matrix calculation
  const firstDayIndex = new Date(year, month - 1, 1).getDay(); // 0 is Sunday
  const daysInMonth = new Date(year, month, 0).getDate();

  const monthName = currentDate.toLocaleString('default', { month: 'long' });

  // Map events to days: { [dayNumber]: [items] }
  const eventsByDay = {};
  calendarData.forEach((item) => {
    const d = new Date(item.expiryDate);
    if (d.getMonth() + 1 === month && d.getFullYear() === year) {
      const day = d.getDate();
      if (!eventsByDay[day]) eventsByDay[day] = [];
      eventsByDay[day].push(item);
    }
  });

  return (
    <div className="space-y-6 max-w-5xl mx-auto">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold text-ink-primary tracking-tight">
            Calendar View
          </h1>
          <p className="text-sm text-ink-secondary mt-1">
            Month-at-a-glance visualization of your upcoming renewals and deadlines.
          </p>
        </div>

        {/* Month Selector Controls */}
        <div className="flex items-center gap-3 bg-white border border-[#E7E5E4] rounded-2xl px-3 py-1.5 shadow-sm self-start sm:self-auto">
          <button
            onClick={handlePrevMonth}
            className="p-1.5 rounded-lg hover:bg-[#F5F5F4] text-ink-muted hover:text-ink-primary transition-colors"
          >
            <ChevronLeft className="w-4 h-4" />
          </button>
          <span className="text-sm font-semibold text-ink-primary min-w-[120px] text-center">
            {monthName} {year}
          </span>
          <button
            onClick={handleNextMonth}
            className="p-1.5 rounded-lg hover:bg-[#F5F5F4] text-ink-muted hover:text-ink-primary transition-colors"
          >
            <ChevronRight className="w-4 h-4" />
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Calendar Grid (2 Cols on lg) */}
        <div className="lg:col-span-2 bg-white rounded-2xl sm:rounded-3xl border border-[#E7E5E4] p-3 sm:p-6 shadow-sm space-y-3 sm:space-y-4">
          {/* Weekday Labels */}
          <div className="grid grid-cols-7 gap-1 text-center text-[10px] sm:text-xs font-semibold uppercase tracking-wider text-ink-muted">
            {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map((d) => (
              <div key={d} className="py-1">
                {d}
              </div>
            ))}
          </div>

          {/* Days Grid */}
          <div className="grid grid-cols-7 gap-1 sm:gap-1.5">
            {/* Empty slots before first day */}
            {Array.from({ length: firstDayIndex }).map((_, i) => (
              <div key={`empty-${i}`} className="h-12 sm:h-20 rounded-xl sm:rounded-2xl bg-[#FAF9F6]/40" />
            ))}

            {/* Days of month */}
            {Array.from({ length: daysInMonth }).map((_, i) => {
              const dayNum = i + 1;
              const hasEvents = eventsByDay[dayNum] && eventsByDay[dayNum].length > 0;
              const isSelected = selectedDayNumber === dayNum;
              const isToday =
                new Date().getDate() === dayNum &&
                new Date().getMonth() + 1 === month &&
                new Date().getFullYear() === year;

              return (
                <div
                  key={dayNum}
                  onClick={() => updateSelectedDay(dayNum, calendarData)}
                  className={`h-12 sm:h-20 rounded-xl sm:rounded-2xl p-1 sm:p-2 flex flex-col justify-between transition-all cursor-pointer border ${
                    isSelected
                      ? 'border-amber-700 bg-amber-50/40 shadow-sm ring-1 ring-amber-700'
                      : isToday
                      ? 'border-ink-primary bg-white font-bold'
                      : 'border-[#E7E5E4] bg-white hover:border-[#D6D3D1]'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <span
                      className={`text-xs font-medium ${
                        isToday
                          ? 'w-5 h-5 rounded-full bg-ink-primary text-white flex items-center justify-center font-bold'
                          : 'text-ink-primary'
                      }`}
                    >
                      {dayNum}
                    </span>
                    {hasEvents && (
                      <span className="text-[10px] font-semibold text-amber-800">
                        {eventsByDay[dayNum].length}
                      </span>
                    )}
                  </div>

                  {/* Event indicator dots */}
                  {hasEvents && (
                    <div className="flex items-center gap-1 flex-wrap">
                      {eventsByDay[dayNum].slice(0, 3).map((ev) => (
                        <span
                          key={ev._id}
                          className={`w-2 h-2 rounded-full ${
                            ev.category === 'subscription' || ev.category === 'finance'
                              ? 'bg-blue-600'
                              : ev.category === 'home'
                              ? 'bg-amber-600'
                              : 'bg-rose-600'
                          }`}
                          title={ev.title}
                        />
                      ))}
                    </div>
                  )}
                </div>
              );
            })}
          </div>

          {/* Legend */}
          <div className="pt-3 border-t border-[#F5F5F4] flex items-center gap-4 text-xs text-ink-secondary flex-wrap">
            <span className="font-medium text-ink-muted">Legend:</span>
            <span className="flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-rose-600" />
              <span>Document / Warranty Expiry</span>
            </span>
            <span className="flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-blue-600" />
              <span>Subscription / Payment</span>
            </span>
            <span className="flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-amber-600" />
              <span>Maintenance / Service</span>
            </span>
          </div>
        </div>

        {/* Selected Day Agenda Drawer (1 Col on lg) */}
        <div className="bg-white rounded-3xl border border-[#E7E5E4] p-6 shadow-sm space-y-4">
          <div className="border-b border-[#E7E5E4] pb-3">
            <span className="text-xs font-semibold uppercase tracking-wider text-ink-muted block">
              Day Agenda
            </span>
            <h3 className="text-lg font-bold text-ink-primary">
              {selectedDayNumber} {monthName} {year}
            </h3>
          </div>

          {selectedDayEvents.length === 0 ? (
            <div className="py-12 text-center text-xs text-ink-muted space-y-2">
              <CalendarIcon className="w-8 h-8 mx-auto text-ink-muted/50" />
              <p>No deadlines scheduled on this day.</p>
            </div>
          ) : (
            <div className="space-y-3">
              {selectedDayEvents.map((item) => {
                const days = getDaysRemaining(item.expiryDate);
                const statusMeta = getStatusMeta(days, item.isResolved);
                const catMeta = CATEGORY_META[item.category] || CATEGORY_META.other;

                return (
                  <div
                    key={item._id}
                    onClick={() => onSelectItem(item)}
                    className="p-3.5 rounded-2xl bg-[#FAF9F6] border border-[#E7E5E4] hover:border-amber-300 transition-all cursor-pointer space-y-2 group"
                  >
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-medium text-ink-secondary">
                        {catMeta.emoji} {catMeta.label}
                      </span>
                      <span className={`text-[10px] px-2 py-0.5 rounded-full border font-semibold ${statusMeta.badgeClass}`}>
                        {statusMeta.pillText}
                      </span>
                    </div>

                    <div className="text-sm font-semibold text-ink-primary group-hover:text-amber-900 transition-colors">
                      {item.title}
                    </div>

                    <div className="text-xs text-ink-muted flex items-center justify-between pt-1">
                      <span>{item.personName}</span>
                      {item.amount && (
                        <span className="font-semibold text-ink-primary">
                          {formatCurrency(item.amount, item.currency)}
                        </span>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
