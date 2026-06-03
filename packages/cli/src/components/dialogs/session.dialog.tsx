import { useCallback, useState, useEffect } from "react";
import { format } from "date-fns";
import { useNavigate } from "react-router";
import { useDialog } from "../providers/dialog";
import { useToast } from "../providers/toast";
import { apiClient } from "../../lib/api-client";
import { getErrorMessage } from "../../lib/http-errors";
import { DialogSearchList } from "../dialog-search-list";
import type { InferResponseType } from "hono/client";
import { TextAttributes } from "@opentui/core";

type Session = InferResponseType<(typeof apiClient.sessions)["$get"],200>[number];

const ROW_WIDTH = 50;

function formatTime(raw: string): string {
  try {
    return format(new Date(raw), "hh:mm: a");
  } catch {
    return "";
  }
}

export const SessionDialogContent = () => {
  const { closeDialog } = useDialog();
  const navigate = useNavigate();
  const { show } = useToast();
  const [sessions, setSessions] = useState<Session[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let ignore = false;
    const fetchSessions = async () => {
      try {
        const res = await apiClient.sessions.$get();
        if (!res.ok) {
          throw new Error(await getErrorMessage(res));
        }
        const data = await res.json();
        if (!ignore) {
          setSessions(data);
          setLoading(false);
        }
      } catch (error) {
        if (!ignore) {
          show({
            variant: "error",
            message:
              error instanceof Error
                ? error.message
                : "failed to fetch session",
          });
          closeDialog();
        }
      }
    };

    fetchSessions();
    return () => {
      ignore = true;
    };
  }, []);

  const handleSelect = useCallback(
    (session: Session) => {
      closeDialog();
      navigate(`/sessions/${session.id}`);
    },
    [closeDialog, navigate],
  );

  if (loading) {
    return (
      <box flexDirection="column">
        <text> Loading sessions...</text>
      </box>
    );
  }

  return (
    <DialogSearchList
      items={sessions}
      onSelect={handleSelect}
      filterFn={(s, query) =>
        s.title.toLowerCase().includes(query.toLowerCase())
      }
      renderItem={(session, isSelected) =>{
        const time = formatTime(session.createdAt);
        const label = time
          ? session.title.length > ROW_WIDTH - time.length - 2
            ? session.title.slice(0, ROW_WIDTH - time.length - 5) + "..."
            : session.title
          : session.title;
        const padded = time ? label.padEnd(ROW_WIDTH - time.length) : label;
        return (
          <text selectable={false} fg={isSelected ? "black" : "white"}>
            {padded + time}
          </text>
        );
      }}
      getKey={(s) => s.id}
      placeholder="search sessions"
      emptyText="No matching sessions"
    />
  );
};
