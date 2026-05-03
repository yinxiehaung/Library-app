export function Table({ columns, rows, rowKey }: any) {
  return (
    <div className="overflow-x-auto border border-gray-200 rounded-2xl">
      <table className="min-w-full text-sm">
        <thead className="bg-gray-50 text-gray-700">
          <tr>
            {columns.map((c: any) => (
              <th key={c.key} className="text-left font-medium px-4 py-3 whitespace-nowrap">
                {c.header}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {rows.map((r: any) => (
            <tr key={rowKey ? r[rowKey] : JSON.stringify(r)} className="border-t border-gray-100">
              {columns.map((c: any) => (
                <td key={c.key} className="px-4 py-3 align-top whitespace-nowrap">
                  {c.cell ? c.cell(r) : r[c.key]}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
