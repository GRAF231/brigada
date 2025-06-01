import React, { useMemo } from 'react';
import {
  Box,
  IconButton,
  Tooltip,
  Alert,
  CircularProgress
} from '@mui/material';
import {
  useReactTable,
  getCoreRowModel,
  getSortedRowModel,
  getExpandedRowModel,
  flexRender,
  createColumnHelper,
  ColumnDef
} from '@tanstack/react-table';
import {
  KeyboardArrowDown as KeyboardArrowDownIcon,
  KeyboardArrowRight as KeyboardArrowRightIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
  Add as AddIcon,
  Check as CheckIcon
} from '@mui/icons-material';
import { EstimateItem } from '../../../types/project';
import { statusColors, statusNames, EstimateItemStatus } from './estimateUtils';

interface EstimateTableProps {
  items: EstimateItem[];
  loading: boolean;
  error: string | null;
  canEdit: boolean;
  canChangeStatus: boolean;
  onAddSubItem: (parentId: string) => void;
  onEdit: (item: EstimateItem) => void;
  onDelete: (item: EstimateItem) => void;
  onChangeStatus: (item: EstimateItem) => void;
}

const EstimateTable: React.FC<EstimateTableProps> = ({
  items,
  loading,
  error,
  canEdit,
  canChangeStatus,
  onAddSubItem,
  onEdit,
  onDelete,
  onChangeStatus
}) => {
  // Создаем помощник для колонок
  const columnHelper = createColumnHelper<EstimateItem>();

  // Определение колонок таблицы
  const columns = useMemo<ColumnDef<EstimateItem, any>[]>(
    () => [
      columnHelper.accessor('name', {
        header: 'Наименование',
        cell: ({ row, getValue }) => (
          <Box sx={{ 
            display: 'flex', 
            alignItems: 'center',
            pl: `${row.depth * 2}rem`
          }}>
            {row.getCanExpand() ? (
              <IconButton
                onClick={row.getToggleExpandedHandler()}
                size="small"
              >
                {row.getIsExpanded() ? <KeyboardArrowDownIcon /> : <KeyboardArrowRightIcon />}
              </IconButton>
            ) : null}
            <span>{getValue()}</span>
          </Box>
        ),
      }),
      columnHelper.accessor('unit', {
        header: 'Ед. изм.',
        size: 100,
      }),
      columnHelper.accessor('quantity', {
        header: 'Кол-во',
        size: 100,
      }),
      columnHelper.accessor('price', {
        header: 'Цена',
        cell: ({ getValue }) => `${getValue().toLocaleString()} ₽`,
        size: 120,
      }),
      columnHelper.accessor('amount', {
        header: 'Сумма',
        cell: ({ getValue }) => `${getValue().toLocaleString()} ₽`,
        size: 120,
      }),
      columnHelper.accessor('status', {
        header: 'Статус',
        cell: ({ getValue }) => {
          const value = getValue();
          return (
            <Box sx={{ 
              backgroundColor: statusColors[value as EstimateItemStatus] || '#ccc',
              color: '#fff',
              borderRadius: '4px',
              padding: '4px 8px',
              display: 'inline-block',
              fontSize: '0.75rem',
              fontWeight: 'bold'
            }}>
              {statusNames[value as EstimateItemStatus] || value}
            </Box>
          );
        },
        size: 120,
      }),
      columnHelper.display({
        id: 'actions',
        header: 'Действия',
        cell: ({ row }) => (
          <Box sx={{ display: 'flex' }}>
            {canChangeStatus && (
              <Tooltip title="Изменить статус">
                <IconButton 
                  size="small" 
                  onClick={() => onChangeStatus(row.original)}
                >
                  <CheckIcon fontSize="small" />
                </IconButton>
              </Tooltip>
            )}
            {canEdit && (
              <>
                <Tooltip title="Добавить подпункт">
                  <IconButton 
                    size="small" 
                    onClick={() => onAddSubItem(row.original._id)}
                  >
                    <AddIcon fontSize="small" />
                  </IconButton>
                </Tooltip>
                <Tooltip title="Редактировать">
                  <IconButton 
                    size="small" 
                    onClick={() => onEdit(row.original)}
                  >
                    <EditIcon fontSize="small" />
                  </IconButton>
                </Tooltip>
                <Tooltip title="Удалить">
                  <IconButton 
                    size="small" 
                    onClick={() => onDelete(row.original)}
                  >
                    <DeleteIcon fontSize="small" />
                  </IconButton>
                </Tooltip>
              </>
            )}
          </Box>
        ),
        size: 150,
      }),
    ],
    [canEdit, canChangeStatus, onAddSubItem, onEdit, onDelete, onChangeStatus]
  );

  // Инициализация таблицы
  const table = useReactTable({
    data: items,
    columns,
    getCoreRowModel: getCoreRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getExpandedRowModel: getExpandedRowModel(),
    getSubRows: (row) => row.children,
  });

  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', p: 3 }}>
        <CircularProgress />
      </Box>
    );
  }

  if (error) {
    return (
      <Alert severity="error" sx={{ mt: 2 }}>
        {error}
      </Alert>
    );
  }

  if (items.length === 0) {
    return (
      <Alert severity="info" sx={{ mt: 2 }}>
        Смета пуста. {canEdit ? 'Добавьте позиции, нажав на кнопку "Добавить позицию".' : 'Ожидайте добавления позиций.'}
      </Alert>
    );
  }

  return (
    <Box sx={{ overflowX: 'auto' }}>
      <table style={{ width: '100%', borderCollapse: 'collapse' }}>
        <thead>
          {table.getHeaderGroups().map(headerGroup => (
            <tr key={headerGroup.id}>
              {headerGroup.headers.map(header => (
                <th
                  key={header.id}
                  colSpan={header.colSpan}
                  style={{
                    borderBottom: '2px solid #ddd',
                    background: '#f5f5f5',
                    padding: '10px',
                    textAlign: 'left',
                    width: header.getSize()
                  }}
                  onClick={header.column.getToggleSortingHandler()}
                >
                  {flexRender(
                    header.column.columnDef.header,
                    header.getContext()
                  )}
                  <span>
                    {{
                      asc: ' 🔼',
                      desc: ' 🔽',
                    }[header.column.getIsSorted() as string] ?? ''}
                  </span>
                </th>
              ))}
            </tr>
          ))}
        </thead>
        <tbody>
          {table.getRowModel().rows.map(row => (
            <tr 
              key={row.id}
              style={{ 
                borderBottom: '1px solid #ddd',
                background: row.depth % 2 === 0 ? 'white' : '#f9f9f9'
              }}
            >
              {row.getVisibleCells().map(cell => (
                <td
                  key={cell.id}
                  style={{
                    padding: '10px',
                    width: cell.column.getSize()
                  }}
                >
                  {flexRender(cell.column.columnDef.cell, cell.getContext())}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </Box>
  );
};

export default EstimateTable;