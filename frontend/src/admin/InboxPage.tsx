import { useCallback, useEffect, useState } from "react";
import { Link } from "react-router-dom";
import Alert from "../components/Alert";
import Avatar from "../components/Avatar";
import Button from "../components/Button";
import EmptyState from "../components/EmptyState";
import Kicker from "../components/Kicker";
import StatusBadge from "../components/StatusBadge";
import { useAuth } from "../auth/AuthContext";
import { ApiError, request } from "../lib/api";
import { usePageMeta } from "../lib/meta";
import { useInquiryCountSetter } from "./AdminLayout";
import { formatDate, formatTime, initials } from "./format";
import type { InquiryList, InquirySummary } from "./types";
import "./InboxPage.css";

export const POLL_INTERVAL_MS = 5_000;

function sortNewestFirst(items: InquirySummary[]): InquirySummary[] {
  return [...items].sort((a, b) => {
    const byDate =
      new Date(b.created_at).getTime() - new Date(a.created_at).getTime();
    return byDate !== 0 ? byDate : b.id - a.id;
  });
}

function MailGlyph() {
  return (
    <svg viewBox="0 0 20 20" fill="none" aria-hidden="true">
      <path
        d="M3 5.5A1.5 1.5 0 0 1 4.5 4h11A1.5 1.5 0 0 1 17 5.5v9a1.5 1.5 0 0 1-1.5 1.5h-11A1.5 1.5 0 0 1 3 14.5v-9Z"
        stroke="currentColor"
        strokeWidth="1.5"
      />
      <path
        d="m3.6 6 6.4 4.5L16.4 6"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

function ChevronGlyph() {
  return (
    <svg viewBox="0 0 20 20" fill="none" aria-hidden="true">
      <path
        d="M8 5l5 5-5 5"
        stroke="currentColor"
        strokeWidth="1.6"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

export default function InboxPage() {
  usePageMeta(
    "Posteingang – EquiCrew Intern",
    "Interner Posteingang von EquiCrew: alle Anfragen aus dem Kontaktformular, neueste zuerst.",
  );

  const { logout } = useAuth();
  const setInquiryCount = useInquiryCountSetter();
  const [items, setItems] = useState<InquirySummary[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const load = useCallback(
    async (mode: "initial" | "poll") => {
      if (mode === "initial") {
        setLoading(true);
      }

      try {
        const data = await request<InquiryList>("/api/inquiries");
        const sorted = sortNewestFirst(data.items);
        setItems(sorted);
        setError("");
        setInquiryCount?.(sorted.length);
      } catch (caught) {
        if (caught instanceof ApiError && caught.status === 401) {
          await logout();
          return;
        }
        setError(
          "Die Anfragen konnten nicht geladen werden. Bitte versuche es erneut.",
        );
      } finally {
        if (mode === "initial") {
          setLoading(false);
        }
      }
    },
    [logout, setInquiryCount],
  );

  useEffect(() => {
    void load("initial");
    const interval = window.setInterval(() => {
      void load("poll");
    }, POLL_INTERVAL_MS);

    return () => {
      window.clearInterval(interval);
    };
  }, [load]);

  const newCount = items.filter((item) => item.status === "new").length;

  return (
    <div className="intern-page">
      <header className="intern-page__header">
        <div>
          <Kicker>Anfragen</Kicker>
          <h1>Posteingang</h1>
        </div>
        <p className="intern-page__meta">
          <span>
            <strong>{items.length}</strong> Anfragen
          </span>
          <span className="intern-page__dot" aria-hidden="true" />
          <span>
            <strong>{newCount}</strong> neu
          </span>
        </p>
      </header>

      <section className="intern-panel" aria-labelledby="inbox-panel-title">
        <div className="intern-panel__head">
          <h2 className="intern-panel__title" id="inbox-panel-title">
            <MailGlyph />
            Alle Anfragen
          </h2>
          <span className="intern-panel__order">Neueste zuerst</span>
        </div>

        {loading ? (
          <p className="intern-panel__status" role="status">
            Anfragen werden geladen …
          </p>
        ) : null}

        {!loading && error && items.length === 0 ? (
          <div className="intern-panel__error">
            <Alert tone="error" title="Anfragen nicht verfügbar">
              <p>{error}</p>
            </Alert>
            <Button
              variant="secondary"
              onClick={() => void load("initial")}
            >
              Erneut versuchen
            </Button>
          </div>
        ) : null}

        {!loading && error && items.length > 0 ? (
          <div className="intern-panel__notice">
            <Alert tone="error" variant="inline">
              {error}
            </Alert>
          </div>
        ) : null}

        {!loading && !error && items.length === 0 ? (
          <EmptyState
            title="Noch keine Anfragen"
            description="Sobald jemand das Kontaktformular auf der Website ausfüllt, erscheint die Anfrage hier."
          />
        ) : null}

        {!loading && items.length > 0 ? (
          <div className="intern-table-scroll">
            <table className="intern-table">
              <thead>
                <tr>
                  <th scope="col">Name</th>
                  <th scope="col">E-Mail</th>
                  <th scope="col">Eingang</th>
                  <th scope="col">Nachricht</th>
                  <th scope="col">Status</th>
                  <th scope="col">
                    <span className="intern-sr-only">Aktion</span>
                  </th>
                </tr>
              </thead>
              <tbody>
                {items.map((item) => {
                  const name = `${item.first_name} ${item.last_name}`;
                  const detailPath = `/intern/anfragen/${item.id}`;
                  return (
                    <tr key={item.id}>
                      <td data-label="Name">
                        <div className="intern-person">
                          <Avatar
                            initials={initials(item.first_name, item.last_name)}
                            size="sm"
                          />
                          <Link className="intern-person__link" to={detailPath}>
                            {name}
                          </Link>
                        </div>
                      </td>
                      <td data-label="E-Mail">
                        <a
                          className="intern-cell-mail"
                          href={`mailto:${item.email}`}
                        >
                          {item.email}
                        </a>
                      </td>
                      <td data-label="Eingang">
                        <span className="intern-cell-date">
                          {formatDate(item.created_at)}
                          <br />
                          {formatTime(item.created_at)}
                        </span>
                      </td>
                      <td data-label="Nachricht">
                        <span className="intern-cell-excerpt">
                          {item.message_excerpt}
                        </span>
                      </td>
                      <td data-label="Status">
                        <StatusBadge status={item.status} />
                      </td>
                      <td data-label="Aktion">
                        <Link
                          className="intern-row-chevron"
                          to={detailPath}
                          aria-label={`Anfrage von ${name} öffnen`}
                        >
                          <ChevronGlyph />
                        </Link>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        ) : null}
      </section>
    </div>
  );
}
