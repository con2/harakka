// lint-test.ts
const raw: any = { id: 123 }; // <-- `any`
const user: { id: number } = raw; // unsafe assignment when the rule is ON

user.id = 2;
