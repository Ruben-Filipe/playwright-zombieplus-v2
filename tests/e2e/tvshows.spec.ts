import { test } from '../support';
import data from '../support/fixtures/tvshows.json';
import { executeSQL } from '../support/database';

const EMAIL = 'admin@zombieplus.com';
const PASSWORD = 'pwd123';

test.beforeAll(async () => {
    await executeSQL('DELETE FROM public.tvshows;');
});

test.beforeEach(async ({ login, tvshows }) => {
    await login.visit();
    await login.login(EMAIL, PASSWORD);
    await login.verifyUserIsLoggedIn('Admin');

    await tvshows.visit();
});

test('deve poder cadastrar uma nova série', async ({ tvshows }) => {
    const tvshow = data.create;
    const successMessage = `A série '${tvshow.title}' foi adicionada ao catálogo.`;

    await tvshows.openRegisterForm();
    await tvshows.createTvshow(tvshow);
    await tvshows.popup.verifyMessage(successMessage);
});

test('deve poder remover uma série', async ({ tvshows, api }) => {
    const tvshow = data.toRemove;
    const successMessage = 'Série removida com sucesso.';

    await api.createTvshow(tvshow);

    await tvshows.visit();
    await tvshows.removeTvshow(tvshow.title);
    await tvshows.popup.verifyMessage(successMessage);
});

test('não deve cadastrar quando o título é duplicado', async ({ tvshows, api }) => {
    const tvshow = data.duplicate;
    const errorMessage = `O título '${tvshow.title}' já consta em nosso catálogo. Por favor, verifique se há necessidade de atualizações ou correções para este item.`;

    await api.createTvshow(tvshow);

    await tvshows.openRegisterForm();
    await tvshows.createTvshow(tvshow);
    await tvshows.popup.verifyMessage(errorMessage);
});

test('deve realizar busca pelo termo zumbi', async ({ tvshows, api }) => {
    const search = data.search;

    for (const tvshow of search.data) {
        await api.createTvshow(tvshow);
    }

    await tvshows.visit();
    await tvshows.search(search.input);
    await tvshows.verifyTvshowsAreDisplayed(search.outputs);
});

test('não deve cadastrar quando os campos obrigatórios não são preenchidos', async ({ tvshows }) => {
    await tvshows.openRegisterForm();
    await tvshows.submitForm();

    await tvshows.verifyAlertMessage([
        'Campo obrigatório',
        'Campo obrigatório',
        'Campo obrigatório',
        'Campo obrigatório',
        'Campo obrigatório (apenas números)'
    ]);
});
