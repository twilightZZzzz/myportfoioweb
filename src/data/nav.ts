export const mainNav = [
  { href: '/services', label: 'Услуги' },
  { href: '/projects', label: 'Проекты' },
  { href: '/about', label: 'Обо мне' },
  { href: '/contact', label: 'Контакты' },
];

export const isActive = (current: string, href: string) => current === href || current.startsWith(href + '/');
