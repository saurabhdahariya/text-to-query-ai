import React from 'react';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from './ui/table';

const ResultTable = ({ data, columns, className }) => {
  if (!data || data.length === 0) {
    return (
      <div className="text-center py-8 text-muted-foreground">
        No data to display
      </div>
    );
  }

  // If columns are not provided, extract them from the first row
  const tableColumns = columns || (data.length > 0 ? Object.keys(data[0]) : []);

  return (
    <div className={`border border-border rounded-lg overflow-hidden bg-card ${className || ''}`}>
      <Table>
        <TableHeader>
          <TableRow className="bg-muted/50">
            {tableColumns.map((column, index) => (
              <TableHead key={index} className="font-semibold text-muted-foreground">
                {column}
              </TableHead>
            ))}
          </TableRow>
        </TableHeader>
        <TableBody>
          {data.map((row, rowIndex) => (
            <TableRow key={rowIndex} className="hover:bg-muted/50">
              {tableColumns.map((column, colIndex) => (
                <TableCell key={colIndex} className="text-foreground">
                  {row[column] !== null && row[column] !== undefined
                    ? String(row[column])
                    : '-'
                  }
                </TableCell>
              ))}
            </TableRow>
          ))}
        </TableBody>
      </Table>
      <div className="px-4 py-2 bg-muted/50 text-sm text-muted-foreground border-t border-border">
        Showing {data.length} row{data.length !== 1 ? 's' : ''}
      </div>
    </div>
  );
};

export default ResultTable;
