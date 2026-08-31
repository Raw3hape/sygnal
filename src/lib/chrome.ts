export function shouldHideAppChrome(onboardingComplete: boolean, pathname: string): boolean {
  if (!onboardingComplete) {
    return true;
  }
  return pathname.startsWith("/lesson") || pathname.startsWith("/exam");
}
