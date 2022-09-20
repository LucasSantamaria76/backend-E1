import { readExpensesFile, writeExpensesFile } from './fs';
import { Command } from 'commander';
import chalk from 'chalk';
import { argv } from 'process';
import prompt from 'prompts';
import { format } from 'date-fns';

interface ICreateExpense {
  id: number;
  description: string;
  amount: number;
  date: string;
}

class Expense {
  id: number;
  description: string;
  amount: number;
  date: string;

  constructor({ id, description, amount, date }: ICreateExpense) {
    this.id = id;
    this.description = description;
    this.amount = amount;
    this.date = date;
  }
}

const generateID = async () => {
  const exp = await getExpenses();
  const oldID = exp.map((el: Expense) => el.id);

  return !!oldID.length ? +Math.max(...oldID) + 1 : 1;
};

const getExpenses = async () => {
  const exp = await readExpensesFile();
  return JSON.parse(exp);
};

const getExpense = async (ID: number) => {
  const expenses = await getExpenses();
  return expenses.find((exp: Expense) => exp.id === ID);
};

const createExpense = async (exp: Expense) => {
  const expenses = await getExpenses();
  expenses.push(exp);
  await writeExpensesFile(expenses);
  return exp;
};

const deleteExpense = async (ID: number) => {
  const expenses = await getExpenses();
  if (!expenses) throw 'No se encontro el ID del gasto';
  const newExpenses = expenses.filter((exp: Expense) => exp.id !== ID);
  await writeExpensesFile(newExpenses);
};

const updateExpense = async (ID: number, amount: number) => {
  const expenses = await getExpenses();
  const expense = expenses.find((exp: Expense) => exp.id === ID);
  if (!expense) throw 'No se encontro el ID del gasto';

  const index = expenses.indexOf(expense);
  expenses[index] = { ...expense, amount };

  await writeExpensesFile(expenses);
};

const cli = new Command();

cli.name('expenses-cli').description('Expenses App by Lucas').version('1.0.0');
cli
  .command('nucba')
  .description('first command')
  .action(() => {
    console.log(chalk.red('Bienvenido a Expenses App by Lucas'));
  });

cli
  .command('gastos')
  .description('Expenses App by Lucas')
  .action(async () => {
    const { action } = await prompt({
      type: 'select',
      name: 'action',
      message: 'Elige una opción',
      choices: [
        {
          title: 'Agregar nuevo gasto',
          value: 'C',
        },
        {
          title: 'Ver listado de gastos',
          value: 'R',
        },
        {
          title: 'Modificar un gasto',
          value: 'U',
        },
        {
          title: 'Eliminar un gasto',
          value: 'D',
        },
      ],
    });

    switch (action) {
      case 'C':
        const { description } = await prompt({
          type: 'text',
          name: 'description',
          message: 'Ingresa una descripción',
        });
        const { amount } = await prompt({
          type: 'number',
          name: 'amount',
          message: 'Ingresa el importe',
        });

        try {
          const newID = await generateID();
          await createExpense(
            new Expense({
              id: newID,
              description,
              amount,
              date: format(new Date(), 'dd-MM-yyyy'),
            })
          );
          return console.log(chalk.green('Gasto creado con exito, felicitaciones'));
        } catch (error) {
          return console.log(chalk.red('Error a crear el gasto'));
        }

      case 'R':
        const data = await getExpenses();
        console.table(data);
        return console.log(
          chalk.bgBlue('Total de gastos: '),
          chalk.red('$' + data.reduce((acc: number, act: ICreateExpense) => (acc += act.amount), 0))
        );

      case 'U':
        const { ID } = await prompt({
          type: 'number',
          name: 'ID',
          message: 'Ingresa el id del gasto a modificar',
        });

        try {
          const exist = await getExpense(ID);
          if (!exist) throw 'No se encontro el ID del gasto';

          const { newAmount } = await prompt({
            type: 'number',
            name: 'newAmount',
            message: 'Ingresa el nuevo importe',
          });

          await updateExpense(ID, newAmount);
          return console.log(chalk.green('Gasto modificado con exito, felicitaciones'));
        } catch (error) {
          return console.log(chalk.red(error));
        }
      case 'D':
        const { id } = await prompt({
          type: 'number',
          name: 'id',
          message: 'Ingresa el id del gasto a eliminar',
        });

        try {
          await deleteExpense(id);

          return console.log(chalk.green('El gasto se elimino con exito'));
        } catch (error) {
          return console.log(chalk.red(error));
        }
    }
  });

cli.parse(argv);
