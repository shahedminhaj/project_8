"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { FormEvent, useEffect, useMemo, useState } from "react";
import {
  ArrowRight,
  CalendarDays,
  Check,
  Heart,
  Leaf,
  LogOut,
  MapPin,
  Menu,
  Moon,
  Plus,
  Search,
  Sparkles,
  Sun,
  Users,
  X,
} from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Separator } from "@/components/ui/separator";
import { Skeleton } from "@/components/ui/skeleton";
import { Textarea } from "@/components/ui/textarea";

type EventItem = {
  id: string;
  title: string;
  description: string;
  category: string;
  location: string;
  date: string;
  time: string;
  image: string;
  creatorEmail: string;
  creatorName: string;
};

type User = { name: string; email: string; photo: string };
type SocialProvider = "google" | "github";
type AuthUser = { name: string; email: string; image?: string | null };
type SessionResponse = { user: AuthUser } | null;
type View =
  | "home"
  | "events"
  | "details"
  | "create"
  | "manage"
  | "joined"
  | "profile"
  | "login"
  | "register";

const photos = {
  hero: "https://images.unsplash.com/photo-1559027615-cd4628902d4a?auto=format&fit=crop&w=1400&q=85",
  cleanup: "https://images.unsplash.com/photo-1618477461853-cf6ed80faba5?auto=format&fit=crop&w=900&q=80",
  food: "https://images.unsplash.com/photo-1593113598332-cd288d649433?auto=format&fit=crop&w=900&q=80",
  garden: "https://images.unsplash.com/photo-1416879595882-3373a0480b5b?auto=format&fit=crop&w=900&q=80",
  community: "https://images.unsplash.com/photo-1531206715517-5c0ba140b2b8?auto=format&fit=crop&w=900&q=80",
  children: "https://images.unsplash.com/photo-1488521787991-ed7bbaae773c?auto=format&fit=crop&w=900&q=80",
  people: "https://images.unsplash.com/photo-1469571486292-0ba58a3f068b?auto=format&fit=crop&w=900&q=80",
};

const apiBaseUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost:4000";
let accessToken: string | null = null;
let accessTokenExpiresAt = 0;

async function refreshAccessToken(): Promise<void> {
  const response = await fetch(`${apiBaseUrl}/api/token`, {
    credentials: "include",
  });
  const payload = (await response.json()) as { token?: string; expiresIn?: number; message?: string };
  if (!response.ok || !payload.token || !payload.expiresIn) {
    throw new Error(payload.message || "Could not obtain an access token. Please sign in again.");
  }
  accessToken = payload.token;
  accessTokenExpiresAt = Date.now() + payload.expiresIn * 1000;
}

async function apiRequest<T>(path: string, options: RequestInit = {}): Promise<T> {
  if (
    accessToken &&
    accessTokenExpiresAt <= Date.now() + 30_000 &&
    path !== "/api/token" &&
    !path.startsWith("/api/auth/")
  ) {
    await refreshAccessToken();
  }

  const headers = new Headers(options.headers);
  if (!headers.has("Content-Type")) headers.set("Content-Type", "application/json");
  if (accessToken && !path.startsWith("/api/auth/")) {
    headers.set("Authorization", `Bearer ${accessToken}`);
  }
  const response = await fetch(`${apiBaseUrl}${path}`, {
    ...options,
    credentials: "include",
    headers,
  });
  const body = await response.text();
  const payload: unknown = body ? JSON.parse(body) : undefined;

  if (!response.ok) {
    const message =
      typeof payload === "object" &&
      payload !== null &&
      "message" in payload &&
      typeof payload.message === "string"
        ? payload.message
        : "The request could not be completed.";
    throw new Error(message);
  }

  return payload as T;
}

function toUser(user: AuthUser): User {
  return {
    name: user.name,
    email: user.email,
    photo:
      user.image ||
      `https://api.dicebear.com/7.x/initials/svg?seed=${encodeURIComponent(user.name || user.email)}`,
  };
}

function futureDate(days: number) {
  const date = new Date();
  date.setDate(date.getDate() + days);
  return date.toISOString().slice(0, 10);
}

function formatDate(value: string) {
  return new Date(`${value}T12:00:00`).toLocaleDateString("en-BD", {
    day: "numeric",
    month: "short",
    year: "numeric",
  });
}

function formatTime(value?: string) {
  if (!value) return "Time not set";
  const [hours, minutes] = value.split(":").map(Number);
  if (
    !Number.isInteger(hours) ||
    hours < 0 ||
    hours > 23 ||
    !Number.isInteger(minutes) ||
    minutes < 0 ||
    minutes > 59
  ) return "Time not set";
  return `${hours % 12 || 12}:${String(minutes).padStart(2, "0")} ${hours >= 12 ? "PM" : "AM"}`;
}

function Icon({
  name,
  size = 18,
}: {
  name: "arrow" | "calendar" | "pin" | "sun" | "moon" | "menu" | "close" | "spark" | "people" | "leaf" | "heart" | "check" | "plus" | "logout" | "search";
  size?: number;
}) {
  const icons = {
    arrow: ArrowRight,
    calendar: CalendarDays,
    pin: MapPin,
    sun: Sun,
    moon: Moon,
    menu: Menu,
    close: X,
    spark: Sparkles,
    people: Users,
    leaf: Leaf,
    heart: Heart,
    check: Check,
    plus: Plus,
    logout: LogOut,
    search: Search,
  };
  const IconComponent = icons[name];
  return <IconComponent size={size} strokeWidth={1.8} aria-hidden="true" />;
}

function pictureStyle(url: string) {
  return { backgroundImage: `url("${url}")` };
}

function EventCard({
  event,
  compact = false,
}: {
  event: EventItem;
  compact?: boolean;
}) {
  return (
    <Card className={`event-card${compact ? " event-card-compact" : ""}`}>
      <Link
        className="event-card-image"
        href={`/events/${event.id}`}
        style={pictureStyle(event.image)}
        aria-label={`View ${event.title}`}
      >
        <Badge variant="secondary" className="category-tag">{event.category}</Badge>
        <span className="image-arrow"><Icon name="arrow" size={16} /></span>
      </Link>
      <CardContent className="event-card-content">
        <div className="event-date"><Icon name="calendar" size={15} />{formatDate(event.date)} · {formatTime(event.time)}</div>
        <h3><Link href={`/events/${event.id}`}>{event.title}</Link></h3>
        <p className="event-location"><Icon name="pin" size={15} />{event.location}</p>
        {!compact && <p className="event-description">{event.description}</p>}
        <Link className="text-link" href={`/events/${event.id}`}>
          Explore event <Icon name="arrow" size={15} />
        </Link>
      </CardContent>
    </Card>
  );
}

function EventForm({
  initial,
  minDate,
  submitLabel,
  onSubmit,
  onCancel,
}: {
  initial?: EventItem;
  minDate: string;
  submitLabel: string;
  onSubmit: (data: Omit<EventItem, "id" | "creatorEmail" | "creatorName">) => void;
  onCancel?: () => void;
}) {
  const [error, setError] = useState("");

  function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const form = new FormData(event.currentTarget);
    const date = String(form.get("date") || "");
    const time = String(form.get("time") || "");
    if (!date || date <= new Date().toISOString().slice(0, 10)) {
      setError("Choose a date in the future so everyone has time to join.");
      return;
    }
    if (!/^([01]\d|2[0-3]):[0-5]\d$/.test(time)) {
      setError("Choose a valid event time.");
      return;
    }
    const thumbnail = String(form.get("image") || "").trim();
    if (thumbnail && !/^https?:\/\/.+/i.test(thumbnail)) {
      setError("Enter a complete image URL starting with http:// or https://.");
      return;
    }
    setError("");
    onSubmit({
      title: String(form.get("title") || "").trim(),
      description: String(form.get("description") || "").trim(),
      category: String(form.get("category") || ""),
      location: String(form.get("location") || "").trim(),
      date,
      time,
      image: thumbnail || photos.community,
    });
  }

  return (
    <form className="event-form" onSubmit={submit}>
      <div className="form-grid">
        <Label className="form-field form-span">
          Event name
          <Input name="title" required minLength={4} maxLength={80} defaultValue={initial?.title} placeholder="e.g. A greener neighborhood" />
        </Label>
        <Label className="form-field">
          Event type
          <Select name="category" defaultValue={initial?.category || ""}>
            <SelectTrigger className="form-select"><SelectValue placeholder="Choose a category" /></SelectTrigger>
            <SelectContent>
              <SelectItem value="Cleanup">Cleanup</SelectItem>
              <SelectItem value="Plantation">Plantation</SelectItem>
              <SelectItem value="Donation">Donation</SelectItem>
              <SelectItem value="Food drive">Food drive</SelectItem>
              <SelectItem value="Education">Education</SelectItem>
              <SelectItem value="Community">Community</SelectItem>
            </SelectContent>
          </Select>
        </Label>
        <Label className="form-field">
          Event date
          <Input name="date" type="date" required min={minDate} defaultValue={initial?.date} />
        </Label>
        <Label className="form-field">
          Event time
          <Input name="time" type="time" required defaultValue={initial?.time || ""} />
        </Label>
        <Label className="form-field form-span">
          Location
          <Input name="location" required minLength={3} maxLength={100} defaultValue={initial?.location} placeholder="Neighborhood, city" />
        </Label>
        <Label className="form-field form-span">
          Image URL <span className="optional-label">optional</span>
          <Input name="image" type="url" defaultValue={initial?.image} placeholder="https://your-image-link.com/photo.jpg" />
        </Label>
        <Label className="form-field form-span">
          A little about the event
          <Textarea name="description" required minLength={20} maxLength={800} rows={5} defaultValue={initial?.description} placeholder="What will you do together? Who can take part?" />
        </Label>
      </div>
      {error && <p className="form-error" role="alert">{error}</p>}
      <div className="form-actions">
        {onCancel && <Button variant="outline" className="button button-outline" type="button" onClick={onCancel}>Cancel</Button>}
        <Button type="submit" className="button button-primary">{submitLabel}<Icon name="arrow" size={16} /></Button>
      </div>
    </form>
  );
}

export function CommunityApp({ view, eventId }: { view: View; eventId?: string }) {
  const router = useRouter();
  const [events, setEvents] = useState<EventItem[]>([]);
  const [today, setToday] = useState("1970-01-01");
  const [minEventDate, setMinEventDate] = useState("1970-01-02");
  const [joined, setJoined] = useState<string[]>([]);
  const [user, setUser] = useState<User | null>(null);
  const [dark, setDark] = useState(false);
  const [ready, setReady] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const [notice, setNotice] = useState("");
  const [search, setSearch] = useState("");
  const [category, setCategory] = useState("All events");
  const [editing, setEditing] = useState<EventItem | null>(null);

  useEffect(() => {
    let active = true;
    async function loadAppData() {
      const storedTheme = localStorage.getItem("commonplace-theme");
      const date = new Date();
      setToday(date.toISOString().slice(0, 10));
      setMinEventDate(futureDate(1));
      if (storedTheme) setDark(storedTheme === "dark");

      try {
        const [loadedEvents, session] = await Promise.all([
          apiRequest<EventItem[]>("/api/events"),
          apiRequest<SessionResponse>("/api/auth/get-session"),
        ]);
        if (!active) return;
        setEvents(loadedEvents);
        const currentUser = session?.user ? toUser(session.user) : null;
        setUser(currentUser);
        if (currentUser) {
          await refreshAccessToken();
          setJoined(await apiRequest<string[]>("/api/events/joined"));
        }
      } catch (error) {
        if (active) {
          setNotice(error instanceof Error ? error.message : "Could not connect to the backend.");
        }
      } finally {
        if (active) setReady(true);
      }
    }

    void loadAppData();
    return () => {
      active = false;
    };
  }, []);

  useEffect(() => {
    document.documentElement.dataset.theme = dark ? "dark" : "light";
    document.documentElement.classList.toggle("dark", dark);
    if (ready) localStorage.setItem("commonplace-theme", dark ? "dark" : "light");
  }, [dark, ready]);

  useEffect(() => {
    if (notice) {
      const timer = window.setTimeout(() => setNotice(""), 3400);
      return () => window.clearTimeout(timer);
    }
  }, [notice]);

  const visibleEvents = useMemo(() => {
    return events
      .filter((event) => event.date >= today)
      .filter((event) => category === "All events" || event.category === category)
      .filter((event) => `${event.title} ${event.location} ${event.category}`.toLowerCase().includes(search.toLowerCase()))
      .sort((a, b) => a.date.localeCompare(b.date));
  }, [events, today, category, search]);
  const upcomingEvents = useMemo(
    () => events.filter((event) => event.date >= today),
    [events, today],
  );

  const activeEvent = events.find((event) => event.id === eventId);
  const ownEvents = events.filter((event) => event.creatorEmail === user?.email);
  const joinedEvents = events
    .filter((event) => joined.includes(event.id))
    .sort((a, b) => a.date.localeCompare(b.date));

  async function addEvent(data: Omit<EventItem, "id" | "creatorEmail" | "creatorName">) {
    if (!user) {
      router.push("/login");
      return;
    }
    try {
      const event = await apiRequest<EventItem>("/api/events", {
        method: "POST",
        body: JSON.stringify(data),
      });
      setEvents((current) => [event, ...current]);
      setNotice("Your event is on the calendar. Thanks for bringing people together!");
      router.push("/events");
    } catch (error) {
      setNotice(error instanceof Error ? error.message : "Could not create the event.");
    }
  }

  async function updateEvent(data: Omit<EventItem, "id" | "creatorEmail" | "creatorName">) {
    if (!editing || editing.creatorEmail !== user?.email) return;
    try {
      const updated = await apiRequest<EventItem>(`/api/events/${editing.id}`, {
        method: "PATCH",
        body: JSON.stringify(data),
      });
      setEvents((current) => current.map((event) => event.id === updated.id ? updated : event));
      setEditing(null);
      setNotice("Your event details have been updated.");
    } catch (error) {
      setNotice(error instanceof Error ? error.message : "Could not update the event.");
    }
  }

  async function deleteEvent(id: string) {
    const event = events.find((item) => item.id === id);
    if (!event || event.creatorEmail !== user?.email) return;
    if (!window.confirm(`Delete "${event.title}"? This cannot be undone.`)) return;
    try {
      await apiRequest<void>(`/api/events/${id}`, { method: "DELETE" });
      setEvents((current) => current.filter((item) => item.id !== id));
      setJoined((current) => current.filter((eventId) => eventId !== id));
      setNotice("Event removed from your list.");
    } catch (error) {
      setNotice(error instanceof Error ? error.message : "Could not remove the event.");
    }
  }

  async function joinEvent(id: string) {
    if (!user) {
      router.push("/login");
      return;
    }
    if (joined.includes(id)) {
      setNotice("You’re already on the list for this event.");
      return;
    }
    try {
      await apiRequest(`/api/events/${id}/join`, { method: "POST" });
      setJoined((current) => [...current, id]);
      setNotice("You’re in! We’ll see you there.");
    } catch (error) {
      setNotice(error instanceof Error ? error.message : "Could not join the event.");
    }
  }

  async function changeProfileName(name: string): Promise<boolean> {
    try {
      await apiRequest<void>("/api/auth/update-user", {
        method: "POST",
        body: JSON.stringify({ name }),
      });
      const session = await apiRequest<SessionResponse>("/api/auth/get-session");
      if (!session?.user) throw new Error("Could not load your updated profile. Please try again.");
      setUser(toUser(session.user));
      setNotice("Your name has been updated.");
      return true;
    } catch (error) {
      setNotice(error instanceof Error ? error.message : "Could not update your name.");
      return false;
    }
  }

  async function authenticate(event: FormEvent<HTMLFormElement>, registering: boolean) {
    event.preventDefault();
    const form = new FormData(event.currentTarget);
    const email = String(form.get("email") || "").trim().toLowerCase();
    const password = String(form.get("password") || "");
    const name = String(form.get("name") || "").trim();
    if (!email || password.length < 6) {
      setNotice("Please enter a valid email and a password with at least 6 characters.");
      return;
    }
    if (registering && (!/[A-Z]/.test(password) || !/[a-z]/.test(password))) {
      setNotice("Your password needs at least one uppercase and one lowercase letter.");
      return;
    }
    const path = registering ? "/api/auth/sign-up/email" : "/api/auth/sign-in/email";
    const credentials = registering
      ? {
          name,
          email,
          password,
          image: String(form.get("photo") || "").trim() || undefined,
        }
      : { email, password };

    try {
      const result = await apiRequest<{ user: AuthUser }>(path, {
        method: "POST",
        body: JSON.stringify(credentials),
      });
      await refreshAccessToken();
      setUser(toUser(result.user));
      setNotice(registering ? "Welcome to Commonplace. Your profile is ready!" : "Welcome back. Let’s do some good.");
      router.push("/events");
    } catch (error) {
      setNotice(error instanceof Error ? error.message : "Could not authenticate your account.");
    }
  }

  async function signInSocial(provider: SocialProvider) {
    try {
      const result = await apiRequest<{ url?: string }>("/api/auth/sign-in/social", {
        method: "POST",
        body: JSON.stringify({ provider, callbackURL: `${window.location.origin}/events` }),
      });
      if (!result.url) throw new Error(`The ${provider} sign-in provider did not return a URL.`);
      window.location.assign(result.url);
    } catch (error) {
      setNotice(error instanceof Error ? error.message : `Could not start ${provider} sign-in.`);
    }
  }

  async function logout() {
    try {
      await apiRequest<void>("/api/auth/sign-out", { method: "POST" });
      accessToken = null;
      accessTokenExpiresAt = 0;
      setUser(null);
      setJoined([]);
      setMenuOpen(false);
      setNotice("You’ve been signed out.");
      router.push("/");
    } catch (error) {
      setNotice(error instanceof Error ? error.message : "Could not sign out.");
    }
  }

  return (
    <div className="site-shell">
      <div className="announcement">
        <span className="announcement-dot" />
        Small acts. Stronger neighborhoods. <Link href="/events">Find your next good thing <Icon name="arrow" size={13} /></Link>
      </div>
      <header className="site-header">
        <div className="nav-wrap">
          <Link className="brand" href="/" aria-label="Commonplace home">
            <span className="brand-mark"><Icon name="leaf" size={20} /></span>
            <span>commonplace<span className="brand-period">.</span><small>GOOD THINGS GROW HERE</small></span>
          </Link>
          <Button variant="outline" size="icon" className="mobile-menu-toggle" aria-label={menuOpen ? "Close menu" : "Open menu"} onClick={() => setMenuOpen(!menuOpen)}>
            <Icon name={menuOpen ? "close" : "menu"} />
          </Button>
          <nav className={`main-nav${menuOpen ? " nav-open" : ""}`} aria-label="Main navigation">
            <Link className={view === "home" ? "nav-active" : ""} href="/" onClick={() => setMenuOpen(false)}>Home</Link>
            <Link className={view === "events" || view === "details" ? "nav-active" : ""} href="/events" onClick={() => setMenuOpen(false)}>Upcoming events</Link>
            {user && <Link className={view === "manage" ? "nav-active" : ""} href="/manage-events" onClick={() => setMenuOpen(false)}>Manage events</Link>}
            <Link className={view === "create" ? "nav-active" : ""} href={user ? "/create-event" : "/login?next=%2Fcreate-event"} onClick={() => setMenuOpen(false)}>Create event</Link>
            <Link href="/#what-we-do" onClick={() => setMenuOpen(false)}>What we do</Link>
          </nav>
          <div className="nav-actions">
            <Button variant="outline" size="icon" className="theme-toggle" onClick={() => setDark(!dark)} aria-label={`Switch to ${dark ? "light" : "dark"} theme`} title={`Switch to ${dark ? "light" : "dark"} theme`}>
              <Icon name={dark ? "sun" : "moon"} size={17} />
            </Button>
            {user ? (
              <div className="account-menu">
                <DropdownMenu>
                  <DropdownMenuTrigger className="avatar-trigger" aria-label={`Open menu for ${user.name}`} title={user.name}>
                    <Avatar className="avatar-button">
                      <AvatarImage src={user.photo} alt="" />
                      <AvatarFallback>{user.name.slice(0, 1).toUpperCase()}</AvatarFallback>
                    </Avatar>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end" className="account-dropdown">
                    <DropdownMenuGroup>
                      <DropdownMenuLabel className="account-dropdown-label">
                        <strong>{user.name}</strong><span>{user.email}</span>
                      </DropdownMenuLabel>
                    </DropdownMenuGroup>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem render={<Link href="/profile" />}>Profile</DropdownMenuItem>
                    <DropdownMenuItem render={<Link href="/create-event" />}>Create event</DropdownMenuItem>
                    <DropdownMenuItem render={<Link href="/manage-events" />}>Manage events</DropdownMenuItem>
                    <DropdownMenuItem render={<Link href="/joined-events" />}>Joined events</DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
                <Button variant="ghost" size="sm" className="logout-button" onClick={logout}>Log out <Icon name="logout" size={15} /></Button>
              </div>
            ) : <Button nativeButton={false} render={<Link href="/login" />} className="button button-small button-primary nav-login">Log in <Icon name="arrow" size={15} /></Button>}
          </div>
        </div>
      </header>

      <main>
        {view === "home" && <HomePage events={visibleEvents.slice(0, 6)} statisticsEvents={upcomingEvents} />}
        {view === "events" && <EventsPage events={visibleEvents} search={search} setSearch={setSearch} category={category} setCategory={setCategory} />}
        {view === "details" && <DetailsPage event={activeEvent} user={user} joined={joined.includes(eventId || "")} onJoin={() => eventId && joinEvent(eventId)} />}
        {view === "create" && <ProtectedPage user={user} ready={ready} title="Make something good happen." eyebrow="CREATE AN EVENT" description="You bring the idea. We’ll help you bring your neighbors together." loginHref="/create-event"><EventForm minDate={minEventDate} submitLabel="Publish your event" onSubmit={addEvent} /></ProtectedPage>}
        {view === "manage" && <ProtectedPage user={user} ready={ready} title="Your events, all together." eyebrow="MANAGE EVENTS" description="Keep your plans current and your community in the loop." loginHref="/manage-events">
          {ownEvents.length ? <div className="manage-list">{ownEvents.map((event) => <Card className="manage-item" key={event.id}>
            <div className="manage-thumb" style={pictureStyle(event.image)} />
            <div className="manage-info"><span>{event.category} · {formatDate(event.date)} · {formatTime(event.time)}</span><h3>{event.title}</h3><p><Icon name="pin" size={14} />{event.location}</p></div>
            <div className="manage-actions"><Button variant="outline" className="button button-outline button-small" onClick={() => setEditing(event)}>Edit date &amp; time</Button><Button variant="destructive" className="button button-delete button-small" onClick={() => deleteEvent(event.id)}>Delete</Button></div>
          </Card>)}</div> : <EmptyState title="Your calendar is still open." detail="Create an event and invite your neighbors to make a difference together." action="Create an event" href="/create-event" />}
          <Dialog open={Boolean(editing)} onOpenChange={(open) => { if (!open) setEditing(null); }}>
            <DialogContent className="edit-modal" showCloseButton={false}>
              <DialogHeader className="modal-heading">
                <div><span className="eyebrow">EDIT YOUR EVENT</span><DialogTitle className="modal-title">A few little updates?</DialogTitle><DialogDescription>Update the event details and keep neighbors in the loop.</DialogDescription></div>
                <Button variant="ghost" size="icon" className="icon-button" aria-label="Close editor" onClick={() => setEditing(null)}><Icon name="close" /></Button>
              </DialogHeader>
              {editing && <EventForm initial={editing} minDate={minEventDate} submitLabel="Save changes" onSubmit={updateEvent} onCancel={() => setEditing(null)} />}
            </DialogContent>
          </Dialog>
        </ProtectedPage>}
        {view === "joined" && <ProtectedPage user={user} ready={ready} title="Good things you’re part of." eyebrow="JOINED EVENTS" description="Your next small act of good is right around the corner." loginHref="/joined-events">
          {joinedEvents.length ? <div className="event-grid">{joinedEvents.map((event) => <EventCard key={event.id} event={event} />)}</div> : <EmptyState title="Your next good thing is out there." detail="Find a local event that feels right and we’ll save it here for you." action="Explore events" href="/events" />}
        </ProtectedPage>}
        {view === "profile" && <ProtectedPage user={user} ready={ready} title="Your neighborhood profile." eyebrow="YOUR PROFILE" description="Your Commonplace account, all in one place." loginHref="/profile">
          {user && <ProfilePage user={user} createdEvents={ownEvents.length} joinedEvents={joinedEvents.length} onSaveName={changeProfileName} />}
        </ProtectedPage>}
        {view === "login" && <AuthPage registering={false} onSubmit={(event) => void authenticate(event, false)} onSocial={signInSocial} />}
        {view === "register" && <AuthPage registering onSubmit={(event) => void authenticate(event, true)} onSocial={signInSocial} />}
      </main>

      {view !== "login" && view !== "register" && <Footer />}
      {notice && <div className="toast-message" role="status"><span><Icon name="check" size={17} /></span>{notice}<button onClick={() => setNotice("")} aria-label="Dismiss message"><Icon name="close" size={15} /></button></div>}
    </div>
  );
}

function HomePage({ events, statisticsEvents }: { events: EventItem[]; statisticsEvents: EventItem[] }) {
  const eventTypes = new Set(statisticsEvents.map((event) => event.category)).size;
  const eventLocations = new Set(statisticsEvents.map((event) => event.location)).size;

  return <>
    <section className="hero-section page-width">
      <div className="hero-copy">
        <span className="eyebrow"><span className="eyebrow-line" /> A LITTLE GOOD GOES A LONG WAY</span>
        <h1>Good things grow<br />when we <em>show up.</em></h1>
        <p className="hero-description">Find your people. Lend a hand. Make your corner of the world a little brighter—one local event at a time.</p>
        <div className="hero-actions"><Button nativeButton={false} render={<Link href="/events" />} className="button button-primary button-large">Find your next good thing <Icon name="arrow" size={17} /></Button><Button nativeButton={false} variant="ghost" render={<Link href="/create-event" />} className="button button-text">Start something local <span>↗</span></Button></div>
        <div className="hero-proof"><div className="avatar-stack"><span>R</span><span>M</span><span>S</span><span>+2k</span></div><p><strong>Good looks good on us.</strong><br />Join neighbors making a difference.</p></div>
      </div>
      <div className="hero-visual">
        <div className="hero-image" style={pictureStyle(photos.hero)} role="img" aria-label="Neighbors volunteering together outdoors" />
        <div className="hero-image-note"><span className="note-icon"><Icon name="heart" size={18} /></span><span><strong>Better, together.</strong><small>Good people. Good things.</small></span></div>
        <div className="hero-number">01<span> / FIND YOUR PEOPLE</span></div>
        <span className="hero-sunburst" aria-hidden="true">✳</span>
      </div>
      <div className="hero-bottom-note"><span>SCROLL A LITTLE</span><span className="scroll-line" /></div>
    </section>

    <section className="impact-strip">
      <div className="page-width impact-inner">
        <p>THE NEIGHBORHOOD<br />AT A GLANCE</p>
        <div><strong>{statisticsEvents.length}</strong><span>upcoming events</span></div>
        <div><strong>{eventTypes}</strong><span>ways to pitch in</span></div>
        <div><strong>{eventLocations}</strong><span>places to show up</span></div>
      </div>
    </section>

    <section className="section-block page-width" id="our-way">
      <div className="section-heading"><div><span className="eyebrow"><span className="eyebrow-line" /> THE NEIGHBORHOOD CALENDAR</span><h2>Make room for <em>good.</em></h2></div><Link className="text-link" href="/events">See all events <Icon name="arrow" size={16} /></Link></div>
      {events.length ? <div className="event-grid">{events.map((event) => <EventCard key={event.id} event={event} />)}</div> : <EmptyState title="New events are just around the corner." detail="Check back soon or start something good in your neighborhood." action="Create an event" href="/create-event" />}
      <div className="home-more"><span>FIND A WAY TO PITCH IN THAT FEELS LIKE YOU.</span><Button nativeButton={false} variant="outline" render={<Link href="/events" />} className="button button-outline">Explore all upcoming events <Icon name="arrow" size={16} /></Button></div>
    </section>

    <section className="how-section" id="what-we-do">
      <div className="page-width how-inner">
        <div className="how-copy"><span className="eyebrow eyebrow-light"><span className="eyebrow-line" /> GOOD IS CLOSER THAN YOU THINK</span><h2>It starts with<br /><em>showing up.</em></h2><p>No big speeches. No perfect plans. Just neighbors, finding the time to do a little good together.</p><Button nativeButton={false} variant="secondary" render={<Link href="/events" />} className="button button-light">See what’s happening <Icon name="arrow" size={16} /></Button></div>
        <div className="steps-list">
          <div className="step-item"><span>01</span><div><h3>Find your kind of good</h3><p>Browse local cleanups, food drives, planting days, and more.</p></div><Icon name="spark" size={20} /></div>
          <div className="step-item"><span>02</span><div><h3>Bring a neighbor along</h3><p>Join an event, invite a friend, and meet the people next door.</p></div><Icon name="people" size={20} /></div>
          <div className="step-item"><span>03</span><div><h3>Make it a regular thing</h3><p>One hour can make someone’s whole week. Yours, too.</p></div><Icon name="heart" size={20} /></div>
        </div>
      </div>
    </section>

    <section className="section-block page-width gallery-section">
      <div className="section-heading"><div><span className="eyebrow"><span className="eyebrow-line" /> LITTLE MOMENTS, BIG MEANING</span><h2>Look what we can <em>do.</em></h2></div><p className="heading-note">A few snapshots from neighbors<br />making their neighborhood theirs.</p></div>
      <div className="gallery-grid"><div className="gallery-photo gallery-large" style={pictureStyle(photos.community)} /><div className="gallery-photo" style={pictureStyle(photos.garden)} /><div className="gallery-quote"><span>“</span><p>The best thing about doing good? Finding out how many people wanted to do it with you.</p><small>— A neighbor in Dhaka</small></div><div className="gallery-photo" style={pictureStyle(photos.children)} /></div>
    </section>

  </>;
}

function EventsPage({
  events, search, setSearch, category, setCategory,
}: {
  events: EventItem[];
  search: string;
  setSearch: (value: string) => void;
  category: string;
  setCategory: (value: string) => void;
}) {
  const categories = ["All events", "Cleanup", "Plantation", "Donation", "Food drive", "Education", "Community"];
  return <section className="interior-page page-width">
    <div className="interior-intro"><span className="eyebrow"><span className="eyebrow-line" /> THE NEIGHBORHOOD CALENDAR</span><h1>Find your next<br /><em>good thing.</em></h1><p>Small ways to show up for the people and places around you. There’s room for everyone.</p><div className="intro-flourish">✳ <span>GOOD IS BETTER<br />WHEN IT’S SHARED</span></div></div>
    <div className="event-toolbar"><div className="event-count">{events.length} upcoming {events.length === 1 ? "event" : "events"} <span>·</span> Dhaka & nearby</div><div className="event-controls"><label className="search-field"><Icon name="search" size={17} /><Input className="search-input" value={search} onChange={(event) => setSearch(event.target.value)} placeholder="Search events" aria-label="Search events" /></label><label className="sr-only" htmlFor="event-category">Filter by event type</label><Select value={category} onValueChange={(value) => { if (value) setCategory(value); }}><SelectTrigger id="event-category" className="filter-select"><SelectValue /></SelectTrigger><SelectContent>{categories.map((item) => <SelectItem key={item} value={item}>{item}</SelectItem>)}</SelectContent></Select></div></div>
    {events.length ? <div className="event-grid">{events.map((event) => <EventCard key={event.id} event={event} />)}</div> : <EmptyState title="Nothing on the calendar just yet." detail="Try another search, or be the first to organize something good." action="Create an event" href="/create-event" />}
    <div className="create-callout"><span className="callout-icon"><Icon name="spark" size={20} /></span><div><strong>Have an idea for your neighborhood?</strong><span>There’s no better time to bring it to life.</span></div><Link className="button button-primary" href="/create-event">Create an event <Icon name="arrow" size={16} /></Link></div>
  </section>;
}

function DetailsPage({ event, user, joined, onJoin }: { event?: EventItem; user: User | null; joined: boolean; onJoin: () => void }) {
  if (!event) return <section className="interior-page page-width"><EmptyState title="We can’t find that event." detail="It may have moved or been taken off the calendar." action="See all events" href="/events" /></section>;
  return <section className="interior-page page-width detail-page">
    <Link className="back-link" href="/events">← Back to upcoming events</Link>
    <div className="detail-layout"><div><div className="detail-image" style={pictureStyle(event.image)}><Badge variant="secondary" className="category-tag">{event.category}</Badge></div><div className="detail-story"><span className="eyebrow"><span className="eyebrow-line" /> A NEIGHBORHOOD EVENT</span><h1>{event.title}</h1><p>{event.description}</p><p className="detail-host">Organized by <strong>{event.creatorName}</strong></p></div></div>
      <aside className="detail-sidebar"><span className="eyebrow">SAVE YOUR SPOT</span><h2>Let’s make it<br /><em>happen.</em></h2><div className="detail-fact"><span><Icon name="calendar" size={17} /></span><div><small>WHEN</small><strong>{formatDate(event.date)} · {formatTime(event.time)}</strong></div></div><div className="detail-fact"><span><Icon name="pin" size={17} /></span><div><small>WHERE</small><strong>{event.location}</strong></div></div><Button className="button button-primary button-large join-button" onClick={onJoin}>{joined ? <>You’re on the list <Icon name="check" size={17} /></> : <>Count me in <Icon name="arrow" size={17} /></>}</Button>{!user && <p className="join-hint">You’ll need to <Link href="/login">log in</Link> to join.</p>}<div className="sidebar-note"><Icon name="heart" size={17} /><span>Every person who shows up makes a difference.</span></div></aside>
    </div>
  </section>;
}

function ProtectedPage({
  user, ready, title, eyebrow, description, loginHref, children,
}: {
  user: User | null;
  ready: boolean;
  title: string;
  eyebrow: string;
  description: string;
  loginHref: string;
  children: React.ReactNode;
}) {
  if (!ready) return <section className="interior-page page-width"><Skeleton className="loading-skeleton" /><Skeleton className="loading-skeleton loading-short" /></section>;
  if (!user) return <section className="interior-page page-width"><Card className="protected-message"><span className="eyebrow">{eyebrow}</span><h1>This one’s for<br /><em>neighbors.</em></h1><p>Log in to keep your community plans close and your next good thing on track.</p><Button nativeButton={false} render={<Link href={`/login?next=${encodeURIComponent(loginHref)}`} />} className="button button-primary">Log in to continue <Icon name="arrow" size={16} /></Button></Card></section>;
  return <section className="interior-page page-width workspace-page"><div className="workspace-heading"><div><span className="eyebrow"><span className="eyebrow-line" /> {eyebrow}</span><h1>{title}</h1><p>{description}</p></div>{eyebrow !== "CREATE AN EVENT" && <Button nativeButton={false} render={<Link href="/create-event" />} className="button button-primary"><Icon name="plus" size={17} /> Create an event</Button>}</div><div className="workspace-content">{children}</div></section>;
}

function EmptyState({ title, detail, action, href }: { title: string; detail: string; action: string; href: string }) {
  return <Card className="empty-state"><span><Icon name="leaf" size={25} /></span><h2>{title}</h2><p>{detail}</p><Button nativeButton={false} render={<Link href={href} />} className="button button-primary">{action}<Icon name="arrow" size={16} /></Button></Card>;
}

function ProfilePage({
  user,
  createdEvents,
  joinedEvents,
  onSaveName,
}: {
  user: User;
  createdEvents: number;
  joinedEvents: number;
  onSaveName: (name: string) => Promise<boolean>;
}) {
  const [editingName, setEditingName] = useState(false);
  const [savingName, setSavingName] = useState(false);

  async function submitName(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const formData = new FormData(event.currentTarget);
    const name = String(formData.get("name") || "").trim();
    if (name.length < 2) return;

    setSavingName(true);
    const saved = await onSaveName(name);
    setSavingName(false);
    if (saved) setEditingName(false);
  }

  return <Card className="profile-card">
    <CardContent className="profile-card-content">
      <Avatar className="profile-avatar">
        <AvatarImage src={user.photo} alt="" />
        <AvatarFallback>{user.name.slice(0, 1).toUpperCase()}</AvatarFallback>
      </Avatar>
      <div className="profile-details">
        <span className="eyebrow">ACCOUNT DETAILS</span>
        {editingName ? (
          <form className="profile-name-form" onSubmit={(event) => void submitName(event)}>
            <Label className="form-field">
              Name
              <Input name="name" required minLength={2} maxLength={60} defaultValue={user.name} autoFocus />
            </Label>
            <div className="profile-name-actions">
              <Button variant="outline" className="button button-outline" type="button" onClick={() => setEditingName(false)} disabled={savingName}>Cancel</Button>
              <Button className="button button-primary" type="submit" disabled={savingName}>{savingName ? "Saving..." : "Save name"}</Button>
            </div>
          </form>
        ) : (
          <div className="profile-name">
            <div><span className="profile-field-label">Name</span><h2>{user.name}</h2></div>
            <Button variant="outline" className="button button-outline profile-change-name" type="button" onClick={() => setEditingName(true)}>Change name</Button>
          </div>
        )}
        <p>{user.email}</p>
        <div className="profile-stats">
          <div><strong>{createdEvents}</strong><span>events created</span></div>
          <div><strong>{joinedEvents}</strong><span>events joined</span></div>
        </div>
      </div>
    </CardContent>
  </Card>;
}

function AuthPage({ registering, onSubmit, onSocial }: { registering: boolean; onSubmit: (event: FormEvent<HTMLFormElement>) => void; onSocial: (provider: SocialProvider) => void }) {
  return <section className="auth-page">
    <div className="auth-visual" style={pictureStyle(photos.people)}><div className="auth-visual-caption"><span className="eyebrow eyebrow-light">GOOD THINGS GROW HERE</span><h2>There’s a place<br />for you <em>here.</em></h2><p>Come as you are. Leave a little good behind.</p></div><div className="auth-caption-mark">✳</div></div>
    <div className="auth-panel"><Card className="auth-card"><CardContent className="auth-card-content"><span className="eyebrow"><span className="eyebrow-line" /> {registering ? "COME ON IN" : "GOOD TO SEE YOU"}</span><h1>{registering ? <>Let’s get<br /><em>to know you.</em></> : <>Welcome<br /><em>back.</em></>}</h1><p>{registering ? "Make a little room for good things in your neighborhood." : "Your next good thing is right where you left it."}</p>
      <form className="auth-form" onSubmit={onSubmit}>
        {registering && <Label className="form-field">Your name<Input name="name" required minLength={2} maxLength={60} placeholder="What should we call you?" /></Label>}
        <Label className="form-field">Email address<Input name="email" type="email" required autoComplete="email" placeholder="you@example.com" /></Label>
        {registering && <Label className="form-field">Profile photo URL <span className="optional-label">optional</span><Input name="photo" type="url" placeholder="https://your-photo-link.com" /></Label>}
        <Label className="form-field">Password<Input name="password" type="password" required minLength={6} autoComplete={registering ? "new-password" : "current-password"} placeholder="At least 6 characters" />{registering && <small className="field-hint">Include an uppercase and a lowercase letter.</small>}</Label>
        <Button className="button button-primary button-large auth-submit" type="submit">{registering ? "Create your account" : "Log in"}<Icon name="arrow" size={17} /></Button>
      </form>
      {!registering && <>
        <div className="auth-divider"><Separator /><span>OR</span><Separator /></div>
        <div className="social-buttons">
          <Button variant="outline" className="button button-outline social-button" type="button" onClick={() => onSocial("google")}><span className="google-mark">G</span> Continue with Google</Button>
          <Button variant="outline" className="button button-outline social-button" type="button" onClick={() => onSocial("github")}><span className="github-mark">GH</span> Continue with GitHub</Button>
        </div>
      </>}
      <div className="auth-switch">{registering ? <>Already one of us? <Link href="/login">Log in</Link></> : <>New around here? <Link href="/register">Create an account</Link></>}</div>
      <div className="auth-demo-note"><Icon name="spark" size={15} /> Your account is secured by Commonplace.</div>
    </CardContent></Card></div>
  </section>;
}

function Footer() {
  const [subscribed, setSubscribed] = useState(false);

  return <>
    <footer className="site-footer"><div className="page-width">
      <section className="footer-subscribe" aria-labelledby="footer-subscribe-title">
        <div>
          <span className="footer-subscribe-eyebrow">A LITTLE GOOD IN YOUR INBOX</span>
          <h2 id="footer-subscribe-title">Stay in the neighborhood.</h2>
          <p>Get a note when good things are happening nearby.</p>
        </div>
        {subscribed ? (
          <p className="footer-subscribe-success" role="status">
            <Icon name="check" size={17} /> Thanks for subscribing! You’ll be notified about good things happening nearby.
          </p>
        ) : (
          <form
            className="footer-subscribe-form"
            onSubmit={(event) => {
              event.preventDefault();
              setSubscribed(true);
            }}
          >
            <label htmlFor="footer-subscribe-email">Email address</label>
            <div className="footer-subscribe-controls">
              <Input id="footer-subscribe-email" name="email" type="email" required autoComplete="email" placeholder="you@example.com" />
              <Button className="button button-primary" type="submit">Subscribe <Icon name="arrow" size={15} /></Button>
            </div>
          </form>
        )}
      </section>
      <div className="footer-main"><div className="footer-brand"><Link className="brand brand-footer" href="/"><span className="brand-mark"><Icon name="leaf" size={20} /></span><span>commonplace<span className="brand-period">.</span><small>GOOD THINGS GROW HERE</small></span></Link><p>Making it easier to show up<br />for the places we call home.</p></div><div className="footer-links"><div><span>FIND YOUR GOOD</span><Link href="/events">Upcoming events</Link><Link href="/create-event">Create an event</Link><Link href="/joined-events">Joined events</Link></div><div><span>THE NEIGHBORHOOD</span><a href="mailto:hello@commonplace.community">Say hello</a><a href="https://x.com" target="_blank" rel="noreferrer">Follow along on X ↗</a></div></div><div className="footer-sticker"><span>✳</span><p>Be the reason<br />someone smiles<br />this week.</p></div></div>
      <div className="footer-bottom"><span>© Commonplace. Made for the good of it.</span><span>GOOD IS CLOSER THAN YOU THINK.</span><Link href="/">Back to top ↑</Link></div>
    </div></footer>
  </>;
}
