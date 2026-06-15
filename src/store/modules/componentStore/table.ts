import { defineStore } from "pinia";
import { TABLELAYOUT } from "@/components/Table/src/const";

export const useComponentTableStore = defineStore("table", {
  state: () => ({
    size: TABLELAYOUT.size,
  }),
  actions: {
    setSize(size: string) {
      this.size = size;
    },
  },
});

