import { describe, expect, it } from 'vitest';
import { contactInput } from '../src/modules/contact/contact.schemas.js';
describe('contact validation', () => {
  it('accepts a valid message', () => {
    expect(
      contactInput.safeParse({
        body: {
          name: 'Ada Lovelace',
          email: 'ada@example.com',
          subject: 'Project enquiry',
          message: 'I would like to discuss a new project with you.',
        },
      }).success,
    ).toBe(true);
  });
  it('rejects unknown fields and short messages', () => {
    expect(
      contactInput.safeParse({
        body: {
          name: 'A',
          email: 'bad',
          subject: 'Hi',
          message: 'short',
          admin: true,
        },
      }).success,
    ).toBe(false);
  });
});
