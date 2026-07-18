"use client";

import { useEffect, useState } from "react";
import {
  listAdminCategoryGroups,
  listAdminCategories,
  createCategoryGroup,
  deleteCategoryGroup,
  createCategory,
  deleteCategory,
} from "@/lib/admin-api";
import { Button } from "@/components/auth/Button";
import type { AdminCategoryGroup, AdminCategory } from "@/types/admin";

export function CategoriesTab() {
  const [groups, setGroups] = useState<AdminCategoryGroup[] | null>(null);
  const [categories, setCategories] = useState<AdminCategory[] | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [newGroupName, setNewGroupName] = useState("");
  const [addingCategoryTo, setAddingCategoryTo] = useState<string | null>(null);
  const [newCategoryName, setNewCategoryName] = useState("");
  const [busy, setBusy] = useState(false);

  function load() {
    Promise.all([listAdminCategoryGroups(), listAdminCategories()])
      .then(([g, c]) => {
        setGroups(g);
        setCategories(c);
      })
      .catch(() => setError("Couldn't load categories."));
  }

  useEffect(load, []);

  async function handleAddGroup(e: React.FormEvent) {
    e.preventDefault();
    if (!newGroupName.trim()) return;
    setBusy(true);
    try {
      await createCategoryGroup({ name: newGroupName.trim() });
      setNewGroupName("");
      load();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Couldn't create that group.");
    } finally {
      setBusy(false);
    }
  }

  async function handleDeleteGroup(id: string) {
    setBusy(true);
    try {
      await deleteCategoryGroup(id);
      load();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Couldn't delete that group.");
    } finally {
      setBusy(false);
    }
  }

  async function handleAddCategory(groupId: string) {
    if (!newCategoryName.trim()) return;
    setBusy(true);
    try {
      await createCategory({ name: newCategoryName.trim(), groupId });
      setNewCategoryName("");
      setAddingCategoryTo(null);
      load();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Couldn't create that category.");
    } finally {
      setBusy(false);
    }
  }

  async function handleDeleteCategory(id: string) {
    setBusy(true);
    try {
      await deleteCategory(id);
      load();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Couldn't delete that category.");
    } finally {
      setBusy(false);
    }
  }

  if (error) return <p className="px-4 py-4 text-sm text-danger">{error}</p>;
  if (!groups || !categories) return <p className="px-4 py-10 text-sm text-muted">Loading…</p>;

  return (
    <div className="p-4">
      <form onSubmit={handleAddGroup} className="flex gap-2 mb-5">
        <input
          value={newGroupName}
          onChange={(e) => setNewGroupName(e.target.value)}
          placeholder="New group name…"
          className="flex-1 rounded-[10px] border border-hairline px-3 py-2 text-sm outline-none focus:border-indigo"
        />
        <Button type="submit" loading={busy} className="w-auto px-4">
          Add group
        </Button>
      </form>

      <div className="flex flex-col gap-4">
        {groups.map((g) => {
          const groupCategories = categories.filter((c) => c.group_id === g.id);
          return (
            <div key={g.id} className="border border-hairline rounded-xl p-3.5">
              <div className="flex items-center justify-between mb-2.5">
                <div className="flex items-center gap-2">
                  {g.icon && <i className={`ti ${g.icon} text-indigo`} />}
                  <span className="text-sm font-bold text-ink">{g.name}</span>
                  <span className="text-[11px] text-faint">({g.category_count})</span>
                </div>
                <button
                  disabled={busy || g.category_count > 0}
                  onClick={() => handleDeleteGroup(g.id)}
                  title={g.category_count > 0 ? "Remove or reassign its categories first" : "Delete group"}
                  className="text-faint disabled:opacity-30"
                >
                  <i className="ti ti-trash text-sm" />
                </button>
              </div>

              <div className="flex flex-wrap gap-1.5 mb-2.5">
                {groupCategories.map((c) => (
                  <span
                    key={c.id}
                    className="flex items-center gap-1.5 text-xs px-2.5 py-1 rounded-2xl bg-mist border border-hairline text-ink"
                  >
                    {c.name}
                    <span className="text-faint">({c.artist_count})</span>
                    <button
                      disabled={busy || c.artist_count > 0}
                      onClick={() => handleDeleteCategory(c.id)}
                      title={c.artist_count > 0 ? "Still in use — can't delete" : "Delete category"}
                      className="disabled:opacity-30"
                    >
                      <i className="ti ti-x text-[10px] text-faint" />
                    </button>
                  </span>
                ))}
                {groupCategories.length === 0 && (
                  <span className="text-xs text-faint">No categories yet.</span>
                )}
              </div>

              {addingCategoryTo === g.id ? (
                <div className="flex gap-2">
                  <input
                    value={newCategoryName}
                    onChange={(e) => setNewCategoryName(e.target.value)}
                    placeholder="Category name…"
                    autoFocus
                    className="flex-1 rounded-[10px] border border-hairline px-2.5 py-1.5 text-xs outline-none focus:border-indigo"
                  />
                  <button
                    onClick={() => handleAddCategory(g.id)}
                    disabled={busy}
                    className="text-xs font-semibold text-indigo px-2.5"
                  >
                    Add
                  </button>
                  <button
                    onClick={() => setAddingCategoryTo(null)}
                    className="text-xs font-semibold text-faint px-2.5"
                  >
                    Cancel
                  </button>
                </div>
              ) : (
                <button
                  onClick={() => setAddingCategoryTo(g.id)}
                  className="text-xs font-semibold text-indigo flex items-center gap-1"
                >
                  <i className="ti ti-plus text-xs" /> Add category
                </button>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
