import { Tag, MAX_TAGS_PER_USER, TagDomainService, TagName, DomainError, ErrorCode, TagRepository } from '@lyrics-notes/core';
import { toUserMessage } from '@/lib/errors';

export type CreateTagInput = {
  name: string;
  color?: string;
};

export type CreateTagOutput = {
  tag: Tag;
};

export class CreateTagUseCase {
  constructor(private readonly tagRepository: TagRepository) {}

  async execute(input: CreateTagInput): Promise<CreateTagOutput> {
    try {
      // 作成上限チェック
      const currentCount = await this.tagRepository.countByUser();
      if (currentCount >= MAX_TAGS_PER_USER) {
        throw new DomainError(
          ErrorCode.MAX_COUNT_EXCEEDED,
          'Tag count limit exceeded',
          { entity: 'tag', maxCount: MAX_TAGS_PER_USER, currentCount }
        );
      }

      const validatedName = TagName.validate(input.name);

      // タグ名の重複チェック
      const exists = await this.tagRepository.existsByName(validatedName);
      TagDomainService.ensureUniqueTagName(validatedName, exists);

      const tag = Tag.create(input.name, input.color);
      await this.tagRepository.save(tag);

      return { tag };
    } catch (error) {
      const { userMessage, devMessage, stack, details } = toUserMessage(error);
      console.error('[CreateTagUseCase] Error:', { devMessage, stack, details });
      throw new Error(userMessage);
    }
  }
}
