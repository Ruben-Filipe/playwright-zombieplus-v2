import { test as base, expect, request } from '@playwright/test';
import { Api } from './api';
import { Login } from './actions/Login';
import { Landing } from './actions/Landing';
import { Movies } from './actions/Movies';

type AppFixtures = {
  landing: Landing;
  login: Login;
  movies: Movies;
  api: Api;
};

export const test = base.extend<AppFixtures>({
  api: async ({ }, use) => {
    const apiContext = await request.newContext({
      baseURL: process.env.API_BASE_URL ?? 'http://localhost:3333',
    });

    const api = new Api(apiContext);
    await api.setToken();

    await use(api);
    await apiContext.dispose();
  },
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
