import { test } from '../support';
import data from '../support/fixtures/movies.json';
import { executeSQL } from '../support/database';

const EMAIL = 'admin@zombieplus.com';
const PASSWORD = 'pwd123';
const SUCCESS_MESSAGE = 'Cadastro realizado com sucesso!';

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

    await movies.openRegisterForm();
    await movies.createMovie(movie);
    await movies.toast.verifyMessage(SUCCESS_MESSAGE);
});

test('não deve cadastrar quando o título é duplicado', async ({ movies, api }) => {
    const movie = data.duplicate;
    const errorMessage = 'Este conteúdo já encontra-se cadastrado no catálogo';

    await api.setToken(EMAIL, PASSWORD);
    await api.createMovie(movie);

    await movies.openRegisterForm();
    await movies.createMovie(movie);
    await movies.toast.verifyMessage(errorMessage);
});

test('não deve cadastrar quando os campos obrigatórios não são preenchidos', async ({ movies }) => {
    await movies.openRegisterForm();
    await movies.submitForm();

    await movies.verifyAlertMessage([
        'Por favor, informe o título.',
        'Por favor, informe a sinopse.',
        'Por favor, informe a empresa distribuidora.',
        'Por favor, informe o ano de lançamento.']);
});
