import { UpdatePhraseUseCase } from '@/application/usecases/phrase/UpdatePhraseUseCase';
import { EntityId, Phrase, PhraseRepository } from '@lyrics-notes/core';

describe('UpdatePhraseUseCase', () => {
  let useCase: UpdatePhraseUseCase;
  let mockPhraseRepository: jest.Mocked<PhraseRepository>;

  beforeEach(() => {
    mockPhraseRepository = {
      save: jest.fn().mockResolvedValue(undefined),
      findById: jest.fn(),
      delete: jest.fn(),
      countByUser: jest.fn(),
    } as jest.Mocked<PhraseRepository>;

    useCase = new UpdatePhraseUseCase(mockPhraseRepository);

    jest.clearAllMocks();
  });

  describe('execute', () => {
    it('フレーズのテキストを更新できる', async () => {
      const phraseId = EntityId.generate();
      const phrase = Phrase.create('元のテキスト');
      mockPhraseRepository.findById = jest.fn().mockResolvedValue(phrase);

      await useCase.execute({ id: phraseId, text: '新しいテキスト' });

      expect(mockPhraseRepository.save).toHaveBeenCalledWith(
        expect.objectContaining({ _text: '新しいテキスト' })
      );
    });

    it('フレーズのメモを更新できる', async () => {
      const phraseId = EntityId.generate();
      const phrase = Phrase.create('テスト');
      mockPhraseRepository.findById = jest.fn().mockResolvedValue(phrase);

      await useCase.execute({ id: phraseId, note: '新しいメモ' });

      expect(mockPhraseRepository.save).toHaveBeenCalledWith(
        expect.objectContaining({ _note: '新しいメモ' })
      );
    });

    it('フレーズのタグを更新できる', async () => {
      const phraseId = EntityId.generate();
      const phrase = Phrase.create('テスト');
      mockPhraseRepository.findById = jest.fn().mockResolvedValue(phrase);

      await useCase.execute({ id: phraseId, tagIds: ['tag-1', 'tag-2'] });

      expect(mockPhraseRepository.save).toHaveBeenCalledWith(
        expect.objectContaining({ _tagIds: ['tag-1', 'tag-2'] })
      );
    });

    it('複数の項目を同時に更新できる', async () => {
      const phraseId = EntityId.generate();
      const phrase = Phrase.create('元のテキスト');
      mockPhraseRepository.findById = jest.fn().mockResolvedValue(phrase);

      await useCase.execute({
        id: phraseId,
        text: '新しいテキスト',
        note: 'メモ',
        tagIds: ['tag-1'],
      });

      expect(mockPhraseRepository.save).toHaveBeenCalledWith(
        expect.objectContaining({
          _text: '新しいテキスト',
          _note: 'メモ',
          _tagIds: ['tag-1'],
        })
      );
    });

    it('フレーズが存在しない場合エラー', async () => {
      mockPhraseRepository.findById = jest.fn().mockResolvedValue(null);

      await expect(
        useCase.execute({ id: EntityId.generate(), text: '新しいテキスト' })
      ).rejects.toThrow();
      expect(mockPhraseRepository.save).not.toHaveBeenCalled();
    });

    it('undefinedの項目は更新されない', async () => {
      const phraseId = EntityId.generate();
      const phrase = Phrase.create('元のテキスト', { note: '元のメモ' });
      mockPhraseRepository.findById = jest.fn().mockResolvedValue(phrase);

      await useCase.execute({ id: phraseId, text: '新しいテキスト' });

      expect(mockPhraseRepository.save).toHaveBeenCalledWith(
        expect.objectContaining({
          _text: '新しいテキスト',
          _note: '元のメモ', // 変わっていない
        })
      );
    });
  });
});
