export interface NavLink {
  name: string;
  href: string;
}

export const navLinks: NavLink[] = [
  { name: "Home", href: "#home" },
  { name: "Filosofi", href: "#filosofi" },
  { name: "Peralatan", href: "#peralatan" },
  { name: "Spot Terbaik", href: "#destinasi" },
];

export const loadingStatus = [
    'Menghubungkan ke server...',
    'Mengunduh aset visual...',
    'Menyusun tata letak...',
    'Mengoptimalkan performa...',
    'Hampir siap...',
    'Selesai!'
  ];