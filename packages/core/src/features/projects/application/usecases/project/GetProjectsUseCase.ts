import { Project } from '../../../domain/entities/Project';
import { ProjectRepository } from '../../ports/ProjectRepository';

export class GetProjectsUseCase {
  constructor(private readonly projectRepository: ProjectRepository) {}

  async execute(): Promise<Project[]> {
    return await this.projectRepository.findAll();
  }
}
