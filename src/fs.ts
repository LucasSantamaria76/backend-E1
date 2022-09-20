import { readFile, writeFile } from 'fs/promises';

export const DATABASE_MY_EXPENSES = 'myExpenses.json';

export const writeExpensesFile = async (data: any) => {
  await writeFile(DATABASE_MY_EXPENSES, JSON.stringify(data));
  return null;
};

export const readExpensesFile = async () => {
  try {
    const expenses = (await readFile(DATABASE_MY_EXPENSES)).toString();

    return expenses;
  } catch (error) {
    await writeExpensesFile([]);
    return '[]';
  }
};
