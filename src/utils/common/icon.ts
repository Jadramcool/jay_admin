import { h } from "vue";
import { NIcon } from "naive-ui";
import { Icon } from "@iconify/vue";

export function renderIcon(icon: string, props: Recordable = {}) {
  return () =>
    h(NIcon, props, {
      default: () => h(Icon, { icon }),
    });
}

