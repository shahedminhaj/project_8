"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { FormEvent, useEffect, useMemo, useState } from "react";

type EventItem = {
  id: string;
  title: string;
  description: string;
  category: string;
  location: string;
  date: string;
  image: string;
  creatorEmail: string;
  creatorName: string;
};

type User = { name: string; email: string; photo: string };
type View =
  | "home"
  | "events"
  | "details"
  | "create"
  | "manage"
  | "joined"
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

const initialEvents: EventItem[] = [
  {
    id: "warm-hands",
    title: "Warm Hands, Warm Hearts",
    description:
      "Help us sort and share winter essentials with families who need a little extra warmth this season. Every donated coat and every helping hand makes a difference.",
    category: "Donation",
    location: "Mirpur 10, Dhaka",
    date: "2027-01-03",
    image: photos.food,
    creatorEmail: "hello@commonplace.community",
    creatorName: "Commonplace team",
  },
  {
    id: "green-streets",
    title: "A Greener Gulshan",
    description:
      "Spend a morning planting native trees and making our shared streets greener. Tools, seedlings, and a cup of tea are on us.",
    category: "Plantation",
    location: "Gulshan Lake Park, Dhaka",
    date: "2027-01-05",
    image: photos.garden,
    creatorEmail: "hello@commonplace.community",
    creatorName: "Commonplace team",
  },
  {
    id: "clean-canal",
    title: "Little Steps, Cleaner Canal",
    description:
      "Join neighbors for a hands-on cleanup along the canal. We will provide gloves, bags, and a short safety briefing before we get started.",
    category: "Cleanup",
    location: "Dhanmondi Lake, Dhaka",
    date: "2027-01-08",
    image: photos.cleanup,
    creatorEmail: "hello@commonplace.community",
    creatorName: "Commonplace team",
  },
  {
    id: "shared-table",
    title: "The Shared Table",
    description:
      "Cook, pack, and deliver nourishing meal boxes with a friendly crew. Bring your energy; we will take care of the ingredients.",
    category: "Food drive",
    location: "Mohammadpur, Dhaka",
    date: "2027-01-11",
    image: photos.people,
    creatorEmail: "hello@commonplace.community",
    creatorName: "Commonplace team",
  },
  {
    id: "reading-circle",
    title: "Stories for Every Saturday",
    description:
      "Share the joy of reading with local children through games, stories, and a book to take home. No teaching experience needed.",
    category: "Education",
    location: "Lalmatia, Dhaka",
    date: "2027-01-14",
    image: photos.children,
    creatorEmail: "hello@commonplace.community",
    creatorName: "Commonplace team",
  },
  {
    id: "neighbors-day",
    title: "A Day for Neighbors",
    description:
      "Meet the people who make our neighborhood feel like home. Lend a hand at our community day with activities for every age.",
    category: "Community",
    location: "Banani, Dhaka",
    date: "2027-01-17",
    image: photos.community,
    creatorEmail: "hello@commonplace.community",
    creatorName: "Commonplace team",
  },
];

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

function Icon({
  name,
  size = 18,
}: {
  name: "arrow" | "calendar" | "pin" | "sun" | "moon" | "menu" | "close" | "spark" | "people" | "leaf" | "heart" | "check" | "plus" | "logout" | "search";
  size?: number;
}) {
  const shared = {
    width: size,
    height: size,
    viewBox: "0 0 24 24",
    fill: "none",
    stroke: "currentColor",
    strokeWidth: 1.8,
    strokeLinecap: "round" as const,
    strokeLinejoin: "round" as const,
    "aria-hidden": true as const,
  };
  const paths = {
    arrow: <><path d="M5 12h14" /><path d="m13 5 7 7-7 7" /></>,
    calendar: <><rect x="3" y="5" width="18" height="16" rx="2" /><path d="M16 3v4M8 3v4M3 10h18" /></>,
    pin: <><path d="M20 10c0 5-8 12-8 12S4 15 4 10a8 8 0 1 1 16 0Z" /><circle cx="12" cy="10" r="2.5" /></>,
    sun: <><circle cx="12" cy="12" r="4" /><path d="M12 2v2m0 16v2M4.93 4.93l1.42 1.42m11.3 11.3 1.42 1.42M2 12h2m16 0h2M4.93 19.07l1.42-1.42m11.3-11.3 1.42-1.42" /></>,
    moon: <path d="M20.5 14.3A8.5 8.5 0 0 1 9.7 3.5 8.5 8.5 0 1 0 20.5 14.3Z" />,
    menu: <><path d="M4 7h16M4 12h16M4 17h16" /></>,
    close: <><path d="m18 6-12 12M6 6l12 12" /></>,
    spark: <><path d="m12 3 1.9 5.8L20 11l-6.1 2.2L12 19l-1.9-5.8L4 11l6.1-2.2L12 3Z" /><path d="m19 14 1.2 2.8L23 18l-2.8 1.2L19 22l-1.2-2.8L15 18l2.8-1.2L19 14Z" /></>,
    people: <><path d="M16 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" /><circle cx="10" cy="7" r="4" /><path d="M20 21v-2a4 4 0 0 0-3-3.87M16 3.13a4 4 0 0 1 0 7.75" /></>,
    leaf: <><path d="M20 4c-8 0-14 3-14 10a6 6 0 0 0 6 6c7 0 10-6 8-16Z" /><path d="M4 21c3-5 7-8 12-11" /></>,
    heart: <path d="M20.8 8.7c0 5.2-8.8 10.1-8.8 10.1S3.2 13.9 3.2 8.7A4.7 4.7 0 0 1 12 6.1a4.7 4.7 0 0 1 8.8 2.6Z" />,
    check: <path d="m5 12 4 4L19 6" />,
    plus: <><path d="M12 5v14M5 12h14" /></>,
    logout: <><path d="M10 17l5-5-5-5M15 12H3" /><path d="M12 3h6a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2h-6" /></>,
    search: <><circle cx="11" cy="11" r="7" /><path d="m20 20-4-4" /></>,
  };
  return <svg {...shared}>{paths[name]}</svg>;
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
    <article className={`event-card${compact ? " event-card-compact" : ""}`}>
      <Link
        className="event-card-image"
        href={`/events/${event.id}`}
        style={pictureStyle(event.image)}
        aria-label={`View ${event.title}`}
      >
        <span className="category-tag">{event.category}</span>
        <span className="image-arrow"><Icon name="arrow" size={16} /></span>
      </Link>
      <div className="event-card-content">
        <div className="event-date"><Icon name="calendar" size={15} />{formatDate(event.date)}</div>
        <h3><Link href={`/events/${event.id}`}>{event.title}</Link></h3>
        <p className="event-location"><Icon name="pin" size={15} />{event.location}</p>
        {!compact && <p className="event-description">{event.description}</p>}
        <Link className="text-link" href={`/events/${event.id}`}>
          Explore event <Icon name="arrow" size={15} />
        </Link>
      </div>
    </article>
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
    if (!date || date <= new Date().toISOString().slice(0, 10)) {
      setError("Choose a date in the future so everyone has time to join.");
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
      image: thumbnail || photos.community,
    });
  }

  return (
    <form className="event-form" onSubmit={submit}>
      <div className="form-grid">
        <label className="form-field form-span">
          Event name
          <input name="title" required minLength={4} maxLength={80} defaultValue={initial?.title} placeholder="e.g. A greener neighborhood" />
        </label>
        <label className="form-field">
          Event type
          <select name="category" required defaultValue={initial?.category || ""}>
            <option value="" disabled>Choose a category</option>
            <option>Cleanup</option><option>Plantation</option><option>Donation</option>
            <option>Food drive</option><option>Education</option><option>Community</option>
          </select>
        </label>
        <label className="form-field">
          Event date
          <input name="date" type="date" required min={minDate} defaultValue={initial?.date} />
        </label>
        <label className="form-field form-span">
          Location
          <input name="location" required minLength={3} maxLength={100} defaultValue={initial?.location} placeholder="Neighborhood, city" />
        </label>
        <label className="form-field form-span">
          Image URL <span className="optional-label">optional</span>
          <input name="image" type="url" defaultValue={initial?.image} placeholder="https://your-image-link.com/photo.jpg" />
        </label>
        <label className="form-field form-span">
          A little about the event
          <textarea name="description" required minLength={20} maxLength={800} rows={5} defaultValue={initial?.description} placeholder="What will you do together? Who can take part?" />
        </label>
      </div>
      {error && <p className="form-error" role="alert">{error}</p>}
      <div className="form-actions">
        {onCancel && <button className="button button-outline" type="button" onClick={onCancel}>Cancel</button>}
        <button className="button button-primary" type="submit">{submitLabel}<Icon name="arrow" size={16} /></button>
      </div>
    </form>
  );
}

export function CommunityApp({ view, eventId }: { view: View; eventId?: string }) {
  const router = useRouter();
  const [events, setEvents] = useState<EventItem[]>(initialEvents);
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
    const timer = window.setTimeout(() => {
      const storedEvents = localStorage.getItem("commonplace-events");
      const storedJoined = localStorage.getItem("commonplace-joined");
      const storedUser = localStorage.getItem("commonplace-user");
      const storedTheme = localStorage.getItem("commonplace-theme");
      const date = new Date();
      setToday(date.toISOString().slice(0, 10));
      setMinEventDate(futureDate(1));
      if (storedEvents) setEvents(JSON.parse(storedEvents) as EventItem[]);
      else setEvents(initialEvents.map((event, index) => ({ ...event, date: futureDate([3, 5, 8, 11, 14, 17][index]) })));
      if (storedJoined) setJoined(JSON.parse(storedJoined) as string[]);
      if (storedUser) setUser(JSON.parse(storedUser) as User);
      if (storedTheme) setDark(storedTheme === "dark");
      setReady(true);
    }, 0);
    return () => window.clearTimeout(timer);
  }, []);

  useEffect(() => {
    document.documentElement.dataset.theme = dark ? "dark" : "light";
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

  const activeEvent = events.find((event) => event.id === eventId);
  const ownEvents = events.filter((event) => event.creatorEmail === user?.email);
  const joinedEvents = events
    .filter((event) => joined.includes(event.id))
    .sort((a, b) => a.date.localeCompare(b.date));

  function saveEvents(next: EventItem[]) {
    setEvents(next);
    localStorage.setItem("commonplace-events", JSON.stringify(next));
  }

  function saveJoined(next: string[]) {
    setJoined(next);
    localStorage.setItem("commonplace-joined", JSON.stringify(next));
  }

  function addEvent(data: Omit<EventItem, "id" | "creatorEmail" | "creatorName">) {
    if (!user) {
      router.push("/login");
      return;
    }
    const next = [{ ...data, id: `event-${Date.now()}`, creatorEmail: user.email, creatorName: user.name }, ...events];
    saveEvents(next);
    setNotice("Your event is on the calendar. Thanks for bringing people together!");
    router.push("/events");
  }

  function updateEvent(data: Omit<EventItem, "id" | "creatorEmail" | "creatorName">) {
    if (!editing || editing.creatorEmail !== user?.email) return;
    saveEvents(events.map((event) => event.id === editing.id ? { ...event, ...data } : event));
    setEditing(null);
    setNotice("Your event details have been updated.");
  }

  function deleteEvent(id: string) {
    const event = events.find((item) => item.id === id);
    if (!event || event.creatorEmail !== user?.email) return;
    saveEvents(events.filter((item) => item.id !== id));
    setNotice("Event removed from your list.");
  }

  function joinEvent(id: string) {
    if (!user) {
      router.push("/login");
      return;
    }
    if (joined.includes(id)) {
      setNotice("You’re already on the list for this event.");
      return;
    }
    saveJoined([...joined, id]);
    setNotice("You’re in! We’ll see you there.");
  }

  function authenticate(event: FormEvent<HTMLFormElement>, registering: boolean) {
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
    const nextUser = {
      name: name || email.split("@")[0],
      email,
      photo: String(form.get("photo") || "").trim() || `https://api.dicebear.com/7.x/initials/svg?seed=${encodeURIComponent(name || email)}`,
    };
    setUser(nextUser);
    localStorage.setItem("commonplace-user", JSON.stringify(nextUser));
    setNotice(registering ? "Welcome to Commonplace. Your profile is ready!" : "Welcome back. Let’s do some good.");
    router.push("/events");
  }

  function logout() {
    localStorage.removeItem("commonplace-user");
    setUser(null);
    setMenuOpen(false);
    setNotice("You’ve been signed out.");
    router.push("/");
  }

  function demoSocial() {
    const nextUser = { name: "Good Neighbor", email: "neighbor@example.com", photo: "https://api.dicebear.com/7.x/initials/svg?seed=Good%20Neighbor" };
    setUser(nextUser);
    localStorage.setItem("commonplace-user", JSON.stringify(nextUser));
    setNotice("Welcome to Commonplace. Your demo profile is ready!");
    router.push("/events");
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
          <button className="mobile-menu-toggle" aria-label={menuOpen ? "Close menu" : "Open menu"} onClick={() => setMenuOpen(!menuOpen)}>
            <Icon name={menuOpen ? "close" : "menu"} />
          </button>
          <nav className={`main-nav${menuOpen ? " nav-open" : ""}`} aria-label="Main navigation">
            <Link className={view === "home" ? "nav-active" : ""} href="/" onClick={() => setMenuOpen(false)}>Home</Link>
            <Link className={view === "events" || view === "details" ? "nav-active" : ""} href="/events" onClick={() => setMenuOpen(false)}>Upcoming events</Link>
            <Link href="/#our-way" onClick={() => setMenuOpen(false)}>Our way</Link>
          </nav>
          <div className="nav-actions">
            <button className="theme-toggle" onClick={() => setDark(!dark)} aria-label={`Switch to ${dark ? "light" : "dark"} theme`} title={`Switch to ${dark ? "light" : "dark"} theme`}>
              <Icon name={dark ? "sun" : "moon"} size={17} />
            </button>
            {user ? (
              <div className="account-menu">
                <button className="avatar-button" style={{ backgroundImage: `url("${user.photo}")` }} onClick={() => setMenuOpen(!menuOpen)} aria-label={`Open menu for ${user.name}`} title={user.name} />
                <Link className="button button-small button-outline nav-create" href="/create-event"><Icon name="plus" size={15} /> Create event</Link>
                <button className="logout-button" onClick={logout}>Log out <Icon name="logout" size={15} /></button>
                {menuOpen && <div className="account-dropdown">
                  <strong>{user.name}</strong><span>{user.email}</span>
                  <Link href="/create-event">Create event</Link><Link href="/manage-events">Manage events</Link><Link href="/joined-events">Joined events</Link>
                  <button onClick={logout}>Log out</button>
                </div>}
              </div>
            ) : <Link className="button button-small button-primary nav-login" href="/login">Log in <Icon name="arrow" size={15} /></Link>}
          </div>
        </div>
      </header>

      <main>
        {view === "home" && <HomePage events={visibleEvents.slice(0, 6)} />}
        {view === "events" && <EventsPage events={visibleEvents} search={search} setSearch={setSearch} category={category} setCategory={setCategory} />}
        {view === "details" && <DetailsPage event={activeEvent} user={user} joined={joined.includes(eventId || "")} onJoin={() => eventId && joinEvent(eventId)} />}
        {view === "create" && <ProtectedPage user={user} ready={ready} title="Make something good happen." eyebrow="CREATE AN EVENT" description="You bring the idea. We’ll help you bring your neighbors together." loginHref="/create-event"><EventForm minDate={minEventDate} submitLabel="Publish your event" onSubmit={addEvent} /></ProtectedPage>}
        {view === "manage" && <ProtectedPage user={user} ready={ready} title="Your events, all together." eyebrow="MANAGE EVENTS" description="Keep your plans current and your community in the loop." loginHref="/manage-events">
          {ownEvents.length ? <div className="manage-list">{ownEvents.map((event) => <div className="manage-item" key={event.id}>
            <div className="manage-thumb" style={pictureStyle(event.image)} />
            <div className="manage-info"><span>{event.category} · {formatDate(event.date)}</span><h3>{event.title}</h3><p><Icon name="pin" size={14} />{event.location}</p></div>
            <div className="manage-actions"><button className="button button-outline button-small" onClick={() => setEditing(event)}>Edit</button><button className="button button-delete button-small" onClick={() => deleteEvent(event.id)}>Delete</button></div>
          </div>)}</div> : <EmptyState title="Your calendar is still open." detail="Create an event and invite your neighbors to make a difference together." action="Create an event" href="/create-event" />}
          {editing && <div className="modal-backdrop" role="presentation" onMouseDown={(event) => { if (event.target === event.currentTarget) setEditing(null); }}>
            <section className="edit-modal" role="dialog" aria-modal="true" aria-labelledby="edit-title">
              <div className="modal-heading"><div><span className="eyebrow">EDIT YOUR EVENT</span><h2 id="edit-title">A few little updates?</h2></div><button className="icon-button" aria-label="Close editor" onClick={() => setEditing(null)}><Icon name="close" /></button></div>
              <EventForm initial={editing} minDate={minEventDate} submitLabel="Save changes" onSubmit={updateEvent} onCancel={() => setEditing(null)} />
            </section>
          </div>}
        </ProtectedPage>}
        {view === "joined" && <ProtectedPage user={user} ready={ready} title="Good things you’re part of." eyebrow="JOINED EVENTS" description="Your next small act of good is right around the corner." loginHref="/joined-events">
          {joinedEvents.length ? <div className="event-grid">{joinedEvents.map((event) => <EventCard key={event.id} event={event} />)}</div> : <EmptyState title="Your next good thing is out there." detail="Find a local event that feels right and we’ll save it here for you." action="Explore events" href="/events" />}
        </ProtectedPage>}
        {view === "login" && <AuthPage registering={false} onSubmit={(event) => authenticate(event, false)} onDemo={demoSocial} />}
        {view === "register" && <AuthPage registering onSubmit={(event) => authenticate(event, true)} onDemo={demoSocial} />}
      </main>

      {view !== "login" && view !== "register" && <Footer />}
      {notice && <div className="toast-message" role="status"><span><Icon name="check" size={17} /></span>{notice}<button onClick={() => setNotice("")} aria-label="Dismiss message"><Icon name="close" size={15} /></button></div>}
    </div>
  );
}

function HomePage({ events }: { events: EventItem[] }) {
  return <>
    <section className="hero-section page-width">
      <div className="hero-copy">
        <span className="eyebrow"><span className="eyebrow-line" /> A LITTLE GOOD GOES A LONG WAY</span>
        <h1>Good things grow<br />when we <em>show up.</em></h1>
        <p className="hero-description">Find your people. Lend a hand. Make your corner of the world a little brighter—one local event at a time.</p>
        <div className="hero-actions"><Link className="button button-primary button-large" href="/events">Find your next good thing <Icon name="arrow" size={17} /></Link><Link className="button button-text" href="/create-event">Start something local <span>↗</span></Link></div>
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
      <div className="page-width impact-inner"><p>GOOD THINGS HAPPEN WHEN WE</p><div><strong>show up</strong><span>for each other</span></div><div><strong>pitch in</strong><span>where it matters</span></div><div><strong>grow together</strong><span>one neighborhood at a time</span></div></div>
    </section>

    <section className="section-block page-width" id="our-way">
      <div className="section-heading"><div><span className="eyebrow"><span className="eyebrow-line" /> THE NEIGHBORHOOD CALENDAR</span><h2>Make room for <em>good.</em></h2></div><Link className="text-link" href="/events">See all events <Icon name="arrow" size={16} /></Link></div>
      {events.length ? <div className="event-grid">{events.map((event) => <EventCard key={event.id} event={event} />)}</div> : <EmptyState title="New events are just around the corner." detail="Check back soon or start something good in your neighborhood." action="Create an event" href="/create-event" />}
      <div className="home-more"><span>FIND A WAY TO PITCH IN THAT FEELS LIKE YOU.</span><Link className="button button-outline" href="/events">Explore all upcoming events <Icon name="arrow" size={16} /></Link></div>
    </section>

    <section className="how-section">
      <div className="page-width how-inner">
        <div className="how-copy"><span className="eyebrow eyebrow-light"><span className="eyebrow-line" /> GOOD IS CLOSER THAN YOU THINK</span><h2>It starts with<br /><em>showing up.</em></h2><p>No big speeches. No perfect plans. Just neighbors, finding the time to do a little good together.</p><Link className="button button-light" href="/events">See what’s happening <Icon name="arrow" size={16} /></Link></div>
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

    <section className="newsletter-section page-width">
      <div className="newsletter-mark"><Icon name="leaf" size={27} /></div>
      <div className="newsletter-copy"><span className="eyebrow">A LITTLE GOOD IN YOUR INBOX</span><h2>Stay close to the good stuff.</h2><p>Local happenings, kind people, and small ways to pitch in. Never noise.</p></div>
      <form className="newsletter-form" onSubmit={(event) => { event.preventDefault(); window.dispatchEvent(new CustomEvent("commonplace-toast", { detail: "You’re on the list. Look out for a little good in your inbox!" })); }}>
        <label className="sr-only" htmlFor="newsletter-email">Your email address</label><input id="newsletter-email" name="email" type="email" required placeholder="Your email address" /><button aria-label="Subscribe"><Icon name="arrow" size={19} /></button><small>THE OCCASIONAL GOOD THING. UNSUBSCRIBE ANYTIME.</small>
      </form>
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
    <div className="event-toolbar"><div className="event-count">{events.length} upcoming {events.length === 1 ? "event" : "events"} <span>·</span> Dhaka & nearby</div><div className="event-controls"><label className="search-field"><Icon name="search" size={17} /><input value={search} onChange={(event) => setSearch(event.target.value)} placeholder="Search events" aria-label="Search events" /></label><label className="sr-only" htmlFor="event-category">Filter by event type</label><select id="event-category" className="filter-select" value={category} onChange={(event) => setCategory(event.target.value)}>{categories.map((item) => <option key={item}>{item}</option>)}</select></div></div>
    {events.length ? <div className="event-grid">{events.map((event) => <EventCard key={event.id} event={event} />)}</div> : <EmptyState title="Nothing on the calendar just yet." detail="Try another search, or be the first to organize something good." action="Create an event" href="/create-event" />}
    <div className="create-callout"><span className="callout-icon"><Icon name="spark" size={20} /></span><div><strong>Have an idea for your neighborhood?</strong><span>There’s no better time to bring it to life.</span></div><Link className="button button-primary" href="/create-event">Create an event <Icon name="arrow" size={16} /></Link></div>
  </section>;
}

function DetailsPage({ event, user, joined, onJoin }: { event?: EventItem; user: User | null; joined: boolean; onJoin: () => void }) {
  if (!event) return <section className="interior-page page-width"><EmptyState title="We can’t find that event." detail="It may have moved or been taken off the calendar." action="See all events" href="/events" /></section>;
  return <section className="interior-page page-width detail-page">
    <Link className="back-link" href="/events">← Back to upcoming events</Link>
    <div className="detail-layout"><div><div className="detail-image" style={pictureStyle(event.image)}><span className="category-tag">{event.category}</span></div><div className="detail-story"><span className="eyebrow"><span className="eyebrow-line" /> A NEIGHBORHOOD EVENT</span><h1>{event.title}</h1><p>{event.description}</p><p className="detail-host">Organized by <strong>{event.creatorName}</strong></p></div></div>
      <aside className="detail-sidebar"><span className="eyebrow">SAVE YOUR SPOT</span><h2>Let’s make it<br /><em>happen.</em></h2><div className="detail-fact"><span><Icon name="calendar" size={17} /></span><div><small>WHEN</small><strong>{formatDate(event.date)}</strong></div></div><div className="detail-fact"><span><Icon name="pin" size={17} /></span><div><small>WHERE</small><strong>{event.location}</strong></div></div><button className="button button-primary button-large join-button" onClick={onJoin}>{joined ? <>You’re on the list <Icon name="check" size={17} /></> : <>Count me in <Icon name="arrow" size={17} /></>}</button>{!user && <p className="join-hint">You’ll need to <Link href="/login">log in</Link> to join.</p>}<div className="sidebar-note"><Icon name="heart" size={17} /><span>Every person who shows up makes a difference.</span></div></aside>
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
  if (!ready) return <section className="interior-page page-width"><div className="loading-skeleton" /><div className="loading-skeleton loading-short" /></section>;
  if (!user) return <section className="interior-page page-width"><div className="protected-message"><span className="eyebrow">{eyebrow}</span><h1>This one’s for<br /><em>neighbors.</em></h1><p>Log in to keep your community plans close and your next good thing on track.</p><Link className="button button-primary" href={`/login?next=${encodeURIComponent(loginHref)}`}>Log in to continue <Icon name="arrow" size={16} /></Link></div></section>;
  return <section className="interior-page page-width workspace-page"><div className="workspace-heading"><div><span className="eyebrow"><span className="eyebrow-line" /> {eyebrow}</span><h1>{title}</h1><p>{description}</p></div>{eyebrow !== "CREATE AN EVENT" && <Link className="button button-primary" href="/create-event"><Icon name="plus" size={17} /> Create an event</Link>}</div><div className="workspace-content">{children}</div></section>;
}

function EmptyState({ title, detail, action, href }: { title: string; detail: string; action: string; href: string }) {
  return <div className="empty-state"><span><Icon name="leaf" size={25} /></span><h2>{title}</h2><p>{detail}</p><Link className="button button-primary" href={href}>{action}<Icon name="arrow" size={16} /></Link></div>;
}

function AuthPage({ registering, onSubmit, onDemo }: { registering: boolean; onSubmit: (event: FormEvent<HTMLFormElement>) => void; onDemo: () => void }) {
  return <section className="auth-page">
    <div className="auth-visual" style={pictureStyle(photos.people)}><div className="auth-visual-caption"><span className="eyebrow eyebrow-light">GOOD THINGS GROW HERE</span><h2>There’s a place<br />for you <em>here.</em></h2><p>Come as you are. Leave a little good behind.</p></div><div className="auth-caption-mark">✳</div></div>
    <div className="auth-panel"><div className="auth-card"><span className="eyebrow"><span className="eyebrow-line" /> {registering ? "COME ON IN" : "GOOD TO SEE YOU"}</span><h1>{registering ? <>Let’s get<br /><em>to know you.</em></> : <>Welcome<br /><em>back.</em></>}</h1><p>{registering ? "Make a little room for good things in your neighborhood." : "Your next good thing is right where you left it."}</p>
      <form className="auth-form" onSubmit={onSubmit}>
        {registering && <label className="form-field">Your name<input name="name" required minLength={2} maxLength={60} placeholder="What should we call you?" /></label>}
        <label className="form-field">Email address<input name="email" type="email" required autoComplete="email" placeholder="you@example.com" /></label>
        {registering && <label className="form-field">Profile photo URL <span className="optional-label">optional</span><input name="photo" type="url" placeholder="https://your-photo-link.com" /></label>}
        <label className="form-field">Password<input name="password" type="password" required minLength={6} autoComplete={registering ? "new-password" : "current-password"} placeholder="At least 6 characters" />{registering && <small className="field-hint">Include an uppercase and a lowercase letter.</small>}</label>
        <button className="button button-primary button-large auth-submit" type="submit">{registering ? "Create your account" : "Log in"}<Icon name="arrow" size={17} /></button>
      </form>
      {!registering && <><div className="auth-divider"><span>OR</span></div><button className="button button-outline social-button" type="button" onClick={onDemo}><span className="google-mark">G</span> Continue with Google</button></>}
      <div className="auth-switch">{registering ? <>Already one of us? <Link href="/login">Log in</Link></> : <>New around here? <Link href="/register">Create an account</Link></>}</div>
      <div className="auth-demo-note"><Icon name="spark" size={15} /> Frontend demo: your profile is saved in this browser.</div>
    </div></div>
  </section>;
}

function Footer() {
  const [notice, setNotice] = useState("");
  useEffect(() => {
    const handler = (event: Event) => setNotice((event as CustomEvent<string>).detail);
    window.addEventListener("commonplace-toast", handler);
    return () => window.removeEventListener("commonplace-toast", handler);
  }, []);
  return <>
    <footer className="site-footer"><div className="page-width">
      <div className="footer-main"><div className="footer-brand"><Link className="brand brand-footer" href="/"><span className="brand-mark"><Icon name="leaf" size={20} /></span><span>commonplace<span className="brand-period">.</span><small>GOOD THINGS GROW HERE</small></span></Link><p>Making it easier to show up<br />for the places we call home.</p></div><div className="footer-links"><div><span>FIND YOUR GOOD</span><Link href="/events">Upcoming events</Link><Link href="/create-event">Create an event</Link><Link href="/joined-events">Joined events</Link></div><div><span>THE NEIGHBORHOOD</span><Link href="/#our-way">Our way</Link><a href="mailto:hello@commonplace.community">Say hello</a><a href="https://x.com" target="_blank" rel="noreferrer">Follow along on X ↗</a></div></div><div className="footer-sticker"><span>✳</span><p>Be the reason<br />someone smiles<br />this week.</p></div></div>
      <div className="footer-bottom"><span>© Commonplace. Made for the good of it.</span><span>GOOD IS CLOSER THAN YOU THINK.</span><Link href="/">Back to top ↑</Link></div>
    </div></footer>
    {notice && <div className="toast-message" role="status"><span><Icon name="check" size={17} /></span>{notice}<button onClick={() => setNotice("")} aria-label="Dismiss message"><Icon name="close" size={15} /></button></div>}
  </>;
}
