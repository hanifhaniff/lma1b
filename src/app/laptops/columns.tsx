"use client";

import { ColumnDef } from "@tanstack/react-table";
import { Laptop } from "./types";
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
  onDelete: (laptop: Laptop) => void
): ColumnDef<Laptop>[] => [
  {
    accessorKey: "image_url",
    header: "Image",
    cell: ({ row }) => {
      const imageUrl = row.getValue("image_url") as string;
      return (
        <div className="w-16 h-12">
          {imageUrl ? (
            <img 
              src={imageUrl} 
              alt="Laptop" 
              className="w-full h-full object-cover rounded-md border"
              onError={(e) => {
                // If the image fails to load, show a fallback
                const target = e.target as HTMLImageElement;
                target.onerror = null; // Prevent infinite loop
                target.src = "https://placehold.co/400x300/e2e8f0/64748b?text=Image+Not+Found"; // Fallback image
              }}
            />
          ) : (
            <div className="w-full h-full bg-gray-100 dark:bg-gray-800 rounded-md flex items-center justify-center border-2 border-dashed border-gray-300 dark:border-gray-600">
              <span className="text-gray-500 text-xs">No image</span>
            </div>
          )}
        </div>
      );
    },
  },
  {
    accessorKey: "name",
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Name" />
    ),
    cell: ({ row }) => (
      <div className="font-medium">
        {row.getValue("name")}
      </div>
    ),
  },
  {
    accessorKey: "assigned_user",
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Assigned User" />
    ),
    cell: ({ row }) => (
      <div>
        {row.getValue("assigned_user") || <span className="text-gray-400 italic">Unassigned</span>}
      </div>
    ),
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
    accessorKey: "serial_number",
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Serial Number" />
    ),
    cell: ({ row }) => (
      <div className="w-[150px] font-mono">{row.getValue("serial_number")}</div>
    ),
  },
  {
    accessorKey: "asset_number",
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Asset Number" />
    ),
    cell: ({ row }) => (
      <div className="w-[120px] font-mono">
        {row.getValue("asset_number") || <span className="text-gray-400">N/A</span>}
      </div>
    ),
  },
  {
    accessorKey: "model_type",
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Model" />
    ),
    cell: ({ row }) => (
      <div className="w-[120px]">{row.getValue("model_type") || <span className="text-gray-400">N/A</span>}</div>
    ),
  },
  {
    accessorKey: "no_bast",
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="No. BAST" />
    ),
    cell: ({ row }) => (
      <div className="w-[120px] font-mono">
        {row.getValue("no_bast") || <span className="text-gray-400">N/A</span>}
      </div>
    ),
  },
  {
    accessorKey: "date_received",
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Date Received" />
    ),
    cell: ({ row }) => {
      const date = row.getValue("date_received") as Date;
      return (
        <div className="w-[120px]">
          {date ? format(date, "MMM dd, yyyy") : <span className="text-gray-400">N/A</span>}
        </div>
      );
    },
  },
  {
    accessorKey: "condition",
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Condition" />
    ),
    cell: ({ row }) => {
      const condition = row.getValue("condition") as string;
      let variant: "default" | "secondary" | "destructive" | "outline" | "primary" = "default";
      
      if (condition) {
        switch (condition.toLowerCase()) {
          case "new":
            variant = "default";
            break;
          case "good":
            variant = "outline";
            break;
          case "fair":
            variant = "secondary";
            break;
          case "damaged":
            variant = "destructive";
            break;
          default:
            variant = "default";
        }
      }

      return (
        <div className="w-[100px]">
          {condition ? (
            <Badge variant={variant}>{condition}</Badge>
          ) : (
            <span className="text-gray-400">N/A</span>
          )}
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