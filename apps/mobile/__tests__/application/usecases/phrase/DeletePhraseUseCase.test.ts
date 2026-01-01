import { DeletePhraseUseCase } from '@/application/usecases/phrase/DeletePhraseUseCase';
import { EntityId, Phrase, PhraseRepository } from '@lyrics-notes/core';

describe('DeletePhraseUseCase', () => {
  let useCase: DeletePhraseUseCase;
  let mockPhraseRepository: jest.Mocked<PhraseRepository>;

  beforeEach(() => {
    mockPhraseRepository = {
      save: jest.fn(),
      findById: jest.fn(),
      delete: jest.fn().mockResolvedValue(undefined),
      countByUser: jest.fn(),
    } as jest.Mocked<PhraseRepository>;

    useCase = new DeletePhraseUseCase(mockPhraseRepository);

    jest.clearAllMocks();
  });

  describe('execute', () => {
    it('正常にフレーズを削除できる', async () => {
      const phraseId = EntityId.generate();
      const phrase = Phrase.create('テストフレーズ');
      mockPhraseRepository.findById = jest.fn().mockResolvedValue(phrase);

      await useCase.execute({ id: phraseId });

      expect(mockPhraseRepository.delete).toHaveBeenCalledTimes(1);
      expect(mockPhraseRepository.delete).toHaveBeenCalledWith(phraseId);
    });

    it('フレーズが存在しない場合エラー', async () => {
      const phraseId = EntityId.generate();
      mockPhraseRepository.findById = jest.fn().mockResolvedValue(null);

      await expect(useCase.execute({ id: phraseId })).rejects.toThrow();
      expect(mockPhraseRepository.delete).not.toHaveBeenCalled();
    });

    it('無効なIDの場合エラー', async () => {
      await expect(useCase.execute({ id: 'invalid-id' })).rejects.toThrow();
      expect(mockPhraseRepository.findById).not.toHaveBeenCalled();
      expect(mockPhraseRepository.delete).not.toHaveBeenCalled();
    });
  });
});
