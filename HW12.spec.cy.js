import { ApiHelper } from "../support/apiHelper";
import { DbHelper } from "../support/dbHelper";


describe("First suite", () => {
  let apiCategories; // Объявляем переменные на уровне describe для области видимости
  
  Cypress.Commands.add("getToken", () => {
    cy.request("POST", "/api/auth/login", {
      email: "test1@gmail.com",
      password: "12345Qq"
    }).then(res => {
      const token = res.body.token;
      cy.wrap(token).as("authToken");
    });
  });
  beforeEach(() => {
    cy.loginByAPI().then(() => { // Добавляем then() для обработки успешного входа
      ApiHelper.getCategories().then((categories) => {
        apiCategories = categories.body; // Присваиваем apiCategories внутри then()
        console.log(apiCategories);
      });
      ApiHelper.getToken().then((token) => {
        // Сохраните токен в контексте теста
        Cypress.env('authToken', token);
      });
        
      cy.getToken();

    });
    // Добавляем intercept для запроса /api/analytics/overview
    cy.intercept(
      'GET', 'http://5.189.186.217/api/analytics/overview',
      { statusCode: 200 } // Провалидируем статус-код запроса = 200
    ).as('analyticsOverview');
    cy.visit('http://5.189.186.217/overview');

    cy.wait('@analyticsOverview', { timeout: 7000 });
  });
  
  it("First", () => {
    // Перехватываем запрос POST на создание категории
cy.intercept('POST', 'http://5.189.186.217/api/category').as('createCategory');

cy.contains("Асортимент").click();
cy.contains("Додати категорію").click();
cy.get("input[type='file']").selectFile("cypress/media/hw12.jpeg", { force: true });
cy.get("[formcontrolname='name']").type("testCategory1").type('{enter}');

cy.wait('@createCategory').then((interception) => {
  const response = interception.response.body;
  const categoryId = response._id;
  cy.log(`ID созданной категории: ${categoryId}`);
  // Функция для создания позиции
  function createPosition(categoryId, name, cost) {
    const payload = {
      category: categoryId,
      name: name,
      cost: cost,
    };
    // Добавьте токен авторизации в заголовки запроса
    cy.request({
      method: 'POST',
      url: 'http://5.189.186.217/api/position',
      body: payload,
      headers: {
        Authorization: Cypress.env('authToken')
      },
    }).then((response) => {
      // Проверьте успешность создания позиции
      //expect(response.status).to.equal(201); // Измените статус кода по мере необходимости
    });
  }
  // Создайте позиции в категории
  createPosition(categoryId, "Позиция 1", 1000);
  createPosition(categoryId, "Позиция 2", 1500);


  // Перехватываем запрос POST на создание заказа
cy.intercept('POST', 'http://5.189.186.217/api/order').as('createOrder');

// создание заказа через ui
cy.contains("Додати замовлення").click();
cy.wait(2000);
cy.reload();
cy.contains("testCategory1").eq(0).click();
cy.wait(2000);
cy.get("[class='btn waves-effect wavers-light btn-small']").eq(0).click();
cy.get("[class='btn waves-effect wavers-light btn-small']").eq(1).click();
cy.get("[class='waves-effect btn grey darken-1']").click();
cy.contains("Підтвердити").click();

// Дождитесь завершения запроса на создание заказа
cy.wait('@createOrder').then((interception) => {
  const response = interception.response.body;
  const orderNumber = response.order;
  cy.log(`Номер созданного заказа: ${orderNumber}`);
  Cypress.env('orderNumber', orderNumber);
});

// Валидация фильтра заказа 
const orderNumber = Cypress.env('orderNumber');
cy.contains("Історія").click();
cy.get("[data-tooltip='Открыть фильтр']").click();
cy.get("[for='number']").type('orderNumber');
cy.wait(2000);
cy.contains("Применить фильтр").click();
cy.get("[class='material-icons']").should('be.visible');

//удаление категории через  ui 

cy.contains("Асортимент").click();
cy.contains(" testCategory1 ").click();
cy.get("[class='btn btn-small red']").click({force:true});
cy.get("[class='btn btn-small red']").click({force:true});
cy.get("[class='btn btn-small red']").click({force:true});


// DbHelper.getAllCategories().then(categories => {
//     console.log(categories);
// })
// cy.findOne({categoryId}, {collection: "categories"}).then(categories => {
//   console.log(categories);
// });

DbHelper.getCategoryByname(categoryId).then(categories => {
     console.log(categories);
     if (categories === null) {
      console.log('Категория удалена успешно');
    } else {
      console.log('Категория не удалена');
    }
});


});
  });
});


