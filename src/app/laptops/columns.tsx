"use client";

import { ColumnDef } from "@tanstack/react-table";
import { Laptop } from "./laptop-service";
import { DataTableColumnHeader } from "./data-table-column-header";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { format } from "date-fns";
import { MoreHorizontal } from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

// Define the columns function that accepts action handlers
export const getLaptopColumns = (
  onEdit: (laptop: Laptop) => void,
  onDelete: (laptop: Laptop) => void,
  onView: (laptop: Laptop) => void
): ColumnDef<Laptop>[] => [
  {
    accessorKey: "name",
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Name" />
    ),
    cell: ({ row }) => {
      const laptop = row.original;
      return (
        <div 
          className="font-medium cursor-pointer text-blue-600 hover:underline max-w-xs truncate"
          onClick={() => onView(laptop)}
          title={laptop.name} // Show full text on hover
        >
          {laptop.name}
        </div>
      );
    },
  },
  {
    accessorKey: "model_type",
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Model Type" />
    ),
    cell: ({ row }) => {
      const value = row.getValue("model_type") as string;
      return (
        <div 
          className="truncate"
          title={value || "-"} // Show full text on hover
        >
          {value || <span className="text-gray-400">-</span>}
        </div>
      );
    },
  },
  {
    accessorKey: "serial_number",
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Serial Number" />
    ),
    cell: ({ row }) => {
      const value = row.getValue("serial_number") as string;
      return (
        <div 
          className="font-mono truncate"
          title={value} // Show full text on hover
        >
          {value}
        </div>
      );
    },
  },
  {
    accessorKey: "assigned_user",
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Assigned User" />
    ),
    cell: ({ row }) => {
      const value = row.getValue("assigned_user") as string;
      return (
        <div 
          className="truncate"
          title={value || "-"} // Show full text on hover
        >
          {value || <span className="text-gray-400">-</span>}
        </div>
      );
    },
    filterFn: (row, id, value) => {
      const assignedUser = row.getValue(id) as string | null;
      if (!value) return true; // If no filter value, show all
      
      // Handle unassigned case
      if (value.toLowerCase() === 'unassigned' || value.toLowerCase() === 'un') {
        return assignedUser === null || assignedUser === "";
      }
      
      // Case-insensitive partial match
      return assignedUser?.toLowerCase().includes(value.toLowerCase()) || false;
    },
  },
  {
    accessorKey: "no_bast",
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="No. BAST" />
    ),
    cell: ({ row }) => {
      const value = row.getValue("no_bast") as string;
      return (
        <div 
          className="font-mono truncate"
          title={value || "-"} // Show full text on hover
        >
          {value || <span className="text-gray-400">-</span>}
        </div>
      );
    },
  },
  {
    accessorKey: "created_at",
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Created At" />
    ),
    cell: ({ row }) => {
      const date = row.getValue("created_at") as string;
      return (
        <div 
          title={date ? format(new Date(date), "MMM dd, yyyy") : "-"} // Show full text on hover
        >
          {date ? format(new Date(date), "MMM dd, yyyy") : <span className="text-gray-400">-</span>}
        </div>
      );
    },
  },
  {
    id: "actions",
    cell: ({ row }) => {
      const laptop = row.original;

      return (
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" className="h-8 w-8 p-0">
              <span className="sr-only">Open menu</span>
              <MoreHorizontal className="h-4 w-4" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuLabel>Actions</DropdownMenuLabel>
            <DropdownMenuItem
              onClick={() => onEdit(laptop)}
            >
              Edit
            </DropdownMenuItem>
            <DropdownMenuItem
              onClick={() => onView(laptop)}
            >
              View
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem
              onClick={() => onDelete(laptop)}
              className="text-red-600 focus:text-red-600"
            >
              Delete
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      );
    },
  },
];