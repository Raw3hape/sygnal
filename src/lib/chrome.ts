export function shouldHideTopbar(onboardingComplete: boolean): boolean {
  return !onboardingComplete;
}

export function shouldHideTabbar(onboardingComplete: boolean, pathname: string): boolean {
  if (!onboardingComplete) {
    return true;
  }
  return pathname.startsWith("/lesson") || pathname.startsWith("/exam");
}
