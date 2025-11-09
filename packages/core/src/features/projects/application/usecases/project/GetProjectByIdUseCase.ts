import { Project } from '../../../domain/entities/Project';
import { ProjectRepository } from '../../ports/ProjectRepository';

export class GetProjectByIdUseCase {
  constructor(private readonly projectRepository: ProjectRepository) {}

  async execute(id: string): Promise<Project | null> {
    return await this.projectRepository.findById(id);
  }
}
