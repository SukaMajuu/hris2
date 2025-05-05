'use client';

import { useParams, useRouter } from 'next/navigation';
import { useState } from 'react';

export default function EditCheckClockPage() {
  const { id } = useParams();
  const router = useRouter();

  // Simulasi data awal (bisa diganti fetch dari backend)
  const [form, setForm] = useState({
    name: 'Sarah Connor',
    position: 'CEO',
    type: 'WFO',
    checkIn: '07:00',
    checkOut: '17:00',
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    alert('Data berhasil disimpan! (Simulasi)');
    // Simulasi redirect ke halaman utama
    router.push('/checkclock');
  };

  return (
    <div className="p-6 max-w-xl mx-auto">
      <h1 className="text-2xl font-bold mb-4">Edit Check-Clock - ID #{id}</h1>

      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block mb-1 font-semibold">Nama</label>
          <input
            type="text"
            name="name"
            value={form.name}
            onChange={handleChange}
            className="w-full border p-2 rounded"
            required
          />
        </div>

        <div>
          <label className="block mb-1 font-semibold">Posisi</label>
          <input
            type="text"
            name="position"
            value={form.position}
            onChange={handleChange}
            className="w-full border p-2 rounded"
          />
        </div>

        <div>
          <label className="block mb-1 font-semibold">Tipe Pekerjaan</label>
          <select
            name="type"
            value={form.type}
            onChange={handleChange}
            className="w-full border p-2 rounded"
          >
            <option value="WFO">WFO</option>
            <option value="WFH">WFH</option>
            <option value="Remote">Remote</option>
          </select>
        </div>

        <div>
          <label className="block mb-1 font-semibold">Check In</label>
          <input
            type="time"
            name="checkIn"
            value={form.checkIn}
            onChange={handleChange}
            className="w-full border p-2 rounded"
          />
        </div>

        <div>
          <label className="block mb-1 font-semibold">Check Out</label>
          <input
            type="time"
            name="checkOut"
            value={form.checkOut}
            onChange={handleChange}
            className="w-full border p-2 rounded"
          />
        </div>

        <div className="flex gap-2">
          <button type="submit" className="bg-blue-500 text-white px-4 py-2 rounded">
            Simpan
          </button>
          <button
            type="button"
            onClick={() => router.back()}
            className="bg-gray-300 text-black px-4 py-2 rounded"
          >
            Batal
          </button>
        </div>
      </form>
    </div>
  );
}
