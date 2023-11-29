import { test, expect } from "@playwright/test";
import { ApiHelper } from "../helpers/apiHelper";
import { Response } from '@playwright/test';

let token: string;
let categoryId: string;
let order: string;




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
  await page.goto("/overview");
});

  test("CRUD category", async ({page}) => {
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
    await addCategoryBtn.click();
    await categoryName.fill("PW Test category");
    const fileChooserPromise = page.waitForEvent("filechooser");
    await page.getByText("Завантажити зображення").click();
    const fileChooser = await fileChooserPromise;
    // expect(fileChooser.isMultiple()).toBeFalsy;
    await fileChooser.setFiles("image.jpg");
    // Interception
    const responsePromise = page.waitForResponse('/api/category');
    await page.getByText("Зберегти зміни").click();
    const response = await responsePromise;
    const parsed = await response.json();
    categoryId = parsed._id;
  
  
    await page.waitForLoadState('networkidle');
    const data = {
      name: "position1",
      cost: 10,
      category: categoryId
    };
    const response1 = await ApiHelper.createPosition(token, data);
    console.log(response1);

    // добавить заказ
    await page.getByRole('link', { name: 'Додати замовлення' }).click();
    await page.getByRole('heading', { name: 'PW Test category' }).click();
    await page.getByRole('button', { name: 'Додати' }).click();
    await page.getByRole('button', { name: 'Завершити' }).click();
    await page.getByRole('button', { name: 'Підтвердити' }).click();
    await new Promise(resolve => setTimeout(resolve, 5000));
    await page.getByRole('button', { name: 'Історія' }).click();

    // order 
    const responsePromise2 = page.waitForResponse('/api/order');
    await page.getByText("Історія").click();
    const response2 = await responsePromise;
    const parsed2 = await response.json();
    order = parsed2._id;
    console.log(order);


    //filter
    await page.getByRole('link', { name: 'Історія' }).click();
    await page.getByRole('button', { name: 'filter_list' }).click();
    await page.getByText('Номер замовлення').click();
    await page.getByLabel('Номер замовлення').fill(order);
    await page.getByRole('button', { name: 'Применить фильтр' }).click();
    

    //delCategori
    await page.getByRole('link', { name: 'Асортимент' }).click();
    await page.getByRole('link', { name: 'PW Test category' }).click();
    page.once('dialog', dialog => {
      console.log(`Dialog message: ${dialog.message()}`);
      dialog.dismiss().catch(() => {});
    });
    await page.getByRole('button', { name: 'delete' }).click();


  });

  


  
