"use client";

import { ColumnDef } from "@tanstack/react-table";
import { ITAsset } from "./types";
import { Button } from "@/components/ui/button";
import { MoreHorizontal, Pencil, Trash2, Eye } from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { DataTableColumnHeader } from "./data-table-column-header";
import { format } from "date-fns";
import { Badge } from "@/components/ui/badge";

export const createColumns = (
  onEdit: (asset: ITAsset) => void,
  onDelete: (asset: ITAsset) => void,
  onView: (asset: ITAsset) => void
): ColumnDef<ITAsset>[] => [
  {
    accessorKey: "nomor_asset",
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Nomor Asset" />
    ),
    cell: ({ row }) => (
      <div className="font-medium font-mono">{row.getValue("nomor_asset")}</div>
    ),
  },
  {
    accessorKey: "nama",
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Nama" />
    ),
    cell: ({ row }) => <div className="max-w-[200px] truncate">{row.getValue("nama")}</div>,
  },
  {
    accessorKey: "kategori",
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Kategori" />
    ),
    cell: ({ row }) => {
      const kategori = row.getValue("kategori") as string;
      return (
        <Badge variant="outline" className="font-normal">
          {kategori}
        </Badge>
      );
    },
  },
  {
    accessorKey: "pic",
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="PIC" />
    ),
    cell: ({ row }) => <div>{row.getValue("pic")}</div>,
  },
  {
    accessorKey: "serial_number",
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Serial Number" />
    ),
    cell: ({ row }) => <div className="font-mono text-sm">{row.getValue("serial_number")}</div>,
  },
  {
    accessorKey: "tanggal_diterima",
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Tanggal Diterima" />
    ),
    cell: ({ row }) => {
      const date = row.getValue("tanggal_diterima") as Date;
      return <div>{format(new Date(date), "dd MMM yyyy")}</div>;
    },
  },
  {
    accessorKey: "nomor_bast",
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Nomor BAST" />
    ),
    cell: ({ row }) => {
      const bast = row.getValue("nomor_bast") as string | null;
      return <div className="text-sm">{bast || "-"}</div>;
    },
  },
  {
    accessorKey: "keterangan",
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Keterangan" />
    ),
    cell: ({ row }) => {
      const keterangan = row.getValue("keterangan") as string | null;
      return (
        <div className="max-w-[250px] truncate text-sm text-muted-foreground">
          {keterangan || "-"}
        </div>
      );
    },
  },
  {
    id: "actions",
    cell: ({ row }) => {
      const asset = row.original;

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
            <DropdownMenuItem onClick={() => onView(asset)}>
              <Eye className="mr-2 h-4 w-4" />
              View Details
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem onClick={() => onEdit(asset)}>
              <Pencil className="mr-2 h-4 w-4" />
              Edit
            </DropdownMenuItem>
            <DropdownMenuItem
              onClick={() => onDelete(asset)}
              className="text-red-600 focus:text-red-600"
            >
              <Trash2 className="mr-2 h-4 w-4" />
              Delete
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      );
    },
  },
];
