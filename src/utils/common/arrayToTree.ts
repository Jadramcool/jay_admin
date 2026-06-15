interface TreeNode {
  id: number | string;
  pid?: number | string | null;
  children?: TreeNode[];
  [key: string]: any;
}

export function arrayToTree<T extends TreeNode>(items: T[], pid: number | string | null = null): T[] {
  const result: T[] = [];
  const map = new Map<number | string, T>();

  items.forEach((item) => {
    const node = { ...item };
    // 不要给叶子节点设置 children: []，否则 n-menu 会渲染展开箭头
    delete node.children;
    map.set(node.id, node);
  });

  items.forEach((item) => {
    const node = map.get(item.id)!;
    if (item.pid !== null && item.pid !== undefined && map.has(item.pid)) {
      const parent = map.get(item.pid)!;
      if (!parent.children) parent.children = [];
      parent.children.push(node);
    } else {
      result.push(node);
    }
  });

  return result;
}
