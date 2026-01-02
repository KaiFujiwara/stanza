import {
  ProjectListItem,
  getProjectsOverview,
} from '@/infra/query/project';
import { ProjectDomainService, MAX_PROJECTS_PER_USER } from '@stanza/core';
import { useQuery } from '@tanstack/react-query';
import { useMemo, useState, useEffect } from 'react';

interface FolderTab {
  id: string;
  name: string;
  orderIndex: number;
  projectCount: number;
}

export function useProjects() {
  const [selectedFolderId, setSelectedFolderId] = useState<string | null>(null); // null (未分類), or folderId

  // React Queryでプロジェクト概要を取得
  const { data: overview, isLoading, refetch } = useQuery({
    queryKey: ['projects', 'overview'],
    queryFn: getProjectsOverview,
  });

  // フォルダタブ一覧（未分類 + 各フォルダ）
  const folderTabs: (FolderTab | { id: null; name: string; projectCount: number })[] = useMemo(() => {
    if (!overview) return [];

    const tabs: any[] = [];

    // 1. "未分類"タブ（folder_id が null のプロジェクト）
    const noFolderCount = overview.projects.filter(p => p.folderId === null).length;
    tabs.push({
      id: null,
      name: '未分類',
      projectCount: noFolderCount,
    });

    // 2. フォルダタブ（orderIndex順）
    tabs.push(...overview.folders);

    return tabs;
  }, [overview]);

  // 選択中のフォルダが削除された場合、未分類に切り替える
  useEffect(() => {
    if (!overview) return;

    // 選択中のフォルダが存在するかチェック
    if (selectedFolderId !== null) {
      const folderExists = overview.folders.some(f => f.id === selectedFolderId);
      if (!folderExists) {
        // フォルダが削除されていた場合、未分類に切り替え
        setSelectedFolderId(null);
      }
    }
  }, [overview, selectedFolderId]);

  // 選択中のフォルダに属するプロジェクト（orderIndex順）
  const filteredProjects: ProjectListItem[] = useMemo(() => {
    if (!overview) return [];

    let projects: ProjectListItem[];

    if (selectedFolderId === null) {
      // 未分類（folder_id が null）
      projects = overview.projects.filter(p => p.folderId === null);
    } else {
      // 特定のフォルダ
      projects = overview.projects.filter(p => p.folderId === selectedFolderId);
    }

    // orderIndex順にソート
    return projects.sort((a, b) => a.orderIndex - b.orderIndex);
  }, [overview, selectedFolderId]);

  // プロジェクト統計（全フォルダ含む）
  const currentCount = overview?.projects.length ?? 0;
  const canCreate = ProjectDomainService.canCreateProject(currentCount);

  return {
    overview,
    loading: isLoading,
    loadOverview: refetch,
    folderTabs,
    selectedFolderId,
    setSelectedFolderId,
    filteredProjects,
    canCreate,
    currentCount,
    maxCount: MAX_PROJECTS_PER_USER,
  };
}
