import { test, expect } from "@playwright/test";
import { ApiHelper } from "../helpers/apiHelper";
import { Response } from '@playwright/test';

let token: string;

test.beforeAll(async () => {
  token = await ApiHelper.getToken({
    email: process.env.EMAIL,
    password: process.env.PASSWORD,
  });
});

test.beforeEach(async ({page}) => {
  page.addInitScript((value) => {
    window.localStorage.setItem("auth-token", value);
  }, token);
  // await page.routeFromHAR('hars/categories.har', {
  //   url: '/api/category',
  //   //update: true
  // });
  await page.goto("/overview");
  // await expect(page).toHaveScreenshot('overview.png');
  // const firstCard = page.locator('.card-content').first();
  // await expect(firstCard).toHaveScreenshot('first_card.png');
  await page.context().storageState({ path: "auth.json" });
});





test('Create category and positions', async ({ page }) => {
    // Дождитесь события запроса с именем 'createCategory'
    const response = await page.waitForResponse('@createCategory');
  
    const responseBody = await response.json();
    const categoryId = responseBody._id;
    console.log(`ID созданной категории: ${categoryId}`);
  
    // Функция для создания позиции
    async function createPosition(name: string, cost: number) {
      const payload = {
        category: categoryId,
        name: name,
        cost: cost,
      };
  
      // Добавьте токен авторизации в заголовки запроса
      const data = {
        email: 'test1@gmail.com',
        password: '12345Qq',
      };
      const authToken = await ApiHelper.getToken(data);
  
      const response = await page.evaluate((payload, authToken) => {
        return fetch('http://5.189.186.217/api/position', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${authToken}`,
          },
          body: JSON.stringify(payload),
        });
      }, payload, authToken);
  
      // Вы можете добавить здесь дополнительные проверки, если это необходимо
    }
  
    // Создайте позиции в категории
    await createPosition("Позиция 1", 1000);
    await createPosition("Позиция 2", 1500);
  });
  
  // ...
  