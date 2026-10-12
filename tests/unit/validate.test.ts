import { describe, expect, it } from 'vitest';
import { checkContact, validateContact } from '../../src/lib/contact/validate';

const valid = {
  name: 'Анна',
  method: 'telegram',
  contact: '@anna_k',
  projectType: 'site',
  message: 'Нужен сайт для ремонтной компании с формой расчёта.',
  budget: '',
  consent: true,
};

describe('validateContact', () => {
  it('принимает корректную заявку и обрезает пробелы', () => {
    const r = validateContact({ ...valid, name: '  Анна  ' });
    expect(r.ok).toBe(true);
    if (r.ok) expect(r.data.name).toBe('Анна');
  });

  it('принимает согласие из обычной HTML-формы ("on")', () => {
    expect(validateContact({ ...valid, consent: 'on' }).ok).toBe(true);
  });

  it('требует обязательные поля', () => {
    const r = validateContact({});
    expect(r.ok).toBe(false);
    if (!r.ok) expect(Object.keys(r.errors).sort()).toEqual(['consent', 'message', 'method', 'name', 'projectType'].sort());
  });

  it('без согласия заявка не проходит', () => {
    const r = validateContact({ ...valid, consent: false });
    expect(r.ok).toBe(false);
    if (!r.ok) expect(r.errors.consent).toBeTruthy();
  });

  it('отклоняет неизвестные значения списков', () => {
    const r = validateContact({ ...valid, projectType: 'hack', budget: 'million', method: 'fax' });
    expect(r.ok).toBe(false);
    if (!r.ok) {
      expect(r.errors.projectType).toBeTruthy();
      expect(r.errors.budget).toBeTruthy();
      expect(r.errors.method).toBeTruthy();
    }
  });

  it('ограничивает длину описания', () => {
    expect(validateContact({ ...valid, message: 'коротко' }).ok).toBe(false);
    expect(validateContact({ ...valid, message: 'а'.repeat(3001) }).ok).toBe(false);
  });

  it('не падает на нестроковых значениях', () => {
    expect(validateContact({ ...valid, name: 42, message: { x: 1 } }).ok).toBe(false);
  });
});

describe('checkContact', () => {
  it.each([
    ['telegram', '@username'],
    ['telegram', 'https://t.me/user_name'],
    ['phone', '+7 (900) 000-00-00'],
    ['phone', '89000000000'],
    ['email', 'name@company.ru'],
  ] as const)('%s: %s — корректно', (m, v) => expect(checkContact(m, v)).toBeUndefined());

  it.each([
    ['telegram', '@ab'],
    ['telegram', 'не ник'],
    ['phone', '123'],
    ['phone', '+7 900 abc'],
    ['email', 'name@'],
  ] as const)('%s: %s — ошибка', (m, v) => expect(checkContact(m, v)).toBeTruthy());
});
