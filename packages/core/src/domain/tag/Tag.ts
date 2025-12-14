import { TagName } from './vo/TagName';
import { TagColor } from './vo/TagColor';
import { EntityId } from '../shared/EntityId';

export class Tag {
  constructor(
    public readonly id: string,
    public name: string,
    public color?: string,
    public readonly createdAt: Date = new Date(),
    public updatedAt: Date = new Date()
  ) {
    TagName.validate(name);
    if (color !== undefined) {
      TagColor.validate(color);
    }
  }

  static create(
    name: string,
    color?: string
  ): Tag {
    const validatedName = TagName.validate(name);
    const validatedColor = TagColor.validate(color);
    const now = new Date();
    return new Tag(
      EntityId.generate(),
      validatedName,
      validatedColor,
      now,
      now
    );
  }

  updateName(name: string): void {
    const validatedName = TagName.validate(name);
    this.name = validatedName;
    this.updatedAt = new Date();
  }

  updateColor(color?: string): void {
    const validatedColor = TagColor.validate(color);
    this.color = validatedColor;
    this.updatedAt = new Date();
  }

}
