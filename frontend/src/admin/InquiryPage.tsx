import { useCallback, useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";
import Alert from "../components/Alert";
import Avatar from "../components/Avatar";
import Button from "../components/Button";
import Card from "../components/Card";
import EmptyState from "../components/EmptyState";
import StatusBadge from "../components/StatusBadge";
import { useAuth } from "../auth/AuthContext";
import { ApiError, request } from "../lib/api";
import { usePageMeta } from "../lib/meta";
import { formatDateTime, initials } from "./format";
import type { InquiryDetail, InquiryStatus } from "./types";
import "./InquiryPage.css";

const STATUS_LABELS: Record<InquiryStatus, string> = {
  new: "Neu",
  read: "Gelesen",
  done: "Erledigt",
};

const STATUS_NOTES: Record<InquiryStatus, string> = {
  new: "Neue Anfrage. Markiere sie nach der Bearbeitung als gelesen oder erledigt.",
  read: "Diese Anfrage ist als gelesen markiert.",
  done: "Diese Anfrage ist erledigt. Der Status bleibt in der Liste sichtbar.",
};

type LoadState = "loading" | "ready" | "not-found" | "error";

function CheckGlyph() {
  return (
    <svg viewBox="0 0 20 20" fill="none" aria-hidden="true">
      <path
        d="M4 10.5l3.6 3.5L16 5.8"
        stroke="currentColor"
        strokeWidth="1.8"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

export default function InquiryPage() {
  const { id } = useParams<{ id: string }>();
  const parsedId = Number(id);
  const inquiryId =
    Number.isInteger(parsedId) && parsedId > 0 ? parsedId : null;

  const { logout } = useAuth();
  const [inquiry, setInquiry] = useState<InquiryDetail | null>(null);
  const [state, setState] = useState<LoadState>("loading");
  const [updating, setUpdating] = useState<InquiryStatus | null>(null);
  const [statusMessage, setStatusMessage] = useState("");
  const [statusError, setStatusError] = useState("");

  const fullName = inquiry
    ? `${inquiry.first_name} ${inquiry.last_name}`
    : null;

  usePageMeta(
    fullName ? `Anfrage von ${fullName} – EquiCrew Intern` : "Anfrage – EquiCrew Intern",
    "Detailansicht einer Anfrage im internen Bereich von EquiCrew.",
  );

  const load = useCallback(async () => {
    if (inquiryId === null) {
      setState("not-found");
      return;
    }

    setState("loading");
    try {
      const data = await request<InquiryDetail>(`/api/inquiries/${inquiryId}`);
      setInquiry(data);
      setState("ready");
    } catch (caught) {
      if (caught instanceof ApiError && caught.status === 401) {
        await logout();
        return;
      }
      if (caught instanceof ApiError && caught.status === 404) {
        setInquiry(null);
        setState("not-found");
        return;
      }
      setState("error");
    }
  }, [inquiryId, logout]);

  useEffect(() => {
    void load();
  }, [load]);

  async function changeStatus(next: InquiryStatus): Promise<void> {
    if (inquiryId === null) {
      return;
    }

    setUpdating(next);
    setStatusError("");

    try {
      const updated = await request<InquiryDetail>(
        `/api/inquiries/${inquiryId}`,
        {
          method: "PATCH",
          body: JSON.stringify({ status: next }),
        },
      );
      setInquiry(updated);
      setStatusMessage(`Status auf „${STATUS_LABELS[next]}“ gesetzt.`);
    } catch (caught) {
      if (caught instanceof ApiError && caught.status === 401) {
        await logout();
        return;
      }
      setStatusError(
        "Der Status konnte nicht geändert werden. Bitte versuche es erneut.",
      );
    } finally {
      setUpdating(null);
    }
  }

  return (
    <div className="intern-detail">
      <div className="intern-detail__topline">
        <Link to="/intern">← Zurück zum Posteingang</Link>
      </div>

      {state === "loading" ? (
        <p className="intern-detail__status" role="status">
          Anfrage wird geladen …
        </p>
      ) : null}

      {state === "not-found" ? (
        <Card variant="panel" className="intern-missing">
          <EmptyState
            title="Diese Anfrage gibt es nicht."
            description="Vielleicht wurde sie entfernt oder der Link ist unvollständig. Im Posteingang findest du alle eingegangenen Anfragen."
            action={
              <Button to="/intern" variant="primary">
                Zum Posteingang
              </Button>
            }
          />
        </Card>
      ) : null}

      {state === "error" ? (
        <Card variant="panel" className="intern-detail__error">
          <Alert tone="error" title="Anfrage nicht verfügbar">
            <p>
              Die Anfrage konnte nicht geladen werden. Bitte versuche es
              erneut.
            </p>
          </Alert>
          <div className="intern-detail__error-actions">
            <Button
              variant="secondary"
              onClick={() => void load()}
            >
              Erneut versuchen
            </Button>
            <Button to="/intern" variant="ghost">
              Zum Posteingang
            </Button>
          </div>
        </Card>
      ) : null}

      {state === "ready" && inquiry ? (
        <>
          <header>
            <div className="intern-detail__head">
              <h1>{fullName}</h1>
              <StatusBadge status={inquiry.status} />
            </div>
            <p className="intern-detail__sub">
              <span>Eingegangen am {formatDateTime(inquiry.created_at)}</span>
              <span aria-hidden="true">·</span>
              <span>Anfrage #{inquiry.id}</span>
            </p>
          </header>

          <div className="intern-detail__layout">
            <Card as="article" variant="message" className="intern-message">
              <h2 className="intern-sr-only" id="message-heading">
                Nachricht
              </h2>
              <p className="intern-message__meta">
                Nachricht über das Kontaktformular
              </p>
              <p className="intern-message__body">{inquiry.message}</p>
              <div className="intern-sender">
                <Avatar
                  initials={initials(inquiry.first_name, inquiry.last_name)}
                />
                <div>
                  <p className="intern-sender__name">{fullName}</p>
                  <a
                    className="intern-sender__mail"
                    href={`mailto:${inquiry.email}`}
                  >
                    {inquiry.email}
                  </a>
                </div>
              </div>
            </Card>

            <aside
              className="intern-detail__side"
              aria-label="Anfrage verwalten"
            >
              <Card as="section" variant="side" aria-labelledby="status-heading">
                <h2 className="intern-side-title" id="status-heading">
                  Status
                </h2>
                <div className="intern-status-actions">
                  {inquiry.status === "new" ? (
                    <Button
                      variant="secondary"
                      size="sm"
                      icon={<CheckGlyph />}
                      iconPosition="start"
                      onClick={() => void changeStatus("read")}
                      disabled={updating !== null}
                      loading={updating === "read"}
                      loadingLabel="Wird gespeichert …"
                    >
                      Als gelesen markieren
                    </Button>
                  ) : null}
                  {inquiry.status === "new" || inquiry.status === "read" ? (
                    <Button
                      variant="primary"
                      size="sm"
                      icon={<CheckGlyph />}
                      iconPosition="start"
                      onClick={() => void changeStatus("done")}
                      disabled={updating !== null}
                      loading={updating === "done"}
                      loadingLabel="Wird gespeichert …"
                    >
                      Als erledigt markieren
                    </Button>
                  ) : null}
                </div>
                <p className="intern-status-note">
                  {STATUS_NOTES[inquiry.status]}
                </p>
                {statusError ? (
                  <Alert tone="error" variant="inline">
                    {statusError}
                  </Alert>
                ) : null}
                <p
                  className="intern-status-message"
                  role="status"
                  aria-live="polite"
                >
                  {statusMessage}
                </p>
              </Card>

              <Card as="section" variant="side" aria-labelledby="details-heading">
                <h2 className="intern-side-title" id="details-heading">
                  Angaben
                </h2>
                <dl className="intern-meta-list">
                  <div>
                    <dt>Vorname</dt>
                    <dd>{inquiry.first_name}</dd>
                  </div>
                  <div>
                    <dt>Nachname</dt>
                    <dd>{inquiry.last_name}</dd>
                  </div>
                  <div>
                    <dt>E-Mail</dt>
                    <dd>
                      <a href={`mailto:${inquiry.email}`}>{inquiry.email}</a>
                    </dd>
                  </div>
                  <div>
                    <dt>Eingegangen</dt>
                    <dd>{formatDateTime(inquiry.created_at)}</dd>
                  </div>
                  <div>
                    <dt>Anfrage-ID</dt>
                    <dd>#{inquiry.id}</dd>
                  </div>
                  <div>
                    <dt>Quelle</dt>
                    <dd>Kontaktformular der Website</dd>
                  </div>
                </dl>
              </Card>
            </aside>
          </div>
        </>
      ) : null}
    </div>
  );
}
