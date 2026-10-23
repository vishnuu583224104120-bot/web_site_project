// ==========================================
// EVENT REGISTRATION SYSTEM - FRONTEND
// ==========================================

const events = [
    {
        id: 1,
        title: "Web Development Workshop",
        category: "Technology",
        date: "2026-11-05",
        time: "10:00 AM - 1:00 PM",
        location: "Computer Lab, Coimbatore",
        price: 199,
        seats: 40,
        description: "Learn HTML, CSS and JavaScript by building your first website.",
        image: "photo-1516321318423-f06f85e504b3"
    },
    {
        id: 2,
        title: "Entrepreneurship Summit",
        category: "Business",
        date: "2026-11-12",
        time: "9:30 AM - 4:00 PM",
        location: "Conference Hall, Coimbatore",
        price: 499,
        seats: 100,
        description: "Discover startup ideas, business strategies and success stories.",
        image: "photo-1552664730-d307ca884978"
    },
    {
        id: 3,
        title: "Live Music Festival",
        category: "Music",
        date: "2026-11-18",
        time: "5:00 PM - 9:00 PM",
        location: "Open Air Auditorium",
        price: 299,
        seats: 200,
        description: "Enjoy an unforgettable evening of music, entertainment and fun.",
        image: "photo-1459749411175-04bf5292ceea"
    },
    {
        id: 4,
        title: "Career Guidance Seminar",
        category: "Education",
        date: "2026-11-22",
        time: "10:00 AM - 12:30 PM",
        location: "College Seminar Hall",
        price: 99,
        seats: 75,
        description: "Get career advice, explore opportunities and plan your future.",
        image: "photo-1523580494863-6f3031224c94"
    },
    {
        id: 5,
        title: "Intercollege Sports Meet",
        category: "Sports",
        date: "2026-11-28",
        time: "8:00 AM - 5:00 PM",
        location: "College Sports Ground",
        price: 149,
        seats: 150,
        description: "Participate in exciting sports competitions and team challenges.",
        image: "photo-1461896836934-ffe607ba8211"
    },
    {
        id: 6,
        title: "Art and Photography Expo",
        category: "Art",
        date: "2026-12-05",
        time: "11:00 AM - 4:00 PM",
        location: "City Art Gallery",
        price: 99,
        seats: 60,
        description: "Explore creative artwork, photography exhibits and new talent.",
        image: "photo-1513364776144-60967b0f800f"
    }
];

// DOM elements
const eventGrid = document.getElementById("eventGrid");
const searchInput = document.getElementById("searchInput");
const categoryFilter = document.getElementById("categoryFilter");
const emptyState = document.getElementById("emptyState");

const modal = document.getElementById("registrationModal");
const registrationForm = document.getElementById("registrationForm");
const registrationList = document.getElementById("registrationList");

const registrationCount = document.getElementById("registrationCount");
const eventCount = document.getElementById("eventCount");
const toast = document.getElementById("toast");

// Store registrations in the browser
const STORAGE_KEY = "eventify_registrations";

let registrations = loadRegistrations();
let toastTimer;

// Safely load previously saved registrations
function loadRegistrations() {
    try {
        const saved = localStorage.getItem(STORAGE_KEY);

        if (!saved) {
            return [];
        }

        const parsed = JSON.parse(saved);

        if (!Array.isArray(parsed)) {
            return [];
        }

        // Only accept registrations belonging to known events.
        return parsed.filter(registration =>
            registration &&
            events.some(event => event.id === Number(registration.eventId)) &&
            typeof registration.fullName === "string" &&
            typeof registration.email === "string" &&
            typeof registration.phone === "string" &&
            typeof registration.attendees === "number"
        );
    } catch (error) {
        return [];
    }
}

// Save registrations
function saveRegistrations() {
    try {
        localStorage.setItem(
            STORAGE_KEY,
            JSON.stringify(registrations)
        );
        return true;
    } catch (error) {
        showToast("Unable to save. Please check your browser storage.");
        return false;
    }
}

// Format date
function formatDate(dateString) {
    const date = new Date(dateString + "T12:00:00");

    return date.toLocaleDateString("en-IN", {
        day: "numeric",
        month: "short",
        year: "numeric"
    });
}

// Escape text before inserting user-provided data into HTML
function escapeHTML(value) {
    return String(value).replace(/[&<>"']/g, character => {
        const entities = {
            "&": "&amp;",
            "<": "&lt;",
            ">": "&gt;",
            '"': "&quot;",
            "'": "&#39;"
        };

        return entities[character];
    });
}

// Display events
function renderEvents() {
    const searchTerm = searchInput.value.trim().toLowerCase();
    const selectedCategory = categoryFilter.value;

    const filteredEvents = events.filter(event => {
        const matchesSearch =
            event.title.toLowerCase().includes(searchTerm) ||
            event.description.toLowerCase().includes(searchTerm) ||
            event.location.toLowerCase().includes(searchTerm) ||
            event.category.toLowerCase().includes(searchTerm);

        const matchesCategory =
            selectedCategory === "All" ||
            event.category === selectedCategory;

        return matchesSearch && matchesCategory;
    });

    eventCount.textContent =
        `${filteredEvents.length} Event${filteredEvents.length !== 1 ? "s" : ""}`;

    emptyState.hidden = filteredEvents.length !== 0;
    eventGrid.hidden = filteredEvents.length === 0;

    eventGrid.innerHTML = filteredEvents.map(event => {
        const alreadyRegistered = registrations.some(
            registration => Number(registration.eventId) === event.id
        );

        return `
            <article class="event-card">
                <div
                    class="event-image"
                    style="background-image: url('https://images.unsplash.com/${event.image}?auto=format&fit=crop&w=800&q=80')"
                    role="img"
                    aria-label="${escapeHTML(event.title)}"
                >
                    <span class="category-tag">
                        ${escapeHTML(event.category)}
                    </span>
                </div>

                <div class="event-body">
                    <p class="event-date">
                        📅 ${formatDate(event.date)}
                    </p>

                    <h3>${escapeHTML(event.title)}</h3>

                    <p class="event-description">
                        ${escapeHTML(event.description)}
                    </p>

                    <div class="event-meta">
                        <span>🕒 ${escapeHTML(event.time)}</span>
                        <span>📍 ${escapeHTML(event.location)}</span>
                        <span>👥 ${event.seats} available seats (demo)</span>
                    </div>

                    <div class="event-footer">
                        <div class="event-price">
                            ₹${event.price}
                            <small>/ person</small>
                        </div>

                        <button
                            class="primary-button register-button"
                            data-register="${event.id}"
                            ${alreadyRegistered ? "disabled" : ""}
                        >
                            ${alreadyRegistered ? "Registered ✓" : "Register Now →"}
                        </button>
                    </div>
                </div>
            </article>
        `;
    }).join("");
}

// Open registration form
function openRegistration(eventId) {
    const event = events.find(item => item.id === Number(eventId));

    if (!event) {
        showToast("Event not found.");
        return;
    }

    const alreadyRegistered = registrations.some(
        registration => Number(registration.eventId) === event.id
    );

    if (alreadyRegistered) {
        showToast("You have already registered for this event.");
        return;
    }

    document.getElementById("selectedEventId").value = event.id;
    document.getElementById("modalEventName").textContent =
        `${event.title} · ${formatDate(event.date)} · ₹${event.price} per person`;

    modal.hidden = false;
    document.body.style.overflow = "hidden";

    document.getElementById("fullName").focus();
}

// Close registration form
function closeRegistration() {
    modal.hidden = true;
    document.body.style.overflow = "";
}

// Handle registration
registrationForm.addEventListener("submit", function (event) {
    event.preventDefault();

    if (!registrationForm.reportValidity()) {
        return;
    }

    const eventId = Number(
        document.getElementById("selectedEventId").value
    );

    const selectedEvent = events.find(item => item.id === eventId);

    if (!selectedEvent) {
        showToast("Please select a valid event.");
        return;
    }

    if (registrations.some(
        registration => Number(registration.eventId) === eventId
    )) {
        showToast("You have already registered for this event.");
        closeRegistration();
        return;
    }

    const registration = {
        registrationId:
            Date.now().toString(36) +
            Math.random().toString(36).slice(2, 8),

        eventId: selectedEvent.id,

        fullName: document.getElementById("fullName").value.trim(),

        email: document.getElementById("email").value.trim(),

        phone: document.getElementById("phone").value.trim(),

        attendees: Number(document.getElementById("attendees").value),

        registeredAt: new Date().toISOString()
    };

    if (
        !registration.fullName ||
        !registration.email ||
        !registration.phone
    ) {
        showToast("Please fill in all required fields.");
        return;
    }

    registrations.push(registration);

    if (!saveRegistrations()) {
        registrations.pop();
        return;
    }

    registrationForm.reset();
    closeRegistration();

    renderEvents();
    renderRegistrations();

    showToast("Registration successful! Welcome aboard 🎉");

    document.getElementById("registrations").scrollIntoView({
        behavior: "smooth"
    });
});

// Display registered events
function renderRegistrations() {
    registrationCount.textContent =
        `${registrations.length} Registered`;

    if (registrations.length === 0) {
        registrationList.innerHTML = `
            <div class="no-registrations" style="grid-column: 1 / -1;">
                <p style="font-size: 32px; margin-bottom: 10px;">🎟️</p>
                <h3>No registrations yet</h3>
                <p style="margin-top: 7px;">
                    Explore upcoming events and register for your favorites!
                </p>
                <a
                    href="#events"
                    class="primary-button"
                    style="margin-top: 18px;"
                >
                    Explore Events →
                </a>
            </div>
        `;

        return;
    }

    registrationList.innerHTML = registrations.map(registration => {
        const event = events.find(
            item => item.id === Number(registration.eventId)
        );

        if (!event) {
            return "";
        }

        return `
            <article class="registration-item">
                <div>
                    <h3>${escapeHTML(event.title)}</h3>

                    <p>📅 ${formatDate(event.date)}</p>

                    <p>👤 ${escapeHTML(registration.fullName)}</p>

                    <p>✉️ ${escapeHTML(registration.email)}</p>

                    <p>🎟️ ${registration.attendees} attendee(s)</p>

                    <p>
                        Total:
                        ₹${event.price * registration.attendees}
                    </p>
                </div>

                <button
                    class="cancel-button"
                    data-cancel="${escapeHTML(registration.registrationId)}"
                >
                    Cancel
                </button>
            </article>
        `;
    }).join("");
}

// Cancel a registration
function cancelRegistration(registrationId) {
    const registration = registrations.find(
        item => item.registrationId === registrationId
    );

    if (!registration) {
        return;
    }

    const event = events.find(
        item => item.id === Number(registration.eventId)
    );

    const confirmed = window.confirm(
        `Are you sure you want to cancel your registration for "${event.title}"?`
    );

    if (!confirmed) {
        return;
    }

    const previousRegistrations = [...registrations];

    registrations = registrations.filter(
        item => item.registrationId !== registrationId
    );

    if (!saveRegistrations()) {
        registrations = previousRegistrations;
        return;
    }

    renderRegistrations();
    renderEvents();

    showToast("Your registration has been cancelled.");
}

// Display notifications
function showToast(message) {
    toast.textContent = message;
    toast.classList.add("show");

    clearTimeout(toastTimer);

    toastTimer = setTimeout(() => {
        toast.classList.remove("show");
    }, 3500);
}

// Event listeners
searchInput.addEventListener("input", renderEvents);

categoryFilter.addEventListener("change", renderEvents);

eventGrid.addEventListener("click", function (event) {
    const button = event.target.closest("[data-register]");

    if (button && !button.disabled) {
        openRegistration(button.dataset.register);
    }
});

registrationList.addEventListener("click", function (event) {
    const button = event.target.closest("[data-cancel]");

    if (button) {
        cancelRegistration(button.dataset.cancel);
    }
});

document.getElementById("closeModal").addEventListener(
    "click",
    closeRegistration
);

modal.addEventListener("click", function (event) {
    if (event.target === modal) {
        closeRegistration();
    }
});

document.addEventListener("keydown", function (event) {
    if (event.key === "Escape" && !modal.hidden) {
        closeRegistration();
    }
});

// Initialize application
document.getElementById("year").textContent = new Date().getFullYear();

renderEvents();
renderRegistrations();
