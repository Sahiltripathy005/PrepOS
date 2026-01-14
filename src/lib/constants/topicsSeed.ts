// src/lib/constants/topicsSeed.ts

export type TopicCategory = "DSA" | "APTI";

export type TopicSeedNode = {
  name: string;
  importanceScore: number;
  children?: TopicSeedNode[];
};

export type TopicSeedCategoryTree = {
  category: TopicCategory;
  roots: TopicSeedNode[];
};

export const TOPICS_SEED: TopicSeedCategoryTree[] = [
  {
    category: "DSA",
    roots: [
      { name: "Arrays", importanceScore: 95 },
      { name: "Strings", importanceScore: 90 },
      { name: "Hashing", importanceScore: 88 },
      { name: "Two Pointers", importanceScore: 80 },
      { name: "Prefix Sum", importanceScore: 82 },
      { name: "Binary Search", importanceScore: 90 },
      { name: "Recursion", importanceScore: 78 },
      { name: "Backtracking", importanceScore: 75 },
      { name: "Linked List", importanceScore: 70 },
      {
        name: "Stack/Queue",
        importanceScore: 78,
        children: [
          { name: "Stack", importanceScore: 78 },
          { name: "Queue", importanceScore: 76 },
          { name: "Monotonic Stack", importanceScore: 72 },
        ],
      },
      {
        name: "Trees",
        importanceScore: 92,
        children: [
          { name: "Traversals", importanceScore: 88 },
          { name: "LCA", importanceScore: 82 },
          { name: "Binary Tree Patterns", importanceScore: 86 },
        ],
      },
      {
        name: "BST",
        importanceScore: 80,
        children: [
          { name: "Insert/Search/Delete", importanceScore: 78 },
          { name: "BST Validation", importanceScore: 74 },
        ],
      },
      {
        name: "Heap",
        importanceScore: 80,
        children: [
          { name: "Priority Queue", importanceScore: 78 },
          { name: "Top K Patterns", importanceScore: 76 },
        ],
      },
      {
        name: "Graphs",
        importanceScore: 92,
        children: [
          { name: "BFS", importanceScore: 88 },
          { name: "DFS", importanceScore: 88 },
        ],
      },
      {
        name: "DP Basics",
        importanceScore: 96,
        children: [
          { name: "1D DP", importanceScore: 90 },
          { name: "2D DP", importanceScore: 88 },
          { name: "DP on Subsequences", importanceScore: 86 },
        ],
      },
    ],
  },
  {
    category: "APTI",
    roots: [
      { name: "Percentages", importanceScore: 90 },
      { name: "Ratio & Proportion", importanceScore: 88 },
      { name: "Time & Work", importanceScore: 92 },
      { name: "Time & Distance", importanceScore: 90 },
      { name: "Profit & Loss", importanceScore: 88 },
      { name: "Mixtures & Alligation", importanceScore: 80 },
      { name: "Permutation & Combination", importanceScore: 85 },
      { name: "Probability", importanceScore: 82 },
      { name: "Number System", importanceScore: 86 },
      { name: "Puzzles", importanceScore: 78 },
    ],
  },
];
