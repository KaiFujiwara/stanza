import { CreatePhraseUseCase } from '@/application/usecases/phrase/CreatePhraseUseCase';
import { MAX_PHRASES_PER_USER, PhraseRepository } from '@lyrics-notes/core';

describe('CreatePhraseUseCase', () => {
  let useCase: CreatePhraseUseCase;
  let mockPhraseRepository: jest.Mocked<PhraseRepository>;

  beforeEach(() => {
    mockPhraseRepository = {
      save: jest.fn().mockResolvedValue(undefined),
      findById: jest.fn(),
      delete: jest.fn(),
      countByUser: jest.fn().mockResolvedValue(0),
    } as jest.Mocked<PhraseRepository>;

    useCase = new CreatePhraseUseCase(mockPhraseRepository);

    jest.clearAllMocks();
  });

  describe('execute', () => {
    it('正常にフレーズを作成できる', async () => {
      const input = { text: '心に残る一言' };
      const result = await useCase.execute(input);

      expect(result.phrase.text).toBe('心に残る一言');
      expect(mockPhraseRepository.save).toHaveBeenCalledTimes(1);
    });

    it('メモ付きで作成できる', async () => {
      const input = { text: 'テストフレーズ', note: 'サビに使えそう' };
      const result = await useCase.execute(input);

      expect(result.phrase.note).toBe('サビに使えそう');
    });

    it('タグ付きで作成できる', async () => {
      const input = { text: 'テストフレーズ', tagIds: ['tag-1', 'tag-2'] };
      const result = await useCase.execute(input);

      expect(result.phrase.tagIds).toEqual(['tag-1', 'tag-2']);
    });

    it('上限に達していない場合は作成できる', async () => {
      mockPhraseRepository.countByUser = jest.fn().mockResolvedValue(MAX_PHRASES_PER_USER - 1);

      const input = { text: 'テストフレーズ' };
      const result = await useCase.execute(input);

      expect(result.phrase).toBeDefined();
      expect(mockPhraseRepository.save).toHaveBeenCalledTimes(1);
    });

    it('上限に達している場合はエラー', async () => {
      mockPhraseRepository.countByUser = jest.fn().mockResolvedValue(MAX_PHRASES_PER_USER);

      const input = { text: 'テストフレーズ' };

      await expect(useCase.execute(input)).rejects.toThrow();
      expect(mockPhraseRepository.save).not.toHaveBeenCalled();
    });

    it('無効なテキストの場合エラー', async () => {
      const input = { text: '' };

      await expect(useCase.execute(input)).rejects.toThrow();
      expect(mockPhraseRepository.save).not.toHaveBeenCalled();
    });
  });
});
