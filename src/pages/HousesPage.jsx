import { useEffect, useState } from 'react';
import * as houseApi from '../api/houseApi';
import * as residentApi from '../api/residentApi';
import Badge from '../components/ui/Badge';
import Button from '../components/ui/Button';
import Modal from '../components/ui/Modal';
import Input from '../components/ui/Input';
import Select from '../components/ui/Select';
import { formatDate } from '../utils/format';
import { PlusIcon, MagnifyingGlassIcon } from '@heroicons/react/24/outline';

function HouseFormModal({ open, onClose, onSaved, initial }) {
  const [form, setForm] = useState({ house_number: '', address: '', status: 'vacant' });
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState({});

  useEffect(() => {
    setForm(initial ?? { house_number: '', address: '', status: 'vacant' });
    setErrors({});
  }, [initial, open]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setErrors({});
    try {
      if (initial?.id) {
        await houseApi.updateHouse(initial.id, form);
      } else {
        await houseApi.createHouse(form);
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
    <Modal open={open} onClose={onClose} title={initial?.id ? 'Edit Rumah' : 'Tambah Rumah'}>
      <form onSubmit={handleSubmit} className="space-y-4">
        <Input
          label="Nomor Rumah"
          value={form.house_number}
          onChange={(e) => setForm({ ...form, house_number: e.target.value })}
          error={errors.house_number?.[0]}
          required
        />
        <Input
          label="Alamat"
          value={form.address}
          onChange={(e) => setForm({ ...form, address: e.target.value })}
          error={errors.address?.[0]}
        />
        <Select
          label="Status"
          value={form.status}
          onChange={(e) => setForm({ ...form, status: e.target.value })}
        >
          <option value="vacant">Kosong</option>
          <option value="occupied">Dihuni</option>
        </Select>
        <div className="flex justify-end gap-2 pt-2">
          <Button variant="secondary" type="button" onClick={onClose}>Batal</Button>
          <Button type="submit" loading={loading}>Simpan</Button>
        </div>
      </form>
    </Modal>
  );
}

function AssignModal({ open, onClose, house, onSaved }) {
  const [residents, setResidents] = useState([]);
  const [residentId, setResidentId] = useState('');
  const [startDate, setStartDate] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    if (!open) return;
    residentApi.getResidents({ per_page: 100 }).then((res) => setResidents(res.data.data ?? []));
    setResidentId('');
    setStartDate('');
    setError('');
  }, [open]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    try {
      await houseApi.assignResident(house.id, { resident_id: residentId, start_date: startDate });
      onSaved();
      onClose();
    } catch (err) {
      setError(err.response?.data?.message ?? 'Gagal menetapkan warga');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Modal open={open} onClose={onClose} title={`Tetapkan Warga — Rumah ${house?.house_number}`}>
      <form onSubmit={handleSubmit} className="space-y-4">
        {error && <p className="text-sm text-red-600">{error}</p>}
        <Select label="Pilih Warga" value={residentId} onChange={(e) => setResidentId(e.target.value)} required>
          <option value="">-- Pilih --</option>
          {residents.map((r) => (
            <option key={r.id} value={r.id}>{r.full_name} ({r.nik})</option>
          ))}
        </Select>
        <Input
          label="Tanggal Mulai"
          type="date"
          value={startDate}
          onChange={(e) => setStartDate(e.target.value)}
          required
        />
        <div className="flex justify-end gap-2 pt-2">
          <Button variant="secondary" type="button" onClick={onClose}>Batal</Button>
          <Button type="submit" loading={loading}>Tetapkan</Button>
        </div>
      </form>
    </Modal>
  );
}

function UnassignModal({ open, onClose, house, resident, onSaved }) {
  const [endDate, setEndDate] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    setEndDate('');
    setError('');
  }, [open]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    try {
      await houseApi.unassignResident(house.id, { resident_id: resident.id, end_date: endDate });
      onSaved();
      onClose();
    } catch (err) {
      setError(err.response?.data?.message ?? 'Gagal');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Modal open={open} onClose={onClose} title="Cabut Penghuni">
      <form onSubmit={handleSubmit} className="space-y-4">
        {error && <p className="text-sm text-red-600">{error}</p>}
        <p className="text-sm text-gray-600">
          Cabut <strong>{resident?.full_name}</strong> dari Rumah <strong>{house?.house_number}</strong>?
        </p>
        <Input
          label="Tanggal Keluar"
          type="date"
          value={endDate}
          onChange={(e) => setEndDate(e.target.value)}
          required
        />
        <div className="flex justify-end gap-2 pt-2">
          <Button variant="secondary" type="button" onClick={onClose}>Batal</Button>
          <Button variant="danger" type="submit" loading={loading}>Cabut</Button>
        </div>
      </form>
    </Modal>
  );
}

function HouseDetailModal({ open, onClose, houseId, onAssign, onUnassign }) {
  const [house, setHouse] = useState(null);

  useEffect(() => {
    if (!open || !houseId) return;
    houseApi.getHouse(houseId).then((res) => setHouse(res.data.data));
  }, [open, houseId]);

  const activeResidents = house?.residents?.filter((r) => r.pivot?.is_active) ?? [];
  const historyResidents = house?.residents?.filter((r) => !r.pivot?.is_active) ?? [];

  return (
    <Modal open={open} onClose={onClose} title={`Detail Rumah ${house?.house_number ?? ''}`} maxWidth="max-w-2xl">
      {!house ? (
        <p className="text-sm text-gray-400">Memuat...</p>
      ) : (
        <div className="space-y-5">
          <div className="grid grid-cols-2 gap-3 text-sm">
            <div><span className="text-gray-500">Nomor:</span> <strong>{house.house_number}</strong></div>
            <div><span className="text-gray-500">Status:</span> <Badge value={house.status} /></div>
            <div className="col-span-2"><span className="text-gray-500">Alamat:</span> {house.address ?? '-'}</div>
          </div>

          <div>
            <div className="flex items-center justify-between mb-2">
              <h3 className="text-sm font-semibold text-gray-700">Penghuni Aktif</h3>
              <Button variant="secondary" className="text-xs py-1 px-2" onClick={() => onAssign(house)}>+ Tetapkan</Button>
            </div>
            {activeResidents.length === 0 ? (
              <p className="text-xs text-gray-400">Tidak ada penghuni aktif.</p>
            ) : (
              <div className="space-y-2">
                {activeResidents.map((r) => (
                  <div key={r.id} className="flex items-center justify-between bg-gray-50 rounded-lg px-3 py-2 text-sm">
                    <div>
                      <p className="font-medium">{r.full_name}</p>
                      <p className="text-xs text-gray-500">Sejak {formatDate(r.pivot?.start_date)}</p>
                    </div>
                    <Button variant="danger" className="text-xs py-1 px-2" onClick={() => onUnassign(house, r)}>Cabut</Button>
                  </div>
                ))}
              </div>
            )}
          </div>

          {historyResidents.length > 0 && (
            <div>
              <h3 className="text-sm font-semibold text-gray-700 mb-2">Riwayat Penghuni</h3>
              <div className="space-y-1">
                {historyResidents.map((r) => (
                  <div key={`${r.id}-${r.pivot?.start_date}`} className="text-xs text-gray-500 flex justify-between bg-gray-50 rounded px-3 py-1.5">
                    <span>{r.full_name}</span>
                    <span>{formatDate(r.pivot?.start_date)} — {formatDate(r.pivot?.end_date)}</span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      )}
    </Modal>
  );
}

export default function HousesPage() {
  const [houses, setHouses] = useState([]);
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(true);
  const [formModal, setFormModal] = useState({ open: false, initial: null });
  const [detailModal, setDetailModal] = useState({ open: false, houseId: null });
  const [assignModal, setAssignModal] = useState({ open: false, house: null });
  const [unassignModal, setUnassignModal] = useState({ open: false, house: null, resident: null });

  const fetchHouses = () => {
    setLoading(true);
    houseApi.getHouses({ search })
      .then((res) => setHouses(res.data.data ?? []))
      .finally(() => setLoading(false));
  };

  useEffect(() => { fetchHouses(); }, [search]);

  const openEdit = (house) => setFormModal({ open: true, initial: house });
  const openDetail = (house) => setDetailModal({ open: true, houseId: house.id });
  const openAssign = (house) => { setDetailModal({ open: false, houseId: null }); setAssignModal({ open: true, house }); };
  const openUnassign = (house, resident) => { setDetailModal({ open: false, houseId: null }); setUnassignModal({ open: true, house, resident }); };

  const handleDelete = async (id) => {
    if (!window.confirm('Hapus rumah ini?')) return;
    await houseApi.deleteHouse(id);
    fetchHouses();
  };

  return (
    <div className="space-y-5">
      <div className="flex items-center justify-between">
        <h1 className="text-xl font-bold text-gray-900">Data Rumah</h1>
        <Button onClick={() => setFormModal({ open: true, initial: null })}>
          <PlusIcon className="w-4 h-4" /> Tambah Rumah
        </Button>
      </div>

      <div className="relative">
        <MagnifyingGlassIcon className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
        <input
          placeholder="Cari nomor atau alamat..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="w-full pl-9 pr-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
        />
      </div>

      <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
        <table className="w-full text-sm">
          <thead className="bg-gray-50 text-gray-500 text-xs uppercase tracking-wide">
            <tr>
              <th className="px-4 py-3 text-left">No. Rumah</th>
              <th className="px-4 py-3 text-left">Alamat</th>
              <th className="px-4 py-3 text-left">Status</th>
              <th className="px-4 py-3 text-left">Penghuni</th>
              <th className="px-4 py-3"></th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {loading ? (
              <tr><td colSpan={5} className="text-center py-8 text-gray-400">Memuat data...</td></tr>
            ) : houses.length === 0 ? (
              <tr><td colSpan={5} className="text-center py-8 text-gray-400">Tidak ada data.</td></tr>
            ) : houses.map((h) => (
              <tr key={h.id} className="hover:bg-gray-50 cursor-pointer" onClick={() => openDetail(h)}>
                <td className="px-4 py-3 font-semibold text-gray-900">{h.house_number}</td>
                <td className="px-4 py-3 text-gray-600">{h.address ?? '-'}</td>
                <td className="px-4 py-3"><Badge value={h.status} /></td>
                <td className="px-4 py-3 text-gray-600">{h.active_residents_count ?? 0} orang</td>
                <td className="px-4 py-3 text-right" onClick={(e) => e.stopPropagation()}>
                  <Button variant="secondary" className="text-xs py-1 px-2 mr-1" onClick={() => openEdit(h)}>Edit</Button>
                  <Button variant="danger" className="text-xs py-1 px-2" onClick={() => handleDelete(h.id)}>Hapus</Button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <HouseFormModal
        open={formModal.open}
        initial={formModal.initial}
        onClose={() => setFormModal({ open: false, initial: null })}
        onSaved={fetchHouses}
      />
      <HouseDetailModal
        open={detailModal.open}
        houseId={detailModal.houseId}
        onClose={() => setDetailModal({ open: false, houseId: null })}
        onAssign={openAssign}
        onUnassign={openUnassign}
      />
      <AssignModal
        open={assignModal.open}
        house={assignModal.house}
        onClose={() => setAssignModal({ open: false, house: null })}
        onSaved={() => { fetchHouses(); setDetailModal({ open: false, houseId: null }); }}
      />
      <UnassignModal
        open={unassignModal.open}
        house={unassignModal.house}
        resident={unassignModal.resident}
        onClose={() => setUnassignModal({ open: false, house: null, resident: null })}
        onSaved={() => { fetchHouses(); setDetailModal({ open: false, houseId: null }); }}
      />
    </div>
  );
}
