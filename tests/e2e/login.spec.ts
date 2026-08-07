import { test } from '../support';

const EMAIL = 'admin@zombieplus.com';
const PASSWORD = 'pwd123';

test.beforeEach(async ({ login }) => {
    await login.visit();
});

test('deve logar como administrador', async ({ login }) => {
    await login.login(EMAIL, PASSWORD);
    await login.verifyUserIsLoggedIn('Admin');
});

test('não deve logar com senha incorreta', async ({ login }) => {
    const message = 'Ocorreu um erro ao tentar efetuar o login. Por favor, verifique suas credenciais e tente novamente.';

    await login.login(EMAIL, 'abc123');
    await login.popup.verifyMessage(message);
});

test('não deve logar quando o email é inválido', async ({ login }) => {
    await login.login('www.papito.com.br', PASSWORD);
    await login.verifyAlertMessage('Email incorreto');
});

test('não deve logar quando o email não é preenchido', async ({ login }) => {
    await login.login('', PASSWORD);
    await login.verifyAlertMessage('Campo obrigatório');
});

test('não deve logar quando a senha não é preenchida', async ({ login }) => {
    await login.login(EMAIL, '');
    await login.verifyAlertMessage('Campo obrigatório');
});

test('não deve logar quando nenhum campo é preenchido', async ({ login }) => {
    await login.login('', '');
    await login.verifyAlertMessage(['Campo obrigatório', 'Campo obrigatório']);
});
