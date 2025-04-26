export type FileTreeItem = {
  path: string;
  type: "file" | "directory";
  size?: number;
  last_modified?: string;
  children?: FileTreeItem[];
  change_type?: "add" | "modify" | "delete";
  additions_count?: number;
  deletions_count?: number;
  is_present_in_commit?: boolean;
};
