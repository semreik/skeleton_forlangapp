export default function logger(...args: unknown[]): void {
  if (__DEV__) {
    console.log(...args);
  }
}
