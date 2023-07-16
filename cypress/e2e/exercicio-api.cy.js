/// <reference types="cypress" />
import contrato from '../contracts/produtos.contract'
const faker = require('faker-br');

describe('User Actions', function () {
     let user;
     let userId;
     let token;

     before(() => {
          cy.token('beltranoo@qa.com.br', 'teste').then(tkn => {
               token = tkn;
          });

          user = {
               nome: faker.name.firstName(),
               email: faker.internet.email(),
               password: faker.internet.password(),
               administrador: faker.random.boolean().toString()
          };
     });

     it('Deve cadastrar um usuário com sucesso', function () {
          cy.createUser(user, token).then(id => {
              userId = id;
          });
      });

     it('Deve editar um usuário previamente cadastrado', function () {
          cy.request({
               method: 'PUT',
               url: `usuarios/${userId}`,
               headers: {
                    Authorization: `Bearer ${token}`,
                    'User-Id': userId
               },
               body: {
                    ...user,
                    password: faker.internet.password()
               }
          }).then((response) => {
               expect(response.status).to.equal(200);
               expect(response.body).to.have.property("message", "Registro alterado com sucesso");
          });
     });

     it('Deve listar usuários cadastrados', () => {
          cy.request({
               method: 'GET',
               url: 'usuarios',
               headers: { Authorization: `Bearer ${token}` }
          })
               .its('body')
               .then((response) => {
                    expect(response).to.have.property('usuarios').that.is.an('array');
                    expect(response.usuarios.length).to.be.greaterThan(0);
               });
     });

     it('Deve validar um usuário com email inválido', () => {
          cy.request({
               method: 'POST',
               url: 'usuarios',
               headers: { Authorization: `Bearer ${token}` },
               body: {
                    nome: 'Jane Doe',
                    email: 'janedoeexample',
                    password: 'password456'
               },
               failOnStatusCode: false
          }).then((response) => {
               expect(response.status).to.equal(400);
               expect(response.body).to.have.property('email');
          });
     });

     it('Deve validar contrato de usuários', () => {
          cy.request({
               method: 'GET',
               url: 'usuarios',
               headers: { Authorization: `Bearer ${token}` }
          })
               .its('body')
               .then((response) => {
                    contrato.validateAsync(response);
               });
     });

     it('Deve deletar um usuário previamente cadastrado', () => {
          cy.request({
               method: 'DELETE',
               url: `usuarios/${userId}`,
               headers: { Authorization: `Bearer ${token}` }
          }).then((response) => {
               expect(response.status).to.equal(200);
               expect(response.body).to.have.property('message', 'Usuário excluído com sucesso');
          });
     });

});
