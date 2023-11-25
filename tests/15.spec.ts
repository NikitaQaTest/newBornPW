import { test, expect } from "@playwright/test";
import { ApiHelper } from "../helpers/apiHelper";
import { Response } from '@playwright/test';

let token: string;
let categoryId: string;

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

  test("Create a category with positions", async ({page}) => {
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
      cost: 100,
      category: categoryId
    };
    const response1 = await ApiHelper.createPosition(token, data);
    console.log(response1);

    // //добавить заказ
    // await page.getByRole('link', { name: 'Додати замовлення' }).click();
    // await page.locator('app-order-categories div').nth(3).click();
    // await page.getByRole('button', { name: 'Додати' }).click();
    // await page.getByRole('button', { name: 'Додати' }).click();
    // await page.getByRole('button', { name: 'Завершити' }).click();
    // await page.getByRole('button', { name: 'Підтвердити' }).click();
  });


  
