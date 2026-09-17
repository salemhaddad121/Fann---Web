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
import { ConfirmDialog } from "@/components/admin/ConfirmDialog";
import type { AdminCategoryGroup, AdminCategory } from "@/types/admin";
import { categoryIcon } from "@/lib/category-icons";
import { BOOKER_INTEREST_OPTIONS, type BookerInterest } from "@/types/auth";

export function CategoriesTab() {
  const [groups, setGroups] = useState<AdminCategoryGroup[] | null>(null);
  const [categories, setCategories] = useState<AdminCategory[] | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [newGroupName, setNewGroupName] = useState("");
  const [addingCategoryTo, setAddingCategoryTo] = useState<string | null>(null);
  const [newCategoryName, setNewCategoryName] = useState("");
  // Which booker bucket the new category answers. No default: picking one
  // has to be a decision, because the failure mode of getting it wrong is
  // a category that simply never appears for a booker and says nothing
  // about it at the time.
  const [newCategoryInterest, setNewCategoryInterest] = useState<
    BookerInterest | "none" | ""
  >("");
  const [busy, setBusy] = useState(false);
  // Deleting a group or a category is irreversible, so both go through a
  // confirmation step. Holding the pending target here keeps the dialog a
  // pure render of state rather than an imperative window.confirm().
  const [pendingDelete, setPendingDelete] = useState<
    { kind: "group" | "category"; id: string; name: string } | null
  >(null);

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

  async function confirmDelete() {
    if (!pendingDelete) return;
    const { kind, id } = pendingDelete;
    setBusy(true);
    try {
      if (kind === "group") await deleteCategoryGroup(id);
      else await deleteCategory(id);
      setPendingDelete(null);
      load();
    } catch (err) {
      setPendingDelete(null);
      setError(
        err instanceof Error
          ? err.message
          : `Couldn't delete that ${kind === "group" ? "group" : "category"}.`,
      );
    } finally {
      setBusy(false);
    }
  }

  async function handleAddCategory(groupId: string) {
    if (!newCategoryName.trim()) return;
    if (!newCategoryInterest) {
      setError("Choose what bookers should find this under.");
      return;
    }
    setError(null);
    setBusy(true);
    try {
      await createCategory({
        name: newCategoryName.trim(),
        groupId,
        // "none" is the explicit Venue-style answer and has to reach the
        // API as null, not as the empty string the placeholder uses.
        bookerInterest: newCategoryInterest === "none" ? null : (newCategoryInterest as BookerInterest),
      });
      setNewCategoryName("");
      setNewCategoryInterest("");
      setAddingCategoryTo(null);
      load();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Couldn't create that category.");
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
          className="flex-1 rounded-[10px] border border-hairline px-3 py-2 text-sm outline-none focus:border-clay"
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
                  {categoryIcon(g.icon) && <i className={`ti ${categoryIcon(g.icon)} text-clay`} />}
                  <span className="text-sm font-bold text-ink">{g.name}</span>
                  <span className="text-[12px] text-faint">({g.category_count})</span>
                </div>
                <button
                  disabled={busy || g.category_count > 0}
                  onClick={() => setPendingDelete({ kind: "group", id: g.id, name: g.name })}
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
                    className="flex items-center gap-1.5 text-xs px-2.5 py-1 rounded-2xl bg-sand border border-hairline text-ink"
                  >
                    {c.name}
                    <span className="text-faint">({c.artist_count})</span>
                    <button
                      disabled={busy || c.artist_count > 0}
                      onClick={() => setPendingDelete({ kind: "category", id: c.id, name: c.name })}
                      title={c.artist_count > 0 ? "Still in use — can't delete" : "Delete category"}
                      className="disabled:opacity-30"
                    >
                      <i className="ti ti-x text-[12px] text-faint" />
                    </button>
                  </span>
                ))}
                {groupCategories.length === 0 && (
                  <span className="text-xs text-faint">No categories yet.</span>
                )}
              </div>

              {addingCategoryTo === g.id ? (
                <div className="flex flex-col gap-2">
                  <div className="flex gap-2">
                    <input
                      value={newCategoryName}
                      onChange={(e) => setNewCategoryName(e.target.value)}
                      placeholder="Category name…"
                      autoFocus
                      className="flex-1 rounded-[10px] border border-hairline px-2.5 py-1.5 text-xs outline-none focus:border-clay"
                    />
                    <button
                      onClick={() => handleAddCategory(g.id)}
                      disabled={busy}
                      className="text-xs font-semibold text-clay px-2.5"
                    >
                      Add
                    </button>
                    <button
                      onClick={() => {
                        setAddingCategoryTo(null);
                        setNewCategoryInterest("");
                      }}
                      className="text-xs font-semibold text-faint px-2.5"
                    >
                      Cancel
                    </button>
                  </div>

                  {/* The group above is the ARTIST's taxonomy — how a
                      performer thinks of their craft. This is the BOOKER's
                      — what someone planning an event went looking for.
                      They genuinely differ: a DJ is a musician to himself
                      and a service to a venue, which is why the two are
                      separate columns and why this cannot be inferred from
                      the group. */}
                  <label className="block">
                    <span className="mb-1 block text-[11px] font-semibold text-muted">
                      When a booker searches, show this under
                    </span>
                    <select
                      value={newCategoryInterest}
                      onChange={(e) =>
                        setNewCategoryInterest(e.target.value as BookerInterest | "none" | "")
                      }
                      className="w-full rounded-[10px] border border-hairline px-2.5 py-1.5 text-xs outline-none focus:border-clay"
                    >
                      <option value="">Choose one…</option>
                      {BOOKER_INTEREST_OPTIONS.map((o) => (
                        <option key={o.value} value={o.value}>
                          {o.label}
                        </option>
                      ))}
                      {/* "Venue" is two different things in this product and
                          the old label did not say which: a booker_type, and
                          a CATEGORY where a venue lists its room for hire.
                          This option is about the second — supply, not
                          demand — so it names what the thing IS rather than
                          borrowing a word that also means a kind of buyer. */}
                      <option value="none">
                        None — this is a space or service, not talent to book
                      </option>
                    </select>
                  </label>
                </div>
              ) : (
                <button
                  onClick={() => setAddingCategoryTo(g.id)}
                  className="text-xs font-semibold text-clay flex items-center gap-1"
                >
                  <i className="ti ti-plus text-xs" /> Add category
                </button>
              )}
            </div>
          );
        })}
      </div>

      {pendingDelete && (
        <ConfirmDialog
          title={pendingDelete.kind === "group" ? "Delete this group?" : "Delete this category?"}
          body={
            <>
              <strong className="text-ink">{pendingDelete.name}</strong> will be permanently
              removed. This can&apos;t be undone.
            </>
          }
          confirmLabel="Delete"
          destructive
          busy={busy}
          onConfirm={confirmDelete}
          onCancel={() => setPendingDelete(null)}
        />
      )}
    </div>
  );
}
