import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { 
  Database, 
  Table as TableIcon, 
  Columns, 
  X, 
  RefreshCw, 
  ChevronDown, 
  ChevronRight,
  Key,
  Hash,
  Type,
  Calendar,
  FileText
} from 'lucide-react';
import { Button } from './ui/button';
import { Card, CardContent, CardHeader } from './ui/card';
import { Badge } from './ui/badge';
import { Separator } from './ui/separator';
import { ScrollArea } from './ui/scroll-area';

const DatabaseSidebar = ({ connectionData, dbSchema, onRefreshSchema, onClose }) => {
  const [expandedTables, setExpandedTables] = useState(new Set());
  const [isRefreshing, setIsRefreshing] = useState(false);

  const toggleTable = (tableName) => {
    const newExpanded = new Set(expandedTables);
    if (newExpanded.has(tableName)) {
      newExpanded.delete(tableName);
    } else {
      newExpanded.add(tableName);
    }
    setExpandedTables(newExpanded);
  };

  const handleRefresh = async () => {
    setIsRefreshing(true);
    try {
      await onRefreshSchema();
    } finally {
      setIsRefreshing(false);
    }
  };

  const getColumnIcon = (dataType) => {
    const type = dataType?.toLowerCase() || '';
    if (type.includes('int') || type.includes('number') || type.includes('decimal') || type.includes('float')) {
      return <Hash className="h-3 w-3" />;
    }
    if (type.includes('varchar') || type.includes('text') || type.includes('char')) {
      return <Type className="h-3 w-3" />;
    }
    if (type.includes('date') || type.includes('time')) {
      return <Calendar className="h-3 w-3" />;
    }
    return <FileText className="h-3 w-3" />;
  };

  const getColumnTypeColor = (dataType) => {
    const type = dataType?.toLowerCase() || '';
    if (type.includes('int') || type.includes('number') || type.includes('decimal') || type.includes('float')) {
      return 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200';
    }
    if (type.includes('varchar') || type.includes('text') || type.includes('char')) {
      return 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200';
    }
    if (type.includes('date') || type.includes('time')) {
      return 'bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-200';
    }
    return 'bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-200';
  };

  return (
    <motion.div
      initial={{ x: -300, opacity: 0 }}
      animate={{ x: 0, opacity: 1 }}
      exit={{ x: -300, opacity: 0 }}
      transition={{ duration: 0.3 }}
      className="w-80 border-r border-border bg-background h-screen flex flex-col"
    >
      {/* Header */}
      <div className="p-4 border-b border-border">
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2">
            <Database className="h-5 w-5" />
            <h2 className="font-semibold">Database Schema</h2>
          </div>
          <div className="flex items-center gap-1">
            <Button
              variant="ghost"
              size="sm"
              onClick={handleRefresh}
              disabled={isRefreshing}
              className="gap-2"
            >
              <RefreshCw className={`h-3 w-3 ${isRefreshing ? 'animate-spin' : ''}`} />
            </Button>
            <Button
              variant="ghost"
              size="sm"
              onClick={onClose}
            >
              <X className="h-4 w-4" />
            </Button>
          </div>
        </div>
        
        <div className="space-y-1 text-sm">
          <div className="flex items-center justify-between">
            <span className="text-muted-foreground">Database:</span>
            <Badge variant="outline">{connectionData?.database}</Badge>
          </div>
          <div className="flex items-center justify-between">
            <span className="text-muted-foreground">Type:</span>
            <Badge variant="secondary">{connectionData?.dbType?.toUpperCase()}</Badge>
          </div>
          <div className="flex items-center justify-between">
            <span className="text-muted-foreground">Host:</span>
            <span className="text-xs font-mono">{connectionData?.host}</span>
          </div>
        </div>
      </div>

      {/* Tables List */}
      <ScrollArea className="flex-1">
        <div className="p-4 space-y-2">
          {dbSchema?.tables?.length > 0 ? (
            dbSchema.tables.map((table, index) => (
              <motion.div
                key={table.TABLE_NAME}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.05 }}
              >
                <Card className="overflow-hidden">
                  <CardHeader 
                    className="p-3 cursor-pointer hover:bg-muted/50 transition-colors"
                    onClick={() => toggleTable(table.TABLE_NAME)}
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <TableIcon className="h-4 w-4" />
                        <span className="font-medium text-sm">{table.TABLE_NAME}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        {table.COLUMN_COUNT && (
                          <Badge variant="outline" className="text-xs">
                            {table.COLUMN_COUNT} cols
                          </Badge>
                        )}
                        {expandedTables.has(table.TABLE_NAME) ? (
                          <ChevronDown className="h-3 w-3" />
                        ) : (
                          <ChevronRight className="h-3 w-3" />
                        )}
                      </div>
                    </div>
                    {table.TABLE_COMMENT && (
                      <p className="text-xs text-muted-foreground mt-1">
                        {table.TABLE_COMMENT}
                      </p>
                    )}
                  </CardHeader>
                  
                  {expandedTables.has(table.TABLE_NAME) && table.columns && (
                    <CardContent className="p-0">
                      <Separator />
                      <div className="p-3 space-y-2">
                        <div className="flex items-center gap-2 mb-2">
                          <Columns className="h-3 w-3" />
                          <span className="text-xs font-medium text-muted-foreground">
                            COLUMNS ({table.columns.length})
                          </span>
                        </div>
                        {table.columns.map((column, colIndex) => (
                          <motion.div
                            key={`${table.TABLE_NAME}-${column.COLUMN_NAME}-${colIndex}`}
                            initial={{ opacity: 0, x: -10 }}
                            animate={{ opacity: 1, x: 0 }}
                            transition={{ delay: colIndex * 0.02 }}
                            className="flex items-center justify-between p-2 rounded bg-muted/30 hover:bg-muted/50 transition-colors"
                          >
                            <div className="flex items-center gap-2 flex-1 min-w-0">
                              {getColumnIcon(column.DATA_TYPE)}
                              <span className="text-xs font-mono truncate">
                                {column.COLUMN_NAME}
                              </span>
                              {column.COLUMN_KEY === 'PRI' && (
                                <Key className="h-3 w-3 text-yellow-500" title="Primary Key" />
                              )}
                            </div>
                            <div className="flex items-center gap-1">
                              <Badge 
                                variant="outline" 
                                className={`text-xs px-1 py-0 ${getColumnTypeColor(column.DATA_TYPE)}`}
                              >
                                {column.DATA_TYPE}
                              </Badge>
                              {column.IS_NULLABLE === 'NO' && (
                                <Badge variant="destructive" className="text-xs px-1 py-0">
                                  NOT NULL
                                </Badge>
                              )}
                            </div>
                          </motion.div>
                        ))}
                      </div>
                    </CardContent>
                  )}
                </Card>
              </motion.div>
            ))
          ) : (
            <Card>
              <CardContent className="p-6 text-center">
                <Database className="h-8 w-8 mx-auto mb-2 text-muted-foreground" />
                <p className="text-sm text-muted-foreground">
                  {isRefreshing ? 'Loading schema...' : 'No tables found'}
                </p>
              </CardContent>
            </Card>
          )}
        </div>
      </ScrollArea>

      {/* Footer */}
      <div className="p-4 border-t border-border">
        <div className="text-xs text-muted-foreground text-center">
          {dbSchema?.tables?.length || 0} tables • Connected
        </div>
      </div>
    </motion.div>
  );
};

export default DatabaseSidebar;
