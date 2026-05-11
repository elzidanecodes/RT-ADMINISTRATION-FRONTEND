const colors = {
  paid: 'bg-green-100 text-green-800',
  unpaid: 'bg-red-100 text-red-800',
  partial: 'bg-yellow-100 text-yellow-800',
  occupied: 'bg-blue-100 text-blue-800',
  vacant: 'bg-gray-100 text-gray-700',
  active: 'bg-green-100 text-green-800',
  inactive: 'bg-gray-100 text-gray-500',
  security: 'bg-indigo-100 text-indigo-800',
  cleaning: 'bg-teal-100 text-teal-800',
};

const labels = {
  paid: 'Lunas',
  unpaid: 'Belum Bayar',
  partial: 'Sebagian',
  occupied: 'Dihuni',
  vacant: 'Kosong',
  active: 'Aktif',
  inactive: 'Tidak Aktif',
  security: 'Keamanan',
  cleaning: 'Kebersihan',
};

export default function Badge({ value }) {
  const key = value?.toLowerCase();
  return (
    <span className={`inline-block px-2 py-0.5 rounded-full text-xs font-medium ${colors[key] ?? 'bg-gray-100 text-gray-700'}`}>
      {labels[key] ?? value}
    </span>
  );
}
