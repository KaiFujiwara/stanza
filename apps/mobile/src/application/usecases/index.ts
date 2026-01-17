/**
 * UseCase Factory
 * すべてのUseCaseのインスタンスを生成・提供する
 * 依存性注入（DI）のエントリーポイント
 */

import { folderRepository } from '@/infra/repositories/FolderRepository';
import { genreRepository } from '@/infra/repositories/GenreRepository';
import { phraseRepository } from '@/infra/repositories/PhraseRepository';
import { projectRepository } from '@/infra/repositories/ProjectRepository';
import { tagRepository } from '@/infra/repositories/TagRepository';

// Folder UseCases
import { CreateFolderUseCase } from './folder/CreateFolderUseCase';
import { UpdateFolderUseCase } from './folder/UpdateFolderUseCase';
import { DeleteFolderUseCase } from './folder/DeleteFolderUseCase';
import { ReorderFoldersUseCase } from './folder/ReorderFoldersUseCase';

// Genre UseCases
import { CreateGenreUseCase } from './genre/CreateGenreUseCase';
import { UpdateGenreUseCase } from './genre/UpdateGenreUseCase';
import { DeleteGenreUseCase } from './genre/DeleteGenreUseCase';

// Phrase UseCases
import { CreatePhraseUseCase } from './phrase/CreatePhraseUseCase';
import { UpdatePhraseUseCase } from './phrase/UpdatePhraseUseCase';
import { DeletePhraseUseCase } from './phrase/DeletePhraseUseCase';

// Project UseCases
import { CreateProjectUseCase } from './project/CreateProjectUseCase';
import { UpdateProjectUseCase } from './project/UpdateProjectUseCase';
import { DeleteProjectUseCase } from './project/DeleteProjectUseCase';

// Tag UseCases
import { CreateTagUseCase } from './tag/CreateTagUseCase';
import { UpdateTagUseCase } from './tag/UpdateTagUseCase';
import { DeleteTagUseCase } from './tag/DeleteTagUseCase';

// Auth UseCases
import { DeleteAccountUseCase } from './auth/DeleteAccountUseCase';

// Folder UseCases
export const createFolderUseCase = new CreateFolderUseCase(folderRepository);
export const updateFolderUseCase = new UpdateFolderUseCase(folderRepository);
export const deleteFolderUseCase = new DeleteFolderUseCase(folderRepository);
export const reorderFoldersUseCase = new ReorderFoldersUseCase(folderRepository);

// Genre UseCases
export const createGenreUseCase = new CreateGenreUseCase(genreRepository);
export const updateGenreUseCase = new UpdateGenreUseCase(genreRepository);
export const deleteGenreUseCase = new DeleteGenreUseCase(genreRepository);

// Phrase UseCases
export const createPhraseUseCase = new CreatePhraseUseCase(phraseRepository);
export const updatePhraseUseCase = new UpdatePhraseUseCase(phraseRepository);
export const deletePhraseUseCase = new DeletePhraseUseCase(phraseRepository);

// Project UseCases
export const createProjectUseCase = new CreateProjectUseCase(projectRepository, genreRepository, folderRepository);
export const updateProjectUseCase = new UpdateProjectUseCase(projectRepository, genreRepository, folderRepository);
export const deleteProjectUseCase = new DeleteProjectUseCase(projectRepository);

// Tag UseCases
export const createTagUseCase = new CreateTagUseCase(tagRepository);
export const updateTagUseCase = new UpdateTagUseCase(tagRepository);
export const deleteTagUseCase = new DeleteTagUseCase(tagRepository);

// Auth UseCases
export const deleteAccountUseCase = new DeleteAccountUseCase();
