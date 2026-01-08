import MoodEntry from "../models/MoodEntry.js";
import User from "../models/Users.js";
import { Op } from "sequelize";
import getUserByToken from "../helpers/get-user-by-token.js";
import { getToken } from "../helpers/verify-token.js";

export class MoodController {
    // Obter a entrada de humor do usuário para a data atual
    static async getLatest(req, res) {
      const userId = req.user.id;
      // Data atual no formato YYYY-MM-DD
      const today = new Date().toISOString().split("T")[0];

      try {
        const moodEntry = await MoodEntry.findOne({
          where: { userId, entryDate: today },
        });

        if (!moodEntry) {
          return res.status(404).json({ message: "No mood entry found for today" });
        }

        return res.status(200).json({
          data: moodEntry,
        });
      } catch (error) {
        return res.status(500).json({ message: error.message });
      }
    }
  // Criar uma nova entrada de humor
  static async create(req, res) {
    const { mood, feelings, notes, sleepHours, entryDate } = req.body;
    const token = getToken(req);

    const user = await getUserByToken(token);
    const userId = user.id;

    // Validações
    if (!mood || !feelings || !notes || !sleepHours) {
      return res.status(400).json({
        message: "Mood, feelings, notes, and sleep hours are required",
      });
    }

    // Validar mood
    const validMoods = ["Very Happy", "Happy", "Neutral", "Sad", "Very Sad"];
    if (!validMoods.includes(mood)) {
      return res.status(400).json({
        message:
          "Invalid mood. Must be one of: Very Happy, Happy, Neutral, Sad, Very Sad",
      });
    }

    // Validar feelings
    if (
      !Array.isArray(feelings) ||
      feelings.length === 0 ||
      feelings.length > 3
    ) {
      return res.status(400).json({
        message: "Feelings must be an array with 1 to 3 items",
      });
    }

    // Validar sleepHours
    const validSleepHours = [
      "9+ hours",
      "7-8 hours",
      "5-6 hours",
      "3-4 hours",
      "0-2 hours",
    ];
    if (!validSleepHours.includes(sleepHours)) {
      return res.status(400).json({
        message:
          "Invalid sleep hours. Must be one of: 9+ hours, 7-8 hours, 5-6 hours, 3-4 hours, 0-2 hours",
      });
    }

    try {
      const date = entryDate || new Date().toISOString().split("T")[0];

      // Verificar se já existe uma entrada para este dia
      const existingEntry = await MoodEntry.findOne({
        where: { userId, entryDate: date },
      });

      if (existingEntry) {
        return res.status(409).json({
          message: "You already have a mood entry for this date",
        });
      }

      const moodEntry = await MoodEntry.create({
        userId,
        mood,
        feelings,
        notes: notes || null,
        sleepHours,
        entryDate: date,
      });

      return res.status(201).json({
        message: "Mood entry created successfully",
        data: moodEntry,
      });
    } catch (error) {
      return res.status(500).json({ message: error.message });
    }
  }

  // Obter todas as entradas de humor do usuário
  static async getAll(req, res) {
    const userId = req.user.id;

    try {
      const moodEntries = await MoodEntry.findAll({
        where: { userId },
        order: [["entryDate", "DESC"]],
      });

      return res.status(200).json({
        message: "Mood entries retrieved successfully",
        data: moodEntries,
      });
    } catch (error) {
      return res.status(500).json({ message: error.message });
    }
  }

  // Obter uma entrada específica por ID
  static async getById(req, res) {
    const { id } = req.params;
    const userId = req.user.id;

    try {
      const moodEntry = await MoodEntry.findOne({
        where: { id, userId },
      });

      if (!moodEntry) {
        return res.status(404).json({ message: "Mood entry not found" });
      }

      return res.status(200).json({
        message: "Mood entry retrieved successfully",
        data: moodEntry,
      });
    } catch (error) {
      return res.status(500).json({ message: error.message });
    }
  }

  // Obter entradas por período (mês, semana, etc)
  static async getByDateRange(req, res) {
    const userId = req.user.id;
    const { startDate, endDate } = req.query;

    if (!startDate || !endDate) {
      return res.status(400).json({
        message: "Start date and end date are required",
      });
    }

    try {
      const moodEntries = await MoodEntry.findAll({
        where: {
          userId,
          entryDate: {
            [Op.between]: [startDate, endDate],
          },
        },
        order: [["entryDate", "DESC"]],
      });

      return res.status(200).json({
        message: "Mood entries retrieved successfully",
        data: moodEntries,
      });
    } catch (error) {
      return res.status(500).json({ message: error.message });
    }
  }

  // Atualizar uma entrada de humor
  static async update(req, res) {
    const { id } = req.params;
    const userId = req.user.id;
    const { mood, feelings, notes, sleepHours } = req.body;

    try {
      const moodEntry = await MoodEntry.findOne({
        where: { id, userId },
      });

      if (!moodEntry) {
        return res.status(404).json({ message: "Mood entry not found" });
      }

      // Validar mood se fornecido
      if (mood) {
        const validMoods = [
          "Very Happy",
          "Happy",
          "Neutral",
          "Sad",
          "Very Sad",
        ];
        if (!validMoods.includes(mood)) {
          return res.status(400).json({
            message:
              "Invalid mood. Must be one of: Very Happy, Happy, Neutral, Sad, Very Sad",
          });
        }
      }

      // Validar feelings se fornecido
      if (feelings) {
        if (
          !Array.isArray(feelings) ||
          feelings.length === 0 ||
          feelings.length > 3
        ) {
          return res.status(400).json({
            message: "Feelings must be an array with 1 to 3 items",
          });
        }
      }

      // Validar sleepHours se fornecido
      if (sleepHours) {
        const validSleepHours = [
          "Less than 4 hours",
          "4-6 hours",
          "7-8 hours",
          "9+ hours",
        ];
        if (!validSleepHours.includes(sleepHours)) {
          return res.status(400).json({
            message:
              "Invalid sleep hours. Must be one of: Less than 4 hours, 4-6 hours, 7-8 hours, 9+ hours",
          });
        }
      }

      await moodEntry.update({
        mood: mood || moodEntry.mood,
        feelings: feelings || moodEntry.feelings,
        notes: notes !== undefined ? notes : moodEntry.notes,
        sleepHours: sleepHours || moodEntry.sleepHours,
      });

      return res.status(200).json({
        message: "Mood entry updated successfully",
        data: moodEntry,
      });
    } catch (error) {
      return res.status(500).json({ message: error.message });
    }
  }

  // Deletar uma entrada de humor
  static async delete(req, res) {
    const { id } = req.params;
    const userId = req.user.id;

    try {
      const moodEntry = await MoodEntry.findOne({
        where: { id, userId },
      });

      if (!moodEntry) {
        return res.status(404).json({ message: "Mood entry not found" });
      }

      await moodEntry.destroy();

      return res.status(200).json({
        message: "Mood entry deleted successfully",
      });
    } catch (error) {
      return res.status(500).json({ message: error.message });
    }
  }

  // Obter estatísticas do humor do usuário
  static async getStats(req, res) {
    const userId = req.user.id;
    const { period } = req.query; // 'week', 'month', 'year'

    try {
      let dateFrom = new Date();

      switch (period) {
        case "week":
          dateFrom.setDate(dateFrom.getDate() - 7);
          break;
        case "month":
          dateFrom.setMonth(dateFrom.getMonth() - 1);
          break;
        case "year":
          dateFrom.setFullYear(dateFrom.getFullYear() - 1);
          break;
        default:
          dateFrom.setMonth(dateFrom.getMonth() - 1); // default to last month
      }

      const moodEntries = await MoodEntry.findAll({
        where: {
          userId,
          entryDate: {
            [Op.gte]: dateFrom.toISOString().split("T")[0],
          },
        },
        order: [["entryDate", "ASC"]],
      });

      // Calcular estatísticas
      const stats = {
        totalEntries: moodEntries.length,
        moodDistribution: {},
        commonFeelings: {},
        sleepDistribution: {},
        averageMood: 0,
      };

      // Mapear moods para valores numéricos
      const moodValues = {
        "Very Sad": 1,
        Sad: 2,
        Neutral: 3,
        Happy: 4,
        "Very Happy": 5,
      };

      let moodSum = 0;

      moodEntries.forEach((entry) => {
        // Mood distribution
        stats.moodDistribution[entry.mood] =
          (stats.moodDistribution[entry.mood] || 0) + 1;

        // Average mood
        moodSum += moodValues[entry.mood];

        // Common feelings
        entry.feelings.forEach((feeling) => {
          stats.commonFeelings[feeling] =
            (stats.commonFeelings[feeling] || 0) + 1;
        });

        // Sleep distribution
        stats.sleepDistribution[entry.sleepHours] =
          (stats.sleepDistribution[entry.sleepHours] || 0) + 1;
      });

      if (moodEntries.length > 0) {
        stats.averageMood = (moodSum / moodEntries.length).toFixed(2);
      }

      return res.status(200).json({
        message: "Statistics retrieved successfully",
        data: stats,
      });
    } catch (error) {
      return res.status(500).json({ message: error.message });
    }
  }
}
