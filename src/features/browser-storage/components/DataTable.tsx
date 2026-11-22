import { useState, type ReactNode } from 'react'
import { flexRender, useTable, type ColumnDef, type RowData } from '@tanstack/react-table'
import { ArrowDown, ArrowUp, ArrowUpDown, ChevronLeft, ChevronRight, Columns3, Trash2 } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Checkbox } from '@/components/ui/checkbox'
import { Input } from '@/components/ui/input'
import { features, type Features } from '@/features/browser-storage/table-features'

interface DataTableProps<TData extends RowData> {
    data: TData[]
    /** Must be a stable reference (define column defs at module scope). */
    columns: ColumnDef<Features, TData, unknown>[]
    getRowId: (row: TData) => string
    searchPlaceholder?: string
    emptyMessage?: string
    pageSize?: number
    /** Extra toolbar controls (add / refresh / clear all …). */
    toolbar?: ReactNode
    /** Per-row action buttons, rendered in a trailing column. */
    renderRowActions?: (row: TData) => ReactNode
    /** Enables row checkboxes and the bulk delete button. */
    onDeleteSelected?: (rows: TData[]) => void
    onRowClick?: (row: TData) => void
}

const PAGE_SIZES = [10, 25, 50, 100]

export function DataTable<TData extends RowData>({
    data,
    columns,
    getRowId,
    searchPlaceholder = 'Search…',
    emptyMessage = 'Nothing here yet.',
    pageSize = 10,
    toolbar,
    renderRowActions,
    onDeleteSelected,
    onRowClick,
}: DataTableProps<TData>) {
    // TanStack Table v9 exposes builder methods on a stable table object, which
    // the React Compiler would otherwise memoise away from reactive reads.
    'use no memo'

    const [search, setSearch] = useState('')
    const selectable = onDeleteSelected !== undefined

    const table = useTable({
        features,
        columns,
        data,
        getRowId,
        globalFilterFn: 'includesString',
        enableRowSelection: selectable,
        initialState: { pagination: { pageIndex: 0, pageSize } },
    })

    const selectedRows = table.getSelectedRowModel().rows
    const visibleColumns = table.getVisibleLeafColumns().length + (selectable ? 1 : 0) + (renderRowActions ? 1 : 0)
    const rowCount = table.getFilteredRowModel().rows.length
    const { pageIndex, pageSize: currentPageSize } = table.state.pagination

    return (
        <div className="space-y-3">
            <div className="flex flex-wrap items-center gap-2">
                <Input
                    value={search}
                    onChange={(event) => {
                        setSearch(event.target.value)
                        table.setGlobalFilter(event.target.value)
                    }}
                    placeholder={searchPlaceholder}
                    aria-label="Search"
                    className="max-w-xs"
                />

                <details className="relative">
                    <summary className="inline-flex h-8 cursor-pointer list-none items-center gap-1.5 rounded-lg border border-border bg-background px-2.5 text-sm font-medium select-none hover:bg-muted">
                        <Columns3 className="size-4" />
                        Columns
                    </summary>
                    <div className="absolute z-10 mt-1 min-w-40 space-y-1 rounded-lg border bg-popover p-2 shadow-md">
                        {table.getAllLeafColumns().map((column) => (
                            <label key={column.id} className="flex items-center gap-2 text-sm">
                                <Checkbox
                                    checked={column.getIsVisible()}
                                    onCheckedChange={(checked) => column.toggleVisibility(checked)}
                                    disabled={!column.getCanHide()}
                                />
                                {typeof column.columnDef.header === 'string' ? column.columnDef.header : column.id}
                            </label>
                        ))}
                    </div>
                </details>

                <div className="ml-auto flex flex-wrap items-center gap-2">
                    {selectable && selectedRows.length > 0 && (
                        <Button
                            variant="destructive"
                            onClick={() => {
                                onDeleteSelected(selectedRows.map((row) => row.original))
                                table.resetRowSelection(true)
                            }}
                        >
                            <Trash2 />
                            Delete {selectedRows.length} selected
                        </Button>
                    )}
                    {toolbar}
                </div>
            </div>

            <div className="overflow-x-auto rounded-lg border">
                <table className="w-full text-left text-sm">
                    <thead className="bg-muted/50 text-xs text-muted-foreground uppercase">
                        {table.getHeaderGroups().map((group) => (
                            <tr key={group.id}>
                                {selectable && (
                                    <th className="w-10 px-3 py-2">
                                        <Checkbox
                                            aria-label="Select all rows on this page"
                                            checked={table.getIsAllPageRowsSelected()}
                                            indeterminate={table.getIsSomePageRowsSelected()}
                                            onCheckedChange={(checked) => table.toggleAllPageRowsSelected(checked)}
                                        />
                                    </th>
                                )}
                                {group.headers.map((header) => {
                                    const sorted = header.column.getIsSorted()
                                    return (
                                        <th key={header.id} className="px-3 py-2 font-medium">
                                            {header.isPlaceholder ? null : header.column.getCanSort() ? (
                                                <button
                                                    type="button"
                                                    className="inline-flex items-center gap-1 uppercase hover:text-foreground"
                                                    onClick={header.column.getToggleSortingHandler()}
                                                >
                                                    {flexRender(header.column.columnDef.header, header.getContext())}
                                                    {sorted === 'asc' ? (
                                                        <ArrowUp className="size-3" />
                                                    ) : sorted === 'desc' ? (
                                                        <ArrowDown className="size-3" />
                                                    ) : (
                                                        <ArrowUpDown className="size-3 opacity-40" />
                                                    )}
                                                </button>
                                            ) : (
                                                flexRender(header.column.columnDef.header, header.getContext())
                                            )}
                                        </th>
                                    )
                                })}
                                {renderRowActions && <th className="w-24 px-3 py-2 text-right font-medium">Actions</th>}
                            </tr>
                        ))}
                    </thead>
                    <tbody>
                        {table.getRowModel().rows.length === 0 ? (
                            <tr>
                                <td colSpan={visibleColumns} className="px-3 py-8 text-center text-muted-foreground">
                                    {search ? 'No matches for your search.' : emptyMessage}
                                </td>
                            </tr>
                        ) : (
                            table.getRowModel().rows.map((row) => (
                                <tr
                                    key={row.id}
                                    data-selected={row.getIsSelected() || undefined}
                                    className="border-t hover:bg-muted/40 data-selected:bg-muted/60"
                                    onClick={onRowClick ? () => onRowClick(row.original) : undefined}
                                >
                                    {selectable && (
                                        <td className="px-3 py-2" onClick={(event) => event.stopPropagation()}>
                                            <Checkbox
                                                aria-label="Select row"
                                                checked={row.getIsSelected()}
                                                onCheckedChange={(checked) => row.toggleSelected(checked)}
                                            />
                                        </td>
                                    )}
                                    {row.getVisibleCells().map((cell) => (
                                        <td key={cell.id} className="max-w-[28rem] px-3 py-2 align-top">
                                            {flexRender(cell.column.columnDef.cell, cell.getContext())}
                                        </td>
                                    ))}
                                    {renderRowActions && (
                                        <td
                                            className="px-3 py-2 text-right whitespace-nowrap"
                                            onClick={(event) => event.stopPropagation()}
                                        >
                                            {renderRowActions(row.original)}
                                        </td>
                                    )}
                                </tr>
                            ))
                        )}
                    </tbody>
                </table>
            </div>

            <div className="flex flex-wrap items-center justify-between gap-2 text-xs text-muted-foreground">
                <span>
                    {rowCount} row{rowCount === 1 ? '' : 's'}
                    {selectable && selectedRows.length > 0 ? ` · ${selectedRows.length} selected` : ''}
                </span>
                <div className="flex items-center gap-2">
                    <select
                        aria-label="Rows per page"
                        value={currentPageSize}
                        onChange={(event) => table.setPageSize(Number(event.target.value))}
                        className="h-7 rounded-md border border-input bg-transparent px-1.5 text-xs"
                    >
                        {PAGE_SIZES.map((size) => (
                            <option key={size} value={size}>
                                {size} / page
                            </option>
                        ))}
                    </select>
                    <span>
                        Page {pageIndex + 1} of {Math.max(table.getPageCount(), 1)}
                    </span>
                    <Button
                        variant="outline"
                        size="icon-sm"
                        aria-label="Previous page"
                        disabled={!table.getCanPreviousPage()}
                        onClick={() => table.previousPage()}
                    >
                        <ChevronLeft />
                    </Button>
                    <Button
                        variant="outline"
                        size="icon-sm"
                        aria-label="Next page"
                        disabled={!table.getCanNextPage()}
                        onClick={() => table.nextPage()}
                    >
                        <ChevronRight />
                    </Button>
                </div>
            </div>
        </div>
    )
}
