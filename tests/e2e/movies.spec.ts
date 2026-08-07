import { test } from '../support';
import data from '../support/fixtures/movies.json';
import { executeSQL } from '../support/database';

const EMAIL = 'admin@zombieplus.com';
const PASSWORD = 'pwd123';

test.beforeAll(async () => {
    await executeSQL('DELETE FROM public.movies;');
});

test.beforeEach(async ({ login }) => {
    await login.visit();
    await login.login(EMAIL, PASSWORD);
    await login.verifyUserIsLoggedIn('Admin');
});

test('deve poder cadastrar um novo filme', async ({ movies }) => {
    const movie = data.create;
    const successMessage = `O filme '${movie.title}' foi adicionado ao catálogo.`;

    await movies.openRegisterForm();
    await movies.createMovie(movie);
    await movies.popup.verifyMessage(successMessage);
});

test('deve poder remover um filme', async ({ movies, api }) => {
    const movie = data.toRemove;
    const successMessage = 'Filme removido com sucesso.';

    await api.createMovie(movie);
    
    await movies.visit();
    await movies.removeMovie(movie.title);
    await movies.popup.verifyMessage(successMessage);
});

test('não deve cadastrar quando o título é duplicado', async ({ movies, api }) => {
    const movie = data.duplicate;
    const errorMessage = `O título '${movie.title}' já consta em nosso catálogo. Por favor, verifique se há necessidade de atualizações ou correções para este item.`;

    await api.createMovie(movie);

    await movies.openRegisterForm();
    await movies.createMovie(movie);
    await movies.popup.verifyMessage(errorMessage);
});

test('não deve cadastrar quando os campos obrigatórios não são preenchidos', async ({ movies }) => {
    await movies.openRegisterForm();
    await movies.submitForm();

    await movies.verifyAlertMessage([
        'Campo obrigatório',
        'Campo obrigatório',
        'Campo obrigatório',
        'Campo obrigatório'])
});
