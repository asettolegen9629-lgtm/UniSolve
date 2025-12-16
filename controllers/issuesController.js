// controllers/issuesController.js
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

// Функция для получения всех записей из таблицы Issue
export const getIssues = async (req, res) => {
  try {
    const issues = await prisma.issue.findMany();
    res.json(issues); // Отправляем ответ с данными
  } catch (error) {
    res.status(500).send(error.message); // Если ошибка, отправляем ошибку
  }
};

// Функция для создания новой записи в таблице Issue
export const createIssue = async (req, res) => {
  const { title, status } = req.body;
  try {
    const newIssue = await prisma.issue.create({
      data: {
        title,
        status,
      },
    });
    res.json(newIssue); // Отправляем созданную запись
  } catch (error) {
    res.status(500).send(error.message); // Если ошибка, отправляем ошибку
  }
};

// Не забудь закрыть соединение с базой данных после выполнения всех запросов
prisma.$disconnect();