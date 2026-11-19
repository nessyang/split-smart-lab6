"use client";

import { FormEvent, useCallback, useEffect, useState } from "react";
import { formatCents } from "@/lib/money";

interface Group { id: number; name: string; memberCount: number; expenseCount: number }
interface Member { id: number; name: string }
interface Expense {
  id: number;
  description: string;
  amountCents: number;
  createdAt: string;
  payer: { id: number; name: string };
  participants: { memberId: number; name: string; shareCents: number }[];
}
interface Balance { memberId: number; name: string; balanceCents: number }

async function api<T>(url: string, init?: RequestInit): Promise<T> {
  const res = await fetch(url, {
    ...init,
    headers: { "Content-Type": "application/json", ...init?.headers },
    cache: "no-store",
  });
  const data = await res.json().catch(() => ({}));
  if (!res.ok) throw new Error(data.error ?? `Request failed (${res.status}).`);
  return data as T;
}

const card = "rounded-xl border border-slate-200 bg-white p-5 shadow-sm";
const input =
  "w-full rounded-md border border-slate-300 px-3 py-2 text-sm text-slate-900 focus:border-emerald-600 focus:outline-none focus:ring-2 focus:ring-emerald-600/20";
const button =
  "rounded-md bg-emerald-600 px-4 py-2 text-sm font-medium text-white hover:bg-emerald-700 disabled:cursor-not-allowed disabled:opacity-50";

function ErrorText({ message }: { message: string | null }) {
  if (!message) return null;
  return (
    <p role="alert" className="mt-2 rounded-md bg-red-50 px-3 py-2 text-sm text-red-700">
      {message}
    </p>
  );
}

export default function SplitSmartApp() {
  const [groups, setGroups] = useState<Group[]>([]);
  const [selectedId, setSelectedId] = useState<number | null>(null);
  const [members, setMembers] = useState<Member[]>([]);
  const [expenses, setExpenses] = useState<Expense[]>([]);
  const [balances, setBalances] = useState<Balance[]>([]);
  const [balanceTotal, setBalanceTotal] = useState(0);
  const [loadError, setLoadError] = useState<string | null>(null);

  const [groupName, setGroupName] = useState("");
  const [groupError, setGroupError] = useState<string | null>(null);
  const [memberName, setMemberName] = useState("");
  const [memberError, setMemberError] = useState<string | null>(null);
  const [description, setDescription] = useState("");
  const [amount, setAmount] = useState("");
  const [payerId, setPayerId] = useState("");
  const [participantIds, setParticipantIds] = useState<number[]>([]);
  const [expenseError, setExpenseError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  const loadGroups = useCallback(async () => {
    const { groups } = await api<{ groups: Group[] }>("/api/groups");
    setGroups(groups);
    return groups;
  }, []);

  const loadGroupDetail = useCallback(async (groupId: number) => {
    const [m, e, b] = await Promise.all([
      api<{ members: Member[] }>(`/api/groups/${groupId}/members`),
      api<{ expenses: Expense[] }>(`/api/groups/${groupId}/expenses`),
      api<{ balances: Balance[]; totalCents: number }>(`/api/groups/${groupId}/balances`),
    ]);
    setMembers(m.members);
    setExpenses(e.expenses);
    setBalances(b.balances);
    setBalanceTotal(b.totalCents);
  }, []);

  // Initial load: restore the selected group from the URL (?group=ID) so a refresh keeps context.
  useEffect(() => {
    loadGroups()
      .then((list) => {
        const fromUrl = Number(new URLSearchParams(window.location.search).get("group"));
        const initial = list.find((g) => g.id === fromUrl) ?? list[0];
        if (initial) setSelectedId(initial.id);
      })
      .catch((err: Error) => setLoadError(err.message));
  }, [loadGroups]);

  useEffect(() => {
    if (selectedId === null) return;
    const url = new URL(window.location.href);
    url.searchParams.set("group", String(selectedId));
    window.history.replaceState(null, "", url);
    setMemberError(null);
    setExpenseError(null);
    setPayerId("");
    setParticipantIds([]);
    loadGroupDetail(selectedId).catch((err: Error) => setLoadError(err.message));
  }, [selectedId, loadGroupDetail]);

  const refresh = async () => {
    await loadGroups();
    if (selectedId !== null) await loadGroupDetail(selectedId);
  };

  async function onCreateGroup(e: FormEvent) {
    e.preventDefault();
    setGroupError(null);
    setBusy(true);
    try {
      const { group } = await api<{ group: Group }>("/api/groups", {
        method: "POST",
        body: JSON.stringify({ name: groupName }),
      });
      setGroupName("");
      await loadGroups();
      setSelectedId(group.id);
    } catch (err) {
      setGroupError((err as Error).message);
    } finally {
      setBusy(false);
    }
  }

  async function onAddMember(e: FormEvent) {
    e.preventDefault();
    if (selectedId === null) return;
    setMemberError(null);
    setBusy(true);
    try {
      const { member } = await api<{ member: Member }>(`/api/groups/${selectedId}/members`, {
        method: "POST",
        body: JSON.stringify({ name: memberName }),
      });
      setMemberName("");
      setParticipantIds((ids) => [...ids, member.id]);
      await refresh();
    } catch (err) {
      setMemberError((err as Error).message);
    } finally {
      setBusy(false);
    }
  }

  async function onAddExpense(e: FormEvent) {
    e.preventDefault();
    if (selectedId === null) return;
    setExpenseError(null);
    if (!payerId) return setExpenseError("Choose who paid.");
    if (participantIds.length === 0) return setExpenseError("Select at least one participant.");
    setBusy(true);
    try {
      await api(`/api/groups/${selectedId}/expenses`, {
        method: "POST",
        body: JSON.stringify({ description, amount, payerId: Number(payerId), participantIds }),
      });
      setDescription("");
      setAmount("");
      await refresh();
    } catch (err) {
      setExpenseError((err as Error).message);
    } finally {
      setBusy(false);
    }
  }

  const toggleParticipant = (id: number) =>
    setParticipantIds((ids) => (ids.includes(id) ? ids.filter((x) => x !== id) : [...ids, id]));

  const selected = groups.find((g) => g.id === selectedId) ?? null;

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900">
      <header className="border-b border-slate-200 bg-white">
        <div className="mx-auto max-w-6xl px-4 py-4">
          <h1 className="text-2xl font-bold text-emerald-700">SplitSmart</h1>
          <p className="text-sm text-slate-500">Record shared expenses and see who owes whom.</p>
        </div>
      </header>

      <main className="mx-auto grid max-w-6xl gap-6 px-4 py-6 lg:grid-cols-[280px_1fr]">
        <ErrorText message={loadError} />

        {/* Groups */}
        <aside className={`${card} h-fit`}>
          <h2 className="mb-3 text-lg font-semibold">Groups</h2>
          <form onSubmit={onCreateGroup} className="flex gap-2">
            <input
              className={input}
              placeholder="New group name"
              aria-label="New group name"
              value={groupName}
              onChange={(e) => setGroupName(e.target.value)}
            />
            <button className={button} disabled={busy}>Create</button>
          </form>
          <ErrorText message={groupError} />
          <ul className="mt-4 space-y-1">
            {groups.length === 0 && <li className="text-sm text-slate-500">No groups yet. Create one above.</li>}
            {groups.map((g) => (
              <li key={g.id}>
                <button
                  onClick={() => setSelectedId(g.id)}
                  className={`w-full rounded-md px-3 py-2 text-left text-sm ${
                    g.id === selectedId ? "bg-emerald-100 font-semibold text-emerald-900" : "hover:bg-slate-100"
                  }`}
                >
                  {g.name}
                  <span className="block text-xs font-normal text-slate-500">
                    {g.memberCount} member{g.memberCount === 1 ? "" : "s"} · {g.expenseCount} expense
                    {g.expenseCount === 1 ? "" : "s"}
                  </span>
                </button>
              </li>
            ))}
          </ul>
        </aside>

        {!selected ? (
          <section className={card}>
            <p className="text-slate-500">Create or select a group to get started.</p>
          </section>
        ) : (
          <div className="grid gap-6 md:grid-cols-2">
            <h2 className="text-xl font-semibold md:col-span-2">{selected.name}</h2>

            {/* Members */}
            <section className={card}>
              <h3 className="mb-3 font-semibold">Members</h3>
              <form onSubmit={onAddMember} className="flex gap-2">
                <input
                  className={input}
                  placeholder="Member name"
                  aria-label="Member name"
                  value={memberName}
                  onChange={(e) => setMemberName(e.target.value)}
                />
                <button className={button} disabled={busy}>Add</button>
              </form>
              <ErrorText message={memberError} />
              <ul className="mt-3 divide-y divide-slate-100">
                {members.length === 0 && <li className="py-2 text-sm text-slate-500">No members yet.</li>}
                {members.map((m) => (
                  <li key={m.id} className="py-2 text-sm">{m.name}</li>
                ))}
              </ul>
            </section>

            {/* Balances */}
            <section className={card}>
              <h3 className="mb-3 font-semibold">Balances</h3>
              {balances.length === 0 ? (
                <p className="text-sm text-slate-500">Add members to see balances.</p>
              ) : (
                <>
                  <ul className="divide-y divide-slate-100">
                    {balances.map((b) => (
                      <li key={b.memberId} className="flex items-center justify-between py-2 text-sm">
                        <span>{b.name}</span>
                        <span
                          data-testid={`balance-${b.memberId}`}
                          className={`font-mono font-semibold ${
                            b.balanceCents > 0 ? "text-emerald-700" : b.balanceCents < 0 ? "text-red-600" : "text-slate-500"
                          }`}
                        >
                          {formatCents(b.balanceCents, { signed: true })}
                          <span className="ml-2 font-sans text-xs font-normal text-slate-500">
                            {b.balanceCents > 0 ? "gets back" : b.balanceCents < 0 ? "owes" : "settled"}
                          </span>
                        </span>
                      </li>
                    ))}
                  </ul>
                  <p className="mt-3 text-xs text-slate-500">
                    Sum of balances: {formatCents(balanceTotal)}
                  </p>
                </>
              )}
            </section>

            {/* Record expense */}
            <section className={`${card} md:col-span-2`}>
              <h3 className="mb-3 font-semibold">Record an expense</h3>
              {members.length === 0 ? (
                <p className="text-sm text-slate-500">Add at least one member before recording expenses.</p>
              ) : (
                <form onSubmit={onAddExpense} className="grid gap-4 sm:grid-cols-2">
                  <label className="text-sm">
                    Description
                    <input
                      className={`${input} mt-1`}
                      placeholder="e.g. Groceries"
                      value={description}
                      onChange={(e) => setDescription(e.target.value)}
                    />
                  </label>
                  <label className="text-sm">
                    Amount (USD)
                    <input
                      className={`${input} mt-1`}
                      placeholder="0.00"
                      inputMode="decimal"
                      value={amount}
                      onChange={(e) => setAmount(e.target.value)}
                    />
                  </label>
                  <label className="text-sm">
                    Paid by
                    <select className={`${input} mt-1`} value={payerId} onChange={(e) => setPayerId(e.target.value)}>
                      <option value="">Select payer…</option>
                      {members.map((m) => (
                        <option key={m.id} value={m.id}>{m.name}</option>
                      ))}
                    </select>
                  </label>
                  <fieldset className="text-sm">
                    <legend className="mb-1 flex w-full items-center justify-between">
                      <span>Split equally between</span>
                      <button
                        type="button"
                        className="text-xs text-emerald-700 hover:underline"
                        onClick={() =>
                          setParticipantIds(participantIds.length === members.length ? [] : members.map((m) => m.id))
                        }
                      >
                        {participantIds.length === members.length ? "Clear" : "Select all"}
                      </button>
                    </legend>
                    <div className="flex flex-wrap gap-2">
                      {members.map((m) => (
                        <label
                          key={m.id}
                          className={`cursor-pointer rounded-full border px-3 py-1 ${
                            participantIds.includes(m.id)
                              ? "border-emerald-600 bg-emerald-50 text-emerald-900"
                              : "border-slate-300"
                          }`}
                        >
                          <input
                            type="checkbox"
                            className="mr-1"
                            checked={participantIds.includes(m.id)}
                            onChange={() => toggleParticipant(m.id)}
                          />
                          {m.name}
                        </label>
                      ))}
                    </div>
                  </fieldset>
                  <div className="sm:col-span-2">
                    <button className={button} disabled={busy}>Add expense</button>
                    <ErrorText message={expenseError} />
                  </div>
                </form>
              )}
            </section>

            {/* History */}
            <section className={`${card} md:col-span-2`}>
              <h3 className="mb-3 font-semibold">Expense history</h3>
              {expenses.length === 0 ? (
                <p className="text-sm text-slate-500">No expenses recorded yet.</p>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full text-left text-sm">
                    <thead className="border-b border-slate-200 text-xs uppercase text-slate-500">
                      <tr>
                        <th className="py-2 pr-4">Date</th>
                        <th className="py-2 pr-4">Description</th>
                        <th className="py-2 pr-4 text-right">Amount</th>
                        <th className="py-2 pr-4">Paid by</th>
                        <th className="py-2">Split between</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100">
                      {expenses.map((x) => (
                        <tr key={x.id} className="align-top">
                          <td className="py-2 pr-4 whitespace-nowrap text-slate-500">
                            {new Date(x.createdAt).toLocaleDateString()}
                          </td>
                          <td className="py-2 pr-4">{x.description}</td>
                          <td className="py-2 pr-4 text-right font-mono">{formatCents(x.amountCents)}</td>
                          <td className="py-2 pr-4">{x.payer.name}</td>
                          <td className="py-2 text-slate-600">
                            {x.participants.map((p) => `${p.name} (${formatCents(p.shareCents)})`).join(", ")}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </section>
          </div>
        )}
      </main>
    </div>
  );
}
