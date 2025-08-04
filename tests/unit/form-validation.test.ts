import { describe, it, expect } from 'vitest';
import { z } from 'zod';

// This is the schema from your form
const formSchema = z.object({
    links: z.array(z.object({
        platform: z.string().min(1, { message: "Platform name required" }),
        url: z.string().url({ message: "Valid URL required" })
    })).min(1, { message: "At least one link required" }),
    styleDescription: z.string()
        .min(10, { message: "Please describe your preferred style (min 10 characters)" })
        .max(500, { message: "Style description too long (max 500 characters)" }),
});

describe('Form Validation', () => {
  it('should accept valid input', () => {
    const validInput = {
      links: [
        { platform: 'Instagram', url: 'https://instagram.com/user' },
        { platform: 'LinkedIn', url: 'https://linkedin.com/in/user' }
      ],
      styleDescription: 'Minimalist design with clean lines'
    };

    expect(() => formSchema.parse(validInput)).not.toThrow();
  });

  it('should reject empty links array', () => {
    const invalidInput = {
      links: [],
      styleDescription: 'Minimalist design'
    };

    expect(() => formSchema.parse(invalidInput)).toThrow('At least one link required');
  });

  it('should reject invalid URLs', () => {
    const invalidInput = {
      links: [
        { platform: 'Instagram', url: 'not-a-url' }
      ],
      styleDescription: 'Test style description'
    };

    expect(() => formSchema.parse(invalidInput)).toThrow('Valid URL required');
  });

  it('should reject short style descriptions', () => {
    const invalidInput = {
      links: [
        { platform: 'Instagram', url: 'https://instagram.com/user' }
      ],
      styleDescription: 'Too short'
    };

    expect(() => formSchema.parse(invalidInput)).toThrow('min 10 characters');
  });
});