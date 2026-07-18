import { formatDateDivider, formatTime } from "@/lib/format";
import type { Message } from "@/types/messaging";

function groupByDay(messages: Message[]): { day: string; items: Message[] }[] {
  const groups: { day: string; items: Message[] }[] = [];
  for (const m of messages) {
    const day = formatDateDivider(m.created_at);
    const last = groups[groups.length - 1];
    if (last && last.day === day) {
      last.items.push(m);
    } else {
      groups.push({ day, items: [m] });
    }
  }
  return groups;
}

export function MessageList({
  messages,
  currentUserId,
  accent,
  accentText,
}: {
  messages: Message[];
  currentUserId: string;
  accent: string; // tailwind bg-* class for own sent bubbles
  accentText: string; // tailwind text-* class matching accent, for read-receipt ticks
}) {
  const groups = groupByDay(messages);

  return (
    <div className="flex flex-col gap-0.5">
      {groups.map((group) => (
        <div key={group.day}>
          <div className="flex items-center gap-2 text-[11px] text-faint py-2">
            <span className="flex-1 h-px bg-hairline" />
            {group.day}
            <span className="flex-1 h-px bg-hairline" />
          </div>
          {group.items.map((m) => {
            const isMine = m.sender_id === currentUserId;
            return (
              <div key={m.id} className={`flex flex-col mb-1.5 ${isMine ? "items-end" : "items-start"}`}>
                <div
                  className={`max-w-[75%] px-3.5 py-2 text-[13px] leading-relaxed break-words ${
                    isMine
                      ? `${accent} text-white rounded-2xl rounded-br-md`
                      : "bg-mist border border-hairline text-ink rounded-2xl rounded-bl-md"
                  }`}
                >
                  {m.body}
                </div>
                <div className="flex items-center gap-1 text-[10px] text-faint mt-0.5 px-1">
                  {formatTime(m.created_at)}
                  {isMine && (
                    <i className={`ti ${m.read_at ? "ti-checks" : "ti-check"} text-xs ${accentText}`} />
                  )}
                </div>
              </div>
            );
          })}
        </div>
      ))}
    </div>
  );
}
