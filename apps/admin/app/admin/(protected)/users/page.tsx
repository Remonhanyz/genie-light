"use client";

import * as React from "react";
import { useState, useEffect } from "react";
import { Table, TableHeader, TableRow, TableHead, TableBody, TableCell } from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import { ConfirmDialog } from "@/components/ui/confirm-dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from "@/components/ui/select";
import { Search, Edit, Trash, ArrowUpDown, ArrowUp, ArrowDown, Flame, AlertTriangle } from "lucide-react";
import { TableLoader } from "@/components/ui/table-loader";
import { toast } from "sonner";
import { formatDate } from "@/lib/utils";
import { useSortableData } from "@/hooks/use-sortable-data";
import { useCurrentUser } from "@/hooks/use-current-user";
import { AccessRestricted } from "@/components/auth/access-restricted";

export default function UsersModerationPage() {
  const { isDataEntry } = useCurrentUser();
  const [users, setUsers] = useState<any[]>([]);
  const [search, setSearch] = useState("");
  const [filterRole, setFilterRole] = useState("ALL");
  const [filterTeam, setFilterTeam] = useState("ALL");
  const [selectedUser, setSelectedUser] = useState<any | null>(null);
  const [isOpen, setIsOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);
  const [hardDeleteTarget, setHardDeleteTarget] = useState<any | null>(null);

  const [form, setForm] = useState({
    role: "USER",
    team: "NONE",
  });

  const { items: sortedUsers, requestSort, sortConfig } = useSortableData(users);

  const loadData = async () => {
    setIsLoading(true);
    try {
      const roleParam = filterRole === "ALL" ? "" : `&role=${filterRole}`;
      const teamParam = filterTeam === "ALL" ? "" : `&team=${filterTeam}`;
      const url = `/api/users?search=${search}${roleParam}${teamParam}`;
      const res = await fetch(url);
      const data = await res.json();
      setUsers(data);
    } catch {
      toast.error("Failed to load user records");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, [search, filterRole, filterTeam]);

  const handleOpenEdit = (user: any) => {
    setSelectedUser(user);
    setForm({
      role: user.role,
      team: user.team || "NONE",
    });
    setIsOpen(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedUser) return;

    try {
      const res = await fetch(`/api/users/${selectedUser.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });

      if (res.ok) {
        toast.success("User access configurations updated");
        setIsOpen(false);
        loadData();
      } else {
        toast.error("Failed to update user profile");
      }
    } catch {
      toast.error("Connection error during save");
    }
  };

  const handleDelete = async (id: string, force: boolean = false) => {
    setIsDeleting(true);
    try {
      const url = force ? `/api/users/${id}?force=true` : `/api/users/${id}`;
      const res = await fetch(url, { method: "DELETE" });
      const data = await res.json().catch(() => ({}));
      if (res.ok) {
        toast.success(
          force
            ? "User account and all connected orders/keys deleted successfully"
            : "User account deleted"
        );
        setDeleteId(null);
        setHardDeleteTarget(null);
        loadData();
      } else {
        toast.error(data.error || "Failed to delete user");
        if (res.status === 409 && !force) {
          const target = users.find((u) => u.id === id);
          if (target) {
            setDeleteId(null);
            setHardDeleteTarget(target);
          }
        }
      }
    } catch {
      toast.error("Network error while deleting user");
    } finally {
      setIsDeleting(false);
    }
  };

  const renderSortHeader = (label: string, field: string) => {
    const isActive = sortConfig?.field === field;
    return (
      <div className="flex items-center gap-1.5 w-full">
        <span>{label}</span>
        <span className="flex-none rounded-md p-0.5 text-default-400 group-hover:bg-default-300/50 dark:group-hover:bg-default-700/50 group-hover:text-default-900 dark:group-hover:text-default-100 transition-colors">
          {isActive ? (
            sortConfig.asc ? (
              <ArrowUp className="h-3.5 w-3.5 text-primary" />
            ) : (
              <ArrowDown className="h-3.5 w-3.5 text-primary" />
            )
          ) : (
            <ArrowUpDown className="h-3.5 w-3.5 opacity-0 group-hover:opacity-100 transition-opacity" />
          )}
        </span>
      </div>
    );
  };

  if (isDataEntry) {
    return <AccessRestricted moduleName="User Accounts & Permissions" />;
  }

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-3xl font-bold tracking-tight">Team & User Accounts</h2>
        <p className="text-muted-foreground">Manage administrative privileges, data entry specialists, and contractor client profiles.</p>
      </div>

      <div className="flex items-center gap-4 flex-wrap">
        <div className="relative flex-1 min-w-[200px] max-w-sm">
          <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search name, email, phone..."
            className="pl-8"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
        <Select value={filterRole} onValueChange={setFilterRole}>
          <SelectTrigger className="w-44">
            <SelectValue placeholder="All Roles" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="ALL">All Roles</SelectItem>
            <SelectItem value="ADMIN">ADMIN</SelectItem>
            <SelectItem value="DATA_ENTRY">DATA ENTRY</SelectItem>
            <SelectItem value="CUSTOMER">CUSTOMER</SelectItem>
            <SelectItem value="GUEST">GUEST</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <Card>
        <CardContent className="p-0">
          <Table>
            <TableHeader className="bg-default-200">
              <TableRow>
                <TableHead
                  onClick={() => requestSort("username")}
                  className="group cursor-pointer select-none hover:bg-default-150/30 dark:hover:bg-default-800/30 transition-colors"
                >
                  {renderSortHeader("Username", "username")}
                </TableHead>
                <TableHead
                  onClick={() => requestSort("email")}
                  className="group cursor-pointer select-none hover:bg-default-150/30 dark:hover:bg-default-800/30 transition-colors"
                >
                  {renderSortHeader("Email address", "email")}
                </TableHead>
                <TableHead
                  onClick={() => requestSort("phone")}
                  className="group cursor-pointer select-none hover:bg-default-150/30 dark:hover:bg-default-800/30 transition-colors"
                >
                  {renderSortHeader("Phone Number", "phone")}
                </TableHead>
                <TableHead
                  onClick={() => requestSort("role")}
                  className="group cursor-pointer select-none hover:bg-default-150/30 dark:hover:bg-default-800/30 transition-colors"
                >
                  {renderSortHeader("Role", "role")}
                </TableHead>
                <TableHead
                  onClick={() => requestSort("team")}
                  className="group cursor-pointer select-none hover:bg-default-150/30 dark:hover:bg-default-800/30 transition-colors"
                >
                  {renderSortHeader("Faction Lock", "team")}
                </TableHead>
                <TableHead
                  onClick={() => requestSort("createdAt")}
                  className="group cursor-pointer select-none hover:bg-default-150/30 dark:hover:bg-default-800/30 transition-colors"
                >
                  {renderSortHeader("Registered", "createdAt")}
                </TableHead>
                <TableHead className="w-24 text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {isLoading ? (
                <TableLoader colSpan={7} rows={5} columns={["text", "text", "text", "badge", "badge", "text", "actions"]} />
              ) : sortedUsers.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={7} className="text-center py-6 text-muted-foreground normal-case">
                    No user accounts found matching conditions.
                  </TableCell>
                </TableRow>
              ) : (
                sortedUsers.map((u) => (
                  <TableRow key={u.id}>
                    <TableCell className="font-semibold normal-case">{u.username}</TableCell>
                    <TableCell className="normal-case">{u.email}</TableCell>
                    <TableCell className="normal-case">{u.phone}</TableCell>
                    <TableCell className="normal-case">
                      <span className={`text-xs font-bold px-2 py-0.5 rounded-full ${
                        u.role === "ADMIN" 
                          ? "bg-purple-100 text-purple-700 dark:bg-purple-950/40 dark:text-purple-300"
                          : u.role === "CLIENT"
                            ? "bg-amber-100 text-amber-700 dark:bg-amber-950/40 dark:text-amber-300"
                            : "bg-zinc-100 text-zinc-700 dark:bg-zinc-800 dark:text-zinc-300"
                      }`}>
                        {u.role}
                      </span>
                    </TableCell>
                    <TableCell className="normal-case">
                      {u.team ? (
                        <span className={`text-xs font-semibold px-2 py-0.5 rounded-full ${
                          u.team === "RED" 
                            ? "bg-red-100 text-red-700 dark:bg-red-950/40 dark:text-red-300"
                            : "bg-blue-100 text-blue-700 dark:bg-blue-950/40 dark:text-blue-300"
                        }`}>
                          TEAM {u.team}
                        </span>
                      ) : (
                        <span className="text-xs text-muted-foreground">None</span>
                      )}
                    </TableCell>
                    <TableCell className="text-xs text-muted-foreground normal-case">{formatDate(u.createdAt)}</TableCell>
                    <TableCell className="flex justify-end gap-1.5 py-3 normal-case">
                      <Button size="icon" variant="outline" onClick={() => handleOpenEdit(u)} className="cursor-pointer" title="Edit User">
                        <Edit className="h-4 w-4" />
                      </Button>
                      <Button
                        size="icon"
                        variant="outline"
                        onClick={() => setDeleteId(u.id)}
                        className="text-destructive hover:bg-destructive/10 cursor-pointer"
                        title="Safe Delete (Protected if orders exist)"
                      >
                        <Trash className="h-4 w-4" />
                      </Button>
                      <Button
                        size="icon"
                        variant="outline"
                        onClick={() => setHardDeleteTarget(u)}
                        className="text-red-600 hover:text-red-500 hover:bg-red-600/10 border-red-500/30 cursor-pointer"
                        title="Hard / Force Delete (Deletes User & Connected Orders/Keys)"
                      >
                        <Flame className="h-4 w-4" />
                      </Button>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      <Dialog open={isOpen} onOpenChange={setIsOpen}>
        <DialogContent className="sm:max-w-md">
          {selectedUser && (
            <form onSubmit={handleSubmit} className="space-y-4">
              <DialogHeader>
                <DialogTitle>Edit Access Controls</DialogTitle>
              </DialogHeader>
              <div className="space-y-3">
                <div className="text-sm border-b pb-2">
                  <p className="font-semibold">{selectedUser.username}</p>
                  <p className="text-muted-foreground text-xs">{selectedUser.email}</p>
                </div>
                <div className="space-y-1.5">
                  <Label htmlFor="role">Authorization Role</Label>
                  <Select value={form.role} onValueChange={(val) => setForm({ ...form, role: val })}>
                    <SelectTrigger id="role">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="USER">USER (Customer)</SelectItem>
                      <SelectItem value="CLIENT">CLIENT (Team Member)</SelectItem>
                      <SelectItem value="ADMIN">ADMIN (System Owner)</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-1.5">
                  <Label htmlFor="team">Faction Lock Override</Label>
                  <Select value={form.team} onValueChange={(val) => setForm({ ...form, team: val })}>
                    <SelectTrigger id="team">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="NONE">NO FACTION</SelectItem>
                      <SelectItem value="RED">TEAM RED</SelectItem>
                      <SelectItem value="BLUE">TEAM BLUE</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
              <DialogFooter>
                <Button type="button" variant="outline" onClick={() => setIsOpen(false)} className="cursor-pointer">
                  Cancel
                </Button>
                <Button type="submit" className="cursor-pointer">
                  Save Changes
                </Button>
              </DialogFooter>
            </form>
          )}
        </DialogContent>
      </Dialog>

      <ConfirmDialog
        open={!!deleteId}
        onOpenChange={(open) => !open && setDeleteId(null)}
        title="Delete User Account"
        description="Are you sure you want to delete this user? If this user has existing purchase orders, deletion is safely blocked to protect order records."
        confirmText="Delete User"
        onConfirm={() => deleteId && handleDelete(deleteId, false)}
        loading={isDeleting}
      />

      {/* Hard / Force Delete User Dialog */}
      <Dialog
        open={!!hardDeleteTarget}
        onOpenChange={(open) => {
          if (!open) setHardDeleteTarget(null);
        }}
      >
        <DialogContent className="sm:max-w-lg bg-card border border-red-500/40">
          <DialogHeader className="text-left space-y-2">
            <div className="flex items-center gap-3">
              <div className="p-2.5 rounded-full bg-red-500/10 text-red-600 dark:text-red-400">
                <AlertTriangle className="h-6 w-6" />
              </div>
              <div>
                <DialogTitle className="text-xl font-bold text-red-600 dark:text-red-400">
                  Hard Delete User & Connected Data
                </DialogTitle>
                <DialogDescription className="text-sm text-muted-foreground mt-0.5">
                  Permanent cascading removal for:{" "}
                  <span className="font-semibold text-foreground">
                    {hardDeleteTarget?.username} ({hardDeleteTarget?.email})
                  </span>
                </DialogDescription>
              </div>
            </div>
          </DialogHeader>

          <div className="rounded-lg bg-destructive/10 border border-destructive/20 p-4 text-sm space-y-2 text-foreground">
            <p className="font-semibold text-red-600 dark:text-red-400">
              Warning: This action is permanent and cannot be undone!
            </p>
            <p className="text-muted-foreground text-xs leading-relaxed">
              This user has active purchase orders. Hard deleting will forcefully delete:
            </p>
            <ul className="list-disc list-inside text-xs space-y-1 text-muted-foreground">
              <li>The user account profile and credentials</li>
              <li>All customer orders and order line items placed by this user</li>
              <li>All single-use faction registration keys generated for their orders</li>
            </ul>
          </div>

          <DialogFooter className="gap-2 sm:gap-2 pt-3 border-t border-border flex flex-col sm:flex-row sm:justify-end">
            <Button
              type="button"
              variant="outline"
              onClick={() => setHardDeleteTarget(null)}
              disabled={isDeleting}
              className="cursor-pointer"
            >
              Cancel
            </Button>
            <Button
              type="button"
              color="destructive"
              onClick={() => hardDeleteTarget && handleDelete(hardDeleteTarget.id, true)}
              disabled={isDeleting}
              className="cursor-pointer gap-1.5"
            >
              <Trash className="h-4 w-4" />
              {isDeleting ? "Deleting..." : "Hard Delete User & Orders"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
