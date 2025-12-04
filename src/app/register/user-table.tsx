'use client';

import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { User } from './types';
import { MoreHorizontal, Edit, Trash2, User as UserIcon, Mail, Calendar } from 'lucide-react';

interface UserTableProps {
  users: User[];
  onEdit: (user: User) => void;
  onDelete: (user: User) => void;
}

export default function UserTable({ users, onEdit, onDelete }: UserTableProps) {
  const formatDate = (date: Date) => {
    return new Date(date).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });
  };

  return (
    <div className="overflow-x-auto">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead className="w-[60px] whitespace-nowrap py-2 px-3 text-xs">No</TableHead>
            <TableHead className="whitespace-nowrap py-2 px-3 text-xs">Username</TableHead>
            <TableHead className="whitespace-nowrap py-2 px-3 text-xs">Name</TableHead>
            <TableHead className="whitespace-nowrap py-2 px-3 text-xs">Email</TableHead>
            <TableHead className="whitespace-nowrap py-2 px-3 text-xs">Created At</TableHead>
            <TableHead className="text-right w-[70px] whitespace-nowrap py-2 px-3 text-xs">Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {users.length > 0 ? (
            users.map((user, index) => (
              <TableRow key={user.id} className="hover:bg-muted/50">
                <TableCell className="font-medium whitespace-nowrap py-2 px-3 text-sm">{index + 1}</TableCell>
                <TableCell className="font-medium whitespace-nowrap py-2 px-3 text-sm">
                  <div className="flex items-center gap-1.5">
                    <UserIcon className="h-3.5 w-3.5 text-blue-500 flex-shrink-0" />
                    <span>{user.username}</span>
                  </div>
                </TableCell>
                <TableCell className="whitespace-nowrap py-2 px-3 text-sm">
                  {user.name || <span className="text-muted-foreground italic text-xs">-</span>}
                </TableCell>
                <TableCell className="whitespace-nowrap py-2 px-3 text-sm">
                  {user.email ? (
                    <div className="flex items-center gap-1.5">
                      <Mail className="h-3.5 w-3.5 text-muted-foreground flex-shrink-0" />
                      <span className="truncate max-w-[200px]">{user.email}</span>
                    </div>
                  ) : (
                    <span className="text-muted-foreground italic text-xs">-</span>
                  )}
                </TableCell>
                <TableCell className="whitespace-nowrap py-2 px-3 text-sm">
                  <div className="flex items-center gap-1.5">
                    <Calendar className="h-3.5 w-3.5 text-muted-foreground flex-shrink-0" />
                    <span>{formatDate(user.created_at)}</span>
                  </div>
                </TableCell>
                <TableCell className="text-right whitespace-nowrap py-2 px-3">
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="ghost" className="h-7 w-7 p-0">
                        <MoreHorizontal className="h-3.5 w-3.5" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      <DropdownMenuItem onClick={() => onEdit(user)}>
                        <Edit className="h-3.5 w-3.5 mr-2" />
                        Edit
                      </DropdownMenuItem>
                      <DropdownMenuItem
                        className="text-red-600 focus:text-red-600"
                        onClick={() => onDelete(user)}
                      >
                        <Trash2 className="h-3.5 w-3.5 mr-2" />
                        Delete
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </TableCell>
              </TableRow>
            ))
          ) : (
            <TableRow>
              <TableCell colSpan={6} className="text-center py-6 text-muted-foreground text-sm">
                No users found
              </TableCell>
            </TableRow>
          )}
        </TableBody>
      </Table>
    </div>
  );
}
