import { BORDER_DEFAULT, BG_CANVAS } from "../utils/ui";

export function TableSkeleton() {
  return (
    <div className={`bg-white rounded-xl shadow-sm ${BORDER_DEFAULT} border overflow-hidden animate-pulse`}>
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead className={`${BG_CANVAS} border-b ${BORDER_DEFAULT}`}>
            <tr>
              {[1, 2, 3, 4, 5, 6, 7].map((i) => (
                <th key={i} className="px-6 py-4">
                  <div className="h-3 bg-border-base rounded w-20"></div>
                </th>
              ))}
            </tr>
          </thead>
          <tbody className={`divide-y ${BORDER_DEFAULT}`}>
            {[1, 2, 3, 4].map((row) => (
              <tr key={row}>
                <td className="px-6 py-4">
                  <div className="w-8 h-8 bg-border-base rounded-lg"></div>
                </td>
                <td className="px-6 py-4">
                  <div className="h-4 bg-border-base rounded w-28"></div>
                </td>
                <td className="px-6 py-4">
                  <div className="h-4 bg-border-base rounded w-24"></div>
                </td>
                <td className="px-6 py-4">
                  <div className="h-4 bg-border-base rounded w-32"></div>
                </td>
                <td className="px-6 py-4">
                  <div className="h-4 bg-border-base rounded w-24"></div>
                </td>
                <td className="px-6 py-4">
                  <div className="h-6 bg-border-base rounded-full w-40"></div>
                </td>
                <td className="px-6 py-4">
                  <div className="flex justify-end gap-2">
                    <div className="h-9 bg-border-base rounded-lg w-32"></div>
                    <div className="h-9 bg-border-base rounded-lg w-28"></div>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

export function KPISkeleton() {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
      {[1, 2, 3, 4].map((i) => (
        <div key={i} className={`bg-white rounded-xl shadow-sm p-6 ${BORDER_DEFAULT} border animate-pulse`}>
          <div className="flex items-start justify-between mb-3">
            <div className="w-6 h-6 bg-border-base rounded"></div>
          </div>
          <div className="h-3 bg-border-base rounded w-24 mb-2"></div>
          <div className="h-8 bg-border-base rounded w-32 mb-2"></div>
          <div className="h-3 bg-border-base rounded w-20"></div>
        </div>
      ))}
    </div>
  );
}
