// eslint-disable-next-line @typescript-eslint/no-explicit-any
export default function clsx(...args: any[]): string {
  const classes: string[] = [];

  for (const arg of args) {
    if (!arg) continue;

    if (typeof arg === "string") {
      classes.push(arg);
    } else if (Array.isArray(arg)) {
      const deep_classes = clsx(...arg);
      classes.push(deep_classes);
    } else if (typeof arg === "object" && arg !== null) {
      for (const key in arg) {
        if (arg[key]) {
          classes.push(key);
        }
      }
    } else if (args === null) {
      continue;
    }
  }

  return classes.join(" ");
}
