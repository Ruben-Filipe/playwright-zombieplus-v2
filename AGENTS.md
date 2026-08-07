# Action Object Model Template Specification

## Purpose

This specification defines the standard structure and conventions for all action object classes in the project. It is intended to be followed by both developers and AI code generators to ensure consistency, readability, and maintainability.

---

# 1. File Naming

## Rules

* Every action object class must be placed in its own file.
* The file name must follow this convention:

```text
ActionName.ts
```

## Examples

```text
Login.ts
Home.ts
Settings.ts
UserProfile.ts
```

---

# 2. Locator Strategy

When creating locators, always use the following priority:

1. **Playwright user-facing locators**

   * `getByRole`
   * `getByLabel`
   * `getByText`
   * `getByPlaceholder`
   * `getByAltText`
   * `getByTitle`
   * `getByTestId` (when applicable)

2. **CSS selectors**

3. **XPath** (last resort only)

## Rules

* Prefer Playwright's user-facing locators whenever possible.
* Use CSS selectors only when user-facing locators cannot uniquely identify an element.
* Use XPath only when neither Playwright locators nor CSS selectors provide a suitable solution.
* Locators should be stable, readable, and resistant to UI changes.

---

# 3. Locator Declaration

## Rules

* All action-specific locators must be declared at the beginning of the class.
* All fixed locators should be declared as `readonly` and public by default.
* All fixed locators must be initialized inside the constructor.
* Locators must never be reassigned after construction.

## Example

```ts
export class Login {
    readonly usernameInput: Locator;
    readonly passwordInput: Locator;
    readonly loginButton: Locator;
    readonly leadFlowModalHeader: Locator;

    constructor(private readonly page: Page) {
        this.usernameInput = page.getByLabel("Username");
        this.passwordInput = page.getByLabel("Password");
        this.loginButton = page.getByRole("button", { name: "Login" });
        this.leadFlowModalHeader = page.getByRole('heading', { name: 'Lead Flow' });
    }
}
```

---

# 4. Generic (Dynamic) Locators

## Rules

* Generic (parameterized) locators must be declared immediately after the constructor.
* Generic locators should be implemented as `private` methods returning a `Locator`.
* Use generic locators only when a locator depends on one or more parameters.
* Fixed locators must never be implemented as generic locators.

## Example

```ts
private row(name: string): Locator {
    return this.page.getByRole("row", { name });
}

private menuItem(name: string): Locator {
    return this.page.getByRole("menuitem", { name });
}
```

---

# 5. Inline Locator Rule

## Rules

* Do not create locators directly inside business methods.
* Every reusable locator must be declared as a class member.
* If a locator requires parameters, implement it as a generic locator method.
* Inline locators are only acceptable when they are truly dynamic and cannot reasonably be reused.

### ✅ Correct

```ts
private readonly saveButton: Locator;

constructor(private readonly page: Page) {
    this.saveButton = page.getByRole("button", { name: "Save" });
}

async save(): Promise<void> {
    await this.saveButton.click();
}
```

### ✅ Correct (Dynamic)

```ts
private menuItem(name: string): Locator {
    return this.page.getByRole("menuitem", { name });
}

async selectMenuItem(name: string): Promise<void> {
    await this.menuItem(name).click();
}
```

### ❌ Incorrect

```ts
async save(): Promise<void> {
    await this.page.getByRole("button", { name: "Save" }).click();
}
```

---

# 6. Single Definition Rule

A locator should be defined only once within an action object.

If multiple methods interact with the same element, they must all reference the same declared locator instead of creating duplicate locator definitions.

---

# 7. Business-Meaningful Methods

## Rules

* Public methods should represent user actions or business operations.
* Methods should hide implementation details of the UI.
* Avoid exposing low-level interactions such as clicking individual controls.

### Good Examples

```ts
async login(username: string, password: string)

async searchForProduct(productName: string)

async addProductToCart(productName: string)

async removeUser(userName: string)

async submitOrder()
```

### Avoid

```ts
async clickLoginButton()

async fillUsername()

async clickSearch()

async clickSave()

async typePassword()
```

---

# 8. Action Objects via Playwright Fixtures

## Rules

* Action objects should be provided as Playwright fixtures instead of being constructed inside test files.
* Define action object fixtures in `tests/support/index.ts`.
* Fixture names should be short and expressive, for example `movies`, `landing`, or `login`.
* Use fixtures in test functions via destructured parameters:

```ts
test('this is the test description', async ({ movies }) => {
  await movies.openRegisterForm();
});
```
* Do not declare local action object variables like `let moviesAction: Movies` or instantiate action objects in test setup code.

## Example

```ts
// tests/support/index.ts
export const test = base.extend({
  movies: async ({ page }, use) => {
    await use(new Movies(page));
  },
});
```

```ts
// tests/e2e/movies.spec.ts
import { test, expect } from '../support';

test('deve poder cadastrar um novo filme', async ({ movies }) => {
  await movies.openRegisterForm();
  await movies.createMovie(data.create);
  await movies.popup.verifyMessage(SUCCESS_MESSAGE);
});
```

---

# 8. API Layer and Request Fixtures

## Rules

* API requests must be centralized in `tests/support/api/index.ts`.
* Each API request must be implemented inside an `Api` class instead of being scattered across action objects or specs.
* API methods must be exclusive to the `Api` class; action classes must only contain UI interactions and never implement API request logic.
* The `Api` class must receive the Playwright request context in its constructor.
* The shared test fixture setup in `tests/support/index.ts` should expose an `api` fixture and create a request context configured with the API base URL.
* API methods should be business meaningful and reusable, such as `createLead`, `setToken`, and `createMovie`.
* Specs should use the `api` fixture instead of calling `request.post` directly.
* UI actions should stay focused on browser interactions; if a test needs API setup, it should call the `api` fixture from the spec.

## Example

```ts
// tests/support/api/index.ts
export class Api {

  constructor(private readonly request: APIRequestContext) {}

  async createLead(name: string, email: string): Promise<void> {
    const response = await this.request.post('/leads', {
      data: { name, email }
    });

    expect(response.ok()).toBeTruthy();
  }
}
```

# 9. Navigation

Each action object should expose a single `visit()` method.

## Rules

* `visit()` should be the last public method in the class.
* This is a hard rule and must not be violated.
* If a new public method is added later, move `visit()` to the bottom again.
* It is responsible for navigating directly to the page represented by the action object.
* There should only be one `visit()` method per action object.

## Example

```ts
async visit(): Promise<void> {
    await this.page.goto("/login");
}
```

---

# 10. Standard Class Layout

Every action object must follow the exact structure below.

```text
Imports

export class ActionName {

    // 1. Private readonly locators

    // 2. Constructor

    // 3. Private generic (dynamic) locators

    // 4. Public business-meaningful methods

    // 5. Public visit() method

}
```

Maintaining this layout across all action objects ensures consistency, improves readability, and enables AI code generation to produce predictable, maintainable, and project-compliant implementations.

---

# 11. Reuse in Specs

## Rules

* Repeated setup steps across tests should be centralized in `beforeEach` or helper functions.
* Action objects should be initialized once per test and reused throughout that test.
* Avoid repeating `visit()` or common navigation steps inside every test when the same page is exercised.
* Prefer a shared setup block for common action initialization and preconditions.

## Example

```ts
let loginAction: Login;

test.beforeEach(async ({ page }) => {
    loginAction = new Login(page);
    await loginAction.visit();
});
```
