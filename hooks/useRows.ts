// useRows.ts
import { useState } from 'react';
import { balanceText } from '../utils';

interface TableRow {
  name: string;
  key: string;
  usage: string;
}

let count = 0;

export function useRows(initialRows: TableRow[] = []) {
  const [rows, setRows] = useState<TableRow[]>(initialRows);

  const updateOrAddRow = (key: string, totalUsage: number) => {
    const rowIndex = rows.findIndex((row) => row.key === key);

    if (rowIndex !== -1) {
      // 更新现有行
      setRows(
        rows.map((row, index) =>
          index === rowIndex ? { ...row, usage: balanceText(totalUsage) } : row
        )
      );
    } else if (totalUsage) {
      // 添加新行
      setRows([
        ...rows,
        {
          name: `Key ${++count}`,
          key,
          usage: balanceText(totalUsage),
        },
      ]);
    }
  };
  const updateRowName = (name: string, index: number) => {
    setRows(rows.map((row, i) => (i === index ? { ...row, name } : row)));
  };

  return { rows, setRows, updateOrAddRow, updateRowName };
}
