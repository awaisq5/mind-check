import { useState } from "react";

function FindSupport() {
  const [form, setForm] = useState({
    street: "",
    city: "",
    zip: "",
    country: "Germany",
  });

  const handleChange = (e) => {
    setForm({
      ...form,
      [e.target.name]: e.target.value,
    });
  };

  const handleSearch = () => {
    if (!form.city || !form.zip) {
      alert("City and ZIP are required");
      return;
    }

    const query = `${form.street} ${form.zip} ${form.city} ${form.country} therapist`;

    const url = `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(query)}`;

    window.open(url, "_blank");
  };

  return (
    <div className="card bg-base-100 shadow-md p-4 space-y-3">
      <h2 className="font-semibold text-lg">Find nearby support</h2>

      <input
        type="text"
        name="street"
        placeholder="Street (optional)"
        className="input input-bordered w-full"
        value={form.street}
        onChange={handleChange}
      />

      <input
        type="text"
        name="city"
        placeholder="City *"
        className="input input-bordered w-full"
        value={form.city}
        onChange={handleChange}
      />

      <input
        type="text"
        name="zip"
        placeholder="ZIP Code *"
        className="input input-bordered w-full"
        value={form.zip}
        onChange={handleChange}
      />

      <input
        type="text"
        name="country"
        placeholder="Country"
        className="input input-bordered w-full"
        value={form.country}
        onChange={handleChange}
      />

      <button
        onClick={handleSearch}
        className="btn btn-primary w-full"
      >
        Search nearby specialists
      </button>
    </div>
  );
}

export default FindSupport;