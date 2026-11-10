import { validatePhone } from '../validatePhone.js'

describe('validatePhone', () => {
  const invalid = [
    ['empty string', '', 'Phone number is required'],
    ['whitespace only', '   ', 'Phone number is required'],
    [
      'no country code',
      '0712345678',
      'Phone number must start with a country code, e.g. +254',
    ],
    [
      'non-digits after the country code',
      '+254abc1234',
      'Phone number can only contain digits after the country code',
    ],
    ['too short', '+2547', 'Phone number must be between 8 and 15 digits'],
    [
      'too long',
      '+2547123456789012',
      'Phone number must be between 8 and 15 digits',
    ],
  ]

  it.each(invalid)('rejects %s', (_label, input, message) => {
    const result = validatePhone(input)
    expect(result.valid).toBe(false)
    expect(result.message).toBe(message)
    expect(result.value).toBe('')
  })

  const valid = [
    ['the sample Kenyan number', '+254712345678', '+254712345678'],
    ['a non-Kenyan country code', '+14155552671', '+14155552671'],
    ['spaces as separators', '+254 712 345 678', '+254712345678'],
    ['dots as separators', '+254.712.345.678', '+254712345678'],
  ]

  it.each(valid)('accepts %s', (_label, input, value) => {
    const result = validatePhone(input)
    expect(result.valid).toBe(true)
    expect(result.message).toBe('')
    expect(result.value).toBe(value)
  })
})
