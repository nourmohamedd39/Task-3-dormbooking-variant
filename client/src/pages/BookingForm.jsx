import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { api } from "../api";

// Server sends "2026-10-10T00:00:00.000Z"; <input type="date"> needs "2026-10-10"
const toDateInput = (value) => (value ? String(value).slice(0, 10) : "");

export default function BookingForm() {
  const { id } = useParams(); // undefined on /bookings/new
  const isEdit = Boolean(id);
  const navigate = useNavigate();

  const [form, setForm] = useState({
    roomNumber: "",
    startDate: "",
    endDate: "",
    purpose: "",
  });
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(isEdit);
  const [submitting, setSubmitting] = useState(false);

  // TODO 3: load the booking when the URL has an id
  useEffect(() => {
    if (!id) return;
    let cancelled = false;

    api
      .get(`/bookings/${id}`)
      .then((res) => {
        if (cancelled) return;
        // handle both { ...booking } and { booking: {...} } / { data: {...} }
        const b = res.data?.booking ?? res.data?.data ?? res.data;
        console.log("loaded booking:", b); // remove once it works
        setForm({
          roomNumber: b?.roomNumber ?? "",
          startDate: toDateInput(b?.startDate),
          endDate: toDateInput(b?.endDate),
          purpose: b?.purpose ?? "",
        });
      })
      .catch((err) => {
        if (!cancelled)
          setError(err.response?.data?.message || "Failed to load booking");
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });

    return () => {
      cancelled = true;
    };
  }, [id]);

  // TODO 1: one handler for all inputs, keyed by the input's name
  const onChange = (e) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  // TODO 2 + 3: POST to create, PATCH to edit
  const onSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setSubmitting(true);

    // no bookedBy: the server takes it from the token
    const payload = {
      roomNumber: form.roomNumber,
      startDate: form.startDate,
      endDate: form.endDate,
      purpose: form.purpose,
    };

    try {
      if (id) {
        await api.patch(`/bookings/${id}`, payload);
      } else {
        await api.post("/bookings", payload);
      }
      navigate("/bookings");
    } catch (err) {
      // 400 bad dates, 403 not your booking, 409 room taken
      setError(err.response?.data?.message || "Something went wrong");
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) return <p className="p-6">Loading…</p>;

  return (
    <div className="max-w-md mx-auto p-6">
      <h1 className="text-2xl font-semibold mb-4">
        {isEdit ? "Edit Booking" : "Book a Room"}
      </h1>

      {error && (
        <div className="mb-4 rounded border border-red-300 bg-red-50 p-3 text-red-700">
          {error}
        </div>
      )}

      <form onSubmit={onSubmit} className="space-y-4">
        <div>
          <label htmlFor="roomNumber" className="block text-sm font-medium mb-1">
            Room number
          </label>
          <input
            id="roomNumber"
            name="roomNumber"
            type="text"
            placeholder="B2-104"
            value={form.roomNumber}
            onChange={onChange}
            required
            className="w-full rounded border px-3 py-2"
          />
        </div>

        <div>
          <label htmlFor="startDate" className="block text-sm font-medium mb-1">
            Start date
          </label>
          <input
            id="startDate"
            name="startDate"
            type="date"
            value={form.startDate}
            onChange={onChange}
            required
            className="w-full rounded border px-3 py-2"
          />
        </div>

        <div>
          <label htmlFor="endDate" className="block text-sm font-medium mb-1">
            End date
          </label>
          <input
            id="endDate"
            name="endDate"
            type="date"
            value={form.endDate}
            onChange={onChange}
            required
            className="w-full rounded border px-3 py-2"
          />
        </div>

        <div>
          <label htmlFor="purpose" className="block text-sm font-medium mb-1">
            Purpose <span className="text-gray-400">(optional)</span>
          </label>
          <textarea
            id="purpose"
            name="purpose"
            rows={3}
            value={form.purpose}
            onChange={onChange}
            className="w-full rounded border px-3 py-2"
          />
        </div>

        <button
          type="submit"
          disabled={submitting}
          className="w-full rounded bg-blue-600 px-4 py-2 text-white disabled:opacity-50"
        >
          {submitting ? "Saving…" : isEdit ? "Save changes" : "Book room"}
        </button>
      </form>
    </div>
  );
}