import { useState } from "react";
import { Calendar, ChevronDown } from "lucide-react";
import { DayPicker } from "react-day-picker";
import { useDateFilterStore, getDateRange } from "../store/dateFilterStore";

export function DateFilter() {
  const { 
    period, 
    customStartDate, 
    customEndDate,
    calendarStartDate,
    calendarEndDate,
    setPeriod, 
    setCustomDates,
    setCalendarDates,
    clearCustomDates 
  } = useDateFilterStore();
  
  const [showDatePicker, setShowDatePicker] = useState(false);

  const dateRange = getDateRange(period, customStartDate, customEndDate);

  const formatDateRange = () => {
    const options: Intl.DateTimeFormatOptions = { day: 'numeric', month: 'short', year: 'numeric' };
    return `${dateRange.startDate.toLocaleDateString('es-MX', options)} - ${dateRange.endDate.toLocaleDateString('es-MX', options)}`;
  };

  return (
    <div className="flex flex-col gap-2">
      <div className="relative ml-auto">
        <button
          onClick={() => setShowDatePicker(!showDatePicker)}
          className="flex items-center gap-2 px-4 py-2 bg-white border-2 border-gray-200 rounded-lg hover:border-[#43D3FF] transition-colors"
        >
          <Calendar className="w-4 h-4 text-[#00184C]" />
          <span className="text-sm font-medium text-[#00184C] text-right">
            {period === "mes-corrido" && "Mes Corrido"}
            {period === "ultimos-30" && "Últimos 30 días"}
            {period === "ultimos-90" && "Últimos 90 días"}
            {period === "personalizado" && "Personalizado"}
          </span>
          <ChevronDown className="w-4 h-4 text-gray-500" />
        </button>

        {showDatePicker && (
          <>
            <div 
              className="fixed inset-0 z-20" 
              onClick={() => setShowDatePicker(false)}
            />
            <div className="absolute right-0 mt-2 w-80 bg-white border border-gray-200 rounded-lg shadow-lg z-30 p-4">
              <div className="space-y-2">
                <button
                  onClick={() => {
                    setPeriod("mes-corrido");
                    setShowDatePicker(false);
                  }}
                  className={`w-full text-left px-3 py-2 rounded-lg text-sm transition-colors ${
                    period === "mes-corrido"
                      ? "bg-[#43D3FF] text-[#00184C] font-semibold"
                      : "hover:bg-gray-100 text-gray-700"
                  }`}
                >Mes Corrido</button>
                <button
                  onClick={() => {
                    setPeriod("ultimos-30");
                    setShowDatePicker(false);
                  }}
                  className={`w-full text-left px-3 py-2 rounded-lg text-sm transition-colors ${
                    period === "ultimos-30"
                      ? "bg-[#43D3FF] text-[#00184C] font-semibold"
                      : "hover:bg-gray-100 text-gray-700"
                  }`}
                >
                  Últimos 30 días
                </button>
                <button
                  onClick={() => {
                    setPeriod("ultimos-90");
                    setShowDatePicker(false);
                  }}
                  className={`w-full text-left px-3 py-2 rounded-lg text-sm transition-colors ${
                    period === "ultimos-90"
                      ? "bg-[#43D3FF] text-[#00184C] font-semibold"
                      : "hover:bg-gray-100 text-gray-700"
                  }`}
                >
                  Últimos 90 días
                </button>
                
                <div className="border-t border-gray-200 my-2" />
                
                <button
                  onClick={() => setPeriod("personalizado")}
                  className={`w-full text-left px-3 py-2 rounded-lg text-sm transition-colors ${
                    period === "personalizado"
                      ? "bg-[#43D3FF] text-[#00184C] font-semibold"
                      : "hover:bg-gray-100 text-gray-700"
                  }`}
                >
                  Personalizado
                </button>
                
                {period === "personalizado" && (
                  <div className="space-y-3 mt-3 p-3 bg-gray-50 rounded-lg max-h-[500px] overflow-y-auto">
                    <div className="text-center">
                      <p className="text-xs font-medium text-gray-700 mb-2">
                        {!calendarStartDate && !calendarEndDate && "Selecciona fecha de inicio"}
                        {calendarStartDate && !calendarEndDate && "Selecciona fecha de fin"}
                        {calendarStartDate && calendarEndDate && "Rango seleccionado"}
                      </p>
                      
                      {calendarStartDate && calendarEndDate && (
                        <div className="flex items-center justify-center gap-2 mb-2 text-xs text-[#00184C] bg-[#43D3FF]/20 rounded-lg p-2">
                          <Calendar className="w-3 h-3" />
                          <span className="font-medium">
                            {calendarStartDate.toLocaleDateString('es-MX', { day: 'numeric', month: 'short', year: 'numeric' })}
                            {' - '}
                            {calendarEndDate.toLocaleDateString('es-MX', { day: 'numeric', month: 'short', year: 'numeric' })}
                          </span>
                        </div>
                      )}
                    </div>
                    
                    <div className="calendar-custom w-full flex justify-center">
                      <DayPicker
                        mode="range"
                        selected={calendarStartDate && calendarEndDate ? { from: calendarStartDate, to: calendarEndDate } : undefined}
                        onSelect={(range) => {
                          if (range?.from) {
                            setCalendarDates(range.from, range.to);
                            setCustomDates(range.from.toISOString().split('T')[0], range.to?.toISOString().split('T')[0] || "");
                          }
                        }}
                        locale={{
                          localize: {
                            day: (n: number) => ['Dom', 'Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb'][n],
                            month: (n: number) => ['Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio', 'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre'][n],
                          },
                          formatLong: {} as any,
                          code: 'es',
                          options: { weekStartsOn: 0 }
                        }}
                        modifiersClassNames={{
                          selected: '!bg-[#43D3FF] !text-[#00184C] font-bold',
                          today: 'border-2 border-[#F9D35A]',
                          range_middle: '!bg-[#43D3FF]/30',
                        }}
                        className="text-sm scale-95"
                      />
                    </div>
                    
                    <div className="flex gap-2">
                      <button
                        onClick={() => {
                          clearCustomDates();
                        }}
                        className="flex-1 px-3 py-2 bg-white border border-gray-300 text-gray-700 rounded-lg text-sm font-semibold hover:bg-gray-50 transition-colors"
                      >
                        Limpiar
                      </button>
                      <button
                        onClick={() => setShowDatePicker(false)}
                        disabled={!calendarStartDate || !calendarEndDate}
                        className="flex-1 px-3 py-2 bg-[#F9D35A] text-[#00184C] rounded-lg text-sm font-semibold hover:bg-[#f7c840] transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                      >
                        Aplicar
                      </button>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </>
        )}
      </div>
      
      <p className="text-xs text-gray-500 text-right">{formatDateRange()}</p>
    </div>
  );
}