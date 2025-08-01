import { type TreeItem } from "@/types"
import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}


export function converFilesToTreeItems(files: { [path: string]: string }): TreeItem[] {
  interface TreeNode {
    [key: string]: TreeNode | null;
  }

  const tree: TreeNode = {};

  const sortedFiles = Object.keys(files).sort();

  for (const filePath of sortedFiles) {
    const parts = filePath.split('/');
    let current = tree;

    for (let i = 0; i < parts.length; i++) {
      const part = parts[i];
      const isLastPart = i === parts.length - 1;
      
      if (isLastPart) {
        // This is a file, mark it as null
        current[part] = null;
      } else {
        // This is a directory
        if (!current[part]) {
          current[part] = {};
        }
        current = current[part] as TreeNode;
      }
    }

  }

  function convertNode(node: TreeNode, name?: string): TreeItem[] | TreeItem {
    const entries = Object.entries(node);

    if (entries.length === 0) {
      return name || '';
    }
    const children: TreeItem[] = [];

    for (const [key, value] of entries) {
      if (value === null) {
        children.push(key);
      } else {
        const subTree = convertNode(value, key);
        if (Array.isArray(subTree)) {
          children.push([key, ...subTree]);
        } else {
          children.push([key, subTree]);
        }
      }
    }

    return children;
  }

  const result = convertNode(tree);
  return Array.isArray(result) ? result : [result];
}