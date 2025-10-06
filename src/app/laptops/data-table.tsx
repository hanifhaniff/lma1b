"use client";

import {
  ColumnDef,
  ColumnFiltersState,
  SortingState,
  VisibilityState,
  flexRender,
  getCoreRowModel,
  getFacetedRowModel,
  getFacetedUniqueValues,
  getFilteredRowModel,
  getPaginationRowModel,
  getSortedRowModel,
  useReactTable,
} from "@tanstack/react-table";

import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  DropdownMenu,
  DropdownMenuCheckboxItem,
  DropdownMenuContent,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Laptop } from "./types";
import { useState } from "react";
import { PlusCircle, ChevronDown, Columns3, Search } from "lucide-react";
import { LaptopDialog } from "./laptop-dialog";
import { ConfirmDialog } from "./confirm-dialog";
import { toast } from "sonner";
import { deleteLaptop } from "./laptop-service";
import { getLaptopColumns } from "./columns";

interface DataTableProps {
  data: Laptop[];
  onRefresh: () => void; // Function to refresh data
  onEdit: (laptop: Laptop) => void;
  onDelete: (laptop: Laptop) => void;
}

export function DataTable({ data, onRefresh, onEdit, onDelete }: DataTableProps) {
  const [rowSelection, setRowSelection] = useState({});
  const [columnVisibility, setColumnVisibility] = useState<VisibilityState>({});
  const [columnFilters, setColumnFilters] = useState<ColumnFiltersState>([]);
  const [sorting, setSorting] = useState<SortingState>([]);

  // State for dialogs
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [editingLaptop, setEditingLaptop] = useState<Laptop | undefined>(undefined);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [laptopToDelete, setLaptopToDelete] = useState<Laptop | null>(null);

  // Action handlers
  const handleEdit = (laptop: Laptop) => {
    setEditingLaptop(laptop);
  };

  const handleDelete = (laptop: Laptop) => {
    setLaptopToDelete(laptop);
    setIsDeleteDialogOpen(true);
  };

  const confirmDelete = async () => {
    if (!laptopToDelete) return;
    
    try {
      await deleteLaptop(laptopToDelete.id);
      toast.success("Laptop deleted successfully!");
      setIsDeleteDialogOpen(false);
      setLaptopToDelete(null);
      onRefresh(); // Refresh the data after successful deletion
    } catch (error) {
      console.error("Error deleting laptop:", error);
      toast.error("Failed to delete laptop");
    }
  };

  // Get columns with action handlers
  const columns = getLaptopColumns(onEdit, onDelete);

  const table = useReactTable({
    data,
    columns,
    state: {
      sorting,
      columnVisibility,
      rowSelection,
      columnFilters,
    },
    enableRowSelection: true,
    onRowSelectionChange: setRowSelection,
    onSortingChange: setSorting,
    onColumnFiltersChange: setColumnFilters,
    onColumnVisibilityChange: setColumnVisibility,
    getCoreRowModel: getCoreRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getFacetedRowModel: getFacetedRowModel(),
    getFacetedUniqueValues: getFacetedUniqueValues(),
  });

  return (
    <div className="space-y-4">
      <div className="flex flex-col sm:flex-row items-start sm:items-center gap-10 py-6 px-3">
        <div className="relative max-w-sm w-full">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Filter by user..."
            value={(table.getColumn("assigned_user")?.getFilterValue() as string) ?? ""}
            onChange={(event) =>
              table.getColumn("assigned_user")?.setFilterValue(event.target.value)
            }
            className="pl-9 h-10"
          />
        </div>
        <div className="flex items-center gap-5 ml-auto">
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline" size="sm">
                <Columns3 className="mr-2 h-4 w-4" />
                Columns
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuLabel>Toggle columns</DropdownMenuLabel>
              <DropdownMenuSeparator />
              {table.getAllColumns().filter(
                (column) => typeof column.accessorFn !== "undefined" && column.getCanHide()
              ).map((column) => {
                return (
                  <DropdownMenuCheckboxItem
                    key={column.id}
                    className="capitalize"
                    checked={column.getIsVisible()}
                    onCheckedChange={(value) => column.toggleVisibility(!!value)}
                  >
                    {column.id}
                  </DropdownMenuCheckboxItem>
                );
              })}
            </DropdownMenuContent>
          </DropdownMenu>
          <Button onClick={() => setIsAddDialogOpen(true)} size="sm">
            <PlusCircle className="mr-2 h-4 w-4" /> Add Laptop
          </Button>
        </div>
      </div>
      <div className="rounded-md border">
        <Table className="min-w-full">
          <TableHeader>
            {table.getHeaderGroups().map((headerGroup) => (
              <TableRow key={headerGroup.id} className="hover:bg-transparent">
                {headerGroup.headers.map((header) => {
                  return (
                    <TableHead 
                      key={header.id} 
                      className="bg-muted/50 font-semibold text-muted-foreground"
                    >
                      {header.isPlaceholder
                        ? null
                        : flexRender(
                            header.column.columnDef.header,
                            header.getContext()
                          )}
                    </TableHead>
                  );
                })}
              </TableRow>
            ))}
          </TableHeader>
          <TableBody>
            {table.getRowModel().rows?.length ? (
              table.getRowModel().rows.map((row) => (
                <TableRow
                  key={row.id}
                  data-state={row.getIsSelected() && "selected"}
                  className="transition-colors hover:bg-muted/30 h-16"
                >
                  {row.getVisibleCells().map((cell) => (
                    <TableCell key={cell.id} className="py-4">
                      {flexRender(
                        cell.column.columnDef.cell,
                        cell.getContext()
                      )}
                    </TableCell>
                  ))}
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell
                  colSpan={columns.length}
                  className="h-24 text-center"
                >
                  No results.
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>
      
      {/* Add/Edit Laptop Dialog */}
      <LaptopDialog
        open={isAddDialogOpen || !!editingLaptop}
        onOpenChange={(open) => {
          if (!open) {
            setIsAddDialogOpen(false);
            setEditingLaptop(undefined);
          }
        }}
        laptop={editingLaptop as any}
        onSuccess={() => {
          onRefresh(); // Refresh data when a laptop is added/updated
        }}
      />
      
      {/* Delete Confirmation Dialog */}
      <ConfirmDialog
        open={isDeleteDialogOpen}
        onOpenChange={setIsDeleteDialogOpen}
        title="Delete Laptop"
        description={`Are you sure you want to delete the laptop "${laptopToDelete?.name}"? This action cannot be undone.`}
        onConfirm={confirmDelete}
        confirmText="Delete"
        cancelText="Cancel"
      />
    </div>
  );
}