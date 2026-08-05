import { test as base, expect } from '@playwright/test';
import { Login } from './actions/Login';
import { Landing } from './actions/Landing';
import { Movies } from './actions/Movies';

type AppFixtures = {
  landing: Landing;
  login: Login;
  movies: Movies;
};

export const test = base.extend<AppFixtures>({
  landing: async ({ page }, use) => {
    await use(new Landing(page));
  },
  login: async ({ page }, use) => {
    await use(new Login(page));
  },
  movies: async ({ page }, use) => {
    await use(new Movies(page));
  },
});

export { expect };
