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

test("Create a category with positions", async ({page}) => {
    const client = await page.context().newCDPSession(page);
    await client.send('Performance.enable');
    const categoriesMenuItem = page
      .getByRole("listitem")
      .filter({ hasText: "Асортимент" });
    const categoriesListElements = page
      .locator("app-categories-page")
      .getByRole("link");
    const addCategoryBtn = page.getByText("Додати категорію");
    const categoryName = page.locator("#name");
    await categoriesMenuItem.click();
    await page.waitForLoadState('networkidle');
    await page.waitForLoadState('domcontentloaded');
    await page.waitForTimeout(5000);
    const allCategoryNames = await categoriesListElements.allTextContents();
    const allCategoryNamesTrimmed = allCategoryNames.map((el) => el.trim());
    const categories = await ApiHelper.getCategories(token);
    const categoryNamesFromApi = categories.map((el: any) => el.name);
    expect(allCategoryNamesTrimmed).toEqual(categoryNamesFromApi);
    await addCategoryBtn.click();
    await categoryName.fill("PW Test category");
    const fileChooserPromise = page.waitForEvent("filechooser");
    await page.getByText("Завантажити зображення").click();
    const fileChooser = await fileChooserPromise;
    expect(fileChooser.isMultiple()).toBeFalsy;
    await fileChooser.setFiles("image.jpg");
    const responsePromise = page.waitForResponse('/api/category');
    await page.getByText("Зберегти зміни").click();

  
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
    const response = await page.evaluate((payload, token) => {
        return fetch('http://5.189.186.217/api/position', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`,
          },
          body: JSON.stringify(payload),
        });
      }, payload, token);
      }
      await createPosition("Позиция 1", 1000);
      await createPosition("Позиция 2", 1500);
    });

   


    
    // const response = await responsePromise;
    // console.log(await response.json());
    // await page.waitForLoadState('networkidle');
    // let performanceMetrics = await client.send('Performance.getMetrics');
        // console.log(performanceMetrics.metrics);


  
