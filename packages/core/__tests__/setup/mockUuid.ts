export let mockUuidCounter = 0;

export const resetMockUuidCounter = () => {
  mockUuidCounter = 0;
};

jest.mock('uuid', () => ({
  v4: jest.fn(() => {
    mockUuidCounter++;
    return `550e8400-e29b-41d4-a716-${String(mockUuidCounter).padStart(12, '0')}`;
  }),
  validate: jest.fn((value: string) => {
    const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
    return uuidRegex.test(value);
  }),
}));
