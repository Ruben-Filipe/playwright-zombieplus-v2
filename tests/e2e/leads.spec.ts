import { faker } from '@faker-js/faker';
import { expect, test } from '../support';

const SUCCESS_MESSAGE = 'Agradecemos por compartilhar seus dados conosco. Em breve, nossa equipe entrará em contato!';

let fullName: string;
let email: string;

test.beforeEach(async ({ landing }) => {
  fullName = faker.person.fullName();
  email = faker.internet.email({ firstName: fullName.toLowerCase() });

  await landing.visit();
  await landing.openLeadModal();
});

test('deve cadastrar um lead na fila de espera', async ({ landing }) => {
  await landing.submitLeadForm(fullName, email);
  await landing.toast.verifyMessage(SUCCESS_MESSAGE);
});

test('não deve cadastrar quando o email que já existe', async ({ request, landing }) => {
  const duplicateMessage = 'O endereço de e-mail fornecido já está registrado em nossa fila de espera.';

  const response = await request.post('http://localhost:3333/leads', {
    data: {
      name: fullName,
      email
    }
  });

  expect(response.ok()).toBeTruthy();

  await landing.submitLeadForm(fullName, email);
  await landing.toast.verifyMessage(duplicateMessage);
});

test('não deve cadastrar com email incorreto', async ({ landing }) => {
  await landing.submitLeadForm(fullName, 'papito.com.br');
  await landing.verifyAlertMessage('Email incorreto');
});

test('não deve cadastrar quando o nome não é preenchido', async ({ landing }) => {
  await landing.submitLeadForm('', email);
  await landing.verifyAlertMessage('Campo obrigatório');
});

test('não deve cadastrar quando o email não é preenchido', async ({ landing }) => {
  await landing.submitLeadForm(fullName, '');
  await landing.verifyAlertMessage('Campo obrigatório');
});

test('não deve cadastrar quando nenhum campo é preenchido', async ({ landing }) => {
  await landing.submitLeadForm('', '');
  await landing.verifyAlertMessage(['Campo obrigatório', 'Campo obrigatório']);
});
