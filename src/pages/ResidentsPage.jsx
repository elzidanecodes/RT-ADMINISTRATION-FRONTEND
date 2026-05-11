import { useEffect, useState } from 'react';
import * as residentApi from '../api/residentApi';
import Badge from '../components/ui/Badge';
import Button from '../components/ui/Button';
import Modal from '../components/ui/Modal';
import Input from '../components/ui/Input';
import Select from '../components/ui/Select';
import { formatDate } from '../utils/format';
import { PlusIcon, MagnifyingGlassIcon } from '@heroicons/react/24/outline';

const GENDERS = [
  { value: 'male', label: 'Laki-laki' },
  { value: 'female', label: 'Perempuan' },
];

const emptyForm = {
  full_name: '', nik: '', phone: '', gender: 'male', birth_date: '', status: 'active', ktp_photo: null,
};

function ResidentFormModal({ open, onClose, onSaved, initial }) {
  const [form, setForm] = useState(emptyForm);
  const [preview, setPreview] = useState(null);
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState({});

  useEffect(() => {
    if (initial) {
      setForm({ ...emptyForm, ...initial, ktp_photo: null });
      setPreview(initial.ktp_photo_url ?? null);
    } else {
      setForm(emptyForm);
      setPreview(null);
    }
    setErrors({});
  }, [initial, open]);

  const handleFile = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    setForm((f) => ({ ...f, ktp_photo: file }));
    setPreview(URL.createObjectURL(file));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setErrors({});
    const fd = new FormData();
    Object.entries(form).forEach(([k, v]) => {
      if (v !== null && v !== undefined && v !== '') fd.append(k, v);
    });
    try {
      if (initial?.id) {
        await residentApi.updateResident(initial.id, fd);
      } else {
        await residentApi.createResident(fd);
      }
      onSaved();
      onClose();
    } catch (err) {
      setErrors(err.response?.data?.errors ?? {});
    } finally {
      setLoading(false);
    }
  };

  return (
    <Modal open={open} onClose={onClose} title={initial?.id ? 'Edit Warga' : 'Tambah Warga'} maxWidth="max-w-xl">
      <form onSubmit={handleSubmit} className="space-y-4">
        <Input label="Nama Lengkap" value={form.full_name} onChange={(e) => setForm({ ...form, full_name: e.target.value })} error={errors.full_name?.[0]} required />
        <Input label="NIK" value={form.nik} onChange={(e) => setForm({ ...form, nik: e.target.value })} error={errors.nik?.[0]} required maxLength={16} />
        <Input label="No. Telepon" value={form.phone} onChange={(e) => setForm({ ...form, phone: e.target.value })} error={errors.phone?.[0]} />
        <div className="grid grid-cols-2 gap-3">
          <Select label="Jenis Kelamin" value={form.gender} onChange={(e) => setForm({ ...form, gender: e.target.value })}>
            {GENDERS.map((g) => <option key={g.value} value={g.value}>{g.label}</option>)}
          </Select>
          <Input label="Tanggal Lahir" type="date" value={form.birth_date} onChange={(e) => setForm({ ...form, birth_date: e.target.value })} error={errors.birth_date?.[0]} />
        </div>
        <Select label="Status" value={form.status} onChange={(e) => setForm({ ...form, status: e.target.value })}>
          <option value="active">Aktif</option>
          <option value="inactive">Tidak Aktif</option>
        </Select>
        <div>
          <label className="text-sm font-medium text-gray-700 block mb-1">Foto KTP</label>
          <input type="file" accept="image/jpeg,image/png" onChange={handleFile} className="text-sm text-gray-600" />
          {errors.ktp_photo && <p className="text-xs text-red-600 mt-1">{errors.ktp_photo[0]}</p>}
          {preview && (
            <img src={preview} alt="Preview KTP" className="mt-2 h-28 w-auto rounded-lg border border-gray-200 object-cover" />
          )}
        </div>
        <div className="flex justify-end gap-2 pt-2">
          <Button variant="secondary" type="button" onClick={onClose}>Batal</Button>
          <Button type="submit" loading={loading}>Simpan</Button>
        </div>
      </form>
    </Modal>
  );
}

function ResidentDetailModal({ open, onClose, resident }) {
  if (!resident) return null;
  return (
    <Modal open={open} onClose={onClose} title="Detail Warga" maxWidth="max-w-lg">
      <div className="space-y-4">
        {resident.ktp_photo_url && (
          <img src={resident.ktp_photo_url} alt="KTP" className="h-36 w-auto rounded-lg border border-gray-200 object-cover" />
        )}
        <div className="grid grid-cols-2 gap-3 text-sm">
          <div><span className="text-gray-500">Nama:</span><br /><strong>{resident.full_name}</strong></div>
          <div><span className="text-gray-500">NIK:</span><br />{resident.nik}</div>
          <div><span className="text-gray-500">Telepon:</span><br />{resident.phone ?? '-'}</div>
          <div><span className="text-gray-500">Jenis Kelamin:</span><br />{resident.gender === 'male' ? 'Laki-laki' : 'Perempuan'}</div>
          <div><span className="text-gray-500">Tanggal Lahir:</span><br />{formatDate(resident.birth_date)}</div>
          <div><span className="text-gray-500">Status:</span><br /><Badge value={resident.status} /></div>
        </div>
        {resident.current_house && (
          <div className="bg-blue-50 rounded-lg px-4 py-3 text-sm">
            <p className="font-medium text-blue-800">Menghuni Rumah {resident.current_house.house_number}</p>
            <p className="text-blue-600 text-xs">{resident.current_house.address}</p>
          </div>
        )}
      </div>
    </Modal>
  );
}

export default function ResidentsPage() {
  const [residents, setResidents] = useState([]);
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(true);
  const [formModal, setFormModal] = useState({ open: false, initial: null });
  const [detailModal, setDetailModal] = useState({ open: false, resident: null });

  const fetchResidents = () => {
    setLoading(true);
    residentApi.getResidents({ search })
      .then((res) => setResidents(res.data.data ?? []))
      .finally(() => setLoading(false));
  };

  useEffect(() => { fetchResidents(); }, [search]);

  const handleDelete = async (id) => {
    if (!window.confirm('Hapus warga ini?')) return;
    await residentApi.deleteResident(id);
    fetchResidents();
  };

  return (
    <div className="space-y-5">
      <div className="flex items-center justify-between">
        <h1 className="text-xl font-bold text-gray-900">Data Warga</h1>
        <Button onClick={() => setFormModal({ open: true, initial: null })}>
          <PlusIcon className="w-4 h-4" /> Tambah Warga
        </Button>
      </div>

      <div className="relative">
        <MagnifyingGlassIcon className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
        <input
          placeholder="Cari nama atau NIK..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="w-full pl-9 pr-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
        />
      </div>

      <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
        <table className="w-full text-sm">
          <thead className="bg-gray-50 text-gray-500 text-xs uppercase tracking-wide">
            <tr>
              <th className="px-4 py-3 text-left">Nama</th>
              <th className="px-4 py-3 text-left">NIK</th>
              <th className="px-4 py-3 text-left">Telepon</th>
              <th className="px-4 py-3 text-left">Rumah</th>
              <th className="px-4 py-3 text-left">Status</th>
              <th className="px-4 py-3"></th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {loading ? (
              <tr><td colSpan={6} className="text-center py-8 text-gray-400">Memuat data...</td></tr>
            ) : residents.length === 0 ? (
              <tr><td colSpan={6} className="text-center py-8 text-gray-400">Tidak ada data.</td></tr>
            ) : residents.map((r) => (
              <tr key={r.id} className="hover:bg-gray-50 cursor-pointer" onClick={() => setDetailModal({ open: true, resident: r })}>
                <td className="px-4 py-3 font-medium text-gray-900">{r.full_name}</td>
                <td className="px-4 py-3 text-gray-500">{r.nik}</td>
                <td className="px-4 py-3 text-gray-600">{r.phone ?? '-'}</td>
                <td className="px-4 py-3 text-gray-600">{r.current_house?.house_number ?? '-'}</td>
                <td className="px-4 py-3"><Badge value={r.status} /></td>
                <td className="px-4 py-3 text-right" onClick={(e) => e.stopPropagation()}>
                  <Button variant="secondary" className="text-xs py-1 px-2 mr-1" onClick={() => setFormModal({ open: true, initial: r })}>Edit</Button>
                  <Button variant="danger" className="text-xs py-1 px-2" onClick={() => handleDelete(r.id)}>Hapus</Button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <ResidentFormModal
        open={formModal.open}
        initial={formModal.initial}
        onClose={() => setFormModal({ open: false, initial: null })}
        onSaved={fetchResidents}
      />
      <ResidentDetailModal
        open={detailModal.open}
        resident={detailModal.resident}
        onClose={() => setDetailModal({ open: false, resident: null })}
      />
    </div>
  );
}
