export async function sleep(sleepTimeMs: number) {
  return new Promise((resolve) => {
    setTimeout(() => resolve(true), sleepTimeMs);
  });
}
