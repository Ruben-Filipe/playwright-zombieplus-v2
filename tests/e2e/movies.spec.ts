import { test } from '../support';
import data from '../support/fixtures/movies.json';
import { executeSQL } from '../support/database';

const EMAIL = 'admin@zombieplus.com';
const PASSWORD = 'pwd123';

test.beforeEach(async ({ login }) => {
    await login.visit();
    await login.login(EMAIL, PASSWORD);
    await login.verifyUserIsLoggedIn('Admin');
});

test('deve poder cadastrar um novo filme', async ({ movies }) => {
    const movie = data.create;
    const successMessage = 'Cadastro realizado com sucesso!';
    
    await executeSQL(`DELETE FROM public.movies WHERE title = '${movie.title}';`);

    await movies.openRegisterForm();
    await movies.createMovie(movie);
    await movies.toast.verifyMessage(successMessage);
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
