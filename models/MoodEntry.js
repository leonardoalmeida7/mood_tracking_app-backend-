import { DataTypes } from "sequelize";
import db from "../db/conn.js";
import User from "./Users.js";

const MoodEntry = db.define("MoodEntry", {
    id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true,
    },
    userId: {
        type: DataTypes.INTEGER,
        allowNull: false,
        references: {
            model: User,
            key: 'id'
        }
    },
    // Etapa 1: Humor do dia
    mood: {
        type: DataTypes.ENUM("Very Happy", "Happy", "Neutral", "Sad", "Very Sad"),
        allowNull: false,
    },
    // Etapa 2: Como se sentiu (até 3 sentimentos)
    feelings: {
        type: DataTypes.JSON, // Array de strings: ["Joyful", "Motivated", ...]
        allowNull: false,
        validate: {
            isValidFeelings(value) {
                if (!Array.isArray(value)) {
                    throw new Error('Feelings must be an array');
                }
                if (value.length === 0 || value.length > 3) {
                    throw new Error('You must select between 1 and 3 feelings');
                }
            }
        }
    },
    // Etapa 3: Bloco de texto opcional
    notes: {
        type: DataTypes.TEXT,
        allowNull: true,
    },
    // Etapa 4: Horas dormidas
    sleepHours: {
        type: DataTypes.ENUM('9+ hours', '7-8 hours', '5-6 hours', '3-4 hours', '0-2 hours'),
        allowNull: false,
    },
    // Data da entrada
    entryDate: {
        type: DataTypes.DATEONLY,
        allowNull: false,
        defaultValue: DataTypes.NOW,
    },
},{
    timestamps: true,
    indexes: [
        {
            unique: true,
            fields: ['userId', 'entryDate']
        }
    ]
});

// Relacionamento: Um usuário pode ter várias entradas de humor
User.hasMany(MoodEntry, { foreignKey: 'userId', onDelete: 'CASCADE' });
MoodEntry.belongsTo(User, { foreignKey: 'userId' });

export default MoodEntry;
