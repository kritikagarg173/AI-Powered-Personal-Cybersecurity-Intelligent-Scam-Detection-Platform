import { useEffect, useState } from "react";
import {
  Users,
  UserPlus,
  Phone,
  ShieldCheck,
  Trash2,
  CheckCircle2,
  X,
} from "lucide-react";
import { API_BASE_URL } from "../services/apiConfig";

function TrustedContacts() {
  const [contacts, setContacts] = useState([]);
const [loading, setLoading] = useState(true);
const [error, setError] = useState("");

  const [showForm, setShowForm] = useState(false);
  const API_URL = `${API_BASE_URL}/contacts`;

const getToken = () => {
  return localStorage.getItem("token");
};

  const [form, setForm] = useState({
    name: "",
    phone: "",
    relation: "",
    emergency: false,
  });
  const fetchContacts = async () => {
  try {
    setLoading(true);
    setError("");

    const token = getToken();

    if (!token) {
      throw new Error("Login token not found. Please login again.");
    }

    const response = await fetch(API_URL, {
      method: "GET",
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });

    const data = await response.json();

    if (!response.ok || !data.success) {
      throw new Error(data.message || "Failed to load trusted contacts");
    }

    const formattedContacts = data.contacts.map((contact) => ({
      id: contact._id,
      name: contact.name,
      phone: contact.phone,
      relation: contact.relationship,
      emergency: contact.isPrimary,
      priority: contact.priority,
    }));

    setContacts(formattedContacts);
  } catch (error) {
    console.error("Fetch contacts error:", error);
    setError(error.message);
  } finally {
    setLoading(false);
  }
};

useEffect(() => {
  fetchContacts();
}, []);

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;

    setForm((prev) => ({
      ...prev,
      [name]: type === "checkbox" ? checked : value,
    }));
  };

  const addContact = async (e) => {
  e.preventDefault();

  if (!form.name || !form.phone || !form.relation) {
    setError("Please fill all required fields.");
    return;
  }

  try {
    setError("");

    const token = getToken();

    if (!token) {
      throw new Error("Login token not found. Please login again.");
    }

    const response = await fetch(API_URL, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({
        name: form.name,
        phone: form.phone,
        relationship: form.relation,
        priority: form.emergency ? 1 : 2,
        isPrimary: form.emergency,
      }),
    });

    const data = await response.json();

    if (!response.ok || !data.success) {
      throw new Error(data.message || "Failed to add trusted contact");
    }

    setForm({
      name: "",
      phone: "",
      relation: "",
      emergency: false,
    });

    setShowForm(false);

    await fetchContacts();
  } catch (error) {
    console.error("Add contact error:", error);
    setError(error.message);
  }
};

  const deleteContact = async (id) => {
  try {
    setError("");

    const token = getToken();

    if (!token) {
      throw new Error("Login token not found. Please login again.");
    }

    const response = await fetch(`${API_URL}/${id}`, {
      method: "DELETE",
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });

    const data = await response.json();

    if (!response.ok || !data.success) {
      throw new Error(data.message || "Failed to delete trusted contact");
    }

    setContacts((prev) =>
      prev.filter((contact) => contact.id !== id)
    );
  } catch (error) {
    console.error("Delete contact error:", error);
    setError(error.message);
  }
};

  return (
    <div className="mx-auto max-w-6xl space-y-7">
      {/* Header */}
      <div className="flex flex-col justify-between gap-4 md:flex-row md:items-end">
        <div>
          <div className="mb-2 flex items-center gap-2">
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-blue-100 text-blue-700">
              <Users size={19} />
            </div>

            <span className="text-xs font-bold uppercase tracking-[0.15em] text-blue-600">
              Emergency Network
            </span>
          </div>

          <h1 className="text-2xl font-bold tracking-tight text-slate-900 md:text-3xl">
            Trusted Contacts
          </h1>

          <p className="mt-2 text-sm text-slate-500">
            People you trust to receive important safety alerts.
          </p>
        </div>

        <button
          onClick={() => setShowForm(true)}
          className="flex w-fit items-center gap-2 rounded-xl bg-blue-700 px-5 py-3 text-sm font-semibold text-white shadow-lg shadow-blue-700/20 transition hover:bg-blue-800"
        >
          <UserPlus size={17} />
          Add Contact
        </button>
      </div>

      {/* Security Banner */}
      <div className="flex gap-3 rounded-2xl border border-blue-100 bg-blue-50 p-4">
        <ShieldCheck
          size={19}
          className="mt-0.5 shrink-0 text-blue-700"
        />

        <div>
          <p className="text-xs font-bold text-blue-800">
            Your trusted network
          </p>

          <p className="mt-1 text-xs leading-5 text-blue-600">
            Emergency contacts can be notified when you activate supported
            safety features.
          </p>
        </div>
      </div>
      {error && (
  <div className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-xs font-medium text-red-600">
    {error}
  </div>
)}
{loading && (
  <div className="rounded-2xl border border-slate-200 bg-white p-6 text-center text-sm text-slate-500">
    Loading trusted contacts...
  </div>
)}

      {/* Contacts */}
      {contacts.length === 0 ? (
        <div className="rounded-3xl border border-dashed border-slate-300 bg-white px-6 py-16 text-center">
          <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-slate-100 text-slate-400">
            <Users size={26} />
          </div>

          <h2 className="mt-4 text-base font-bold text-slate-800">
            No trusted contacts yet
          </h2>

          <p className="mx-auto mt-2 max-w-sm text-xs leading-5 text-slate-400">
            Add someone you trust so they can be part of your emergency
            safety network.
          </p>

          <button
            onClick={() => setShowForm(true)}
            className="mt-5 rounded-xl bg-blue-700 px-5 py-3 text-xs font-semibold text-white"
          >
            Add First Contact
          </button>
        </div>
      ) : (
        <div className="grid gap-4 md:grid-cols-2">
          {contacts.map((contact) => (
            <div
              key={contact.id}
              className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm"
            >
              <div className="flex items-start justify-between">
                <div className="flex items-center gap-4">
                  <div className="flex h-12 w-12 items-center justify-center rounded-full bg-blue-100 text-sm font-bold text-blue-700">
                    {contact.name
                      .split(" ")
                      .map((word) => word[0])
                      .join("")
                      .slice(0, 2)
                      .toUpperCase()}
                  </div>

                  <div>
                    <div className="flex items-center gap-2">
                      <h3 className="text-sm font-bold text-slate-900">
                        {contact.name}
                      </h3>

                      {contact.emergency && (
                        <span className="rounded-full bg-red-50 px-2 py-1 text-[9px] font-bold text-red-600">
                          Emergency
                        </span>
                      )}
                    </div>

                    <p className="mt-1 text-xs text-slate-400">
                      {contact.relation}
                    </p>
                  </div>
                </div>

                <button
                  onClick={() => deleteContact(contact.id)}
                  className="rounded-lg p-2 text-slate-400 transition hover:bg-red-50 hover:text-red-600"
                  title="Remove contact"
                >
                  <Trash2 size={16} />
                </button>
              </div>

              <div className="mt-5 flex items-center justify-between border-t border-slate-100 pt-4">
                <div className="flex items-center gap-2 text-xs text-slate-500">
                  <Phone size={14} />
                  {contact.phone}
                </div>

                <span className="flex items-center gap-1.5 text-[10px] font-semibold text-green-600">
                  <span className="h-1.5 w-1.5 rounded-full bg-green-500" />
                  Protected
                </span>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Add Contact Modal */}
      {showForm && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-slate-950/40 p-4">
          <div className="w-full max-w-md rounded-3xl bg-white p-6 shadow-2xl">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-lg font-bold text-slate-900">
                  Add Trusted Contact
                </h2>

                <p className="mt-1 text-xs text-slate-400">
                  Add someone to your safety network.
                </p>
              </div>

              <button
                onClick={() => setShowForm(false)}
                className="rounded-lg p-2 text-slate-400 hover:bg-slate-100"
              >
                <X size={19} />
              </button>
            </div>

            <form onSubmit={addContact} className="mt-6 space-y-4">
              {/* Name */}
              <div>
                <label className="mb-1.5 block text-xs font-semibold text-slate-600">
                  Full Name
                </label>

                <input
                  type="text"
                  name="name"
                  value={form.name}
                  onChange={handleChange}
                  placeholder="e.g. Dad"
                  className="w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm outline-none focus:border-blue-400 focus:ring-4 focus:ring-blue-50"
                />
              </div>

              {/* Phone */}
              <div>
                <label className="mb-1.5 block text-xs font-semibold text-slate-600">
                  Phone Number
                </label>

                <input
                  type="tel"
                  name="phone"
                  value={form.phone}
                  onChange={handleChange}
                  placeholder="+91 98765 43210"
                  className="w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm outline-none focus:border-blue-400 focus:ring-4 focus:ring-blue-50"
                />
              </div>

              {/* Relation */}
              <div>
                <label className="mb-1.5 block text-xs font-semibold text-slate-600">
                  Relationship
                </label>

                <select
                  name="relation"
                  value={form.relation}
                  onChange={handleChange}
                  className="w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-700 outline-none focus:border-blue-400 focus:ring-4 focus:ring-blue-50"
                >
                  <option value="">Select relationship</option>
                  <option value="Parent">Parent</option>
                  <option value="Sibling">Sibling</option>
                  <option value="Friend">Friend</option>
                  <option value="Partner">Partner</option>
                  <option value="Guardian">Guardian</option>
                  <option value="Other">Other</option>
                </select>
              </div>

              {/* Emergency */}
              <label className="flex cursor-pointer items-center gap-3 rounded-xl bg-red-50 p-3">
                <input
                  type="checkbox"
                  name="emergency"
                  checked={form.emergency}
                  onChange={handleChange}
                  className="h-4 w-4 accent-red-600"
                />

                <div>
                  <p className="text-xs font-bold text-red-700">
                    Emergency contact
                  </p>

                  <p className="mt-0.5 text-[10px] text-red-500">
                    Prioritize this person for safety alerts.
                  </p>
                </div>
              </label>

              {/* Buttons */}
              <div className="flex gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setShowForm(false)}
                  className="flex-1 rounded-xl border border-slate-200 px-4 py-3 text-xs font-semibold text-slate-600 hover:bg-slate-50"
                >
                  Cancel
                </button>

                <button
                  type="submit"
                  className="flex flex-1 items-center justify-center gap-2 rounded-xl bg-blue-700 px-4 py-3 text-xs font-semibold text-white hover:bg-blue-800"
                >
                  <CheckCircle2 size={15} />
                  Save Contact
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

export default TrustedContacts;